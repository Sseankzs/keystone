import json
import boto3
import logging
import os
from datetime import datetime
from typing import Dict, Any, List
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Get environment variables
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-haiku-20240307-v1:0')
BEDROCK_REGION = os.environ.get('BEDROCK_REGION', 'ap-southeast-1')
GRANTS_TABLE = os.environ.get('GRANTS_TABLE', 'Grants')

# Initialize AWS clients
bedrock = boto3.client('bedrock-runtime', region_name=BEDROCK_REGION)
dynamodb = boto3.resource('dynamodb', region_name=BEDROCK_REGION)

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """
    SME Chat Lambda function that provides AI assistance for grant-related questions
    """
    try:
        # Handle CORS preflight requests
        if event.get('httpMethod') == 'OPTIONS':
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
        
        # Fetch grant details from DynamoDB
        grant_details = fetch_grant_from_database(grant_id)
        if not grant_details:
            logger.error(f"Grant not found in database: {grant_id}")
            raise Exception(f"Grant not found in database: {grant_id}")
        
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

def prepare_grant_context(grant_details: Dict[str, Any]) -> str:
    """
    Prepare a comprehensive context about the grant for the AI
    """
    context_parts = []
    
    # Basic grant information
    context_parts.append(f"Grant Title: {grant_details.get('title', 'N/A')}")
    context_parts.append(f"Grant ID: {grant_details.get('grant_id', 'N/A')}")
    context_parts.append(f"Issuer: {grant_details.get('issuer', 'N/A')}")
    context_parts.append(f"Country: {grant_details.get('country', 'N/A')}")
    context_parts.append(f"Status: {grant_details.get('status', 'N/A')}")
    context_parts.append(f"Deadline: {grant_details.get('deadline', 'N/A')}")
    
    # Funding amount
    amount_min = grant_details.get('amount_min')
    amount_max = grant_details.get('amount_max')
    if amount_min and amount_max:
        context_parts.append(f"Funding Range: RM {amount_min:,} - RM {amount_max:,}")
    elif amount_min:
        context_parts.append(f"Minimum Funding: RM {amount_min:,}")
    elif amount_max:
        context_parts.append(f"Maximum Funding: RM {amount_max:,}")
    
    # Description
    if grant_details.get('description'):
        context_parts.append(f"Description: {grant_details.get('description')}")
    
    # Sector tags
    sector_tags = grant_details.get('sector_tags', [])
    if sector_tags:
        context_parts.append(f"Sectors: {', '.join(sector_tags)}")
    
    # Eligibility rules
    eligibility_rules = grant_details.get('eligibility_rules', [])
    if eligibility_rules:
        context_parts.append("Eligibility Requirements:")
        for rule in eligibility_rules:
            if isinstance(rule, dict):
                key = rule.get('key', '')
                value = rule.get('value', '')
                context_parts.append(f"  - {key}: {value}")
            else:
                context_parts.append(f"  - {rule}")
    
    # Required documents
    required_documents = grant_details.get('required_documents', [])
    if required_documents:
        context_parts.append("Required Documents:")
        for doc in required_documents:
            context_parts.append(f"  - {doc}")
    
        return "\n".join(context_parts)

def fetch_grant_from_database(grant_id: str) -> Dict[str, Any]:
    """
    Fetch grant details from DynamoDB
    """
    try:
        table = dynamodb.Table(GRANTS_TABLE)
        
        # First try to scan the table directly (since we don't have a GSI)
        logger.info(f"Scanning table for grant_id: {grant_id}")
        response = table.scan(
            FilterExpression='grant_id = :grant_id',
            ExpressionAttributeValues={
                ':grant_id': grant_id
            }
        )
        
        if response['Items']:
            grant = response['Items'][0]
            logger.info(f"Found grant via table scan: {grant.get('title', 'Unknown')}")
            
            # Convert Decimal to float for JSON serialization
            for key in ['amount_min', 'amount_max']:
                if key in grant and grant[key] is not None:
                    grant[key] = float(grant[key])
            
            return grant
        else:
            logger.warning(f"Grant not found in database: {grant_id}")
            return None
                
    except Exception as e:
        logger.error(f"Error fetching grant from database: {str(e)}")
        return None

