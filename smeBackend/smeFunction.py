import json
import boto3
from botocore.exceptions import ClientError
from datetime import datetime

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
sme_profiles_table = dynamodb.Table('SMEProfiles')

def lambda_handler(event, context):
    """
    Main Lambda handler for SME backend operations
    """
    
    try:
        # Parse the incoming request
        http_method = event.get('httpMethod', '')
        path = event.get('path', '')
        
        # Route based on HTTP method and path
        if http_method == 'GET' and '/dashboard' in path:
            return handle_dashboard_request(event)
        else:
            return create_response(400, {'error': 'Invalid endpoint. Use GET /dashboard'})
    
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        return create_response(500, {'error': 'Internal server error'})

def handle_dashboard_request(event):
    """
    Handle dashboard request to retrieve all SME profiles
    """
    try:
        # Retrieve all SME profiles from DynamoDB
        sme_profiles = get_all_sme_profiles()
        
        return create_response(200, {
            "message": "SME profiles retrieved successfully",
            "sme_profiles": sme_profiles
        })
        
    except Exception as e:
        print(f"Dashboard request error: {str(e)}")
        return create_response(500, {'error': f'Failed to retrieve dashboard data: {str(e)}'})

def get_all_sme_profiles():
    """
    Retrieve all SME profiles from DynamoDB
    """
    try:
        # Scan the entire table
        response = sme_profiles_table.scan()
        
        # Extract items from response
        items = response.get('Items', [])
        
        # Convert DynamoDB items to regular dict format
        sme_profiles = []
        for item in items:
            # Convert DynamoDB decimal types to regular numbers
            profile = convert_dynamodb_item(item)
            sme_profiles.append(profile)
        
        return sme_profiles
        
    except ClientError as e:
        print(f"DynamoDB error: {str(e)}")
        raise e
    except Exception as e:
        print(f"Get SME profiles error: {str(e)}")
        raise e

def convert_dynamodb_item(item):
    """
    Convert DynamoDB item to regular Python dict, handling Decimal types
    """
    from decimal import Decimal
    
    def decimal_converter(obj):
        if isinstance(obj, Decimal):
            # Convert to int if it's a whole number, otherwise float
            if obj % 1 == 0:
                return int(obj)
            else:
                return float(obj)
        elif isinstance(obj, dict):
            return {k: decimal_converter(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [decimal_converter(item) for item in obj]
        return obj
    
    return decimal_converter(item)

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
            'Access-Control-Allow-Methods': 'GET, OPTIONS'
        },
        'body': json.dumps(body, indent=2)
    }