import base64
import uuid
import json

def decode_base64(file_base64: str) -> bytes:
    """
    Decode a Base64 string into bytes.
    """
    try:
        return base64.b64decode(file_base64)
    except Exception as e:
        raise ValueError(f"Invalid Base64 data: {str(e)}")

def safe_filename(title: str, extension: str = "pdf") -> str:
    """
    Generate a safe, unique filename for S3.
    """
    return f"{uuid.uuid4()}_{title.replace(' ', '_')}.{extension}"

def make_response(status_code: int, body: dict) -> dict:
    """
    Return a properly formatted Lambda HTTP response.
    """
    return {
        "statusCode": status_code,
        "headers": {"Content-Type": "application/json"},
        "body": json.dumps(body)
    }
