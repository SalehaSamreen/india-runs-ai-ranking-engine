"""
Candidate loader — reads candidates.jsonl (or .jsonl.gz) and returns
validated Candidate objects. Malformed records are logged and skipped;
the loader never crashes on bad data.
"""

import gzip
import json
import logging
from pathlib import Path
from typing import Generator, List, Optional

from pydantic import ValidationError

from app.models.candidate import Candidate
from app.utils.normalizer import normalize_skill_name, normalize_company_name, clean_text

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Low-level record normalization before Pydantic validation
# ---------------------------------------------------------------------------

def _normalize_raw(raw: dict) -> dict:
    """
    Light pre-processing on the raw dict before handing it to Pydantic.
    Mutates a shallow copy — does not modify the original.
    """
    raw = dict(raw)

    # Normalize skill names
    for skill in raw.get("skills", []):
        skill["name"] = normalize_skill_name(skill.get("name", ""))

    # Normalize company names in career history
    for entry in raw.get("career_history", []):
        entry["company"] = normalize_company_name(entry.get("company", ""))
        entry["description"] = clean_text(entry.get("description", ""))

    # Normalize profile text fields
    profile = raw.get("profile", {})
    for field in ("headline", "summary", "current_title", "current_company"):
        if field in profile:
            profile[field] = clean_text(profile[field])

    return raw


# ---------------------------------------------------------------------------
# Core loader
# ---------------------------------------------------------------------------

def iter_candidates(path: str | Path) -> Generator[Candidate, None, None]:
    """
    Yield validated Candidate objects from a .jsonl or .jsonl.gz file.
    Skips records that fail validation and logs the error.
    """
    path = Path(path)
    if not path.exists():
        raise FileNotFoundError(f"Candidate file not found: {path}")

    opener = gzip.open if path.suffix == ".gz" else open
    mode = "rt"

    skipped = 0
    loaded = 0

    with opener(path, mode, encoding="utf-8") as fh:
        for line_no, line in enumerate(fh, start=1):
            line = line.strip()
            if not line:
                continue
            try:
                raw = json.loads(line)
            except json.JSONDecodeError as exc:
                logger.warning("Line %d: JSON parse error — %s", line_no, exc)
                skipped += 1
                continue

            raw = _normalize_raw(raw)

            try:
                candidate = Candidate.model_validate(raw)
                loaded += 1
                yield candidate
            except ValidationError as exc:
                cid = raw.get("candidate_id", f"<line {line_no}>")
                logger.warning("Skipping %s: %s", cid, exc.error_count())
                skipped += 1

    logger.info("Loaded %d candidates, skipped %d.", loaded, skipped)


def load_candidates(path: str | Path) -> List[Candidate]:
    """
    Convenience wrapper — returns a list instead of a generator.
    For 100K records the generator form is preferred to keep memory lower.
    """
    return list(iter_candidates(path))


def load_sample(path: str | Path, n: int = 100) -> List[Candidate]:
    """Load only the first n candidates — useful for smoke-testing."""
    candidates: List[Candidate] = []
    for c in iter_candidates(path):
        candidates.append(c)
        if len(candidates) >= n:
            break
    return candidates
