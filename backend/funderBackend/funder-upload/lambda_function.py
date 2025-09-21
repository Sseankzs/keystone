import json
import boto3
import uuid
import base64
import os
from datetime import datetime
from typing import Dict, Any, List, Optional
import PyPDF2
import io
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
BEDROCK_REGION = os.environ.get('BEDROCK_REGION', 'us-east-1')  # Default to us-east-1

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime', region_name=BEDROCK_REGION)
s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Main Lambda handler for grant document upload and processing
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
        title = body.get('title')  # Optional, will be extracted by AI if not provided
        issuer = body.get('issuer')  # This should be the funder_id
        pdf_content = body.get('pdf_content')  # Base64 encoded PDF
        
        if not all([issuer, pdf_content]):
            return create_response(400, {
                'error': 'Missing required fields: issuer, pdf_content'
            })
        
        # Generate unique grant ID
        grant_id = str(uuid.uuid4())
        
        # If no title provided, let AI extract it from document content
        if not title:
            title = None  # Will be extracted by AI from document content
        
        logger.info(f"Processing grant upload: {grant_id} - {'AI will extract title' if not title else title}")
        
        # Decode PDF content
        try:
            pdf_bytes = base64.b64decode(pdf_content)
        except Exception as e:
            logger.error(f"Failed to decode PDF content: {str(e)}")
            return create_response(400, {'error': 'Invalid PDF content encoding'})
        
        # Store PDF in S3
        s3_key = f"grants/{issuer}/{grant_id}/original.pdf"
        s3.put_object(
            Bucket=S3_BUCKET,
            Key=s3_key,
            Body=pdf_bytes,
            ContentType='application/pdf',
            Metadata={
                'grant_id': grant_id,
                'issuer': issuer,
                'title': title or 'AI-extracted',
                'uploaded_at': datetime.utcnow().isoformat()
            }
        )
        
        logger.info(f"PDF stored in S3: {s3_key}")
        
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(pdf_bytes)
        if not extracted_text:
            return create_response(400, {'error': 'Failed to extract text from PDF'})
        
        logger.info(f"Extracted {len(extracted_text)} characters from PDF")
        logger.info(f"First 500 chars of extracted text: {extracted_text[:500]}")
        logger.info(f"Last 500 chars of extracted text: {extracted_text[-500:]}")
        
        # Use Bedrock to extract structured information
        logger.info("Sending text to Bedrock for analysis...")
        grant_data = extract_grant_info_with_bedrock(extracted_text, title, issuer)
        logger.info(f"Bedrock analysis complete. Extracted data: {grant_data}")
        
        # Store grant information in DynamoDB
        save_grant_to_dynamodb(grant_id, grant_data, s3_key)
        
        # Return success response
        return create_response(200, {
            'message': 'Grant uploaded and processed successfully',
            'grant_id': grant_id,
            'grant_data': grant_data
        })
        
    except Exception as e:
        logger.error(f"Error processing grant upload: {str(e)}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extract text from PDF using PyPDF2
    """
    try:
        pdf_file = io.BytesIO(pdf_bytes)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        
        extracted_text = ""
        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            extracted_text += page.extract_text() + "\n"
        
        # Clean up the text
        extracted_text = re.sub(r'\n+', '\n', extracted_text)
        extracted_text = re.sub(r'\s+', ' ', extracted_text)
        
        return extracted_text.strip()
        
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {str(e)}")
        return ""

def extract_grant_info_with_bedrock(text: str, title: str, issuer: str) -> Dict[str, Any]:
    """
    Use AWS Bedrock to extract structured grant information from text
    """
    
    # Define the predefined sector list
    sector_list = [
        "Agriculture", "Forestry", "Fisheries", "Mining & Quarrying", "Food & Beverage Manufacturing",
        "Textiles & Apparel", "Wood & Furniture", "Chemicals & Plastics", "Electronics & Electricals",
        "Automotive & Parts", "Machinery & Equipment", "Building & Construction", "Civil Engineering",
        "Real Estate Development", "Property Management", "Retail & Wholesale Trade", "E-commerce",
        "Logistics & Transportation", "Tourism & Hospitality", "Healthcare Services", "Education & Training",
        "Professional Services", "Creative & Media", "Information & Communication Technology (ICT)",
        "Software & App Development", "Fintech", "Green Technology", "Renewable Energy", "Biotechnology",
        "Social Enterprise", "Non-profit & Community Services", "Personal Services"
    ]
    
    # Construct the prompt for Bedrock
    prompt = f"""
    Analyze this grant document and extract structured information. Return ONLY a valid JSON object with this exact schema:

    {{
        "title": "extract the actual grant title from the document content",
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
    - For status, determine based on deadline and document language
    - Be conservative - use null for uncertain information
    - For sector_tags, ONLY choose from this predefined list (can choose none or multiple): {sector_list}
    - Match the grant content to the most relevant sectors from the list above
    - For title, extract the actual grant/program name from the document (e.g., "Small Business Innovation Grant 2024", "Green Energy Initiative", etc.)
    - Eligibility rules should capture key requirements as key-value pairs
    - Required documents should list document types needed for application

    Document text:
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
            "title": title or f"Grant Document - {datetime.utcnow().strftime('%B %d, %Y')}",
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
        "title": grant_info.get("title", title or f"Grant Document - {datetime.utcnow().strftime('%B %d, %Y')}"),
        "issuer": grant_info.get("issuer", issuer),
        "country": grant_info.get("country"),
        "status": grant_info.get("status", "open"),
        "deadline": validate_date(grant_info.get("deadline")),
        "amount_min": validate_number(grant_info.get("amount_min")),
        "amount_max": validate_number(grant_info.get("amount_max")),
        "sector_tags": validate_sector_tags(grant_info.get("sector_tags", [])),
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

def validate_sector_tags(value) -> List[str]:
    """Validate sector tags against predefined list"""
    # Define the predefined sector list
    valid_sectors = [
        "Agriculture", "Forestry", "Fisheries", "Mining & Quarrying", "Food & Beverage Manufacturing",
        "Textiles & Apparel", "Wood & Furniture", "Chemicals & Plastics", "Electronics & Electricals",
        "Automotive & Parts", "Machinery & Equipment", "Building & Construction", "Civil Engineering",
        "Real Estate Development", "Property Management", "Retail & Wholesale Trade", "E-commerce",
        "Logistics & Transportation", "Tourism & Hospitality", "Healthcare Services", "Education & Training",
        "Professional Services", "Creative & Media", "Information & Communication Technology (ICT)",
        "Software & App Development", "Fintech", "Green Technology", "Renewable Energy", "Biotechnology",
        "Social Enterprise", "Non-profit & Community Services", "Personal Services"
    ]
    
    if not isinstance(value, list):
        logger.warning(f"sector_tags is not a list: {type(value)} - {value}")
        return []
    
    # Filter to only include sectors from the predefined list
    validated_sectors = []
    invalid_sectors = []
    
    for item in value:
        if item is not None:
            sector = str(item).strip()
            if sector in valid_sectors:
                validated_sectors.append(sector)
            else:
                invalid_sectors.append(sector)
    
    # Log invalid sectors for debugging
    if invalid_sectors:
        logger.warning(f"Invalid sectors found (not in predefined list): {invalid_sectors}")
        logger.info(f"Valid sectors that were accepted: {validated_sectors}")
    
    return validated_sectors

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

def save_grant_to_dynamodb(grant_id: str, grant_data: Dict[str, Any], s3_key: str):
    """
    Save grant information to DynamoDB
    """
    try:
        table = dynamodb.Table(GRANTS_TABLE)
        
        # Log the sector_tags before saving for debugging
        logger.info(f"Sector tags before saving to DynamoDB: {grant_data['sector_tags']} (type: {type(grant_data['sector_tags'])})")
        
        # Ensure sector_tags is a proper list for DynamoDB
        sector_tags = grant_data.get('sector_tags', [])
        if not isinstance(sector_tags, list):
            sector_tags = []
        
        # Prepare the item for DynamoDB
        item = {
            'grant_id': grant_id,
            'title': grant_data['title'],
            'issuer': grant_data['issuer'],
            'status': grant_data['status'],
            'sector_tags': sector_tags,  # Ensure this is a proper list
            'eligibility_rules': grant_data['eligibility_rules'],
            'required_documents': grant_data['required_documents'],
            'document_s3_key': s3_key,
            'created_at': datetime.utcnow().isoformat(),
            'updated_at': datetime.utcnow().isoformat()
        }
        
        # Add optional fields only if they have values
        optional_fields = ['country', 'deadline', 'amount_min', 'amount_max']
        for field in optional_fields:
            if grant_data[field] is not None:
                # Convert numeric values to Decimal for DynamoDB
                if field in ['amount_min', 'amount_max'] and isinstance(grant_data[field], (int, float)):
                    item[field] = Decimal(str(grant_data[field]))
                else:
                    item[field] = grant_data[field]
        
        # Log the final item structure before saving
        logger.info(f"Final DynamoDB item structure: {json.dumps(item, default=str)}")
        
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
        'title': 'Small Business Innovation Grant 2024',
        'issuer': 'dept-commerce-123',
        'pdf_content': 'JVBERi0xLjQKJeL...'  # Base64 encoded PDF content
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_local()