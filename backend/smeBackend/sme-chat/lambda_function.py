import json
import boto3
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import os

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS services
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

# Environment variables with defaults
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
BEDROCK_REGION = os.environ.get('BEDROCK_REGION', 'us-east-1')  # Default to us-east-1


def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """Create a standardized API Gateway response"""
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
            'Access-Control-Allow-Methods': 'POST,OPTIONS,GET',
            'Access-Control-Max-Age': '86400'
        },
        'body': json.dumps(body)
    }

def get_hardcoded_grant_data() -> Dict[str, Any]:
    """Return hardcoded grant data"""
    return {
        "grant_id": "3bbf836b-78e1-4e26-b5a6-eb3672c16fc5",
        "amount_max": 2500000,
        "amount_min": 500000,
        "country": "Malaysia",
        "created_at": "2025-09-21T10:56:48.471261",
        "deadline": "2025-09-30",
        "document_s3_key": "grants/innovation-foundation-001/3bbf836b-78e1-4e26-b5a6-eb3672c16fc5/original.pdf",
        "eligibility_rules": [
            {
                "key": "company_type",
                "value": "Malaysian-incorporated SMEs or startups with minimum 51% Malaysian ownership"
            },
            {
                "key": "technology_level",
                "value": "Minimum TRL 4-6 for R&D, TRL 6-8 for scaling"
            },
            {
                "key": "business_age",
                "value": "Minimum 1 year of operations"
            },
            {
                "key": "co-funding_requirement",
                "value": "Minimum 20% of project cost"
            }
        ],
        "issuer": "innovation-foundation-001",
        "required_documents": [
            "Technology Readiness Assessment",
            "Comprehensive Business Plan"
        ],
        "sector_tags": [
            "Information & Communication Technology (ICT)",
            "Software & App Development",
            "Fintech",
            "Healthcare Services",
            "Education & Training",
            "Creative & Media"
        ],
        "status": "open",
        "title": "MDEC Digital Innovation Fund",
        "updated_at": "2025-09-21T10:56:48.471273"
    }

def prepare_grant_context(grant_data: Dict[str, Any]) -> str:
    """Prepare grant context for the AI"""
    try:
        # Format eligibility rules
        eligibility_text = ""
        for rule in grant_data.get('eligibility_rules', []):
            eligibility_text += f"• {rule['key']}: {rule['value']}\n"
        
        # Format sector tags
        sectors = ", ".join(grant_data.get('sector_tags', []))
        
        # Format required documents
        documents = ", ".join(grant_data.get('required_documents', []))
        
        context = f"""
GRANT DETAILS:
Title: {grant_data.get('title', 'N/A')}
Grant ID: {grant_data.get('grant_id', 'N/A')}
Issuer: {grant_data.get('issuer', 'N/A')}
Country: {grant_data.get('country', 'N/A')}
Status: {grant_data.get('status', 'N/A')}

FUNDING AMOUNT:
Minimum: RM {grant_data.get('amount_min', 0):,}
Maximum: RM {grant_data.get('amount_max', 0):,}

DEADLINE:
{grant_data.get('deadline', 'N/A')}

SECTOR TAGS:
{sectors}

ELIGIBILITY REQUIREMENTS:
{eligibility_text.strip()}

REQUIRED DOCUMENTS:
{documents}

DESCRIPTION:
This is a comprehensive digital innovation fund designed to support Malaysian SMEs and startups in developing cutting-edge technology solutions. The fund focuses on companies with strong technological readiness and innovative business models across various sectors including ICT, fintech, healthcare, education, and creative industries.

KEY BENEFITS:
• Substantial funding support (RM 500K - RM 2.5M)
• Focus on technology readiness levels 4-8
• Support for both R&D and scaling phases
• Government backing through MDEC
• Comprehensive support for Malaysian tech ecosystem

APPLICATION PROCESS:
1. Submit Technology Readiness Assessment
2. Provide comprehensive business plan
3. Demonstrate minimum 20% co-funding capability
4. Meet Malaysian ownership requirements
5. Show minimum 1 year operational history
"""
        
        logger.info(f"Prepared grant context for: {grant_data.get('title', 'Unknown')}")
        return context.strip()
        
    except Exception as e:
        logger.error(f"Error preparing grant context: {str(e)}")
        return f"Grant: {grant_data.get('title', 'Unknown')}"

