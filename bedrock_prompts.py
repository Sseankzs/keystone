# bedrock_prompts.py
# Keep few-shot templates compact. Use them with call_bedrock_generate(prompt).

GRANT_SUMMARIZER_PROMPT = """
You are an information extraction assistant. Extract the following keys from the grant text:
- title: short title
- issuer
- purpose: short plain-English purpose
- sector_tags: list of sectors (e.g., manufacturing, agritech)
- eligibility_rules: list of simple rules (e.g., "company_age_years_min:2", "headcount_max:200", "jurisdiction:MY")
- required_documents: short list
- deadlines: dates if present

Return valid JSON only. Use direct quotes for purpose if present.
Grant text:
<<<GRANT_TEXT>>>
"""

ELIGIBILITY_JUDGE_PROMPT = """
You are an eligibility judge. Given a COMPANY JSON and a GRANT JSON, for each eligibility rule return PASS / FAIL / UNCERTAIN and a 1-sentence supporting quote (where possible).
Return JSON:
{
 "rule_results":[ {"rule":"...", "result":"PASS|FAIL|UNCERTAIN", "quote":"..."} ],
 "overall":"PASS|FAIL|POSSIBLE",
 "missing_docs": ["..."]
}
COMPANY: <<<COMPANY_JSON>>>
GRANT: <<<GRANT_JSON>>>
"""

GOAL_INTENT_PROMPT = """
Extract intents from this SME goal as JSON: {purposes:[...], keywords:[...], implied_sector: "..." }
Goal: <<<GOAL_TEXT>>>
"""

Rationale_template = "Explain in up to 60 words why this grant is a match and list up to 3 missing items."
