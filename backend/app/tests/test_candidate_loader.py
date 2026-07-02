"""
Unit tests for Phase 1: candidate parser & data models.
Run with: pytest app/tests/test_candidate_loader.py -v
"""

import json
import gzip
import tempfile
import os
import pytest
from pathlib import Path

from app.models.candidate import Candidate
from app.models.skill import Skill
from app.utils.normalizer import (
    normalize_skill_name,
    normalize_company_name,
    parse_experience_string,
    months_to_years,
)
from app.services.candidate_loader import iter_candidates, load_sample


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

VALID_RAW = {
    "candidate_id": "CAND_0000001",
    "profile": {
        "anonymized_name": "Ira Vora",
        "headline": "Backend Engineer | SQL, Spark, Cloud",
        "summary": "6.9 years building data pipelines.",
        "location": "Toronto",
        "country": "Canada",
        "years_of_experience": 6.9,
        "current_title": "Backend Engineer",
        "current_company": "Mindtree",
        "current_company_size": "10001+",
        "current_industry": "IT Services",
    },
    "career_history": [
        {
            "company": "Mindtree",
            "title": "Backend Engineer",
            "start_date": "2024-03-08",
            "end_date": None,
            "duration_months": 27,
            "is_current": True,
            "industry": "IT Services",
            "company_size": "10001+",
            "description": "Built streaming pipelines.",
        }
    ],
    "education": [
        {
            "institution": "LPU",
            "degree": "B.E.",
            "field_of_study": "Computer Science",
            "start_year": 2017,
            "end_year": 2020,
            "grade": "8.24 CGPA",
            "tier": "tier_3",
        }
    ],
    "skills": [
        {"name": "NLP", "proficiency": "advanced", "endorsements": 37, "duration_months": 26},
        {"name": "Milvus", "proficiency": "advanced", "endorsements": 40, "duration_months": 35},
    ],
    "certifications": [],
    "languages": [{"language": "English", "proficiency": "professional"}],
    "redrob_signals": {
        "profile_completeness_score": 86.9,
        "signup_date": "2025-10-16",
        "last_active_date": "2026-05-20",
        "open_to_work_flag": True,
        "profile_views_received_30d": 23,
        "applications_submitted_30d": 2,
        "recruiter_response_rate": 0.34,
        "avg_response_time_hours": 177.8,
        "skill_assessment_scores": {"NLP": 38.8},
        "connection_count": 356,
        "endorsements_received": 35,
        "notice_period_days": 60,
        "expected_salary_range_inr_lpa": {"min": 18.7, "max": 36.1},
        "preferred_work_mode": "onsite",
        "willing_to_relocate": False,
        "github_activity_score": 9.2,
        "search_appearance_30d": 249,
        "saved_by_recruiters_30d": 4,
        "interview_completion_rate": 0.71,
        "offer_acceptance_rate": 0.58,
        "verified_email": True,
        "verified_phone": True,
        "linkedin_connected": False,
    },
}


