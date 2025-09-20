import json
import boto3
import base64
import uuid
from datetime import datetime
from botocore.exceptions import ClientError

# Initialize AWS clients
textract_client = boto3.client('textract')
bedrock_runtime = boto3.client('bedrock-runtime')
s3_client = boto3.client('s3')

# Configuration
TEMP_S3_BUCKET = 'sme-funding-bucket-sg-1'  # For temporary PDF storage
BEDROCK_MODEL_ID = 'amazon.nova-pro-v1:0'  # Nova Pro

def lambda_handler(event, context):
    """
    Main Lambda handler for grant information upload with AI analysis
    """
    
    try:
        # Parse the incoming request
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')
        body = event.get('body', '{}')
        
        # Parse request body
        request_body = {}
        if body:
            try:
                request_body = json.loads(body)
            except json.JSONDecodeError:
                return create_response(400, {'error': 'Invalid JSON in request body'})
        
        # Route based on HTTP method and path
        if http_method == 'POST' and '/upload-grant' in path:
            return handle_grant_upload(request_body)
        else:
            return create_response(400, {'error': 'Invalid endpoint. Use POST /upload-grant'})
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def handle_grant_upload(request_body):
    """
    Handle grant information upload with AI-powered PDF analysis
    """
    try:
        # Validate required fields
        title = request_body.get('title')
        description = request_body.get('description', '')
        pdf_file = request_body.get('pdf_file')
        
        if not title:
            return create_response(400, {'error': 'title is required'})
        
        if not pdf_file:
            return create_response(400, {'error': 'pdf_file is required'})
        
        # Generate unique identifiers
        grant_id = f"grant_{str(uuid.uuid4())[:8]}"
        temp_s3_key = f"temp-pdfs/{grant_id}/{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        
        # Step 1: Decode and upload PDF to S3 (required for Textract)
        try:
            pdf_bytes = base64.b64decode(pdf_file)
        except Exception as e:
            return create_response(400, {'error': 'Invalid base64 PDF content'})
        
        # Upload to S3 for Textract processing
        s3_client.put_object(
            Bucket=TEMP_S3_BUCKET,
            Key=temp_s3_key,
            Body=pdf_bytes,
            ContentType='application/pdf'
        )
        
        # Step 2: Extract text using Amazon Textract
        extracted_text = extract_text_from_pdf(TEMP_S3_BUCKET, temp_s3_key)
        
        if not extracted_text:
            return create_response(400, {'error': 'Could not extract text from PDF'})
        
        # Step 3: Analyze extracted text using Bedrock (Claude)
        grant_data = analyze_grant_with_bedrock(extracted_text, title, grant_id)
        
        # Step 4: Clean up temporary S3 file
        try:
            s3_client.delete_object(Bucket=TEMP_S3_BUCKET, Key=temp_s3_key)
        except:
            pass  # Don't fail if cleanup fails
        
        # Additional metadata for the response
        processing_info = {
            "processing_status": "completed",
            "processed_at": datetime.now().isoformat(),
            "original_title": title,
            "has_description": bool(description),
            "pdf_received": True,
            "text_extracted": True,
            "analysis_method": "bedrock_claude",
            "characters_extracted": len(extracted_text)
        }
        
        return create_response(200, {
            "message": "Grant information processed successfully",
            "grant_data": grant_data,
            "processing_info": processing_info
        })
        
    except Exception as e:
        print(f"Grant upload error: {str(e)}")
        return create_response(500, {'error': f'Grant processing failed: {str(e)}'})

def extract_text_from_pdf(bucket, key):
    """
    Extract text from PDF using Amazon Textract
    """
    try:
        response = textract_client.detect_document_text(
            Document={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': key
                }
            }
        )
        
        # Combine all text blocks
        extracted_text = ""
        for item in response['Blocks']:
            if item['BlockType'] == 'LINE':
                extracted_text += item['Text'] + "\n"
        
        return extracted_text.strip()
        
    except ClientError as e:
        print(f"Textract error: {str(e)}")
        return None
    except Exception as e:
        print(f"Text extraction error: {str(e)}")
        return None

