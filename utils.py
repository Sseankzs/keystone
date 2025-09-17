# utils.py
import os
import json
import boto3
import requests
from botocore.config import Config
from datetime import datetime
from opensearchpy import OpenSearch, RequestsHttpConnection
from requests.auth import HTTPBasicAuth

REGION = os.environ.get("AWS_REGION", "ap-southeast-1")
BEDROCK_MODEL_ID = os.environ.get("BEDROCK_MODEL_ID")
OPENSEARCH_HOST = os.environ.get("OPENSEARCH_HOST")
OPENSEARCH_INDEX = os.environ.get("OPENSEARCH_INDEX", "grants_idx")
S3_BUCKET = os.environ.get("S3_BUCKET")

boto_config = Config(retries={'max_attempts': 3})
s3 = boto3.client("s3", config=boto_config)
textract = boto3.client("textract", config=boto_config)
dynamodb = boto3.resource("dynamodb", region_name=REGION)
ssm = boto3.client("ssm", config=boto_config)
# For Bedrock runtime, AWS uses 'bedrock-runtime' client 
bedrock_runtime = boto3.client("bedrock-runtime", region_name=REGION, config=boto_config)

def get_opensearch_client():
    # This assumes your OpenSearch domain is using SigV4. In many setups you'd use AWSRequestsAuth.
    # Simplest: if OPENSEARCH_HOST requires basic auth, set OPENSEARCH_USER/PASS env vars.
    user = os.environ.get("OPENSEARCH_USER")
    passwd = os.environ.get("OPENSEARCH_PASS")
    if user and passwd:
        return OpenSearch(
            hosts=[OPENSEARCH_HOST],
            http_auth=(user, passwd),
            use_ssl=True,
            verify_certs=True,
            connection_class=RequestsHttpConnection,
        )
    # If using SigV4, an advanced auth handler needed; for hackathon, basic auth or public endpoint is easier.
    return OpenSearch(
        hosts=[OPENSEARCH_HOST],
        use_ssl=True, verify_certs=True, connection_class=RequestsHttpConnection
    )

def call_bedrock_generate(prompt, model_id=None, max_tokens=512, temperature=0.0):
    model = model_id or BEDROCK_MODEL_ID
    if not model:
        raise RuntimeError("BEDROCK_MODEL_ID not set")
    response = bedrock_runtime.invoke_model(
        modelId=model,
        contentType="application/json",
        body=json.dumps({
            "input": prompt,
            "max_tokens_to_sample": max_tokens,
            "temperature": temperature
        })
    )
    # Response body is a stream-like bytes. Read and parse.
    body = response['body'].read().decode('utf-8')
    # The exact format depends on the model; assume plain text.
    return body

def textract_extract_text_from_s3(s3_bucket, s3_key):
    # Use Textract synchronous for small docs — StartDocumentTextDetection is async, but we use AnalyzeDocument for demo
    # Simpler: fetch object and send to Textract DetectDocumentText if small (<5MB) by bytes. Here we use Textract analyze document with S3Ref
    try:
        resp = textract.analyze_document(
            Document={'S3Object': {'Bucket': s3_bucket, 'Name': s3_key}},
            FeatureTypes=['TABLES','FORMS']  # optional
        )
        # naive text aggregation
        lines = []
        for block in resp.get('Blocks', []):
            if block['BlockType'] == 'LINE':
                lines.append(block['Text'])
        return "\n".join(lines)
    except Exception as e:
        print("Textract error:", e)
        raise

def index_to_opensearch(doc_id, body):
    client = get_opensearch_client()
    client.index(OPENSEARCH_INDEX, body, id=doc_id)
    return True

def search_opensearch(query_body):
    client = get_opensearch_client()
    res = client.search(OPENSEARCH_INDEX, body=query_body)
    return res

def now_ts():
    return datetime.utcnow().isoformat() + "Z"
