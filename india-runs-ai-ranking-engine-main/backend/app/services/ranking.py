from app.services.hybrid_scoring import ScoredCandidate


def rank_candidates(scored: dict, top_n: int = 100) -> list:
    """
    Sorts by final_score descending.
    Ties broken by candidate_id ascending — this matches the submission_spec
    tie-break rule exactly so the validator never rejects the output.
    Returns a list of ScoredCandidate, best first.
    """
    ordered = sorted(
        scored.values(),
        key=lambda sc: (-sc.final_score, sc.candidate_id),
    )
    return ordered[:top_n]
