from dataclasses import dataclass
from app.models.candidate import Candidate


@dataclass
class BehavioralScore:
    candidate_id: str
    availability_score: float
    responsiveness_score: float
    reliability_score: float
    trust_score: float
    composite_behavioral_score: float


def _availability(candidate: Candidate) -> float:
    """
    Uses signals.days_since_active (existing property on RedrobSignals).
    The JD explicitly warns: a perfect-on-paper candidate who hasn't logged in
    for 6 months is not actually available — availability is the top-weighted signal.
    """
    signals = candidate.redrob_signals
    days = signals.days_since_active  # existing property — do not recompute

    open_to_work = 1.0 if signals.open_to_work_flag else 0.3

    if days <= 7:
        activity = 1.0
    elif days <= 14:
        activity = 0.9
    elif days <= 30:
        activity = 0.75
    elif days <= 60:
        activity = 0.5
    elif days <= 90:
        activity = 0.3
    else:
        activity = 0.05  # 3+ months inactive → effectively unavailable

    return round(0.5 * open_to_work + 0.5 * activity, 4)


def _responsiveness(candidate: Candidate) -> float:
    signals = candidate.redrob_signals
    rate_score = signals.recruiter_response_rate  # already 0.0–1.0

    hours = signals.avg_response_time_hours
    if hours <= 12:
        speed = 1.0
    elif hours <= 24:
        speed = 0.85
    elif hours <= 48:
        speed = 0.7
    elif hours <= 72:
        speed = 0.5
    elif hours <= 168:
        speed = 0.3
    else:
        speed = 0.1

    return round(0.6 * rate_score + 0.4 * speed, 4)


def _reliability(candidate: Candidate) -> float:
    signals = candidate.redrob_signals
    interview = signals.interview_completion_rate  # 0.0–1.0

    # offer_acceptance_rate is -1 when no prior offer history → treat as neutral
    offer = signals.offer_acceptance_rate
    offer_score = 0.5 if offer == -1 else max(0.0, offer)

    return round(0.6 * interview + 0.4 * offer_score, 4)


def _trust(candidate: Candidate) -> float:
    signals = candidate.redrob_signals
    verifications = (
        (1 if signals.verified_email else 0)
        + (1 if signals.verified_phone else 0)
        + (1 if signals.linkedin_connected else 0)
    ) / 3.0
    completeness = signals.profile_completeness_score / 100.0
    return round(0.5 * verifications + 0.5 * completeness, 4)


def compute_behavioral_score(candidate: Candidate) -> BehavioralScore:
    availability    = _availability(candidate)
    responsiveness  = _responsiveness(candidate)
    reliability     = _reliability(candidate)
    trust           = _trust(candidate)

    composite = round(
        0.40 * availability
        + 0.30 * responsiveness
        + 0.20 * reliability
        + 0.10 * trust,
        4,
    )

    return BehavioralScore(
        candidate_id=candidate.candidate_id,
        availability_score=availability,
        responsiveness_score=responsiveness,
        reliability_score=reliability,
        trust_score=trust,
        composite_behavioral_score=composite,
    )


def compute_behavioral_batch(candidates: list) -> dict:
    """Returns {candidate_id: BehavioralScore}"""
    return {c.candidate_id: compute_behavioral_score(c) for c in candidates}
