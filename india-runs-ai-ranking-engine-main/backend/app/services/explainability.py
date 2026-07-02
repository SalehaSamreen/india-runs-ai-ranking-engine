from app.models.candidate import Candidate
from app.services.hybrid_scoring import ScoredCandidate
from app.services.honeypot_detection import HoneypotResult


def generate_reasoning(
    candidate: Candidate,
    scored: ScoredCandidate,
    honeypot: HoneypotResult,
) -> str:
    """
    Builds a 1-2 sentence fact-grounded reasoning string from computed features.
    No LLM call — deterministic, satisfies the no-network ranking constraint.
    Uses existing Candidate properties: total_experience_years,
    has_product_company_experience, has_services_only_background.
    """
    if honeypot.is_honeypot:
        return (
            f"Flagged as likely honeypot ({', '.join(honeypot.flags)}); "
            f"profile shows internal inconsistencies and is excluded from serious consideration."
        )

    yoe = candidate.total_experience_years
    title = candidate.profile.current_title
    company = candidate.profile.current_company
    comps = scored.component_scores

    strengths = []
    if comps["skill_match"] >= 0.6:
        strengths.append("strong required-skill overlap with JD")
    if comps["retrieval_experience"] >= 0.5:
        strengths.append("hands-on retrieval/vector-search experience")
    if comps["production_experience"] >= 0.5:
        strengths.append("evidence of shipping production systems")
    if comps["eval_experience"] >= 0.5:
        strengths.append("experience with ranking evaluation metrics")
    if comps["behavioral"] >= 0.7:
        strengths.append("highly responsive and currently active on platform")
    if candidate.has_product_company_experience:
        strengths.append("product company background")

    concerns = []
    if comps["experience_fit"] < 0.6:
        concerns.append(f"{yoe} yrs experience outside JD's 5-9 yr band")
    if candidate.has_services_only_background:
        concerns.append("pure-consulting career background")
    if comps["behavioral"] < 0.4:
        concerns.append("low recent activity or responsiveness")
    if comps["notice_period"] < 0.5:
        concerns.append("long notice period")
    if comps["retrieval_experience"] < 0.25:
        concerns.append("limited retrieval/search systems experience")

    strength_text = "; ".join(strengths) if strengths else "moderate overall fit"
    concern_text = f" Concerns: {', '.join(concerns)}." if concerns else ""

    return (
        f"{yoe} yrs exp, currently {title} at {company}. "
        f"{strength_text}.{concern_text}"
    )


def attach_reasoning(
    ranked: list,
    candidates_by_id: dict,
    honeypot_map: dict,
) -> list:
    """
    Returns submission-ready list of dicts:
    [{"candidate_id": ..., "rank": ..., "score": ..., "reasoning": ...}]
    """
    output = []
    for rank, sc in enumerate(ranked, start=1):
        candidate = candidates_by_id[sc.candidate_id]
        reasoning = generate_reasoning(
            candidate, sc, honeypot_map[sc.candidate_id]
        )
        output.append({
            "candidate_id": sc.candidate_id,
            "rank": rank,
            "score": sc.final_score,
            "reasoning": reasoning,
        })
    return output
