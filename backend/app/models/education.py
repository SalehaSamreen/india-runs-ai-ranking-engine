from pydantic import BaseModel
from typing import Literal, Optional


TIER = Literal["tier_1", "tier_2", "tier_3", "tier_4", "unknown"]


class Education(BaseModel):
    institution: str
    degree: str
    field_of_study: str
    start_year: int
    end_year: int
    grade: Optional[str] = None
    tier: TIER = "unknown"
