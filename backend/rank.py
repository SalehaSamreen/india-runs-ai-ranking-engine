"""
Ranking script — produces the submission CSV.
Requires precompute.py to have been run first.
Must complete within 5 minutes on CPU with no network access.

Usage:
    python rank.py --candidates ./data/candidates.jsonl --out ./submission.csv
"""
import argparse
import csv
import time
from app.services.candidate_loader import load_candidates
from app.pipeline import run_pipeline


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--candidates", required=True, help="Path to candidates.jsonl")
    parser.add_argument("--out", required=True, help="Output CSV path")
    args = parser.parse_args()

    print(f"[Rank] Loading candidates from {args.candidates}...")
    start_total = time.time()
    candidates = load_candidates(args.candidates)
    print(f"[Rank] Loaded {len(candidates):,} candidates")

    print("[Rank] Running pipeline...")
    start_pipeline = time.time()
    results = run_pipeline(candidates, top_n=100)
    pipeline_time = time.time() - start_pipeline
    print(f"[Rank] Pipeline completed in {pipeline_time:.1f}s")

    print(f"[Rank] Writing {args.out}...")
    with open(args.out, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["candidate_id", "rank", "score", "reasoning"]
        )
        writer.writeheader()
        writer.writerows(results)

    total_time = time.time() - start_total
    print(f"[Rank] Done. {len(results)} candidates written to {args.out}")
    print(f"[Rank] Total time: {total_time:.1f}s (pipeline only: {pipeline_time:.1f}s, limit: 300s)")

    if pipeline_time > 300:
        print("[Rank] WARNING: pipeline exceeded 300s limit!")
    else:
        print(f"[Rank] Within time limit ({pipeline_time:.1f}s / 300s)")


if __name__ == "__main__":
    main()
