from dataclasses import dataclass, field
from datetime import datetime
from app.models.candidate import Candidate
from app.models.jd_profile import JDProfile


@dataclass
class HoneypotResult:
    candidate_id: str
    is_honeypot: bool
    penalty: float
    flags: list = field(default_factory=list)


def _check_impossible_timeline(candidate: Candidate) -> list:
    """
    Checks if stated duration_months matches the computed date difference.
    Honeypot profiles often have these mismatched by more than 6 months.
    """
    flags = []
    for entry in candidate.career_history:
        if entry.end_date and entry.duration_months:
            try:
                start = datetime.strptime(entry.start_date, "%Y-%m-%d")
                end = datetime.strptime(entry.end_date, "%Y-%m-%d")
                actual_months = (
                    (end.year - start.year) * 12 + (end.month - start.month)
                )
                if abs(actual_months - entry.duration_months) > 6:
                    flags.append("duration_date_mismatch")
                    break
            except (ValueError, TypeError):
                pass
    return flags


def _check_skill_duration_inconsistency(candidate: Candidate) -> list:
    """
    Honeypot profiles have expert/advanced skills with 0 months used,
    or skill durations that exceed the candidate's entire career length.
    NOTE: Skill.duration_months is Optional[int] = None so always use (x or 0).
    Uses candidate.total_experience_years (existing property on Candidate).
    """
    flags = []
    total_career_months = candidate.total_experience_years * 12

    expert_skills = [
        s for s in candidate.skills
        if s.proficiency in ("expert", "advanced")
    ]

    # 3+ expert skills with zero or null duration is a strong honeypot signal
    zero_dur_experts = [
        s for s in expert_skills if (s.duration_months or 0) == 0
    ]
    if len(zero_dur_experts) >= 3:
        flags.append("expert_skills_zero_duration")

    # Any single skill duration exceeding total career length is impossible
    for s in expert_skills:
        if (s.duration_months or 0) > total_career_months + 12:
            flags.append("skill_duration_exceeds_career_length")
            break

    return flags


def _check_keyword_stuffing(candidate: Candidate, jd: JDProfile) -> list:
    """
    The JD warns explicitly: a candidate whose title is 'Marketing Manager'
    but has every AI keyword in their skills list is not a fit.
    Uses candidate.skill_names (existing property on Candidate).
    Lowercases before matching to handle normalized skill names.
    """
    flags = []
    all_jd_skills = jd.required_skills + jd.preferred_skills
    skill_names_lower = {s.lower() for s in candidate.skill_names}

    matched_count = 0
    for item in all_jd_skills:
        names = [item.name.lower()] + [a.lower() for a in item.aliases]
        if any(n in skill_names_lower for n in names):
            matched_count += 1

    title = candidate.profile.current_title.lower()
    non_technical_indicators = [
        "marketing", "hr ", "human resource", "sales",
        "content writer", "recruiter", "business development",
        "operations manager", "account manager", "content creator",
    ]
    is_non_technical = any(t in title for t in non_technical_indicators)

    if matched_count >= 6 and is_non_technical:
        flags.append("ai_keyword_stuffing_nontechnical_title")

    return flags


def _check_yoe_vs_career_history(candidate: Candidate) -> list:
    """
    Total months across all career entries should roughly match claimed YOE.
    A gap of more than 30 months is a red flag.
    """
    flags = []
    total_history_months = sum(c.duration_months for c in candidate.career_history)
    claimed_months = candidate.total_experience_years * 12

    if total_history_months > 0 and abs(total_history_months - claimed_months) > 30:
        flags.append("career_history_yoe_mismatch")
    return flags


def detect_honeypot(candidate: Candidate, jd: JDProfile) -> HoneypotResult:
    flags = []
    flags += _check_impossible_timeline(candidate)
    flags += _check_skill_duration_inconsistency(candidate)
    flags += _check_keyword_stuffing(candidate, jd)
    flags += _check_yoe_vs_career_history(candidate)

    # Require corroborating evidence — single flag could be a data quirk
    if len(flags) >= 2:
        is_honeypot = True
        penalty = 0.95  # near-total; keeps score non-zero for debuggability
    elif len(flags) == 1:
        is_honeypot = False
        penalty = 0.25  # soft ding
    else:
        is_honeypot = False
        penalty = 0.0

    return HoneypotResult(
        candidate_id=candidate.candidate_id,
        is_honeypot=is_honeypot,
        penalty=penalty,
        flags=flags,
    )


def detect_honeypots_batch(candidates: list, jd: JDProfile) -> dict:
    """Returns {candidate_id: HoneypotResult}"""
    return {c.candidate_id: detect_honeypot(c, jd) for c in candidates}
