# match.py
import os
import json
from utils import call_bedrock_generate, search_opensearch
from bedrock_prompts import GOAL_INTENT_PROMPT, ELIGIBILITY_JUDGE_PROMPT
import boto3

DEMO_MODE = os.environ.get("DEMO_MODE", "false").lower() == "true"
OPENSEARCH_INDEX = os.environ.get("OPENSEARCH_INDEX", "grants_idx")

def compute_score(rule_results, fit_score, readiness):
    # rule_results: list of PASS/FAIL/UNCERTAIN
    # simple eligibility: PASS=1, UNCERTAIN=0.5, FAIL=0
    vals = {"PASS":1.0, "UNCERTAIN":0.5, "FAIL":0.0}
    elig_avg = sum(vals.get(r["result"], 0) for r in rule_results) / max(1, len(rule_results))
    return 0.6*elig_avg + 0.3*fit_score + 0.1*readiness

def lambda_handler(event, context):
    """
    event:
    {
      "company": { ... },
      "goal_text": "..."
    }
    """
    if DEMO_MODE:
        return {"results":[
            {"grant_id":"demo_mdv_2025", "score":87, "badges":["Likely eligible"], "why":"Matches sector and purpose; missing audited accounts.", "checklist":["SSM cert","Audited accounts"]}
        ]}

    company = event.get("company", {})
    goal_text = event.get("goal_text", "")
    # 1) extract intents
    prompt = GOAL_INTENT_PROMPT.replace("<<<GOAL_TEXT>>>", goal_text)
    try:
        intent_out = call_bedrock_generate(prompt, max_tokens=200)
        intents = json.loads(intent_out)
    except Exception:
        intents = {"purposes": [], "keywords": [], "implied_sector": None}

    # 2) query OpenSearch by keywords and sector
    query_terms = " ".join(intents.get("keywords", []) + ([intents.get("implied_sector")] if intents.get("implied_sector") else []))
    if not query_terms.strip():
        query_terms = company.get("sector", "")

    # simple BM25 query body (adjust for your OpenSearch version)
    q_body = {
        "size": 10,
        "query": {
            "multi_match": {
                "query": query_terms,
                "fields": ["title^3","sector_tags^3","body"]
            }
        }
    }
    search_res = search_opensearch(q_body)
    hits = search_res.get("hits", {}).get("hits", [])

    results = []
    for h in hits:
        src = h.get("_source", {})
        grant_json = {
            "grant_id": src.get("grant_id") or h.get("_id"),
            "title": src.get("title"),
            "sector_tags": src.get("sector_tags", []),
            "body": src.get("body","")
        }
        # 3) call bedrock eligibility judge
        judge_prompt = ELIGIBILITY_JUDGE_PROMPT.replace("<<<COMPANY_JSON>>>", json.dumps(company)).replace("<<<GRANT_JSON>>>", json.dumps(grant_json))
        try:
            judge_out = call_bedrock_generate(judge_prompt, max_tokens=400)
            judge_json = json.loads(judge_out)
        except Exception:
            judge_json = {"rule_results": [], "overall":"POSSIBLE", "missing_docs":[]}

        # 4) compute fit (Jaccard-like)
        company_tags = {company.get("sector","").lower()}
        grant_tags = set([t.lower() for t in grant_json.get("sector_tags",[])])
        if company_tags and grant_tags:
            intersection = company_tags.intersection(grant_tags)
            fit = len(intersection)/max(1, len(company_tags.union(grant_tags)))
        else:
            fit = 0.0
        readiness = 1.0 - (len(judge_json.get("missing_docs", []))/max(1, len(grant_json.get("required_documents",[]) or []))) if grant_json.get("required_documents") else 0.5

        score = int(round(100 * compute_score(judge_json.get("rule_results", []), fit, readiness)))

        results.append({
            "grant_id": grant_json["grant_id"],
            "title": grant_json["title"],
            "score": score,
            "why": judge_json.get("overall","POSSIBLE"),
            "missing_docs": judge_json.get("missing_docs", []),
            "citations": []  # left for ask endpoint
        })

    # sort top-3
    results = sorted(results, key=lambda r: r["score"], reverse=True)[:3]

    # store matches in DynamoDB
    ddb = boto3.resource("dynamodb")
    table = ddb.Table("Matches")
    for r in results:
        table.put_item(Item={
            "company_id": company.get("name","demo").lower().replace(" ","_"),
            "grant_id": r["grant_id"],
            "score": r["score"],
            "missing_docs": r["missing_docs"],
            "rationale": r["why"],
            "created_at": __import__('datetime').datetime.utcnow().isoformat() + "Z"
        })

    return {"results": results}
