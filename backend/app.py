"""
AyurSutra - Main FastAPI Application
Ayurvedic Dosha Detection & Panchakarma Recommendation Chatbot
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from database.database import engine, Base
from routes import chat, assessment, pdf
import os
import sys

# Add backend directory to path for imports
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="AyurSutra API",
    description="Ayurvedic Dosha Detection & Panchakarma Recommendation Chatbot",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "https://sih-ayursutra-t1ci.onrender.com",  # frontend on Render
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(chat.router, prefix="/chat")
app.include_router(assessment.router, prefix="/assessment")
app.include_router(pdf.router, prefix="/pdf")

# PDF Reports
reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
os.makedirs(reports_dir, exist_ok=True)
app.mount("/reports", StaticFiles(directory=reports_dir), name="reports")

# Health endpoints
@app.get("/health")
async def health_check():
    return {"status": "healthy"}


@app.get("/keepalive")
def keep_alive():
    return {"status": "awake"}


# ---- SERVE FRONTEND (VITE DIST) ----
frontend_dist = os.path.join(os.path.dirname(__file__), "../frontend/dist")

if os.path.exists(frontend_dist):
    # Step 1: Serve static files
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

    # Step 2: Handle React Router refresh
    @app.get("/{full_path:path}")
    async def serve_frontend(full_path: str):
        return FileResponse(os.path.join(frontend_dist, "index.html"))


# Run locally
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
