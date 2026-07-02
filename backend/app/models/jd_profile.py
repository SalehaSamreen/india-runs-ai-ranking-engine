from typing import List
# pyrefly: ignore [missing-import]
from pydantic import BaseModel, Field


class SkillItem(BaseModel):
    name: str
    weight: float = Field(ge=0.0, le=1.0)
    aliases: List[str] = []


class JDProfile(BaseModel):
    title: str
    company: str
    experience_min: float
    experience_max: float
    required_skills: List[SkillItem]
    preferred_skills: List[SkillItem]
    disqualifying_patterns: List[str]
    excluded_company_keywords: List[str]
    preferred_locations: List[str]
    relocation_ok_locations: List[str]
    notice_period_ideal_days: int
    notice_period_max_days: int
    product_company_preference: bool
    hidden_expectations: List[str]
    semantic_blob: str
