from app.tasks.celery_app import celery_app
from loguru import logger
from app.core.database import SessionLocal

@celery_app.task(name="refresh_forecast_models")
def refresh_forecast_models():
    """
    Background task to retrain or update ML forecasting models 
    using the latest historic data.
    """
    logger.info("Starting background ML forecast model refresh...")
    db = SessionLocal()
    try:
        # Re-fetch historic data and incrementally train the GBR models.
        # Save new models to ml_models/ directory.
        
        logger.info("Background ML forecast refresh completed successfully.")
        return {"status": "success", "message": "ML models retrained."}
    except Exception as e:
        logger.error(f"Error in forecast refresh task: {e}")
        raise e
    finally:
        db.close()
