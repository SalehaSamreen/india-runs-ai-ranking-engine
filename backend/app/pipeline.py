"""
Main pipeline orchestrator — Phases 2 through 9.

Input:  list of Candidate objects from Phase 1 candidate_loader.py
Output: list of dicts ready for Phase 10 CSV writer
        [{"candidate_id": ..., "rank": ..., "score": ..., "reasoning": ...}]

Usage:
    from app.services.candidate_loader import load_candidates
    from app.pipeline import run_pipeline

    candidates = load_candidates("data/candidates.jsonl")
    results = run_pipeline(candidates)
"""

from app.services.jd_understanding import get_jd_profile
from app.services.semantic_matching import compute_semantic_scores
from app.services.feature_engineering import extract_features_batch
from app.services.behavioral_analysis import compute_behavioral_batch
from app.services.honeypot_detection import detect_honeypots_batch
from app.services.hybrid_scoring import score_all_candidates
from app.services.ranking import rank_candidates
from app.services.explainability import attach_reasoning
from app.models.candidate import Candidate


def run_pipeline(candidates: list, top_n: int = 100) -> list:
    """
    Full Phase 2-9 pipeline.

    Args:
        candidates: list of Candidate objects (from candidate_loader.py)
        top_n:      number of ranked candidates to return, default 100

    Returns:
        List of dicts sorted rank 1 (best) to top_n.
    """
    jd = get_jd_profile()
    print(f"[Pipeline] JD loaded: {jd.title} @ {jd.company}")

    print(f"[Pipeline] Phase 3: semantic scoring {len(candidates):,} candidates...")
    semantic_scores = compute_semantic_scores(candidates, jd)

    print("[Pipeline] Phase 4: feature extraction...")
    features_map = extract_features_batch(candidates, jd)

    print("[Pipeline] Phase 5: behavioral scoring...")
    behavioral_map = compute_behavioral_batch(candidates)

    print("[Pipeline] Phase 6: honeypot detection...")
    honeypot_map = detect_honeypots_batch(candidates, jd)
    honeypots_found = sum(1 for h in honeypot_map.values() if h.is_honeypot)
    print(f"[Pipeline] Honeypots flagged: {honeypots_found}")

    print("[Pipeline] Phase 7: hybrid scoring...")
    scored = score_all_candidates(
        semantic_scores, features_map, behavioral_map, honeypot_map
    )

    print("[Pipeline] Phase 8: ranking...")
    ranked = rank_candidates(scored, top_n=top_n)

    print("[Pipeline] Phase 9: generating reasoning...")
    candidates_by_id = {c.candidate_id: c for c in candidates}
    results = attach_reasoning(ranked, candidates_by_id, honeypot_map)

    print(f"[Pipeline] Done. Top {top_n} candidates ranked.")
    return results
