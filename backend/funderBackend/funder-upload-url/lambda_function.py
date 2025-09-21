import json
import boto3
import uuid
import os
import requests
from datetime import datetime
from typing import Dict, Any, List, Optional
import re
import logging
from botocore.exceptions import ClientError
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
GRANTS_TABLE = os.environ.get('GRANTS_TABLE', 'Grants')
S3_BUCKET = os.environ.get('S3_BUCKET', 'grant-documents-bucket')
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
BEDROCK_REGION = os.environ.get('BEDROCK_REGION', 'us-east-1')
FIRECRAWL_API_KEY = os.environ.get('FIRECRAWL_API_KEY')

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime', region_name=BEDROCK_REGION)
s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Main Lambda handler for grant URL scraping and processing
    """
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return create_response(200, {'message': 'CORS preflight successful'})
    
    try:
        # Parse the incoming request
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event
        
        # Extract required fields
        title = body.get('title')
        issuer = body.get('issuer')  # This should be the funder_id
        url = body.get('url')  # Website URL to scrape
        
        if not all([title, issuer, url]):
            return create_response(400, {
                'error': 'Missing required fields: title, issuer, url'
            })
        
        # Validate URL format
        if not url.startswith(('http://', 'https://')):
            return create_response(400, {'error': 'Invalid URL format. Must start with http:// or https://'})
        
        # Generate unique grant ID
        grant_id = str(uuid.uuid4())
        
        logger.info(f"Processing grant URL scraping: {grant_id} - {title}")
        logger.info(f"URL to scrape: {url}")
        
        # Scrape website content using Firecrawl
        extracted_text = scrape_website_with_firecrawl(url)
        if not extracted_text:
            return create_response(400, {'error': 'Failed to extract content from URL'})
        
        logger.info(f"Extracted {len(extracted_text)} characters from URL")
        logger.info(f"First 500 chars of extracted text: {extracted_text[:500]}")
        logger.info(f"Last 500 chars of extracted text: {extracted_text[-500:]}")
        
        # Store scraped content in S3
        s3_key = f"grants/{issuer}/{grant_id}/scraped_content.txt"
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=extracted_text.encode('utf-8'),
            ContentType='text/plain',
            Metadata={
                'grant_id': grant_id,
                'issuer': issuer,
                'title': title,
                'source_url': url,
                'scraped_at': datetime.utcnow().isoformat()
            }
        )
        
        logger.info(f"Scraped content stored in S3: {s3_key}")
        
        # Use Bedrock to extract structured information
        logger.info("Sending scraped text to Bedrock for analysis...")
        grant_data = extract_grant_info_with_bedrock(extracted_text, title, issuer)
        logger.info(f"Bedrock analysis complete. Extracted data: {grant_data}")
        
        # Store grant information in DynamoDB
        save_grant_to_dynamodb(grant_id, grant_data, s3_key, url)
        
        # Return success response
        return create_response(200, {
            'message': 'Grant URL scraped and processed successfully',
            'grant_id': grant_id,
            'grant_data': grant_data
        })
        
    except Exception as e:
        logger.error(f"Error processing grant URL scraping: {str(e)}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def scrape_website_with_firecrawl(url: str) -> str:
    """
    Scrape website content using Firecrawl API
    """
    try:
        if not FIRECRAWL_API_KEY:
            logger.error("FIRECRAWL_API_KEY environment variable not set")
            return ""
        
        # Firecrawl API endpoint
        firecrawl_url = "https://api.firecrawl.dev/v0/scrape"
        
        headers = {
            'Authorization': f'Bearer {FIRECRAWL_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'url': url,
            'formats': ['markdown', 'html'],
            'includeTags': ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'div', 'span', 'li', 'td'],
            'excludeTags': ['script', 'style', 'nav', 'footer', 'header'],
            'waitFor': 1000,  # Wait 1 second for page to load
            'timeout': 30000  # 30 second timeout
        }
        
        logger.info(f"Calling Firecrawl API for URL: {url}")
        response = requests.post(firecrawl_url, headers=headers, json=payload, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            
            # Extract content from response
            if data.get('success') and data.get('data'):
                content_data = data['data']
                
                # Prioritize markdown content, fallback to HTML content
                extracted_text = ""
                
                if content_data.get('markdown'):
                    extracted_text = content_data['markdown']
                    logger.info("Using markdown content from Firecrawl")
                elif content_data.get('html'):
                    extracted_text = content_data['html']
                    logger.info("Using HTML content from Firecrawl")
                elif content_data.get('content'):
                    extracted_text = content_data['content']
                    logger.info("Using raw content from Firecrawl")
                
                # Add metadata
                if content_data.get('metadata'):
                    metadata = content_data['metadata']
                    title = metadata.get('title', '')
                    description = metadata.get('description', '')
                    
                    if title:
                        extracted_text = f"Page Title: {title}\n\n" + extracted_text
                    if description:
                        extracted_text = f"Page Description: {description}\n\n" + extracted_text
                
                # Clean up the text
                extracted_text = clean_scraped_text(extracted_text)
                
                logger.info(f"Successfully scraped {len(extracted_text)} characters")
                return extracted_text
            else:
                logger.error(f"Firecrawl API returned unsuccessful response: {data}")
                return ""
        else:
            logger.error(f"Firecrawl API request failed with status {response.status_code}: {response.text}")
            return ""
            
    except requests.exceptions.RequestException as e:
        logger.error(f"Request error when calling Firecrawl API: {str(e)}")
        return ""
    except Exception as e:
        logger.error(f"Error scraping website with Firecrawl: {str(e)}")
        return ""

def clean_scraped_text(text: str) -> str:
    """
    Clean and normalize scraped text content
    """
    if not text:
        return ""
    
    # Remove excessive whitespace and normalize line breaks
    text = re.sub(r'\n+', '\n', text)
    text = re.sub(r'\s+', ' ', text)
    
    # Remove common web artifacts
    text = re.sub(r'<!DOCTYPE[^>]*>', '', text)
    text = re.sub(r'<script[^>]*>.*?</script>', '', text, flags=re.DOTALL | re.IGNORECASE)
    text = re.sub(r'<style[^>]*>.*?</style>', '', text, flags=re.DOTALL | re.IGNORECASE)
    
    # Clean up markdown artifacts if present
    text = re.sub(r'\[.*?\]\(.*?\)', '', text)  # Remove markdown links
    text = re.sub(r'#{1,6}\s*', '', text)  # Remove markdown headers
    
    return text.strip()

def extract_grant_info_with_bedrock(text: str, title: str, issuer: str) -> Dict[str, Any]:
    """
    Use AWS Bedrock to extract structured grant information from scraped text
    """
    
    # Construct the prompt for Bedrock
    prompt = f"""
    Analyze this grant website content and extract structured information. Return ONLY a valid JSON object with this exact schema:

    {{
        "title": "{title}",
        "issuer": "{issuer}",
        "country": "extracted country or null",
        "status": "open|closed|upcoming",
        "deadline": "YYYY-MM-DD format or null",
        "amount_min": numeric_value_or_null,
        "amount_max": numeric_value_or_null,
        "sector_tags": ["array", "of", "relevant", "sectors"],
        "eligibility_rules": [
            {{"key": "requirement_type", "value": "specific_requirement"}}
        ],
        "required_documents": ["list", "of", "required", "document", "types"]
    }}

    Guidelines:
    - For amounts, extract only numbers (no currency symbols)
    - For dates, convert to YYYY-MM-DD format
    - For status, determine based on deadline and content language
    - Be conservative - use null for uncertain information
    - Sector tags should be broad categories (e.g., "technology", "healthcare", "education")
    - Eligibility rules should capture key requirements as key-value pairs
    - Required documents should list document types needed for application

    Website content:
    {text[:7000]}

    Return only the JSON object, no additional text or explanations.
    """
    
    try:
        # Prepare request for Bedrock - Different format for Nova vs Claude
        if "nova" in BEDROCK_MODEL_ID.lower():
            # Amazon Nova model format
            request_body = {
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "text": prompt
                            }
                        ]
                    }
                ],
                "inferenceConfig": {
                    "maxTokens": 2000,
                    "temperature": 0.1,
                    "topP": 0.9
                }
            }
            logger.info("Using Amazon Nova model format")
        else:
            # Anthropic Claude model format
            request_body = {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            }
            logger.info("Using Claude model format")
        
        logger.info(f"Sending request to Bedrock model: {BEDROCK_MODEL_ID}")
        logger.info(f"Prompt being sent (first 1000 chars): {prompt[:1000]}")
        
        # Call Bedrock
        response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(request_body),
            contentType='application/json'
        )
        
        # Parse response - Different format for Nova vs Claude
        response_body = json.loads(response['body'].read())
        
        if "nova" in BEDROCK_MODEL_ID.lower():
            # Nova response format: output.message.content[0].text
            extracted_info = response_body.get('output', {}).get('message', {}).get('content', [{}])[0].get('text', '{}')
        else:
            # Claude response format: content[0].text
            extracted_info = response_body.get('content', [{}])[0].get('text', '{}')
        
        logger.info(f"Raw Bedrock response body: {response_body}")
        logger.info(f"Extracted info from Bedrock: {extracted_info}")
        logger.info(f"Response parsing method: {'Nova format' if 'nova' in BEDROCK_MODEL_ID.lower() else 'Claude format'}")
        
        # Clean and parse the JSON response
        try:
            # Remove any markdown code blocks if present
            json_text = re.sub(r'```json\s*', '', extracted_info)
            json_text = re.sub(r'```', '', json_text)
            json_text = json_text.strip()
            
            grant_info = json.loads(json_text)
        except json.JSONDecodeError:
            # Try to find JSON in the response
            json_match = re.search(r'\{.*\}', extracted_info, re.DOTALL)
            if json_match:
                grant_info = json.loads(json_match.group())
            else:
                raise ValueError("No valid JSON found in Bedrock response")
        
        # Validate and clean the extracted information
        grant_info = validate_and_clean_grant_info(grant_info, title, issuer)
        
        logger.info("Successfully extracted grant information using Bedrock")
        return grant_info
        
    except Exception as e:
        logger.error(f"Error using Bedrock to extract grant info: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Full error details: {e}", exc_info=True)
        
        # Fallback: return basic structure with provided information
        return {
            "title": title,
            "issuer": issuer,
            "country": None,
            "status": "open",
            "deadline": None,
            "amount_min": None,
            "amount_max": None,
            "sector_tags": [],
            "eligibility_rules": [],
            "required_documents": []
        }

def validate_and_clean_grant_info(grant_info: Dict, title: str, issuer: str) -> Dict[str, Any]:
    """
    Validate and clean the grant information extracted by Bedrock
    """
    
    # Ensure required fields are present and valid
    validated_info = {
        "title": grant_info.get("title", title),
        "issuer": grant_info.get("issuer", issuer),
        "country": grant_info.get("country"),
        "status": grant_info.get("status", "open"),
        "deadline": validate_date(grant_info.get("deadline")),
        "amount_min": validate_number(grant_info.get("amount_min")),
        "amount_max": validate_number(grant_info.get("amount_max")),
        "sector_tags": validate_list(grant_info.get("sector_tags", [])),
        "eligibility_rules": validate_eligibility_rules(grant_info.get("eligibility_rules", [])),
        "required_documents": validate_list(grant_info.get("required_documents", []))
    }
    
    # Validate status
    valid_statuses = ["open", "closed", "upcoming"]
    if validated_info["status"] not in valid_statuses:
        validated_info["status"] = "open"
    
    # Ensure amount_min <= amount_max if both exist
    if (validated_info["amount_min"] is not None and 
        validated_info["amount_max"] is not None and 
        validated_info["amount_min"] > validated_info["amount_max"]):
        # Swap them
        validated_info["amount_min"], validated_info["amount_max"] = \
            validated_info["amount_max"], validated_info["amount_min"]
    
    return validated_info

def validate_date(date_value) -> Optional[str]:
    """Validate and format date to ISO format"""
    if not date_value:
        return None
    
    try:
        if isinstance(date_value, str):
            # Clean the date string
            date_clean = re.sub(r'[^\d\-/.]', '', date_value)
            
            # Try different date formats
            formats = [
                '%Y-%m-%d', '%d-%m-%Y', '%m-%d-%Y', 
                '%Y/%m/%d', '%d/%m/%Y', '%m/%d/%Y',
                '%Y.%m.%d', '%d.%m.%Y', '%m.%d.%Y'
            ]
            
            for fmt in formats:
                try:
                    parsed_date = datetime.strptime(date_clean, fmt)
                    return parsed_date.strftime('%Y-%m-%d')
                except ValueError:
                    continue
        
        return None
    except Exception:
        return None

def validate_number(value) -> Optional[float]:
    """Validate and convert to number"""
    if value is None:
        return None
    
    try:
        if isinstance(value, (int, float)):
            return float(value) if value >= 0 else None
        
        if isinstance(value, str):
            # Remove currency symbols, commas, and other non-numeric chars
            clean_value = re.sub(r'[^\d.]', '', value)
            if clean_value:
                num_value = float(clean_value)
                return num_value if num_value >= 0 else None
        
        return None
    except (ValueError, TypeError):
        return None

def validate_list(value) -> List[str]:
    """Validate list values"""
    if not isinstance(value, list):
        return []
    
    # Convert to strings and filter out empty values
    return [str(item).strip() for item in value if item is not None and str(item).strip()]

def validate_eligibility_rules(rules) -> List[Dict[str, str]]:
    """Validate eligibility rules format"""
    if not isinstance(rules, list):
        return []
    
    validated_rules = []
    for rule in rules:
        if isinstance(rule, dict) and 'key' in rule and 'value' in rule:
            key = str(rule['key']).strip()
            value = str(rule['value']).strip()
            if key and value:  # Only add non-empty rules
                validated_rules.append({'key': key, 'value': value})
    
    return validated_rules

def save_grant_to_dynamodb(grant_id: str, grant_data: Dict[str, Any], s3_key: str, source_url: str = None):
    """
    Save grant information to DynamoDB
    """
    try:
        table = dynamodb.Table(GRANTS_TABLE)
        
        # Prepare the item for DynamoDB
        item = {
            'grant_id': grant_id,
            'title': grant_data['title'],
            'issuer': grant_data['issuer'],
            'status': grant_data['status'],
            'sector_tags': grant_data['sector_tags'],
            'eligibility_rules': grant_data['eligibility_rules'],
            'required_documents': grant_data['required_documents'],
            'document_s3_key': s3_key,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Add source URL if provided
        if source_url:
            item['source_url'] = source_url
        
        # Add optional fields only if they have values
        optional_fields = ['country', 'deadline', 'amount_min', 'amount_max']
        for field in optional_fields:
            if grant_data[field] is not None:
                # Convert numeric values to Decimal for DynamoDB
                if field in ['amount_min', 'amount_max'] and isinstance(grant_data[field], (int, float)):
                    item[field] = Decimal(str(grant_data[field]))
                else:
                    item[field] = grant_data[field]
        
        # Save to DynamoDB
        table.put_item(Item=item)
        
        logger.info(f"Successfully saved grant {grant_id} to DynamoDB")
        
    except ClientError as e:
        logger.error(f"Error saving to DynamoDB: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error saving to DynamoDB: {str(e)}")
        raise

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create API Gateway response with proper CORS headers
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
            'Access-Control-Allow-Methods': 'POST,OPTIONS,GET',
            'Access-Control-Allow-Credentials': 'false',
            'Access-Control-Max-Age': '86400'
        },
        'body': json.dumps(body, default=str)
    }

# Test function for local development
def test_local():
    """
    Test function for local development
    """
    # Sample test event
    test_event = {
        'title': 'Tech Innovation Grant 2024',
        'issuer': 'dept-commerce-123',
        'url': 'https://example.com/grant-opportunity'
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_local()
