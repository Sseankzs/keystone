# lambda_create_grant.py
import os
import json
import uuid
import boto3
from datetime import datetime

DYNAMODB_TABLE = os.environ['GRANTS_TABLE']
S3_BUCKET = os.environ['GRANTS_BUCKET']
PRESIGNED_EXPIRES = int(os.getenv('PRESIGNED_EXPIRES', '3600'))  # seconds

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(DYNAMODB_TABLE)
s3 = boto3.client('s3')

def lambda_handler(event, context):
    """
    Expects API Gateway (proxy) event with JSON body:
    {
      "title": "Some grant title",
      "description": "Optional description",
      "issuer": "funder_id"
    }
    Returns: {grant_id, upload_url, s3_key}
    """
    body = json.loads(event.get('body') or "{}")
    title = body.get('title')
    description = body.get('description', '')
    issuer = body.get('issuer')
    if not title or not issuer:
        return {
            "statusCode": 400,
            "body": json.dumps({"error": "Missing required fields: title, issuer"})
        }

    grant_id = str(uuid.uuid4())
    s3_key = f"grants/{grant_id}/original.pdf"
    now = datetime.utcnow().isoformat()

    # create minimal Grants item - fields will be enriched after processing
    item = {
        "grant_id": grant_id,
        "title": title,
        "description": description,
        "issuer": issuer,
        "status": "awaiting_pdf",
        "created_at": now,
        # place-holder fields for later:
        "amount_min": None,
        "amount_max": None,
        "deadline": None,
        "sector_tags": [],
        "required_documents": [],
        "textract_job_id": None,
        "s3_key": s3_key
    }

    table.put_item(Item=item)

    # presigned PUT URL
    upload_url = s3.generate_presigned_url(
        ClientMethod='put_object',
        Params={
            'Bucket': S3_BUCKET,
            'Key': s3_key,
            'ContentType': 'application/pdf'
        },
        ExpiresIn=PRESIGNED_EXPIRES
    )

    resp = {
        "grant_id": grant_id,
        "upload_url": upload_url,
        "s3_key": s3_key
    }

    return {
        "statusCode": 201,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(resp)
    }
