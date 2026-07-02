import hashlib
import os
import numpy as np
from sentence_transformers import SentenceTransformer  # pyrefly: ignore [missing-import]
from functools import lru_cache

MODEL_NAME = "all-MiniLM-L6-v2"
CACHE_DIR = os.path.join(
    os.path.dirname(__file__), "..", "..", "data", "embedding_cache"
)
os.makedirs(CACHE_DIR, exist_ok=True)


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def embed_texts(texts: list, batch_size: int = 256) -> np.ndarray:
    model = get_model()
    return model.encode(
        texts,
        batch_size=batch_size,
        show_progress_bar=True,
        convert_to_numpy=True,
        normalize_embeddings=True,
    )


def get_or_build_candidate_embeddings(
    candidate_ids: list, texts: list
) -> np.ndarray:
    """
    Saves embeddings to disk after first run.
    On all subsequent runs, loads from cache — skips the expensive encode step.
    """
    cache_key = hashlib.sha256(str(candidate_ids).encode()).hexdigest()[:16]
    cache_path = os.path.join(CACHE_DIR, f"candidates_{cache_key}.npy")

    if os.path.exists(cache_path):
        return np.load(cache_path)

    embeddings = embed_texts(texts, batch_size=256)
    np.save(cache_path, embeddings)
    return embeddings
