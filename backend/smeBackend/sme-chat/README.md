# SME Chat Lambda Function

This Lambda function provides AI-powered chat assistance for SMEs asking questions about specific grants.

## Overview

The `sme-chat` function uses AWS Bedrock to provide intelligent responses to SME questions about grant opportunities. It receives grant details and user messages, then generates contextual, helpful responses.

## API Endpoint

**URL:** `https://your-api-gateway-url.execute-api.ap-southeast-1.amazonaws.com/dev/sme-chat`  
**Method:** POST  
**Content-Type:** application/json

## Request Format

### Initial Chat (with grant_id)
```json
{
  "grant_id": "MDEC-2024-001",
  "message": "Hello! I'm here to help you with questions about this grant opportunity.",
  "conversation_id": null
}
```

### Ongoing Chat (without grant_id)
```json
{
  "message": "What are the eligibility requirements?",
  "conversation_id": "conv_20241221_143022_abc12345"
}
```

**Note**: The Lambda function will automatically fetch grant details from DynamoDB using the provided `grant_id`. No need to send grant details in the request body.

## Response Format

```json
{
  "statusCode": 200,
  "body": {
    "message": "Hello! I'm your AI assistant for the MDEC Digital Innovation Fund. I can help you understand the eligibility requirements, application process, and key benefits of this grant opportunity. What would you like to know?",
    "conversation_id": "conv_20241221_143022_abc12345",
    "timestamp": "2024-12-21T14:30:22.123456"
  }
}
```

## Features

- **Dynamic Data Fetching**: Automatically retrieves grant details from DynamoDB
- **Context-Aware**: Uses real grant data to provide accurate, relevant responses
- **Professional Tone**: Maintains a helpful, professional communication style
- **Conversation Tracking**: Supports ongoing conversations with conversation IDs
- **Comprehensive Knowledge**: Has access to all grant information including:
  - Basic details (title, issuer, funding amount, deadline)
  - Eligibility requirements
  - Required documents
  - Sector tags and descriptions
  - Application guidelines
- **Database Integration**: Fetches live data from DynamoDB grants table
- **Error Handling**: Gracefully handles missing grants and database errors

## Error Handling

- **500 Error**: Returns a user-friendly error message if the AI service is unavailable
- **Graceful Degradation**: Falls back to helpful error messages instead of technical errors

## Dependencies

- AWS Bedrock (Claude 3 Sonnet)
- Python 3.9+
- boto3

## Environment Variables

The Lambda function supports the following environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-sonnet-20240229-v1:0` | Bedrock model to use for AI responses |
| `BEDROCK_REGION` | `ap-southeast-1` | AWS region for Bedrock service |

### Supported Bedrock Models

- `anthropic.claude-3-sonnet-20240229-v1:0` (Default - Most capable)
- `anthropic.claude-3-haiku-20240307-v1:0` (Faster, less capable)
- `anthropic.claude-3-opus-20240229-v1:0` (Most capable, most expensive)
- `amazon.titan-text-express-v1` (Amazon's model)
- `amazon.titan-text-lite-v1` (Amazon's lighter model)

### Supported Regions

- `us-east-1` (N. Virginia)
- `us-west-2` (Oregon)
- `ap-southeast-1` (Singapore) - Default
- `ap-southeast-2` (Sydney)
- `eu-west-1` (Ireland)

## Deployment

### Option 1: Using AWS CLI

1. Set environment variables:
```bash
export BEDROCK_MODEL_ID="anthropic.claude-3-sonnet-20240229-v1:0"
export BEDROCK_REGION="ap-southeast-1"
```

2. Run the deployment script:
```bash
chmod +x deploy.sh
./deploy.sh
```

### Option 2: Using CloudFormation

1. Deploy the CloudFormation template:
```bash
aws cloudformation create-stack \
  --stack-name sme-chat-stack \
  --template-body file://cloudformation.yaml \
  --parameters ParameterKey=BedrockModelId,ParameterValue=anthropic.claude-3-sonnet-20240229-v1:0 \
               ParameterKey=BedrockRegion,ParameterValue=ap-southeast-1
```

### Option 3: Manual Deployment

1. Package the Lambda function
2. Deploy to AWS Lambda
3. Set environment variables in Lambda console:
   - `BEDROCK_MODEL_ID`: Your preferred model
   - `BEDROCK_REGION`: Your preferred region
4. Configure API Gateway endpoint
5. Set up proper IAM permissions for Bedrock access
6. Update the frontend with the correct API endpoint URL

## Usage in Frontend

The frontend should:
1. Send grant details on initial chat initialization
2. Include conversation_id for ongoing messages
3. Handle loading states and error responses
4. Display messages in a chat interface

## Security Considerations

- Input validation and sanitization
- Rate limiting to prevent abuse
- Proper error handling to avoid information leakage
- CORS configuration for web access
