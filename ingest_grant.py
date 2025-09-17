# ingest_grant.py
import os
import json
import uuid
from utils import s3, call_bedrock_generate, index_to_opensearch, textract_extract_text_from_s3
from bedrock_prompts import GRANT_SUMMARIZER_PROMPT

S3_BUCKET = os.environ.get("S3_BUCKET")
DEMO_MODE = os.environ.get("DEMO_MODE", "false").lower() == "true"

def lambda_handler(event, context):
    """
    Expected event:
    {
      "source_type": "s3|url",
      "s3_key": "grants/mdv.pdf",
      "url": null
    }
    """
    if DEMO_MODE:
        # return sample pre-seeded response
        return {
            "grant_id": "demo_mdv_2025",
            "title": "Demo MDV Tech Upgrade",
            "tags": ["manufacturing", "digitalization"]
        }

    source_type = event.get("source_type")
    if source_type == "s3":
        s3_key = event.get("s3_key")
        if not s3_key:
            return {"error": "s3_key required"}
        # Extract text
        try:
            text = textract_extract_text_from_s3(S3_BUCKET, s3_key)
        except Exception as e:
            return {"error": f"textract failed: {str(e)}"}

    elif source_type == "url":
        # basic fetch
        import requests, bs4
        url = event.get("url")
        r = requests.get(url, timeout=10)
        soup = bs4.BeautifulSoup(r.text, "html.parser")
        # strip boilerplate
        paragraphs = [p.get_text(separator=" ", strip=True) for p in soup.find_all("p")]
        text = "\n".join(paragraphs)
    else:
        return {"error": "invalid source_type"}

    # Call Bedrock summarizer
    prompt = GRANT_SUMMARIZER_PROMPT.replace("<<<GRANT_TEXT>>>", text[:50000])
    try:
        bedrock_out = call_bedrock_generate(prompt, max_tokens=600)
        # Attempt to parse JSON from model
        parsed = json.loads(bedrock_out.strip())
    except Exception as e:
        # fallback: minimal metadata
        parsed = {
            "title": "Unknown grant",
            "issuer": "Unknown",
            "purpose": text[:400],
            "sector_tags": [],
            "eligibility_rules": [],
            "required_documents": []
        }

    # store into DynamoDB table 'Grants'
    import boto3
    dynamodb = boto3.resource("dynamodb")
    table = dynamodb.Table("Grants")
    grant_id = parsed.get("grant_id") or f"grant_{uuid.uuid4().hex[:8]}"
    item = {
        "grant_id": grant_id,
        "title": parsed.get("title"),
        "issuer": parsed.get("issuer"),
        "purpose": parsed.get("purpose"),
        "sector_tags": parsed.get("sector_tags", []),
        "eligibility_rules": parsed.get("eligibility_rules", []),
        "required_documents": parsed.get("required_documents", []),
        "raw_s3": {"bucket": S3_BUCKET, "key": s3_key} if source_type == "s3" else None,
        "created_at": __import__('datetime').datetime.utcnow().isoformat() + "Z"
    }
    table.put_item(Item=item)

    # Index text chunks to OpenSearch (naive single-chunk approach)
    from utils import index_to_opensearch
    os_doc = {
        "grant_id": grant_id,
        "title": item["title"],
        "issuer": item["issuer"],
        "sector_tags": item["sector_tags"],
        "body": parsed.get("purpose") + "\n\n" + text[:4000],
        "created_at": item["created_at"]
    }
    index_to_opensearch(grant_id, os_doc)

    return {"grant_id": grant_id, "status": "ok", "title": item["title"]}
