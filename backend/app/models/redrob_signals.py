from pydantic import BaseModel, field_validator
from typing import Dict, Literal, Optional
from datetime import date, datetime


class SalaryRange(BaseModel):
    min: float
    max: float


class RedrobSignals(BaseModel):
    profile_completeness_score: float
    signup_date: str
    last_active_date: str
    open_to_work_flag: bool
    profile_views_received_30d: int
    applications_submitted_30d: int
    recruiter_response_rate: float
    avg_response_time_hours: float
    skill_assessment_scores: Dict[str, float] = {}
    connection_count: int
    endorsements_received: int
    notice_period_days: int
    expected_salary_range_inr_lpa: SalaryRange
    preferred_work_mode: Literal["remote", "hybrid", "onsite", "flexible"]
    willing_to_relocate: bool
    github_activity_score: float  # -1 means no GitHub linked
    search_appearance_30d: int
    saved_by_recruiters_30d: int
    interview_completion_rate: float
    offer_acceptance_rate: float  # -1 means no prior offers
    verified_email: bool
    verified_phone: bool
    linkedin_connected: bool

    @property
    def days_since_active(self) -> int:
        today = datetime.now().date()
        try:
            last = datetime.strptime(self.last_active_date, "%Y-%m-%d").date()
            return (today - last).days
        except ValueError:
            return 9999

    @property
    def is_recently_active(self) -> bool:
        return self.days_since_active <= 30

    @property
    def is_available(self) -> bool:
        return self.open_to_work_flag and self.days_since_active <= 90
