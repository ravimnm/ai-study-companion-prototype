"""
Production launcher for Render.

The project backend is stored as Jupyter notebooks rather than .py modules.
This launcher loads those notebooks as normal Python modules, builds the
FastAPI application, registers all API routers, and starts Uvicorn.

Unlike notebooks/run_backend.ipynb, this file contains no Google Colab,
Google Drive, or ngrok-specific code.
"""

from pathlib import Path
import json
import os
import sys
import threading
import types

import uvicorn


# ============================================================
# PROJECT PATHS
# ============================================================

# This file lives at:
#   <repo>/backend/render_server.py
#
# Therefore:
#   PROJECT_ROOT = <repo>
#   BACKEND_DIR  = <repo>/backend

BACKEND_DIR = Path(__file__).resolve().parent
PROJECT_ROOT = BACKEND_DIR.parent

if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

# Where the embedding model files live. prefetch_model.py downloads the
# model into this folder during the build, so the server never has to
# download it (slowly, on a tiny CPU) while a user is waiting.
os.environ.setdefault(
    "EMBEDDING_CACHE_DIR",
    str(BACKEND_DIR / ".model_cache"),
)


# ============================================================
# PACKAGE HIERARCHY
# ============================================================

def ensure_package_hierarchy():
    packages = [
        "app",
        "app.ai",
        "app.api",
        "app.core",
        "app.models",
        "app.schemas",
        "app.services",
        "app.utils",
        "app.workers",
    ]

    for package_name in packages:
        if package_name not in sys.modules:
            package = types.ModuleType(package_name)
            package.__path__ = []
            package.__package__ = package_name
            sys.modules[package_name] = package


ensure_package_hierarchy()


# ============================================================
# NOTEBOOK SOURCE LOADER
# ============================================================

def normalize_cell_source(source):
    if isinstance(source, str):
        return source

    if isinstance(source, list):
        parts = []

        def collect(value):
            if isinstance(value, str):
                parts.append(value)
            elif isinstance(value, list):
                for item in value:
                    collect(item)

        collect(source)
        return "".join(parts)

    return ""


def notebook_source(notebook_path):
    with open(notebook_path, "r", encoding="utf-8") as f:
        notebook = json.load(f)

    sources = []

    for cell in notebook.get("cells", []):
        if cell.get("cell_type") != "code":
            continue

        source = normalize_cell_source(
            cell.get("source", [])
        )

        if not source.strip():
            continue

        cleaned_lines = []

        for line in source.splitlines(keepends=True):
            stripped = line.lstrip()

            # Ignore Jupyter/Colab magic commands.
            if stripped.startswith("%"):
                continue

            # Ignore notebook shell commands.
            if stripped.startswith("!"):
                continue

            cleaned_lines.append(line)

        cleaned = "".join(cleaned_lines)

        if cleaned.strip():
            sources.append(cleaned)

    return "\n\n".join(sources)


def load_project_module(relative_path: str, module_name: str):
    notebook_path = PROJECT_ROOT / relative_path

    if not notebook_path.exists():
        raise FileNotFoundError(
            f"Notebook not found: {notebook_path}"
        )

    # Remove stale module if present.
    sys.modules.pop(module_name, None)

    module = types.ModuleType(module_name)
    module.__file__ = str(notebook_path)
    module.__package__ = module_name.rpartition(".")[0]

    sys.modules[module_name] = module

    source = notebook_source(notebook_path)

    compiled = compile(
        source,
        str(notebook_path),
        "exec",
    )

    exec(
        compiled,
        module.__dict__,
    )

    return module


# ============================================================
# LOAD BACKEND MODULES
# ============================================================

core_modules = [
    ("backend/app/core/config.ipynb", "app.core.config"),
    ("backend/app/core/security.ipynb", "app.core.security"),
    ("backend/app/core/database.ipynb", "app.core.database"),
]

utils_modules = [
    ("backend/app/utils/helpers.ipynb", "app.utils.helpers"),
    ("backend/app/utils/logging.ipynb", "app.utils.logging"),
]

model_names = [
    "activity",
    "ai_usage",
    "assessment",
    "concept",
    "conversation",
    "document_chunk",
    "mastery",
    "material",
    "project",
    "recommendation",
    "space",
    "user",
]

model_modules = [
    (
        f"backend/app/models/{name}.ipynb",
        f"app.models.{name}",
    )
    for name in model_names
]

schema_names = [
    "analytics",
    "auth",
    "material",
    "project",
    "quiz",
    "space",
    "tutor",
]

schema_modules = [
    (
        f"backend/app/schemas/{name}.ipynb",
        f"app.schemas.{name}",
    )
    for name in schema_names
]

ai_names = [
    "prompts",
    "tutor",
    "quiz_generator",
    "evaluator",
    "recommender",
]

ai_modules = [
    (
        f"backend/app/ai/{name}.ipynb",
        f"app.ai.{name}",
    )
    for name in ai_names
]

