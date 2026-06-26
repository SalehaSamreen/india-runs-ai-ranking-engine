import re
from pydantic import BaseModel, field_validator
from typing import Dict, List, Optional

from app.models.profile import Profile
from app.models.career import CareerEntry
from app.models.education import Education
from app.models.skill import Skill
from app.models.redrob_signals import RedrobSignals


class Certification(BaseModel):
    name: str
    issuer: str
    year: int


class Language(BaseModel):
    language: str
    proficiency: str


CANDIDATE_ID_RE = re.compile(r"^CAND_[0-9]{7}$")


class Candidate(BaseModel):
    candidate_id: str
    profile: Profile
    career_history: List[CareerEntry]
    education: List[Education] = []
    skills: List[Skill] = []
    certifications: List[Certification] = []
    languages: List[Language] = []
    redrob_signals: RedrobSignals

    @field_validator("candidate_id")
    @classmethod
    def validate_id(cls, v: str) -> str:
        if not CANDIDATE_ID_RE.match(v):
            raise ValueError(f"Invalid candidate_id format: {v!r}")
        return v

    # ------------------------------------------------------------------
    # Convenience properties used by later pipeline phases
    # ------------------------------------------------------------------

    @property
    def skill_names(self) -> List[str]:
        return [s.name for s in self.skills]

    @property
    def total_experience_years(self) -> float:
        return self.profile.years_of_experience

    @property
    def has_product_company_experience(self) -> bool:
        return any(c.is_product_company for c in self.career_history)

    @property
    def has_services_only_background(self) -> bool:
        return all(c.is_services_company for c in self.career_history)

    @property
    def job_tenures(self) -> List[int]:
        """Duration in months for each role — used for stability scoring."""
        return [c.duration_months for c in self.career_history]

    @property
    def avg_tenure_months(self) -> float:
        tenures = self.job_tenures
        return sum(tenures) / len(tenures) if tenures else 0.0
