from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.database.mongodb import close_db, connect_db
from app.ml.model import get_model
from app.routes import api, auth
from app.utils.config import get_settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    get_model()  # train or load on startup
    yield
    await close_db()


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="DrugInsight AI API",
    description="AI-powered drug repurposing research platform (academic prototype)",
    version="1.0.0",
    lifespan=lifespan,
)
settings = get_settings()

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(api.router)


@app.get("/health")
async def health():
    return {"status": "ok", "demo_mode": settings.demo_mode}