def generate_ai_response(message: str, grant_context: str, conversation_id: str = None) -> str:
    """Generate AI response using Bedrock"""
    try:
        # Create the prompt for the AI
        prompt = f"""You are a helpful AI assistant specialized in helping SMEs understand grant opportunities. You have access to detailed information about a specific grant and should provide professional, accurate, and helpful responses.

{grant_context}

INSTRUCTIONS:
- Be professional and friendly in your responses
- Use the grant information to provide accurate answers
- If asked about something not in the grant details, say you don't have that information
- Help SMEs understand eligibility requirements, application processes, and key benefits
- Provide clear, actionable advice
- Keep responses concise but comprehensive
- If this is the first message, introduce yourself and offer to help with grant-related questions

USER MESSAGE: {message}

RESPONSE:"""

        # Prepare the request for Bedrock (Nova Premier model format)
        body = {
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "text": prompt
                        }
                    ]
                }
            ]
        }

        logger.info(f"Using Bedrock model: {BEDROCK_MODEL_ID} in region: {BEDROCK_REGION}")

        # Call Bedrock
        response = bedrock.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(body),
            contentType="application/json"
        )

        # Parse the response
        response_body = json.loads(response['body'].read())
        logger.info(f"Raw response body: {json.dumps(response_body, indent=2)}")
        
        # Handle different response formats for different models
        if 'content' in response_body and len(response_body['content']) > 0:
            # Claude format
            if isinstance(response_body['content'][0], dict) and 'text' in response_body['content'][0]:
                ai_response = response_body['content'][0]['text']
            else:
                ai_response = str(response_body['content'][0])
        elif 'output' in response_body:
            # Nova Premier format
            if 'message' in response_body['output']:
                ai_response = response_body['output']['message']
            elif 'content' in response_body['output']:
                ai_response = response_body['output']['content']
            else:
                ai_response = str(response_body['output'])
        elif 'completion' in response_body:
            # Alternative format
            ai_response = response_body['completion']
        elif 'text' in response_body:
            # Direct text response
            ai_response = response_body['text']
        else:
            # Fallback - try to extract text from any available field
            logger.warning(f"Unknown response format: {response_body}")
            ai_response = str(response_body)

        logger.info(f"Generated AI response: {ai_response}")
        return ai_response

    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        raise e

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    SME Chat Lambda function that provides AI assistance for grant-related questions
    """
    try:
        # Log the incoming event for debugging
        logger.info(f"Received event: {json.dumps(event, default=str)}")
        
        # Handle CORS preflight requests
        if event.get('httpMethod') == 'OPTIONS':
            logger.info("Handling CORS preflight request")
            return create_response(200, {'message': 'CORS preflight successful'})

        # Parse the request body
        body = json.loads(event.get('body', '{}'))

        # Extract parameters
        message = body.get('message', '')
        grant_id = body.get('grant_id')
        conversation_id = body.get('conversation_id')

        logger.info(f"Received message: {message}")
        logger.info(f"Grant ID: {grant_id}")
        logger.info(f"Conversation ID: {conversation_id}")

        # Use hardcoded grant data instead of fetching from DynamoDB
        grant_details = get_hardcoded_grant_data()
        logger.info(f"Using hardcoded grant: {grant_details.get('title', 'Unknown')}")

        # Prepare the context for the AI
        grant_context = prepare_grant_context(grant_details)

        # Generate AI response
        ai_response = generate_ai_response(message, grant_context, conversation_id)

        # Generate conversation ID if not provided
        if not conversation_id:
            conversation_id = f"conv_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{context.aws_request_id[:8]}"

        return create_response(200, {
            'message': ai_response,
            'conversation_id': conversation_id,
            'timestamp': datetime.now().isoformat()
        })

    except Exception as e:
        logger.error(f"Error in sme-chat lambda: {str(e)}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': f'Error: {str(e)}',
            'details': str(e)
        })
