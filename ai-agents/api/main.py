"""
HyperTask API Server - Fixed Version
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import os
import asyncio
from dotenv import load_dotenv
from loguru import logger
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from agents.manager import manager
from agents.copybot import copybot
from agents.designbot import designbot
 
# Load environment
load_dotenv()

# Initialize app
app = FastAPI(
    title="HyperTask AI Agent API",
    description="Decentralized AI agent marketplace on Monad",
    version="2.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response Models
class TaskRequest(BaseModel):
    prompt: str = Field(..., description="User's request")
    context: Optional[Dict[str, Any]] = Field(default=None)

class ProjectResponse(BaseModel):
    analysis: Dict[str, Any]
    deliverables: List[Dict[str, Any]]
    transaction: Dict[str, Any]
    status: str

# Endpoints
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "name": "HyperTask API",
        "version": "2.0.0",
        "status": "online",
        "docs": "/docs"
    }

@app.get("/health")
async def health():
    """Health check"""
    return {
        "status": "healthy",
        "agents": {
            "copybot": "ready",
            "designbot": "ready",
            "manager": "ready"
        }
    }

@app.get("/agents")
async def get_agents():
    """Get agent status"""
    return manager.get_worker_status()

@app.post("/analyze")
async def analyze(request: TaskRequest):
    """Analyze request without executing"""
    try:
        analysis = manager.analyze_request(request.prompt)
        return analysis
    except Exception as e:
        logger.error(f"Analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute", response_model=ProjectResponse)
async def execute(request: TaskRequest):
    """Execute complete project"""
    try:
        logger.info(f"🚀 Processing: {request.prompt[:50]}...")
        
        result = await asyncio.wait_for(
            manager.process_request(
                user_prompt=request.prompt,
                context=request.context
            ),
            timeout=180.0  # 3 minute timeout for full execution
        )
        
        logger.success("✅ Project completed")
        return result
        
    except asyncio.TimeoutError:
        logger.error("⏱️ Request timeout - API took too long")
        raise HTTPException(status_code=504, detail="Request timeout - API is taking too long")
    except Exception as e:
        logger.error(f"❌ Execution failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/copybot/slogan")
async def generate_slogan(brand_name: str, context: Optional[Dict[str, Any]] = None):
    """Generate slogan only"""
    try:
        slogan = await copybot.generate_slogan(brand_name, context)
        return {"slogan": slogan, "brand_name": brand_name}
    except Exception as e:
        logger.error(f"Slogan generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/designbot/logo")
async def generate_logo(
    brand_name: str,
    style: str = "modern minimalist",
    context: Optional[Dict[str, Any]] = None
):
    """Generate logo only"""
    try:
        result = await designbot.generate_logo(brand_name, style, context)
        return {
            "image_base64": result["image_base64"],
            "brand_name": brand_name,
            "size": result["size"]
        }
    except Exception as e:
        logger.error(f"Logo generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", 8000))
    logger.info(f"Starting HyperTask API on port {port}")
    
    uvicorn.run(
        "main:app",
        host="localhost",
        port=port,
        reload=True
    )