service_names = [
    "ai_service",
    "document_service",
    "retrieval_service",
    "tutor_service",
    "quiz_service",
    "assessment_service",
    "mastery_service",
    "recommendation_service",
    "analytics_service",
    "growth_service",
]

service_modules = [
    (
        f"backend/app/services/{name}.ipynb",
        f"app.services.{name}",
    )
    for name in service_names
]

worker_names = [
    "document_worker",
    "learning_worker",
    "quiz_worker",
]

worker_modules = [
    (
        f"backend/app/workers/{name}.ipynb",
        f"app.workers.{name}",
    )
    for name in worker_names
]

module_groups = [
    ("core", core_modules),
    ("utils", utils_modules),
    ("models", model_modules),
    ("schemas", schema_modules),
    ("ai", ai_modules),
    ("services", service_modules),
    ("workers", worker_modules),
]

loaded_modules = {}

for group_name, modules in module_groups:
    print(f"Loading {group_name}...")

    for relative_path, module_name in modules:
        loaded_modules[module_name] = load_project_module(
            relative_path,
            module_name,
        )

    print(f"✓ {group_name} loaded")


# ============================================================
# LOAD FASTAPI APPLICATION
# ============================================================

print("Loading FastAPI application...")

main_module = load_project_module(
    "backend/app/main.ipynb",
    "app.main",
)

app = main_module.app


# ============================================================
# INITIALIZE MONGODB
# ============================================================

from app.core.config import settings
from app.core.database import create_database

database = create_database(
    mongodb_uri=settings.mongodb_uri,
    database_name=settings.mongodb_database,
)

app.state.database = database

print("✓ MongoDB initialized")


# ============================================================
# LOAD API ROUTERS
# ============================================================

api_modules = [
    ("auth", "backend/app/api/auth.ipynb"),
    ("spaces", "backend/app/api/spaces.ipynb"),
    ("projects", "backend/app/api/projects.ipynb"),
    ("materials", "backend/app/api/materials.ipynb"),
    ("tutor", "backend/app/api/tutor.ipynb"),
    ("quiz", "backend/app/api/quiz.ipynb"),
    ("mastery", "backend/app/api/mastery.ipynb"),
    ("growth", "backend/app/api/growth.ipynb"),
    ("analytics", "backend/app/api/analytics.ipynb"),
    ("admin", "backend/app/api/admin.ipynb"),
    ("recommendations", "backend/app/api/recommendations.ipynb"),
]

loaded_api = {}

for name, relative_path in api_modules:
    module_name = f"app.api.{name}"

    module = load_project_module(
        relative_path,
        module_name,
    )

    loaded_api[name] = module

    router = getattr(module, "router", None)

    if router is None:
        raise RuntimeError(
            f"API module '{name}' does not expose a router."
        )

    if len(router.routes) == 0:
        raise RuntimeError(
            f"API router '{name}' is empty."
        )

    app.include_router(
        router,
        prefix="/api",
    )

    print(
        f"✓ {name}: {len(router.routes)} routes"
    )


# ============================================================
# STARTUP MAINTENANCE (never allowed to stop the server booting)
# ============================================================

# 1. Atlas Vector Search index. Without it every Tutor/Quiz retrieval
#    fails. Creation is a no-op if the index already exists.
try:
    database.initialize_vector_search_index()
except Exception as exc:
    print(f"! Vector Search index not ready: {exc}")

# 2. Anything still "processing" belongs to a process that no longer
#    exists (restart / out-of-memory kill). Fail it so the UI stops
#    spinning and offers a retry.
try:
    interrupted = loaded_api["materials"].recover_interrupted_materials(
        database
    )
    if interrupted:
        print(f"! Marked {interrupted} interrupted material(s) as failed")
except Exception as exc:
    print(f"! Could not recover interrupted materials: {exc}")

# 3. Load the embedding model in the background so the first upload
#    does not wait for it, without delaying the port binding.
threading.Thread(
    target=loaded_modules["app.services.ai_service"].warm_up_embeddings,
    name="embedding-warmup",
    daemon=True,
).start()


# ============================================================
# START SERVER
# ============================================================

# Render supplies PORT automatically.
# Local fallback is 8000.

PORT = int(os.environ.get("PORT", "8000"))

print("=" * 70)
print("AI STUDY COMPANION BACKEND")
print("=" * 70)
print(f"Project root: {PROJECT_ROOT}")
print(f"Backend dir:  {BACKEND_DIR}")
print(f"Port:         {PORT}")
print("=" * 70)

if __name__ == "__main__":
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=PORT,
        log_level="info",
        # Behind Render's proxy: trust X-Forwarded-* so redirects and
        # URLs keep https instead of silently downgrading to http.
        proxy_headers=True,
        forwarded_allow_ips="*",
        timeout_keep_alive=65,
    )
