import base64
import uuid
import boto3

s3 = boto3.client("s3")
BUCKET_NAME = "YOUR_BUCKET_NAME"

def upload_fund(file_base64: str, title: str) -> str:
    """
    Uploads a Base64-encoded file to S3.
    Returns the S3 filename.
    """
    # Decode Base64
    file_bytes = base64.b64decode(file_base64)

    # Safe filename
    filename = f"{uuid.uuid4()}_{title.replace(' ', '_')}.pdf"

    # Upload
    s3.put_object(Bucket=BUCKET_NAME, Key=filename, Body=file_bytes)

    return filename