def analyze_grant_with_bedrock(extracted_text, title, grant_id):
    """
    Use Bedrock (Claude) to analyze extracted text and structure grant information
    """
    
    prompt = f"""
You are an expert grant analyst. I need you to analyze the following grant document text and extract structured information.

The document title provided by user: {title}

Document text:
{extracted_text}

Please analyze this text and extract the following grant information in JSON format:
- title: The grant program title (use provided title if document doesn't specify)
- issuer: The funding organization/agency name
- country: Country where the grant is offered
- deadline: Application deadline in ISO date format (YYYY-MM-DDTHH:MM:SSZ)
- amount_max: Maximum grant amount as a number (extract currency and convert to USD if needed)
- sector_tags: List of relevant sector tags (technology, healthcare, education, environment, etc.)
- eligibility_rules: List of objects with "key" and "value" fields describing who can apply
- required_documents: List of documents that applicants must submit

If specific information is not found in the text, make reasonable assumptions based on context or use "Not specified" for text fields and 0 for numeric fields.

Respond ONLY with valid JSON in this exact format:
{{
    "title": "string",
    "issuer": "string", 
    "country": "string",
    "deadline": "string",
    "amount_max": number,
    "sector_tags": ["string"],
    "eligibility_rules": [{{"key": "string", "value": "string"}}],
    "required_documents": ["string"]
}}
"""

    try:
        response = bedrock_runtime.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            contentType='application/json',
            accept='application/json',
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 2000,
                "temperature": 0.1,
                "messages": [
                    {
                        "role": "user",
                        "content": prompt
                    }
                ]
            })
        )
        
        response_body = json.loads(response['body'].read())
        analysis_text = response_body['content'][0]['text']
        
        # Parse the JSON response from Claude
        try:
            grant_analysis = json.loads(analysis_text)
            
            # Add the grant_id as primary key
            grant_analysis['grant_id'] = grant_id
            
            # Validate and clean the response
            grant_analysis = validate_and_clean_grant_data(grant_analysis)
            
            return grant_analysis
            
        except json.JSONDecodeError:
            print(f"Invalid JSON from Bedrock: {analysis_text}")
            # Return fallback data if Claude response is not valid JSON
            return create_fallback_grant_data(title, grant_id)
        
    except Exception as e:
        print(f"Bedrock analysis error: {str(e)}")
        # Return fallback data if Bedrock fails
        return create_fallback_grant_data(title, grant_id)

def validate_and_clean_grant_data(grant_data):
    """
    Validate and clean the grant data structure
    """
    # Ensure all required fields exist
    required_fields = {
        'title': 'Unknown Grant',
        'issuer': 'Not specified',
        'country': 'Not specified',
        'deadline': '2024-12-31T23:59:59Z',
        'amount_max': 0,
        'sector_tags': [],
        'eligibility_rules': [],
        'required_documents': []
    }
    
    for field, default_value in required_fields.items():
        if field not in grant_data or grant_data[field] is None:
            grant_data[field] = default_value
    
    # Ensure amount_max is a number
    try:
        grant_data['amount_max'] = float(grant_data['amount_max'])
    except:
        grant_data['amount_max'] = 0
    
    # Ensure lists are actually lists
    list_fields = ['sector_tags', 'eligibility_rules', 'required_documents']
    for field in list_fields:
        if not isinstance(grant_data[field], list):
            grant_data[field] = []
    
    return grant_data

def create_fallback_grant_data(title, grant_id):
    """
    Create fallback grant data if AI analysis fails
    """
    return {
        "grant_id": grant_id,
        "title": title,
        "issuer": "Analysis failed - manual review required",
        "country": "Not specified",
        "deadline": "2024-12-31T23:59:59Z",
        "amount_max": 0,
        "sector_tags": ["general"],
        "eligibility_rules": [
            {
                "key": "status",
                "value": "Requires manual analysis"
            }
        ],
        "required_documents": [
            "Manual document review required"
        ]
    }

def create_response(status_code, body):
    """
    Create a properly formatted HTTP response for API Gateway
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        'body': json.dumps(body, indent=2)
    }