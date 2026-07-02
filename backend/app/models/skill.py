from pydantic import BaseModel, field_validator
from typing import Literal, Optional


class Skill(BaseModel):
    name: str
    proficiency: Literal["beginner", "intermediate", "advanced", "expert"]
    endorsements: int = 0
    duration_months: Optional[int] = None

    @field_validator("name")
    @classmethod
    def normalize_name(cls, v: str) -> str:
        return v.strip()
