import json
from upload_fund import upload_fund
from utils import make_response

def lambda_handler(event, context):
    try:
        body = json.loads(event.get("body", "{}"))
        title = body.get("title", "untitled")
        file_base64 = body.get("file_base64")

        if not file_base64:
            return make_response(400, {"message": "No file provided"})

        # Upload
        filename = upload_fund(file_base64, title)

        return make_response(200, {"message": "Upload successful", "filename": filename})

    except Exception as e:
        print("Error:", str(e))
        return make_response(500, {"message": "Internal Server Error", "error": str(e)})
