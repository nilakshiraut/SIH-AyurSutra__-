"""
PDF Generation Endpoint
Creates downloadable PDF reports
"""
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any
from utils.simple_pdf_generator import generate_pdf_report
import os

router = APIRouter()

class PDFRequest(BaseModel):
    user_data: Dict[str, Any] = {}
    dosha_results: Dict[str, Any]
    panchakarma_recs: Dict[str, Any]

@router.post("/api/pdf/generate")
async def generate_pdf(request: PDFRequest):
    """Generate PDF report"""
    try:
        pdf_path = generate_pdf_report(
            request.user_data,
            request.dosha_results,
            request.panchakarma_recs
        )

        if not os.path.exists(pdf_path):
            raise HTTPException(status_code=500, detail="PDF file was not generated")

        return FileResponse(
            pdf_path,
            media_type='application/pdf',
            filename='ayursutra_assessment_report.pdf'
        )
    except Exception as e:
        print(f"PDF generation error: {e}")
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")

