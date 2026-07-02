from dataclasses import dataclass
from app.models.candidate import Candidate
from app.models.jd_profile import JDProfile


@dataclass
class FeatureVector:
    candidate_id: str
    skill_match_score: float
    experience_fit_score: float
    production_experience_score: float
    retrieval_experience_score: float
    eval_experience_score: float
    product_company_score: float
    location_fit_score: float
    notice_period_score: float
    career_stability_score: float
    title_relevance_score: float


def _title_relevance(candidate: Candidate) -> float:
    """
    Scores how relevant the candidate's current title is to Senior AI Engineer.
    This score is used as a MULTIPLIER in hybrid_scoring — not just additive.
    A Project Manager with AI keywords still gets crushed by this.
    """
    current = candidate.profile.current_title.lower()
    all_titles_blob = current + " " + " ".join(
        c.title.lower() for c in candidate.career_history
    )

    # Directly relevant — exactly the role we want
    high_relevance = [
        "machine learning", "ml engineer", "ai engineer", "nlp engineer",
        "search engineer", "recommendation", "ranking engineer",
        "retrieval", "applied scientist", "research engineer",
        "data scientist", "applied ml", "applied ai", "deep learning",
        "computer vision engineer", "nlp", "llm engineer",
    ]

    # Engineers who could plausibly do this role
    medium_relevance = [
        "software engineer", "backend engineer", "data engineer",
        "platform engineer", "senior engineer", "staff engineer",
        "tech lead", "full stack", "cloud engineer", "infrastructure",
        "sre", "devops", "architect", "python developer",
    ]

    # Clearly wrong role types — should be crushed even with good semantic scores
    low_relevance = [
    "project manager", "program manager", "product manager",
    "graphic designer", "designer", "frontend engineer", "ui engineer",
    "ux engineer", "ux designer", "java developer", ".net developer",
    "android developer", "ios developer", "mobile developer",
    "business analyst", "scrum master", "marketing", "hr ",
    "human resource", "sales", "recruiter", "content writer",
    "mechanical engineer", "civil engineer", "electrical engineer",
    "hardware engineer", "embedded engineer", "supply chain",
    "operations manager", "account manager", "finance",
    "accountant", "financial analyst", "chartered accountant",
    "qa engineer", "quality assurance", "tester", "test engineer",
]

    # Current title is the primary signal
    if any(k in current for k in high_relevance):
        return 1.0

    if any(k in current for k in low_relevance):
        # Partial credit only if their career history shows strong AI background
        if any(k in all_titles_blob for k in high_relevance):
            return 0.35  # career switcher — had AI history but now in non-AI role
        return 0.05  # non-technical role with no AI history → near zero

    if any(k in current for k in medium_relevance):
        # Boost medium-relevance candidates if their history shows AI work
        if any(k in all_titles_blob for k in high_relevance):
            return 0.85
        return 0.60

    # Unknown title — default low because we cannot confirm relevance
    return 0.15


def _skill_match(candidate: Candidate, jd: JDProfile) -> float:
    cand_skill_names = {s.lower() for s in candidate.skill_names}
    career_blob = " ".join(
        c.description.lower() + " " + c.title.lower()
        for c in candidate.career_history
    )

    def matched(skill_item) -> bool:
        names = [skill_item.name.lower()] + [a.lower() for a in skill_item.aliases]
        return any(n in cand_skill_names or n in career_blob for n in names)

    req = jd.required_skills
    pref = jd.preferred_skills
    req_total = sum(s.weight for s in req) or 1.0
    pref_total = sum(s.weight for s in pref) or 1.0
    req_score = sum(s.weight for s in req if matched(s)) / req_total
    pref_score = sum(s.weight for s in pref if matched(s)) / pref_total
    return round(0.8 * req_score + 0.2 * pref_score, 4)


