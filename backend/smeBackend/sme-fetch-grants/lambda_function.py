import json
import boto3
import os
from datetime import datetime
from typing import Dict, Any, List
import logging
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError
from decimal import Decimal

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Environment variables
GRANTS_TABLE = os.environ.get('GRANTS_TABLE', 'Grants')

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')

def lambda_handler(event, context):
    """
    Main Lambda handler for fetching all available grants for SME dashboard
    """
    
    # Handle preflight OPTIONS request
    if event.get('httpMethod') == 'OPTIONS':
        return create_response(200, {'message': 'CORS preflight successful'})
    
    try:
        logger.info(f"Received event: {json.dumps(event, default=str)}")
        
        # Parse query parameters
        query_params = event.get('queryStringParameters') or {}
        logger.info(f"Query parameters: {query_params}")
        
        # Optional filters
        status = query_params.get('status', None)  # No default filter
        limit = int(query_params.get('limit', 100))  # Higher default limit
        offset = int(query_params.get('offset', 0))  # For pagination
        
        logger.info(f"Fetching grants with status: {status}, limit: {limit}, offset: {offset}")
        
        # Get grants from database
        grants = get_grants_from_database(status, limit, offset)
        
        # Get total count for pagination
        total_count = get_total_grants_count(status)
        
        logger.info(f"Retrieved {len(grants)} grants out of {total_count} total")
        
        # Prepare response body
        response_body = {
            'message': 'Successfully retrieved grants',
            'grants': grants,
            'total_count': total_count,
            'returned_count': len(grants),
            'has_more': (offset + len(grants)) < total_count,
            'next_offset': offset + len(grants) if (offset + len(grants)) < total_count else None,
            'retrieved_at': datetime.utcnow().isoformat()
        }
        
        logger.info(f"Response body: {json.dumps(response_body, default=str)}")
        
        # Return the grants
        return create_response(200, response_body)
        
    except Exception as e:
        logger.error(f"Error fetching grants: {str(e)}")
        return create_response(500, {
            'error': 'Failed to fetch grants',
            'message': str(e)
        })

def get_grants_from_database(status: str, limit: int, offset: int) -> List[Dict[str, Any]]:
    """
    Retrieve grants from DynamoDB with optional filtering and pagination
    """
    
    try:
        table = dynamodb.Table(GRANTS_TABLE)
        
        # Build filter expression only if status is provided
        if status:
            filter_expression = Attr('status').eq(status)
            response = table.scan(
                FilterExpression=filter_expression,
                ProjectionExpression='grant_id, title, issuer, country, deadline, amount_min, amount_max, sector_tags, eligibility_rules, required_documents, created_at, updated_at, status'
            )
        else:
            # No filter - get all grants
            response = table.scan(
                ProjectionExpression='grant_id, title, issuer, country, deadline, amount_min, amount_max, sector_tags, eligibility_rules, required_documents, created_at, updated_at, status'
            )
        
        grants = response.get('Items', [])
        
        # Handle pagination if needed
        while 'LastEvaluatedKey' in response and len(grants) < (offset + limit):
            if status:
                response = table.scan(
                    FilterExpression=filter_expression,
                    ProjectionExpression='grant_id, title, issuer, country, deadline, amount_min, amount_max, sector_tags, eligibility_rules, required_documents, created_at, updated_at, status',
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
            else:
                response = table.scan(
                    ProjectionExpression='grant_id, title, issuer, country, deadline, amount_min, amount_max, sector_tags, eligibility_rules, required_documents, created_at, updated_at, status',
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
            grants.extend(response.get('Items', []))
        
        # Convert Decimal to float for JSON serialization
        for grant in grants:
            for key in ['amount_min', 'amount_max']:
                if key in grant and grant[key] is not None:
                    grant[key] = float(grant[key])
        
        # Apply pagination
        paginated_grants = grants[offset:offset + limit]
        
        # Sort by created_at (newest first)
        paginated_grants.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        logger.info(f"Retrieved {len(paginated_grants)} grants after pagination")
        return paginated_grants
        
    except ClientError as e:
        logger.error(f"DynamoDB error: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error retrieving grants: {str(e)}")
        raise

def get_total_grants_count(status: str) -> int:
    """
    Get total count of grants with the specified status
    """
    
    try:
        table = dynamodb.Table(GRANTS_TABLE)
        
        # Count items with the specified status
        if status:
            response = table.scan(
                FilterExpression=Attr('status').eq(status),
                Select='COUNT'
            )
            
            count = response.get('Count', 0)
            
            # Handle pagination for count
            while 'LastEvaluatedKey' in response:
                response = table.scan(
                    FilterExpression=Attr('status').eq(status),
                    Select='COUNT',
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                count += response.get('Count', 0)
        else:
            # Count all grants
            response = table.scan(Select='COUNT')
            
            count = response.get('Count', 0)
            
            # Handle pagination for count
            while 'LastEvaluatedKey' in response:
                response = table.scan(
                    Select='COUNT',
                    ExclusiveStartKey=response['LastEvaluatedKey']
                )
                count += response.get('Count', 0)
        
        logger.info(f"Total grants with status '{status}': {count}")
        return count
        
    except Exception as e:
        logger.error(f"Error counting grants: {str(e)}")
        return 0

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
    # Sample test event
    test_event = {
        'httpMethod': 'GET',
        'queryStringParameters': {
            'status': 'open',
            'limit': '10',
            'offset': '0'
        }
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    test_local()
