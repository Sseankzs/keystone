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
S3_BUCKET = os.environ.get("S3_BUCKET")

boto_config = Config(retries={'max_attempts': 3})

# Lazy-loaded AWS clients to avoid initialization errors during import
_s3_client = None
_textract_client = None
_dynamodb_resource = None
_ssm_client = None
_bedrock_runtime_client = None

def get_s3_client():
    global _s3_client
    if _s3_client is None:
        _s3_client = boto3.client("s3", config=boto_config)
    return _s3_client

def get_textract_client():
    global _textract_client
    if _textract_client is None:
        _textract_client = boto3.client("textract", config=boto_config)
    return _textract_client

def get_dynamodb_resource():
    global _dynamodb_resource
    if _dynamodb_resource is None:
        _dynamodb_resource = boto3.resource("dynamodb", region_name=REGION)
    return _dynamodb_resource

def get_ssm_client():
    global _ssm_client
    if _ssm_client is None:
        _ssm_client = boto3.client("ssm", config=boto_config)
    return _ssm_client

def get_bedrock_runtime_client():
    global _bedrock_runtime_client
    if _bedrock_runtime_client is None:
        _bedrock_runtime_client = boto3.client("bedrock-runtime", region_name=REGION, config=boto_config)
    return _bedrock_runtime_client

def call_bedrock_generate(prompt, model_id=None, max_tokens=512, temperature=0.0):
    model = model_id or BEDROCK_MODEL_ID
    if not model:
        raise RuntimeError("BEDROCK_MODEL_ID not set")
    bedrock_runtime = get_bedrock_runtime_client()
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
        textract = get_textract_client()
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
