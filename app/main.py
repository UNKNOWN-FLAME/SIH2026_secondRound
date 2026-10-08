import os
from contextlib import asynccontextmanager
import uuid
from fastapi import FastAPI, Request, Response, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import text

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from loguru import logger
import sentry_sdk
from prometheus_fastapi_instrumentator import Instrumentator

from app.core.config import settings
from app.core.database import engine, Base, SessionLocal, get_db
from app.api.v1.api_router import api_router
from app.models.taxonomy import NCOOccupation
from app.services.nco_matcher import nco_matcher_service
from app.services.skill_graph_engine import skill_graph_engine
from app.seed.database_seeder import seed_database


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Ensure database schema is ready and in-memory AI engines are warm
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()
    try:
        # Check if database has any occupations seeded
        count = db.query(NCOOccupation).count()
        if count == 0:
            logger.info("Empty database detected. Running automatic initial seed...")
            seed_database(db)
        else:
            # Warm up in-memory AI services
            all_occs = db.query(NCOOccupation).all()
            nco_matcher_service.build_index(all_occs)
            occ_list = [
                {
                    "nco_code": o.nco_code,
                    "title": o.title,
                    "sector_code": o.sector_code,
                    "nsqf_level": o.nsqf_level,
                    "core_skills": o.core_skills,
                    "is_emerging": o.is_emerging,
                    "is_legacy_at_risk": o.is_legacy_at_risk
                }
                for o in all_occs
            ]
            skill_graph_engine.load_taxonomy(occ_list)
            logger.info(f"LMIS AI Engines Warmed Up with {len(all_occs)} NCO Occupations.")
    finally:
        db.close()
    
    yield
    
    # Shutdown logic (if any)
    logger.info("Shutting down LMIS Backend Service...")

limiter = Limiter(key_func=get_remote_address)


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="""
## Ministry of Skill Development and Entrepreneurship (MSDE)
### AI-Enabled Labour Market Intelligence and Skill Demand-Supply Forecasting Engine (PS 26246)

An apex decision-support backend for MSDE, NCVET, and State Skill Missions:
* **Pillar 1: Multi-Source Lead-Indicator Demand Fusion (CDI)**: Ingests job postings, industrial Capex/PLI signals, and e-Shram mobility into a unified demand index.
* **Pillar 2: Skill Adjacency & Bridge-Course Engine**: Recommends shortest skill transition pathways (4–8 week bridge modules) for surplus trades using NCO-2015/NSQF graphs.
* **Pillar 3: Autonomous Policy Target Optimizer & What-If Sandbox**: Solves constrained linear allocation problems to generate optimal annual training targets per district and trade.
    """,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Initialize Sentry for Error Tracking
sentry_sdk.init(
    dsn=os.getenv("SENTRY_DSN", ""),  # Leave empty for dev to disable
    traces_sample_rate=1.0,
    environment="production"
)

# Initialize Prometheus Metrics Instrumentator
Instrumentator().instrument(app).expose(app)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Configure CORS for seamless frontend/dashboard access
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_correlation_id(request: Request, call_next):
    req_id = str(uuid.uuid4())
    logger.bind(request_id=req_id)
    response = await call_next(request)
    response.headers["X-Request-ID"] = req_id
    response.headers["X-API-Version"] = settings.VERSION
    return response

# Mount API Routers
app.include_router(api_router, prefix=settings.API_V1_STR)

# Mount Frontend Static Directory for Apex Decision Dashboard
frontend_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
if os.path.isdir(frontend_dir):
    app.mount("/dashboard", StaticFiles(directory=frontend_dir, html=True), name="dashboard")


@app.get("/", tags=["System Health"])
def root():
    return {
        "service": settings.PROJECT_NAME,
        "problem_statement": settings.PROJECT_ID,
        "version": settings.VERSION,
        "status": "OPERATIONAL",
        "documentation": "/docs",
        "frontend_dashboard": "/dashboard",
        "sectors_covered": [
            "Green Energy & Clean Mobility (Solar PV, EV Tech)",
            "Electronics System Design & Manufacturing (ESDM - Semiconductor/SMT)",
            "Healthcare & Allied Clinical Services (EMT, Dialysis)",
            "IT-ITeS & Emerging Digital (Cloud Ops, Drone Telemetry)"
        ],
        "forecasting_horizons": ["12 Months (Tactical)", "24 Months (Strategic)"]
    }


@app.get("/health", tags=["System Health"])
@limiter.limit("10/minute")
def health_check(request: Request, db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.execute(text("SELECT 1"))
    except Exception as e:
        logger.error(f"Health check DB failure: {e}")
        db_status = "disconnected"
        
    return {
        "status": "healthy" if db_status == "connected" else "degraded",
        "database": db_status,
        "nco_matcher_ready": nco_matcher_service.is_fitted,
        "skill_graph_ready": len(skill_graph_engine.occupations_dict) > 0
    }