def _write_jsonl(records: list, path: Path) -> None:
    with open(path, "w", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")


def _write_jsonl_gz(records: list, path: Path) -> None:
    with gzip.open(path, "wt", encoding="utf-8") as f:
        for r in records:
            f.write(json.dumps(r) + "\n")


# ---------------------------------------------------------------------------
# Model-level tests
# ---------------------------------------------------------------------------

class TestCandidateModel:
    def test_valid_candidate(self):
        c = Candidate.model_validate(VALID_RAW)
        assert c.candidate_id == "CAND_0000001"
        assert c.total_experience_years == 6.9
        assert "NLP" in c.skill_names

    def test_invalid_candidate_id_raises(self):
        from pydantic import ValidationError
        bad = dict(VALID_RAW, candidate_id="INVALID_ID")
        with pytest.raises(ValidationError):
            Candidate.model_validate(bad)

    def test_empty_skills_allowed(self):
        raw = dict(VALID_RAW, skills=[])
        c = Candidate.model_validate(raw)
        assert c.skill_names == []

    def test_empty_education_allowed(self):
        raw = dict(VALID_RAW, education=[])
        c = Candidate.model_validate(raw)
        assert c.education == []

    def test_missing_optional_certifications(self):
        raw = {k: v for k, v in VALID_RAW.items() if k != "certifications"}
        c = Candidate.model_validate(raw)
        assert c.certifications == []

    def test_product_company_detection(self):
        c = Candidate.model_validate(VALID_RAW)
        # Mindtree is a services company
        assert not c.has_product_company_experience

    def test_avg_tenure(self):
        c = Candidate.model_validate(VALID_RAW)
        assert c.avg_tenure_months == 27.0

    def test_redrob_days_since_active(self):
        c = Candidate.model_validate(VALID_RAW)
        # last_active_date is 2026-05-20, today is 2026-06-26 → 37 days
        assert c.redrob_signals.days_since_active >= 0

    def test_redrob_availability(self):
        c = Candidate.model_validate(VALID_RAW)
        # open_to_work=True, last_active 37 days ago → within 90 day window
        assert c.redrob_signals.is_available


# ---------------------------------------------------------------------------
# Loader tests
# ---------------------------------------------------------------------------

class TestCandidateLoader:
    def test_load_valid_jsonl(self, tmp_path):
        p = tmp_path / "candidates.jsonl"
        _write_jsonl([VALID_RAW], p)
        results = list(iter_candidates(p))
        assert len(results) == 1
        assert results[0].candidate_id == "CAND_0000001"

    def test_load_gzipped_jsonl(self, tmp_path):
        p = tmp_path / "candidates.jsonl.gz"
        _write_jsonl_gz([VALID_RAW], p)
        results = list(iter_candidates(p))
        assert len(results) == 1

    def test_skips_malformed_json(self, tmp_path):
        p = tmp_path / "candidates.jsonl"
        with open(p, "w") as f:
            f.write("NOT JSON\n")
            f.write(json.dumps(VALID_RAW) + "\n")
        results = list(iter_candidates(p))
        assert len(results) == 1  # bad line skipped, good line loaded

    def test_skips_invalid_candidate(self, tmp_path):
        bad = dict(VALID_RAW, candidate_id="BAD")
        p = tmp_path / "candidates.jsonl"
        _write_jsonl([bad, VALID_RAW], p)
        results = list(iter_candidates(p))
        assert len(results) == 1

    def test_file_not_found_raises(self):
        with pytest.raises(FileNotFoundError):
            list(iter_candidates("/nonexistent/path.jsonl"))

    def test_load_sample_limit(self, tmp_path):
        p = tmp_path / "candidates.jsonl"
        _write_jsonl([VALID_RAW] * 10, p)
        # All have same candidate_id which will be caught by dedup in model — use unique IDs
        records = []
        for i in range(10):
            r = json.loads(json.dumps(VALID_RAW))
            r["candidate_id"] = f"CAND_000000{i}"
            records.append(r)
        _write_jsonl(records, p)
        results = load_sample(p, n=3)
        assert len(results) == 3

    def test_empty_lines_ignored(self, tmp_path):
        p = tmp_path / "candidates.jsonl"
        with open(p, "w") as f:
            f.write("\n\n")
            f.write(json.dumps(VALID_RAW) + "\n")
            f.write("\n")
        results = list(iter_candidates(p))
        assert len(results) == 1


# ---------------------------------------------------------------------------
# Normalizer tests
# ---------------------------------------------------------------------------

class TestNormalizer:
    def test_skill_alias(self):
        assert normalize_skill_name("pytorch") == "PyTorch"
        assert normalize_skill_name("PYTORCH") == "PyTorch"
        assert normalize_skill_name("sklearn") == "scikit-learn"

    def test_skill_unknown_passthrough(self):
        assert normalize_skill_name("  Milvus  ") == "Milvus"

    def test_company_alias(self):
        assert normalize_company_name("Google LLC") == "Google"
        assert normalize_company_name("google inc.") == "Google"

    def test_company_unknown_passthrough(self):
        assert normalize_company_name("  Stripe  ") == "Stripe"

    def test_parse_experience_years_months(self):
        assert parse_experience_string("3 years 8 months") == 3.67

    def test_parse_experience_years_only(self):
        assert parse_experience_string("5 yrs") == 5.0

    def test_parse_experience_invalid(self):
        assert parse_experience_string("n/a") is None

    def test_months_to_years(self):
        assert months_to_years(24) == 2.0
        assert months_to_years(18) == 1.5
