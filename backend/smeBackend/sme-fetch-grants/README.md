# SME Fetch Grants Lambda Function

This Lambda function fetches all available grants for the SME dashboard.

## Features

- Fetches grants from DynamoDB with optional filtering
- Supports pagination (limit/offset)
- Filters by status (default: 'open')
- Returns grants in a format suitable for the SME dashboard
- Includes CORS headers for web requests

## API Endpoint

```
GET https://your-api-gateway-url.execute-api.region.amazonaws.com/dev/sme-fetch-grants
```

### Query Parameters

- `status` (optional): Filter by grant status (default: 'open')
- `limit` (optional): Number of grants to return (default: 50)
- `offset` (optional): Number of grants to skip for pagination (default: 0)

### Example Request

```
GET /sme-fetch-grants?status=open&limit=20&offset=0
```

### Response Format

```json
{
  "statusCode": 200,
  "body": {
    "message": "Successfully retrieved grants",
    "grants": [
      {
        "grant_id": "grant-123",
        "title": "Manufacturing Innovation Grant",
        "issuer": "Department of Commerce",
        "country": "United States",
        "deadline": "2024-12-31",
        "amount_min": 100000,
        "amount_max": 500000,
        "sector_tags": ["Manufacturing", "Innovation"],
        "eligibility_rules": [...],
        "required_documents": [...],
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total_count": 25,
    "returned_count": 20,
    "has_more": true,
    "next_offset": 20,
    "retrieved_at": "2024-01-15T10:30:00Z"
  }
}
```

## Environment Variables

- `GRANTS_TABLE`: DynamoDB table name (default: 'Grants')

## Deployment

1. Package the function:
```bash
cd backend/smeBackend/sme-fetch-grants
zip -r sme-fetch-grants.zip lambda_function.py
```

2. Create Lambda function in AWS Console or use AWS CLI:
```bash
aws lambda create-function \
  --function-name sme-fetch-grants \
  --runtime python3.9 \
  --role arn:aws:iam::YOUR_ACCOUNT:role/lambda-execution-role \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://sme-fetch-grants.zip
```

3. Set environment variables:
```bash
aws lambda update-function-configuration \
  --function-name sme-fetch-grants \
  --environment Variables='{GRANTS_TABLE=Grants}'
```

4. Create API Gateway endpoint and connect to Lambda function

## Testing

Run locally:
```bash
python lambda_function.py
```

This will execute the test function with sample parameters.
