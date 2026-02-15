"""
HyperTask API Server - Fixed & Working Version
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
import os
from dotenv import load_dotenv
from loguru import logger
import sys

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from agents.manager import manager
from agents.copybot import copybot
from agents.designbot import designbot
from agents.master_chatbot import master_chatbot

# Load environment
load_dotenv()

# Initialize app
app = FastAPI(
    title="HyperTask AI Agent API",
    description="Decentralized AI agent marketplace on Monad",
    version="2.0.0"
)

# Store conversations (in production, use Redis or database)
conversations: Dict[str, List[Dict]] = {}

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
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

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's chat message")
    conversation_id: Optional[str] = Field(default=None)

class ChatResponse(BaseModel):
    response: str
    conversation_id: str
    detected_tasks: List[str]
    ready_to_execute: bool
    requires_clarification: bool

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

@app.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Chat with master AI assistant
    Conversational interaction before task execution
    """
    try:
        import time
        
        # Generate or use provided conversation ID
        conv_id = request.conversation_id or f"conv_{int(time.time() * 1000)}"
        
        # Get conversation history
        history = conversations.get(conv_id, [])
        
        # Add user message to history
        history.append({
            "role": "user",
            "content": request.message
        })
        
        # Get chatbot response
        chat_result = await master_chatbot.chat(request.message, history)
        
        # Add assistant response to history
        history.append({
            "role": "assistant",
            "content": chat_result["response"]
        })
        
        # Store updated history (keep last 20 messages)
        conversations[conv_id] = history[-20:]
        
        logger.info(f"Chat response generated for {conv_id}")
        
        return {
            "response": chat_result["response"],
            "conversation_id": conv_id,
            "detected_tasks": chat_result["detected_tasks"],
            "ready_to_execute": chat_result["ready_to_execute"],
            "requires_clarification": chat_result.get("requires_clarification", False)
        }
        
    except Exception as e:
        logger.error(f"Chat failed: {e}")
        # Return friendly error instead of raising exception
        return {
            "response": "I'm having trouble connecting right now. Please try asking about creating a logo, slogan, landing page, or pitch deck!",
            "conversation_id": request.conversation_id or "error",
            "detected_tasks": [],
            "ready_to_execute": False,
            "requires_clarification": False
        }

@app.post("/execute", response_model=ProjectResponse)
async def execute(request: TaskRequest):
    """Execute complete project"""
    try:
        logger.info(f"Processing: {request.prompt}")
        
        result = await manager.process_request(
            user_prompt=request.prompt,
            context=request.context
        )
        
        logger.success("Project completed")
        return result
        
    except Exception as e:
        logger.error(f"Execution failed: {e}")
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

@app.post("/agents/copybot/landing-page")
async def generate_landing_page(
    brand_name: str,
    product_description: str,
    context: Optional[Dict[str, Any]] = None
):
    """Generate landing page copy"""
    try:
        page = await copybot.generate_landing_page(brand_name, product_description, context)
        return {
            "brand_name": brand_name,
            "sections": page
        }
    except Exception as e:
        logger.error(f"Landing page generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/agents/copybot/pitch-deck")
async def generate_pitch_deck(
    brand_name: str,
    context: Optional[Dict[str, Any]] = None
):
    """Generate pitch deck"""
    try:
        deck = await copybot.generate_pitch_deck_copy(brand_name, context)
        return {
            "brand_name": brand_name,
            "slides": deck
        }
    except Exception as e:
        logger.error(f"Pitch deck generation failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    
    port = int(os.getenv("API_PORT", 8000))
    logger.info(f"Starting HyperTask API on port {port}")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=port,
        reload=True
    )