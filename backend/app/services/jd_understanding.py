from functools import lru_cache
from app.models.jd_profile import JDProfile, SkillItem


def _build_jd_profile() -> JDProfile:
    """
    Hand-encoded structured representation of the Redrob Senior AI Engineer JD.
    Deliberately not auto-parsed — the JD itself warns that keyword extraction is a trap.
    """

    required_skills = [
        SkillItem(
            name="Embeddings-based Retrieval",
            weight=1.0,
            aliases=[
                "sentence-transformers", "openai embeddings", "bge", "e5",
                "dense retrieval", "bi-encoder", "semantic search",
                "embedding", "embeddings",
            ],
        ),
        SkillItem(
            name="Vector Database",
            weight=1.0,
            aliases=[
                "pinecone", "weaviate", "qdrant", "milvus", "opensearch",
                "elasticsearch", "faiss", "hybrid search", "vector search",
                "vector store", "vector db",
            ],
        ),
        SkillItem(
            name="Python",
            weight=0.9,
            aliases=["pyspark", "pytorch", "tensorflow", "numpy", "pandas"],
        ),
        SkillItem(
            name="Ranking Evaluation",
            weight=0.9,
            aliases=[
                "ndcg", "mrr", "map", "mean average precision",
                "a/b test", "ab test", "offline eval", "online eval",
                "precision@", "recall@", "evaluation framework",
            ],
        ),
    ]

    preferred_skills = [
        SkillItem(
            name="LLM Fine-tuning",
            weight=0.5,
            aliases=["lora", "qlora", "peft", "fine-tuning", "fine tuning", "finetuning"],
        ),
        SkillItem(
            name="Learning-to-Rank",
            weight=0.5,
            aliases=[
                "xgboost ranking", "neural ranking", "lambdamart",
                "listwise", "ltr", "learning to rank",
            ],
        ),
        SkillItem(
            name="HR-tech or Marketplace",
            weight=0.3,
            aliases=["recruiting", "talent", "marketplace", "recommendation system"],
        ),
        SkillItem(
            name="Distributed Systems",
            weight=0.3,
            aliases=["large-scale inference", "kafka", "spark", "distributed"],
        ),
        SkillItem(
            name="Open Source",
            weight=0.3,
            aliases=["github", "open-source", "open source contribution"],
        ),
    ]

    disqualifying_patterns = [
        "pure_research_no_production",
        "langchain_openai_only_under_12_months",
        "architecture_only_no_code_18_months",
        "title_chaser",
        "framework_tutorial_only",
        "cv_speech_robotics_no_nlp_ir",
        "closed_source_only_5yr_no_external_validation",
    ]

    # Aligned with SERVICES_COMPANIES set in career.py
    excluded_company_keywords = [
        "TCS", "Infosys", "Wipro", "Accenture", "Cognizant", "Capgemini",
        "HCL", "Tech Mahindra", "Mindtree", "Mphasis",
    ]

    hidden_expectations = [
        "shipped_end_to_end_ranking_or_search_system_to_real_users",
        "has_defensible_opinions_on_hybrid_vs_dense_retrieval",
        "has_defensible_opinions_on_offline_vs_online_eval",
        "has_defensible_opinions_on_finetune_vs_prompt",
        "tilts_toward_shipper_over_researcher",
    ]

    semantic_blob = (
        "Senior AI Engineer owning ranking retrieval and matching systems "
        "for a recruiting marketplace. Production experience with embeddings "
        "based retrieval, vector databases, hybrid search, ranking evaluation "
        "NDCG MRR MAP A/B testing, and Python. Prefers product company "
        "background over pure research or pure consulting. Candidate matching "
        "job description NLP information retrieval search recommendation system "
        "learning to rank embedding fine-tuning evaluation framework."
    )

    return JDProfile(
        title="Senior AI Engineer — Founding Team",
        company="Redrob AI",
        experience_min=5.0,
        experience_max=9.0,
        required_skills=required_skills,
        preferred_skills=preferred_skills,
        disqualifying_patterns=disqualifying_patterns,
        excluded_company_keywords=excluded_company_keywords,
        preferred_locations=["Pune", "Noida"],
        relocation_ok_locations=[
            "Hyderabad", "Mumbai", "Delhi", "Bangalore", "Bengaluru",
        ],
        notice_period_ideal_days=30,
        notice_period_max_days=60,
        product_company_preference=True,
        hidden_expectations=hidden_expectations,
        semantic_blob=semantic_blob,
    )


@lru_cache(maxsize=1)
def get_jd_profile() -> JDProfile:
    """Singleton. Every downstream phase imports this."""
    return _build_jd_profile()
