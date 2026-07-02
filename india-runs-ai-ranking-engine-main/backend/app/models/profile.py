from pydantic import BaseModel, field_validator
from typing import Literal, Optional


COMPANY_SIZE = Literal[
    "1-10", "11-50", "51-200", "201-500",
    "501-1000", "1001-5000", "5001-10000", "10001+"
]


class Profile(BaseModel):
    anonymized_name: str
    headline: str
    summary: str
    location: str
    country: str
    years_of_experience: float
    current_title: str
    current_company: str
    current_company_size: COMPANY_SIZE
    current_industry: str

    @field_validator("years_of_experience")
    @classmethod
    def clamp_experience(cls, v: float) -> float:
        return max(0.0, min(v, 50.0))
