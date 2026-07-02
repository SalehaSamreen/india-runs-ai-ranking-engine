"""
Pre-computation script — run this ONCE before rank.py.
Builds and caches the candidate embeddings to disk.
This step can exceed 5 minutes — that is allowed per submission spec.

Usage:
    python precompute.py --candidates ./data/candidates.jsonl
"""
import argparse
import time
from app.services.candidate_loader import load_candidates
from app.services.jd_understanding import get_jd_profile
from app.services.semantic_matching import build_candidate_text
from app.utils.embedding_cache import get_or_build_candidate_embeddings

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidates", required=True)
    args = parser.parse_args()

    print(f"[Precompute] Loading candidates from {args.candidates}...")
    start = time.time()
    candidates = load_candidates(args.candidates)
    print(f"[Precompute] Loaded {len(candidates):,} candidates in {time.time()-start:.1f}s")

    print("[Precompute] Building candidate texts...")
    candidate_ids = [c.candidate_id for c in candidates]
    texts = [build_candidate_text(c) for c in candidates]

    print("[Precompute] Encoding and caching embeddings (this takes ~10 minutes)...")
    start = time.time()
    get_or_build_candidate_embeddings(candidate_ids, texts)
    print(f"[Precompute] Done in {time.time()-start:.1f}s. Cache saved to data/embedding_cache/")

if __name__ == "__main__":
    main()
