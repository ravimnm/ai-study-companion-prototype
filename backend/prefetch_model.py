"""
Download the embedding model at BUILD time.

Run by the Render build command (see render.yaml):

    pip install -r requirements.txt && python prefetch_model.py

so the model files are baked into the deployed image. Otherwise the
first upload after every deploy would have to download ~90 MB on a
tiny CPU, which looks like a file stuck in "processing".
"""

import os
from pathlib import Path

BACKEND_DIR = Path(__file__).resolve().parent

cache_dir = os.environ.setdefault(
    "EMBEDDING_CACHE_DIR",
    str(BACKEND_DIR / ".model_cache"),
)

model_name = os.environ.get(
    "EMBEDDING_MODEL",
    "sentence-transformers/all-MiniLM-L6-v2",
)

from fastembed import TextEmbedding

model = TextEmbedding(model_name=model_name, cache_dir=cache_dir)

vector = next(iter(model.embed(["prefetch check"])))

assert len(vector) == 384, f"Unexpected embedding size: {len(vector)}"

print(f"Embedding model cached in {cache_dir} (dim={len(vector)}).")