def generate_ai_response(message: str, grant_context: str, conversation_id: str = None) -> str:
    """
    Generate AI response using Bedrock
    """
    try:
        # Create the prompt for the AI
        prompt = f"""You are a helpful AI assistant specialized in helping SMEs understand grant opportunities. You have access to detailed information about a specific grant and should provide professional, accurate, and helpful responses.

GRANT INFORMATION:
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

        # Prepare the request for Bedrock
        body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
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
        ai_response = response_body['content'][0]['text']
        
        logger.info(f"Generated AI response: {ai_response}")
        return ai_response
        
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        # Remove fallback - let the error propagate
        raise e

def generate_intelligent_fallback(message: str, grant_context: str) -> str:
    """
    Generate intelligent responses based on grant data without Bedrock
    """
    message_lower = message.lower()
    
    # Extract grant details from context
    grant_info = {}
    lines = grant_context.split('\n')
    current_section = None
    current_content = []
    
    for line in lines:
        if ':' in line and not line.startswith('  -'):
            # Save previous section if exists
            if current_section and current_content:
                grant_info[current_section] = '\n'.join(current_content)
            
            # Start new section
            key, value = line.split(':', 1)
            current_section = key.strip()
            current_content = [value.strip()] if value.strip() else []
        elif line.startswith('  -') and current_section:
            # Add to current section
            current_content.append(line.strip())
        elif line.strip() and current_section:
            # Add to current section
            current_content.append(line.strip())
    
    # Save last section
    if current_section and current_content:
        grant_info[current_section] = '\n'.join(current_content)
    
    # Handle common questions
    if any(word in message_lower for word in ['eligibility', 'eligible', 'qualify', 'requirements']):
        eligibility = grant_info.get('Eligibility Requirements', grant_info.get('Eligibility Rules', 'Please check the grant documentation for specific eligibility requirements.'))
        return f"""Based on the grant information, here are the key eligibility requirements:

{eligibility}

To determine if you qualify, make sure you meet all the basic criteria listed above. If you have any specific questions about your eligibility, I'd recommend reaching out to the grant issuer directly for clarification."""

    elif any(word in message_lower for word in ['deadline', 'when', 'due', 'timeline']):
        deadline = grant_info.get('Deadline', 'Please check the grant documentation')
        return f"""The grant deadline is {deadline}. 

I recommend:
1. Starting your application at least 2-3 weeks before the deadline
2. Gathering all required documents early
3. Having someone review your application before submitting
4. Submitting a few days early to avoid any last-minute technical issues

Would you like help with any specific part of the application process?"""

    elif any(word in message_lower for word in ['amount', 'funding', 'money', 'budget', 'cost']):
        funding_range = grant_info.get('Funding Range', 'Please check the grant documentation')
        return f"""This grant offers funding ranging from {funding_range}.

The exact amount you receive will depend on:
1. Your project scope and requirements
2. The quality of your application
3. Available funding at the time of review
4. How well your project aligns with the grant objectives

Make sure to clearly justify your funding request in your application and show how the funds will be used effectively."""

    elif any(word in message_lower for word in ['documents', 'required', 'paperwork', 'application']):
        return f"""Here are the required documents for this grant:

{grant_info.get('Required Documents', 'Please check the grant documentation for the complete list of required documents.')}

Make sure to:
1. Prepare all documents well in advance
2. Ensure they are properly formatted and complete
3. Have them reviewed by someone else before submitting
4. Keep copies of everything you submit

Do you need help with any specific document requirements?"""

    elif any(word in message_lower for word in ['sector', 'industry', 'field', 'technology']):
        return f"""This grant is focused on: {grant_info.get('Sectors', grant_info.get('Sector Tags', 'Please check the grant documentation for specific sector requirements'))}

Make sure your project clearly demonstrates:
1. How it fits within these sector categories
2. Innovation in your chosen field
3. Market potential and commercial viability
4. Alignment with the grant's objectives

Would you like help positioning your project within these sectors?"""

    else:
        title = grant_info.get('Grant Title', grant_info.get('Title', 'funding opportunity'))
        funding = grant_info.get('Funding Range', grant_info.get('Amount Max', 'the maximum amount'))
        return f"""I'd be happy to help you with questions about this grant opportunity! 

Based on the grant information, this appears to be a {title} with funding up to {funding}.

Some common areas I can help with:
- Eligibility requirements and qualification criteria
- Application process and required documents
- Timeline and deadlines
- Funding amounts and budget planning
- Sector alignment and project positioning

What specific aspect of this grant would you like to know more about?"""

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create API Gateway response with proper CORS headers
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
            'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
        },
        'body': json.dumps(body)
    }
