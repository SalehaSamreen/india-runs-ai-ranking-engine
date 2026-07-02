from dataclasses import dataclass
from app.services.feature_engineering import FeatureVector
from app.services.behavioral_analysis import BehavioralScore
from app.services.honeypot_detection import HoneypotResult

# Weights sum to exactly 1.0
# title_relevance is NOT in here — it acts as a multiplier, not an additive component
WEIGHTS = {
    "semantic":               0.25,
    "skill_match":            0.20,
    "production_experience":  0.12,
    "retrieval_experience":   0.12,
    "eval_experience":        0.06,
    "experience_fit":         0.06,
    "product_company":        0.06,
    "behavioral":             0.07,
    "career_stability":       0.03,
    "location_fit":           0.02,
    "notice_period":          0.01,
}


@dataclass
class ScoredCandidate:
    candidate_id: str
    final_score: float
    component_scores: dict


def _title_multiplier(title_relevance: float) -> float:
    """
    Converts title relevance score into a multiplicative penalty.
    This ensures that a Project Manager with great semantic score still
    gets crushed — no amount of keyword overlap rescues a wrong role type.
    """
    if title_relevance >= 0.8:
        return 1.0    # high relevance — no penalty
    if title_relevance >= 0.55:
        return 0.85   # medium relevance — small penalty
    if title_relevance >= 0.3:
        return 0.55   # borderline — meaningful penalty
    if title_relevance >= 0.1:
        return 0.25   # low relevance — heavy penalty
    return 0.08       # title = 0.05 (PM, Designer etc) → near elimination


def compute_hybrid_score(
    candidate_id: str,
    semantic_score: float,
    features: FeatureVector,
    behavioral: BehavioralScore,
    honeypot: HoneypotResult,
) -> ScoredCandidate:

    components = {
        "semantic":              semantic_score,
        "skill_match":           features.skill_match_score,
        "title_relevance":       features.title_relevance_score,
        "production_experience": features.production_experience_score,
        "retrieval_experience":  features.retrieval_experience_score,
        "eval_experience":       features.eval_experience_score,
        "experience_fit":        features.experience_fit_score,
        "product_company":       features.product_company_score,
        "behavioral":            behavioral.composite_behavioral_score,
        "career_stability":      features.career_stability_score,
        "location_fit":          features.location_fit_score,
        "notice_period":         features.notice_period_score,
    }

    # Additive base score from all weighted components except title_relevance
    base_score = sum(
        WEIGHTS[k] * v for k, v in components.items()
        if k in WEIGHTS
    )

    # Title relevance applied as multiplier — wrong role type cannot be rescued
    # by high semantic similarity or good behavioral signals
    t_mult = _title_multiplier(features.title_relevance_score)

    # Honeypot penalty also multiplicative — stacks with title multiplier
    final_score = round(base_score * t_mult * (1.0 - honeypot.penalty), 6)

    return ScoredCandidate(
        candidate_id=candidate_id,
        final_score=final_score,
        component_scores=components,
    )


def score_all_candidates(
    semantic_scores: dict,
    features_map: dict,
    behavioral_map: dict,
    honeypot_map: dict,
) -> dict:
    results = {}
    for cid in features_map:
        results[cid] = compute_hybrid_score(
            candidate_id=cid,
            semantic_score=semantic_scores.get(cid, 0.0),
            features=features_map[cid],
            behavioral=behavioral_map[cid],
            honeypot=honeypot_map[cid],
        )
    return results