def _experience_fit(candidate: Candidate, jd: JDProfile) -> float:
    yoe = candidate.total_experience_years
    if jd.experience_min <= yoe <= jd.experience_max:
        return 1.0
    gap = (
        jd.experience_min - yoe if yoe < jd.experience_min
        else yoe - jd.experience_max
    )
    return max(0.0, 1.0 - gap / 5.0)


def _production_experience(candidate: Candidate) -> float:
    keywords = [
        "production", "deployed", "real-time", "real users", "shipped",
        "live", "at scale", "latency", "throughput", "scalab",
    ]
    blob = " ".join(c.description.lower() for c in candidate.career_history)
    hits = sum(1 for k in keywords if k in blob)
    return min(1.0, hits / 4.0)


def _retrieval_experience(candidate: Candidate) -> float:
    keywords = [
        "embedding", "vector", "retrieval", "ranking", "search",
        "faiss", "pinecone", "weaviate", "qdrant", "milvus",
        "elasticsearch", "opensearch", "bm25", "hybrid search",
        "dense retrieval", "semantic search", "recommendation",
        "information retrieval",
    ]
    skill_blob = " ".join(s.lower() for s in candidate.skill_names)
    career_blob = " ".join(c.description.lower() for c in candidate.career_history)
    blob = skill_blob + " " + career_blob
    hits = sum(1 for k in keywords if k in blob)
    return min(1.0, hits / 4.0)


def _eval_experience(candidate: Candidate) -> float:
    keywords = [
        "ndcg", "mrr", "map", "mean average precision",
        "a/b test", "ab test", "offline eval", "online eval",
        "precision@", "recall@", "benchmark",
    ]
    blob = " ".join(c.description.lower() for c in candidate.career_history)
    hits = sum(1 for k in keywords if k in blob)
    return min(1.0, hits / 2.0)


def _product_company_score(candidate: Candidate) -> float:
    if candidate.has_services_only_background:
        return 0.2
    if candidate.has_product_company_experience:
        return 1.0
    return 0.6


def _location_fit(candidate: Candidate, jd: JDProfile) -> float:
    loc = candidate.profile.location.lower()
    country = candidate.profile.country.lower()
    if any(p.lower() in loc for p in jd.preferred_locations):
        return 1.0
    if any(p.lower() in loc for p in jd.relocation_ok_locations):
        return 0.8
    if "india" in country and candidate.redrob_signals.willing_to_relocate:
        return 0.6
    if candidate.redrob_signals.willing_to_relocate:
        return 0.4
    return 0.2


def _notice_period_score(candidate: Candidate, jd: JDProfile) -> float:
    days = candidate.redrob_signals.notice_period_days
    if days <= jd.notice_period_ideal_days:
        return 1.0
    if days <= jd.notice_period_max_days:
        return 0.7
    return max(0.0, 1.0 - (days - jd.notice_period_max_days) / 90.0)


def _career_stability(candidate: Candidate) -> float:
    avg = candidate.avg_tenure_months
    if avg >= 24:
        return 1.0
    if avg >= 18:
        return 0.7
    if avg >= 12:
        return 0.5
    return 0.3


def extract_features(candidate: Candidate, jd: JDProfile) -> FeatureVector:
    return FeatureVector(
        candidate_id=candidate.candidate_id,
        skill_match_score=_skill_match(candidate, jd),
        experience_fit_score=_experience_fit(candidate, jd),
        production_experience_score=_production_experience(candidate),
        retrieval_experience_score=_retrieval_experience(candidate),
        eval_experience_score=_eval_experience(candidate),
        product_company_score=_product_company_score(candidate),
        location_fit_score=_location_fit(candidate, jd),
        notice_period_score=_notice_period_score(candidate, jd),
        career_stability_score=_career_stability(candidate),
        title_relevance_score=_title_relevance(candidate),
    )


def extract_features_batch(candidates: list, jd: JDProfile) -> dict:
    return {c.candidate_id: extract_features(c, jd) for c in candidates}