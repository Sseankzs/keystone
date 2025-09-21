#!/usr/bin/env python3
"""
Deploy the sme-chat Lambda function
"""

import boto3
import zipfile
import os
import json
from datetime import datetime

def deploy_lambda():
    """Deploy the Lambda function"""
    
    # Configuration
    FUNCTION_NAME = "sme-chat"
    REGION = "ap-southeast-1"
    RUNTIME = "python3.9"
    HANDLER = "lambda_function.lambda_handler"
    
    # Create deployment package
    print("📦 Creating deployment package...")
    
    # Create zip file
    zip_path = "sme-chat-deployment.zip"
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        # Add lambda function
        zipf.write("lambda_function.py", "lambda_function.py")
        
        # Add any other dependencies if needed
        # Note: boto3 is already available in Lambda runtime
    
    print(f"✅ Created deployment package: {zip_path}")
    
    # Initialize Lambda client
    lambda_client = boto3.client('lambda', region_name=REGION)
    
    try:
        # Read the zip file
        with open(zip_path, 'rb') as zip_file:
            zip_content = zip_file.read()
        
        print(f"🚀 Deploying to Lambda function: {FUNCTION_NAME}")
        
        # Update function code
        response = lambda_client.update_function_code(
            FunctionName=FUNCTION_NAME,
            ZipFile=zip_content
        )
        
        print(f"✅ Successfully deployed!")
        print(f"Function ARN: {response['FunctionArn']}")
        print(f"Last Modified: {response['LastModified']}")
        
        # Update function configuration if needed
        try:
            config_response = lambda_client.update_function_configuration(
                FunctionName=FUNCTION_NAME,
                Environment={
                    'Variables': {
                        'BEDROCK_MODEL_ID': 'anthropic.claude-3-haiku-20240307-v1:0',
                        'BEDROCK_REGION': 'ap-southeast-1',
                        'GRANTS_TABLE': 'Grants'
                    }
                },
                Timeout=30,
                MemorySize=256
            )
            print(f"✅ Updated function configuration")
        except Exception as e:
            print(f"⚠️  Could not update configuration: {str(e)}")
        
        # Clean up
        os.remove(zip_path)
        print(f"🧹 Cleaned up deployment package")
        
    except Exception as e:
        print(f"❌ Error deploying Lambda function: {str(e)}")
        if os.path.exists(zip_path):
            os.remove(zip_path)

if __name__ == "__main__":
    deploy_lambda()
