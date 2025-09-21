import json
import boto3
import logging
from datetime import datetime
from typing import Dict, Any, Optional
import os
import re

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS services
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

# Environment variables with defaults
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
BEDROCK_REGION = os.environ.get('BEDROCK_REGION', 'us-east-1')  # Default to us-east-1

# In-memory conversation storage (in production, use DynamoDB or similar)
conversation_history = {}


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

def convert_markdown_to_plain_text(text: str) -> str:
    """Convert markdown formatting to plain text"""
    if not text:
        return text
    
    # Remove markdown headers
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)
    
    # Remove bold and italic formatting
    text = re.sub(r'\*\*(.*?)\*\*', r'\1', text)  # **bold** -> bold
    text = re.sub(r'\*(.*?)\*', r'\1', text)      # *italic* -> italic
    text = re.sub(r'__(.*?)__', r'\1', text)      # __bold__ -> bold
    text = re.sub(r'_(.*?)_', r'\1', text)        # _italic_ -> italic
    
    # Remove code blocks and inline code
    text = re.sub(r'```.*?```', '', text, flags=re.DOTALL)  # Code blocks
    text = re.sub(r'`([^`]+)`', r'\1', text)                # Inline code
    
    # Remove links but keep the text
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)    # [text](url) -> text
    
    # Remove list markers
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)  # Bullet points
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)  # Numbered lists
    
    # Remove horizontal rules
    text = re.sub(r'^---+$', '', text, flags=re.MULTILINE)
    text = re.sub(r'^\*\*\*+$', '', text, flags=re.MULTILINE)
    
    # Clean up extra whitespace
    text = re.sub(r'\n\s*\n\s*\n', '\n\n', text)  # Multiple newlines to double
    text = re.sub(r'^\s+', '', text, flags=re.MULTILINE)  # Leading whitespace
    text = text.strip()
    
    return text

def convert_json_to_plain_text(data) -> str:
    """Convert JSON response to plain text"""
    if isinstance(data, str):
        try:
            # Try to parse as JSON first
            parsed = json.loads(data)
            return convert_json_to_plain_text(parsed)
        except json.JSONDecodeError:
            # If not JSON, return as is
            return data
    
    elif isinstance(data, dict):
        # Handle dictionary responses
        if 'content' in data:
            if isinstance(data['content'], list) and len(data['content']) > 0:
                # Handle content array like [{"text": "..."}]
                if isinstance(data['content'][0], dict) and 'text' in data['content'][0]:
                    return data['content'][0]['text']
                else:
                    return str(data['content'][0])
            else:
                return str(data['content'])
        elif 'text' in data:
            return str(data['text'])
        elif 'message' in data:
            return str(data['message'])
        else:
            # Extract all string values from the dictionary
            text_parts = []
            for key, value in data.items():
                if isinstance(value, str) and value.strip():
                    text_parts.append(value)
            return ' '.join(text_parts) if text_parts else str(data)
    
    elif isinstance(data, list):
        # Handle list responses
        text_parts = []
        for item in data:
            if isinstance(item, str):
                text_parts.append(item)
            elif isinstance(item, dict):
                text_parts.append(convert_json_to_plain_text(item))
        return ' '.join(text_parts) if text_parts else str(data)
    
    else:
        return str(data)

def get_conversation_history(conversation_id: str) -> list:
    """Get conversation history for a given conversation ID"""
    return conversation_history.get(conversation_id, [])

def add_to_conversation_history(conversation_id: str, role: str, content: str):
    """Add a message to conversation history"""
    if conversation_id not in conversation_history:
        conversation_history[conversation_id] = []
    
    conversation_history[conversation_id].append({
        "role": role,
        "content": content
    })
    
    # Keep only last 20 messages to prevent memory issues
    if len(conversation_history[conversation_id]) > 20:
        conversation_history[conversation_id] = conversation_history[conversation_id][-20:]

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
        # Get conversation history
        history = get_conversation_history(conversation_id) if conversation_id else []
        
        # Build conversation context
        conversation_context = ""
        if history:
            conversation_context = "\n\nPREVIOUS CONVERSATION:\n"
            for msg in history[-10:]:  # Include last 10 messages
                role = "User" if msg["role"] == "user" else "Assistant"
                # Convert content to plain text if it's a dict/object
                content = convert_json_to_plain_text(msg['content'])
                conversation_context += f"{role}: {content}\n"
        
        # Create the prompt for the AI
        prompt = f"""You are a helpful AI assistant specialized in helping SMEs understand grant opportunities. You have access to detailed information about a specific grant and should provide professional, accurate, and helpful responses.

{grant_context}{conversation_context}

INSTRUCTIONS:
- Be professional and friendly in your responses
- Use the grant information to provide accurate answers
- If asked about something not in the grant details, say you don't have that information
- Help SMEs understand eligibility requirements, application processes, and key benefits
- Provide clear, actionable advice
- Keep responses concise but comprehensive
- Continue the conversation naturally based on previous messages
- Don't reintroduce yourself if this is not the first message

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
        
        # Ensure we have a string response, not an object
        if isinstance(ai_response, dict):
            logger.info(f"AI response is dict, converting: {ai_response}")
            ai_response = convert_json_to_plain_text(ai_response)
        elif not isinstance(ai_response, str):
            logger.info(f"AI response is not string, converting: {ai_response}")
            ai_response = str(ai_response)

        logger.info(f"AI response after initial conversion: {ai_response}")
        logger.info(f"AI response type: {type(ai_response)}")

        # Convert JSON/object to plain text first, then markdown to plain text
        plain_text_response = convert_json_to_plain_text(ai_response)
        plain_text_response = convert_markdown_to_plain_text(plain_text_response)
        
        logger.info(f"Final plain text response: {plain_text_response}")
        return plain_text_response

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
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
                    'Access-Control-Allow-Methods': 'POST,OPTIONS,GET',
                    'Access-Control-Max-Age': '86400'
                },
                'body': json.dumps({'message': 'CORS preflight successful'})
            }

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

        # Generate conversation ID if not provided
        if not conversation_id:
            conversation_id = f"conv_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{context.aws_request_id[:8]}"

        # Add user message to conversation history
        add_to_conversation_history(conversation_id, "user", message)

        # Generate AI response
        ai_response = generate_ai_response(message, grant_context, conversation_id)

        # Ensure the response is plain text (convert any remaining JSON/objects)
        final_response = convert_json_to_plain_text(ai_response)

        # Add AI response to conversation history (store as plain text)
        add_to_conversation_history(conversation_id, "assistant", final_response)

        # Return response in the format expected by the frontend
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
                'Access-Control-Allow-Methods': 'POST,OPTIONS,GET',
                'Access-Control-Max-Age': '86400'
            },
            'body': json.dumps({
                'message': final_response,
                'conversation_id': conversation_id,
                'timestamp': datetime.now().isoformat()
            })
        }

    except Exception as e:
        logger.error(f"Error in sme-chat lambda: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
                'Access-Control-Allow-Methods': 'POST,OPTIONS,GET',
                'Access-Control-Max-Age': '86400'
            },
            'body': json.dumps({
                'error': 'Internal server error',
                'message': f'Error: {str(e)}',
                'details': str(e)
            })
        }
