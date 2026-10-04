from typing import Optional
from fastapi import APIRouter, Query, Form, Request, BackgroundTasks
from fastapi.responses import PlainTextResponse
from loguru import logger
from twilio.twiml.messaging_response import MessagingResponse

from app.services.whatsapp_gig import whatsapp_gig_service, WhatsAppGigIngestionResult
from app.tasks.celery_app import celery_app

router = APIRouter()


@router.post("/ingest-gig-signal", response_model=WhatsAppGigIngestionResult)
def ingest_whatsapp_gig_signal(
    contractor_phone: str = Query("+919822189012", description="MSME / Contractor WhatsApp phone number"),
    message_text: str = Query("Bhosari MIDC Pune mein turant 15 EV battery aur wiring technicians chahiye urgent requirement", description="Raw voice transcript or text from WhatsApp")
):
    """
    (Demo/Test) WhatsApp 'Gig-Signal' Engine for MSMEs and Contractors (Feature 4).
    """
    return whatsapp_gig_service.process_incoming_whatsapp_message(
        contractor_phone=contractor_phone,
        message_text=message_text
    )


@router.post("/twilio/webhook", response_class=PlainTextResponse)
async def twilio_whatsapp_webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    From: str = Form(...),
    Body: str = Form(...)
):
    """
    Real Twilio WhatsApp webhook integration stub.
    Receives incoming WhatsApp messages, triggers LMIS AI logic, and replies with candidates.
    """
    contractor_phone = From.replace("whatsapp:", "")
    message_text = Body.strip()
    
    logger.info(f"Incoming WhatsApp from {contractor_phone}: {message_text}")
    
    # Process the message via our AI Engine
    result = whatsapp_gig_service.process_incoming_whatsapp_message(
        contractor_phone=contractor_phone,
        message_text=message_text
    )
    
    # In a fully connected real system, we'd trigger a Celery background task to update CDI
    # celery_app.send_task("refresh_cdi_scores", kwargs={"district": result.extracted_district})
    
    # Format Twilio TwiML response
    twiml_resp = MessagingResponse()
    twiml_resp.message(result.automated_whatsapp_reply)
    
    return str(twiml_resp)
