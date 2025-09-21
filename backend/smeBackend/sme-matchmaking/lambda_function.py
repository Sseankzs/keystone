import json
import boto3
import os
from datetime import datetime
from typing import Dict, Any, List
import logging
from boto3.dynamodb.conditions import Attr
from botocore.exceptions import ClientError

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Initialize AWS clients
dynamodb = boto3.resource('dynamodb')
bedrock = boto3.client('bedrock-runtime')

# Environment variables
GRANTS_TABLE = os.environ.get('GRANTS_TABLE', 'Grants')
BEDROCK_MODEL_ID = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
BEDROCK_REGION = os.environ.get('BEDROCK_REGION', 'us-east-1')

def lambda_handler(event, context):
    """
    Main Lambda handler for AI-powered grant matchmaking
    """
    
    try:
        # Parse the incoming request
        if 'body' in event:
            body = json.loads(event['body']) if isinstance(event['body'], str) else event['body']
        else:
            body = event
        
        # Extract SME goals/description
        sme_goals = body.get('goals', '').strip()
        sme_id = body.get('sme_id')  # Optional for tracking
        max_matches = body.get('max_matches', 10)
        
        if not sme_goals:
            return create_response(400, {
                'error': 'Please provide your funding goals and objectives'
            })
        
        logger.info(f"Processing matchmaking request for SME: {sme_id}")
        logger.info(f"Goals: {sme_goals[:200]}...")
        
        # Get available grants from database
        available_grants = get_available_grants()
        logger.info(f"Retrieved {len(available_grants)} grants from database")
        
        if not available_grants:
            logger.warning("No grants found in database")
            return create_response(200, {
                'message': 'No grants currently available',
                'matches': [],
                'total_matches': 0
            })
        
        # Log sample grants for debugging
        logger.info("Sample grants from database:")
        for i, grant in enumerate(available_grants[:3]):
            logger.info(f"Grant {i+1}: {grant.get('title', 'No title')} - Status: {grant.get('status', 'No status')} - Sectors: {grant.get('sector_tags', [])}")
        
        # Use Bedrock to analyze and match grants
        logger.info("Calling Bedrock for grant analysis...")
        matches = analyze_grants_with_bedrock(sme_goals, available_grants, max_matches)
        logger.info(f"Bedrock returned {len(matches)} matches")
        
        # If Bedrock returns no matches, try enhanced fallback matching
        if not matches:
            logger.info("No Bedrock matches found, trying enhanced fallback matching...")
            matches = enhanced_fallback_matching(sme_goals, available_grants, max_matches)
            logger.info(f"Enhanced fallback returned {len(matches)} grant matches")
        
        # If still no matches, return all grants as a last resort
        if not matches:
            logger.info("No matches found with any method, returning all available grants...")
            matches = return_all_grants_fallback(available_grants, max_matches)
            logger.info(f"All grants fallback returned {len(matches)} grant matches")
        
        # Return the matches
        return create_response(200, {
            'message': 'Successfully found grant matches',
            'sme_goals': sme_goals,
            'matches': matches,
            'total_matches': len(matches),
            'processed_at': datetime.utcnow().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error in grant matchmaking: {str(e)}")
        return create_response(500, {
            'error': 'Matchmaking service failed',
            'message': str(e)
        })

def get_available_grants() -> List[Dict[str, Any]]:
    """
    Retrieve available grants from DynamoDB
    """
    
    try:
        table = dynamodb.Table(GRANTS_TABLE)
        
        # Scan for open grants (you might want to add GSI for better performance)
        response = table.scan(
            FilterExpression=Attr('status').eq('open'),
            ProjectionExpression='grant_id, title, issuer, country, deadline, amount_min, amount_max, sector_tags, eligibility_rules, required_documents'
        )
        
        grants = response.get('Items', [])
        
        # Handle pagination if needed
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                FilterExpression=Attr('status').eq('open'),
                ProjectionExpression='grant_id, title, issuer, country, deadline, amount_min, amount_max, sector_tags, eligibility_rules, required_documents',
                ExclusiveStartKey=response['LastEvaluatedKey']
            )
            grants.extend(response.get('Items', []))
        
        # Convert Decimal to float for JSON serialization
        for grant in grants:
            for key in ['amount_min', 'amount_max']:
                if key in grant and grant[key] is not None:
                    grant[key] = float(grant[key])
        
        logger.info(f"Retrieved {len(grants)} available grants")
        return grants
        
    except Exception as e:
        logger.error(f"Error retrieving grants: {str(e)}")
        return []

def analyze_grants_with_bedrock(sme_goals: str, grants: List[Dict], max_matches: int = 10) -> List[Dict[str, Any]]:
    """
    Use Bedrock to analyze SME goals against available grants and return matches
    """
    
    logger.info(f"Starting Bedrock analysis with {len(grants)} grants")
    logger.info(f"SME Goals: {sme_goals[:100]}...")
    
    # Prepare grants data for Bedrock analysis
    grants_summary = []
    for grant in grants:
        summary = {
            'id': grant['grant_id'],
            'title': grant['title'],
            'issuer': grant['issuer'],
            'country': grant.get('country'),
            'deadline': grant.get('deadline'),
            'amount_range': f"${grant.get('amount_min', 0):,.0f} - ${grant.get('amount_max', 0):,.0f}" if grant.get('amount_min') or grant.get('amount_max') else "Amount not specified",
            'sectors': grant.get('sector_tags', []),
            'eligibility': [f"{rule.get('key', '')}: {rule.get('value', '')}" for rule in grant.get('eligibility_rules', [])],
            'required_docs': grant.get('required_documents', [])
        }
        grants_summary.append(summary)
    
    logger.info(f"Prepared {len(grants_summary)} grants for Bedrock analysis")
    
    # Construct the prompt for Bedrock
    prompt = f"""
    You are an expert grant matchmaking specialist. Analyze the SME's funding goals against available grants and return the most relevant matches.

    SME's Funding Goals:
    {sme_goals}

    Available Grants:
    {json.dumps(grants_summary, indent=2)}

    IMPORTANT MATCHING CRITERIA:
    1. Look for ANY grants that could be relevant, even loosely
    2. Consider sector tags, title keywords, and general business themes
    3. Manufacturing keywords: manufacturing, production, factory, plant, tissue, paper, textile, fabric, clothing, garment, make, produce, create
    4. Technology keywords: technology, tech, software, ai, artificial, intelligence, digital, computer, app, platform, system, automation
    5. Business keywords: business, company, startup, enterprise, organization, development, growth, expansion, scale, improve
    6. Funding keywords: funding, grant, money, capital, investment, support, financial

    Please analyze each grant's relevance to the SME's goals and return a JSON array of the top {max_matches} matches, ordered by relevance (best matches first).

    For each match, provide this exact JSON structure:
    {{
        "grant_id": "exact_grant_id_from_above",
        "relevance_score": 0.0-1.0,
        "match_reasoning": "Detailed explanation of why this grant matches the SME's goals",
        "key_benefits": ["benefit1", "benefit2", "benefit3"],
        "potential_concerns": ["concern1", "concern2"] or [],
        "recommended_focus": "Specific advice on how to position their application",
        "deadline_urgency": "low|medium|high",
        "competition_level": "low|medium|high"
    }}

    SCORING GUIDELINES (BE CONSERVATIVE):
    - 0.8-0.9: Excellent match - exact sector, amount, and goal alignment
    - 0.6-0.7: Very good match - strong sector alignment and relevant goals
    - 0.4-0.5: Good match - some sector/keyword alignment
    - 0.3-0.4: Moderate match - loose relevance to goals
    - 0.2-0.3: Weak match - minimal relevance but still applicable
    - Below 0.2: Do not include
    
    IMPORTANT: Be conservative with scores. Most matches should be 0.3-0.6 range.

    Guidelines:
    1. Include grants with relevance_score >= 0.2 (lower threshold for more matches)
    2. Consider sector alignment, funding amount needs, geographic eligibility, and goal alignment
    3. Be specific and actionable in your reasoning
    4. Highlight both opportunities and challenges
    5. Consider application complexity and SME's likely capability
    6. Factor in deadline urgency and competition level
    7. If no exact matches, include grants that are generally relevant to business development
    8. Return only valid JSON array, no additional text

    Return the matches as a JSON array:
    """
    
    try:
        # Call Bedrock
        logger.info("Calling Bedrock API...")
        response = call_bedrock(prompt)
        logger.info(f"Bedrock response length: {len(response)} characters")
        logger.info(f"Bedrock response preview: {response[:200]}...")
        
        # Parse and validate the response
        logger.info("Parsing Bedrock response...")
        matches = parse_bedrock_response(response, grants)
        
        logger.info(f"Successfully parsed {len(matches)} grant matches from Bedrock")
        return matches
        
    except Exception as e:
        logger.error(f"Error using Bedrock for matchmaking: {str(e)}")
        logger.error(f"Exception type: {type(e).__name__}")
        logger.error(f"Exception details: {e}", exc_info=True)
        
        # Fallback: return a simple rule-based match
        logger.info("Using fallback matching logic...")
        fallback_matches = create_fallback_matches(sme_goals, grants, max_matches)
        logger.info(f"Fallback returned {len(fallback_matches)} matches")
        return fallback_matches

def call_bedrock(prompt: str) -> str:
    """
    Call Bedrock API with the matchmaking prompt
    """
    
    try:
        # Initialize bedrock client with correct region
        bedrock_client = boto3.client('bedrock-runtime', region_name=BEDROCK_REGION)
        
        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 3000,
            "temperature": 0.3,
            "messages": [
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        }
        
        response = bedrock_client.invoke_model(
            modelId=BEDROCK_MODEL_ID,
            body=json.dumps(request_body),
            contentType='application/json'
        )
        
        response_body = json.loads(response['body'].read())
        return response_body.get('content', [{}])[0].get('text', '[]')
        
    except Exception as e:
        logger.error(f"Bedrock API call failed: {str(e)}")
        raise

def parse_bedrock_response(bedrock_response: str, original_grants: List[Dict]) -> List[Dict[str, Any]]:
    """
    Parse and validate Bedrock's JSON response
    """
    
    try:
        logger.info(f"Parsing Bedrock response: {bedrock_response[:500]}...")
        
        # Clean the response
        json_text = bedrock_response.strip()
        
        # Remove markdown code blocks if present
        if json_text.startswith('```json'):
            json_text = json_text[7:]
        if json_text.endswith('```'):
            json_text = json_text[:-3]
        json_text = json_text.strip()
        
        logger.info(f"Cleaned JSON text: {json_text[:200]}...")
        
        # Parse JSON
        matches = json.loads(json_text)
        logger.info(f"Successfully parsed JSON with {len(matches)} items")
        
        if not isinstance(matches, list):
            raise ValueError("Response is not a JSON array")
        
        # Validate and enrich each match
        validated_matches = []
        grants_lookup = {grant['grant_id']: grant for grant in original_grants}
        
        for match in matches:
            if not isinstance(match, dict):
                continue
                
            grant_id = match.get('grant_id')
            if not grant_id or grant_id not in grants_lookup:
                continue
            
            # Get full grant details
            full_grant = grants_lookup[grant_id]
            
            # Validate and structure the match
            validated_match = {
                'grant_id': grant_id,
                'title': full_grant['title'],
                'issuer': full_grant['issuer'],
                'country': full_grant.get('country'),
                'deadline': full_grant.get('deadline'),
                'amount_min': full_grant.get('amount_min'),
                'amount_max': full_grant.get('amount_max'),
                'sector_tags': full_grant.get('sector_tags', []),
                'relevance_score': min(1.0, max(0.0, float(match.get('relevance_score', 0.5)))),
                'match_reasoning': match.get('match_reasoning', ''),
                'key_benefits': match.get('key_benefits', []),
                'potential_concerns': match.get('potential_concerns', []),
                'recommended_focus': match.get('recommended_focus', ''),
                'deadline_urgency': match.get('deadline_urgency', 'medium'),
                'competition_level': match.get('competition_level', 'medium'),
                'required_documents': full_grant.get('required_documents', []),
                'eligibility_rules': full_grant.get('eligibility_rules', [])
            }
            
            validated_matches.append(validated_match)
        
        # Sort by relevance score
        validated_matches.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        return validated_matches
        
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse Bedrock JSON response: {str(e)}")
        logger.error(f"Response was: {bedrock_response}")
        raise ValueError("Invalid JSON response from AI")
        
    except Exception as e:
        logger.error(f"Error processing Bedrock response: {str(e)}")
        raise

def create_fallback_matches(sme_goals: str, grants: List[Dict], max_matches: int) -> List[Dict[str, Any]]:
    """
    Create simple rule-based matches as fallback when Bedrock fails
    """
    
    logger.info(f"Using fallback matching algorithm for '{sme_goals[:50]}...' with {len(grants)} grants")
    
    # Simple keyword matching
    goal_words = set(sme_goals.lower().split())
    logger.info(f"Goal words: {list(goal_words)[:10]}...")
    
    scored_grants = []
    for i, grant in enumerate(grants):
        score = 0.0
        
        # Check title and sector tags for keyword matches
        title_words = set(grant['title'].lower().split())
        sector_words = set(' '.join(grant.get('sector_tags', [])).lower().split())
        
        # Calculate overlap
        title_overlap = len(goal_words.intersection(title_words))
        sector_overlap = len(goal_words.intersection(sector_words))
        
        if title_overlap > 0:
            score += title_overlap * 0.4
        if sector_overlap > 0:
            score += sector_overlap * 0.6
        
        logger.info(f"Grant {i+1}: '{grant['title'][:30]}...' - Title overlap: {title_overlap}, Sector overlap: {sector_overlap}, Score: {score:.2f}")
        
        if score > 0:
            # Calculate more conservative relevance score
            # Base score for any match
            base_score = 0.2
            
            # Title matches (moderate weight)
            title_score = min(0.3, title_overlap * 0.1)
            
            # Sector matches (high weight but capped)
            sector_score = min(0.4, sector_overlap * 0.15)
            
            # Calculate final score (capped at 0.8 for fallback)
            final_score = min(0.8, base_score + title_score + sector_score)
            
            match = {
                'grant_id': grant['grant_id'],
                'title': grant['title'],
                'issuer': grant['issuer'],
                'country': grant.get('country'),
                'deadline': grant.get('deadline'),
                'amount_min': grant.get('amount_min'),
                'amount_max': grant.get('amount_max'),
                'sector_tags': grant.get('sector_tags', []),
                'relevance_score': final_score,
                'match_reasoning': f"Matched based on keyword similarity in {['title', 'sector'][sector_overlap > title_overlap]}",
                'key_benefits': ['Funding opportunity', 'Business growth support'],
                'potential_concerns': ['Application requirements may be complex'],
                'recommended_focus': 'Review eligibility requirements carefully',
                'deadline_urgency': 'medium',
                'competition_level': 'medium',
                'required_documents': grant.get('required_documents', []),
                'eligibility_rules': grant.get('eligibility_rules', [])
            }
            scored_grants.append(match)
    
    # Sort and return top matches
    scored_grants.sort(key=lambda x: x['relevance_score'], reverse=True)
    final_matches = scored_grants[:max_matches]
    logger.info(f"Fallback matching returned {len(final_matches)} matches out of {len(scored_grants)} scored grants")
    return final_matches

def enhanced_fallback_matching(sme_goals: str, grants: List[Dict], max_matches: int) -> List[Dict[str, Any]]:
    """
    Enhanced fallback matching that uses sector tags and keyword matching
    """
    
    logger.info(f"Enhanced fallback matching for '{sme_goals[:50]}...' with {len(grants)} grants")
    
    # Extract keywords from SME goals
    goal_words = set(sme_goals.lower().split())
    logger.info(f"Goal words: {list(goal_words)[:10]}...")
    
    # Define sector keyword mappings
    sector_keywords = {
        'manufacturing': ['manufacturing', 'production', 'factory', 'plant', 'tissue', 'paper', 'textile', 'fabric', 'clothing', 'garment'],
        'technology': ['technology', 'tech', 'software', 'ai', 'artificial', 'intelligence', 'digital', 'computer', 'app', 'platform'],
        'healthcare': ['healthcare', 'health', 'medical', 'pharmaceutical', 'biotech', 'biotechnology', 'medicine', 'clinical'],
        'agriculture': ['agriculture', 'farming', 'crop', 'food', 'agricultural', 'farming', 'livestock', 'dairy'],
        'energy': ['energy', 'renewable', 'solar', 'wind', 'green', 'sustainable', 'clean', 'power', 'electricity'],
        'education': ['education', 'training', 'learning', 'school', 'university', 'academic', 'research', 'study'],
        'finance': ['finance', 'financial', 'fintech', 'banking', 'investment', 'funding', 'capital', 'money'],
        'retail': ['retail', 'commerce', 'ecommerce', 'e-commerce', 'shopping', 'store', 'marketplace', 'sales'],
        'transportation': ['transportation', 'logistics', 'shipping', 'delivery', 'freight', 'transport', 'mobility'],
        'construction': ['construction', 'building', 'infrastructure', 'development', 'real estate', 'property', 'housing']
    }
    
    scored_grants = []
    
    for i, grant in enumerate(grants):
        score = 0.0
        match_reasons = []
        
        # Get grant details
        title = grant.get('title', '').lower()
        sectors = [s.lower() for s in grant.get('sector_tags', [])]
        issuer = grant.get('issuer', '').lower()
        
        logger.info(f"Grant {i+1}: '{grant.get('title', 'No title')[:30]}...' - Sectors: {sectors}")
        
        # 1. Direct keyword matching in title
        title_words = set(title.split())
        title_overlap = len(goal_words.intersection(title_words))
        if title_overlap > 0:
            score += title_overlap * 0.3
            match_reasons.append(f"Title keywords: {list(goal_words.intersection(title_words))}")
        
        # 2. Sector tag matching
        sector_matches = 0
        for sector in sectors:
            if sector in sector_keywords:
                sector_keyword_matches = len(goal_words.intersection(sector_keywords[sector]))
                if sector_keyword_matches > 0:
                    score += sector_keyword_matches * 0.4
                    sector_matches += sector_keyword_matches
                    match_reasons.append(f"Sector '{sector}' keywords: {list(goal_words.intersection(sector_keywords[sector]))}")
            else:
                # Direct sector name matching
                if any(keyword in sector for keyword in goal_words):
                    score += 0.3
                    sector_matches += 1
                    match_reasons.append(f"Direct sector match: '{sector}'")
        
        # 3. Broad category matching
        if any(word in goal_words for word in ['funding', 'grant', 'money', 'capital', 'investment', 'support']):
            score += 0.2
            match_reasons.append("Funding-related keywords")
        
        if any(word in goal_words for word in ['business', 'company', 'startup', 'enterprise', 'organization']):
            score += 0.1
            match_reasons.append("Business-related keywords")
        
        if any(word in goal_words for word in ['development', 'growth', 'expansion', 'scale', 'improve']):
            score += 0.1
            match_reasons.append("Development-related keywords")
        
        # 4. Manufacturing-specific matching
        manufacturing_keywords = ['manufacturing', 'production', 'factory', 'plant', 'tissue', 'paper', 'textile', 'fabric', 'clothing', 'garment', 'make', 'produce', 'create']
        if any(word in goal_words for word in manufacturing_keywords):
            score += 0.3
            match_reasons.append("Manufacturing-related keywords")
        
        # 5. Technology-specific matching
        tech_keywords = ['technology', 'tech', 'software', 'ai', 'artificial', 'intelligence', 'digital', 'computer', 'app', 'platform', 'system', 'automation']
        if any(word in goal_words for word in tech_keywords):
            score += 0.3
            match_reasons.append("Technology-related keywords")
        
        logger.info(f"Grant {i+1} scoring: {score:.2f} - Reasons: {match_reasons}")
        
        # Only include if score is above threshold
        if score >= 0.1:  # Lower threshold to catch more matches
            # Calculate relevance score more conservatively
            # Start with a lower base score
            base_score = 0.15
            
            # Title keyword matches (moderate weight)
            title_score = min(0.25, title_overlap * 0.08)
            
            # Sector matches (high weight but capped)
            sector_score = min(0.35, sector_matches * 0.12)
            
            # Manufacturing/tech specific matches (moderate weight)
            specific_score = 0.0
            if any(word in goal_words for word in manufacturing_keywords):
                specific_score += 0.2
            if any(word in goal_words for word in tech_keywords):
                specific_score += 0.2
            
            # Business/funding keywords (low weight)
            business_score = 0.0
            if any(word in goal_words for word in ['funding', 'grant', 'money', 'capital', 'investment', 'support']):
                business_score += 0.05
            if any(word in goal_words for word in ['business', 'company', 'startup', 'enterprise', 'organization']):
                business_score += 0.03
            if any(word in goal_words for word in ['development', 'growth', 'expansion', 'scale', 'improve']):
                business_score += 0.03
            
            # Calculate final relevance score (0.15 to 0.85)
            final_score = min(0.85, base_score + title_score + sector_score + specific_score + business_score)
            
            # Ensure minimum score for any match
            final_score = max(0.2, final_score)
            
            match = {
                'grant_id': grant['grant_id'],
                'title': grant['title'],
                'issuer': grant['issuer'],
                'country': grant.get('country'),
                'deadline': grant.get('deadline'),
                'amount_min': grant.get('amount_min'),
                'amount_max': grant.get('amount_max'),
                'sector_tags': grant.get('sector_tags', []),
                'relevance_score': final_score,
                'match_reasoning': f"Enhanced matching: {'; '.join(match_reasons[:3])}",
                'key_benefits': [
                    'Funding opportunity',
                    'Business growth support',
                    f'Relevant to {sectors[0] if sectors else "your industry"}' if sectors else 'Your business needs'
                ],
                'potential_concerns': [
                    'Check eligibility requirements carefully',
                    'Review application deadlines'
                ],
                'recommended_focus': f"Focus on {match_reasons[0] if match_reasons else 'general business development'}",
                'deadline_urgency': 'medium',
                'competition_level': 'medium',
                'required_documents': grant.get('required_documents', []),
                'eligibility_rules': grant.get('eligibility_rules', [])
            }
            scored_grants.append(match)
    
    # Sort by relevance score
    scored_grants.sort(key=lambda x: x['relevance_score'], reverse=True)
    final_matches = scored_grants[:max_matches]
    
    logger.info(f"Enhanced fallback matching returned {len(final_matches)} matches out of {len(scored_grants)} scored grants")
    return final_matches

def return_all_grants_fallback(grants: List[Dict], max_matches: int) -> List[Dict[str, Any]]:
    """
    Final fallback that returns all available grants if no matches are found
    """
    
    logger.info(f"Returning all grants fallback with {len(grants)} grants")
    
    matches = []
    for i, grant in enumerate(grants[:max_matches]):
        match = {
            'grant_id': grant['grant_id'],
            'title': grant['title'],
            'issuer': grant['issuer'],
            'country': grant.get('country'),
            'deadline': grant.get('deadline'),
            'amount_min': grant.get('amount_min'),
            'amount_max': grant.get('amount_max'),
            'sector_tags': grant.get('sector_tags', []),
            'relevance_score': 0.3,  # Default score for all grants
            'match_reasoning': f"Available grant opportunity from {grant.get('issuer', 'Unknown issuer')}. Review details to determine relevance to your business needs.",
            'key_benefits': [
                'Funding opportunity',
                'Business growth support',
                'Potential business development'
            ],
            'potential_concerns': [
                'Check eligibility requirements carefully',
                'Review application deadlines and requirements'
            ],
            'recommended_focus': 'Review grant details and requirements to determine if it fits your business needs',
            'deadline_urgency': 'medium',
            'competition_level': 'medium',
            'required_documents': grant.get('required_documents', []),
            'eligibility_rules': grant.get('eligibility_rules', [])
        }
        matches.append(match)
    
    logger.info(f"All grants fallback returned {len(matches)} matches")
    return matches

def create_response(status_code: int, body: Dict[str, Any]) -> Dict[str, Any]:
    """
    Create API Gateway response with CORS headers
    """
    return {
        'statusCode': status_code,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Requested-With',
            'Access-Control-Allow-Methods': 'POST,OPTIONS,GET',
            'Access-Control-Allow-Credentials': 'false',
            'Access-Control-Max-Age': '86400'
        },
        'body': json.dumps(body, default=str)
    }

def lambda_handler_test():
    """
    Test function for local development
    """
    
    test_event = {
        'goals': """
        We are a fintech startup focused on AI-powered financial planning tools for small businesses. 
        We're looking for $200,000 to $500,000 in funding to:
        1. Develop our MVP mobile application
        2. Hire 3 additional software engineers
        3. Conduct market validation studies
        4. Obtain necessary financial licenses
        
        Our target market is small business owners who need better cash flow management and financial forecasting tools.
        We have a team of 5 people with backgrounds in finance and technology.
        """,
        'sme_id': 'test-sme-123',
        'max_matches': 5
    }
    
    result = lambda_handler(test_event, None)
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    lambda_handler_test()