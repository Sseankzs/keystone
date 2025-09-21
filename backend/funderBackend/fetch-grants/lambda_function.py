import json
import boto3
import os
import logging
from botocore.exceptions import ClientError
from decimal import Decimal
from typing import Dict, Any, List

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
GRANTS_TABLE = os.environ.get('GRANTS_TABLE', 'Grants')

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    """
    Fetch grants from DynamoDB filtered by issuer
    """
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return create_response(200, {'message': 'CORS preflight successful'})
    
    try:
        # Parse query parameters
        query_params = event.get('queryStringParameters', {}) or {}
        issuer = query_params.get('issuer', 'innovation-foundation-001')  # Default issuer
        
        logger.info(f"Fetching grants for issuer: {issuer}")
        
        # Fetch grants from DynamoDB
        grants = fetch_grants_by_issuer(issuer)
        
        logger.info(f"Found {len(grants)} grants for issuer: {issuer}")
        
        # Return grants
        return create_response(200, {
            'grants': grants,
            'count': len(grants),
            'issuer': issuer
        })
        
    except Exception as e:
        logger.error(f"Error fetching grants: {str(e)}")
        return create_response(500, {
            'error': 'Internal server error',
            'message': str(e)
        })

def fetch_grants_by_issuer(issuer: str) -> List[Dict[str, Any]]:
    """
    Fetch all grants for a specific issuer from DynamoDB
    """
    try:
        table = dynamodb.Table(GRANTS_TABLE)
        
        # Scan the table with filter for issuer
        # Note: In production, you might want to use a GSI (Global Secondary Index) for better performance
        response = table.scan(
            FilterExpression='issuer = :issuer',
            ExpressionAttributeValues={
                ':issuer': issuer
            }
        )
        
        grants = response.get('Items', [])
        
        # Convert Decimal objects to float for JSON serialization
        grants = convert_decimals_to_float(grants)
        
        # Sort by created_at (newest first)
        grants.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return grants
        
    except ClientError as e:
        logger.error(f"Error fetching grants from DynamoDB: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error fetching grants: {str(e)}")
        raise

def convert_decimals_to_float(obj):
    """
    Recursively convert Decimal objects to float for JSON serialization
    """
    if isinstance(obj, list):
        return [convert_decimals_to_float(item) for item in obj]
    elif isinstance(obj, dict):
        return {key: convert_decimals_to_float(value) for key, value in obj.items()}
    elif isinstance(obj, Decimal):
        return float(obj)
    else:
        return obj

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
            'Access-Control-Allow-Methods': 'GET,OPTIONS',
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
    test_event = {
        'queryStringParameters': {
            'issuer': 'innovation-foundation-001'
        }
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_local()
