import numpy as np
from app.models.candidate import Candidate
from app.models.jd_profile import JDProfile
from app.utils.embedding_cache import embed_texts, get_or_build_candidate_embeddings


def build_candidate_text(candidate: Candidate) -> str:
    """
    Concatenates the fields that carry real semantic signal.
    Career descriptions weighted heavily — they describe what was actually done.
    Skill names are normalized by the loader already (FAISS, NLP, LoRA etc).
    Uses candidate.skill_names which is a convenience property from candidate.py.
    """
    career_text = " ".join(
        f"{c.title} at {c.company} in {c.industry}: {c.description}"
        for c in candidate.career_history
    )
    skills_text = " ".join(candidate.skill_names)

    return (
        f"{candidate.profile.headline}. "
        f"{candidate.profile.summary} "
        f"Current: {candidate.profile.current_title} at "
        f"{candidate.profile.current_company}. "
        f"Skills: {skills_text}. "
        f"{career_text}"
    )


def compute_semantic_scores(candidates: list, jd: JDProfile) -> dict:
    """
    Returns {candidate_id: float} where scores are in [0, 1].
    Embeddings are cached to disk after first run — fast on repeat runs.
    """
    jd_embedding = embed_texts([jd.semantic_blob])[0]

    candidate_ids = [c.candidate_id for c in candidates]
    candidate_texts = [build_candidate_text(c) for c in candidates]
    candidate_embeddings = get_or_build_candidate_embeddings(
        candidate_ids, candidate_texts
    )

    # Embeddings are L2-normalised so dot product == cosine similarity, range [-1, 1]
    with np.errstate(all='ignore'):
        raw_scores = candidate_embeddings @ jd_embedding

    # Rescale [-1, 1] to [0, 1] for consistent downstream blending
    scores = (raw_scores + 1.0) / 2.0

    return dict(zip(candidate_ids, scores.tolist()))
