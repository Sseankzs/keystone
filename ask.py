# ask.py
import os
import json
from utils import search_opensearch, call_bedrock_generate
DEMO_MODE = os.environ.get("DEMO_MODE", "false").lower() == "true"

RAG_PROMPT = """
You are a helpful assistant answering a user question about a grant. Use the provided passages to answer and include citations.

Passages:
<<<PASSAGES>>>

Question: <<<QUESTION>>>

Answer concisely in plain language. Include 1-2 quoted passages and the source title if available.
"""

def lambda_handler(event, context):
    """
    event: { "grant_id": "...", "question": "..." }
    """
    if DEMO_MODE:
        return {"answer":"You need SSM cert and audited accounts. (See 'Required documents' section.)", "citations":[{"quote":"Required documents include SSM, audited accounts","section":"Documents"}]}

    grant_id = event.get("grant_id")
    question = event.get("question", "")
    # fetch from OpenSearch by grant_id
    q = {"size": 5, "query": {"term": {"grant_id": grant_id}}}
    res = search_opensearch(q)
    hits = res.get("hits", {}).get("hits", [])
    passages = []
    for h in hits:
        src = h.get("_source", {})
        passages.append(f"Title: {src.get('title')}\n{src.get('body','')[:1000]}")

    prompt = RAG_PROMPT.replace("<<<PASSAGES>>>", "\n\n---\n\n".join(passages)).replace("<<<QUESTION>>>", question)
    out = call_bedrock_generate(prompt, max_tokens=300)
    return {"answer": out}
