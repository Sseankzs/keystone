from flask import Flask, request, jsonify
import os
import json
from ask import lambda_handler as ask_handler
from match import lambda_handler as match_handler
from ingest_grant import lambda_handler as ingest_handler

app = Flask(__name__)

@app.route('/')
def health_check():
    return jsonify({"status": "healthy", "service": "MYsme Grant Matching API"})

@app.route('/ask', methods=['POST'])
def ask():
    """Q&A endpoint for grant questions"""
    try:
        data = request.get_json()
        result = ask_handler(data, None)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/match', methods=['POST'])
def match():
    """Grant matching endpoint"""
    try:
        data = request.get_json()
        result = match_handler(data, None)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/ingest', methods=['POST'])
def ingest():
    """Grant document ingestion endpoint"""
    try:
        data = request.get_json()
        result = ingest_handler(data, None)
        return jsonify(result)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
