"""
Enhanced API - Smart chat handling and task execution
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from loguru import logger
import uuid
import sys

# Configure logger
logger.remove()
logger.add(sys.stderr, level="INFO")

# Import enhanced manager
from agents.manager import manager

app = FastAPI(title="HyperTask AI API", version="2.0")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request models
class ChatRequest(BaseModel):
    message: str
    conversation_id: Optional[str] = None

class ExecuteRequest(BaseModel):
    conversation_id: str

class DirectTaskRequest(BaseModel):
    prompt: str
    context: Optional[Dict[str, Any]] = None


# Endpoints
@app.get("/")
async def root():
    """Health check"""
    return {
        "status": "online",
        "service": "HyperTask AI API",
        "version": "2.0",
        "agents": ["CopyBot", "DesignBot"]
    }

@app.get("/health")
async def health():
    """Detailed health check"""
    worker_status = manager.get_worker_status()
    return {
        "status": "healthy",
        "workers": worker_status
    }

@app.post("/chat")
async def chat(request: ChatRequest):
    """
    Handle chat messages with intelligent conversation flow
    
    This endpoint:
    1. Analyzes the user's message in context
    2. Extracts relevant information (brand, style, etc.)
    3. Asks clarifying questions if needed
    4. Marks conversation as ready when sufficient info is gathered
    """
    
    try:
        # Generate conversation ID if not provided
        conversation_id = request.conversation_id or str(uuid.uuid4())
        
        logger.info(f"Chat request - Conversation: {conversation_id}, Message: {request.message[:100]}")
        
        # Handle the message through the enhanced manager
        result = await manager.handle_chat_message(
            message=request.message,
            conversation_id=conversation_id
        )
        
        logger.info(f"Chat response ready: {result.get('ready_to_execute', False)}")
        
        return result
        
    except Exception as e:
        logger.error(f"Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/execute")
async def execute(request: ExecuteRequest):
    """
    Execute tasks for a ready conversation
    
    This endpoint:
    1. Retrieves the conversation state
    2. Executes all planned tasks
    3. Returns formatted deliverables
    """
    
    try:
        logger.info(f"Executing tasks for conversation: {request.conversation_id}")
        
        # Get conversation state
        conv_state = manager.get_conversation_state(request.conversation_id)
        
        if not conv_state.get("ready_to_execute"):
            raise HTTPException(
                status_code=400,
                detail="Conversation not ready for execution. Continue chatting to provide more details."
            )
        
        analysis = conv_state.get("analysis")
        if not analysis:
            raise HTTPException(
                status_code=400,
                detail="No task analysis found. Please start a new conversation."
            )
        
        # Execute tasks
        result = await manager.execute_tasks(
            analysis=analysis,
            conversation_id=request.conversation_id
        )
        
        logger.success(f"Execution completed: {len(result['deliverables'])} deliverables")
        
        return {
            "status": result["status"],
            "deliverables": result["deliverables"],
            "transaction": {
                "total": result["total_cost"],
                "burn_fee": result["burn_fee"]
            },
            "conversation_id": request.conversation_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Execution error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/task/direct")
async def direct_task(request: DirectTaskRequest):
    """
    Direct task execution (bypass chat)
    
    For when you have all the info and want immediate execution
    """
    
    try:
        logger.info(f"Direct task execution: {request.prompt[:100]}")
        
        result = await manager.process_request(
            user_prompt=request.prompt,
            context=request.context
        )
        
        return result
        
    except Exception as e:
        logger.error(f"Direct task error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversation/{conversation_id}")
async def get_conversation(conversation_id: str):
    """Get conversation state and history"""
    
    try:
        state = manager.get_conversation_state(conversation_id)
        return state
        
    except Exception as e:
        logger.error(f"Error fetching conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/conversation/{conversation_id}/reset")
async def reset_conversation(conversation_id: str):
    """Reset a conversation"""
    
    try:
        # Clear conversation state
        if conversation_id in manager.conversation_manager.conversations:
            del manager.conversation_manager.conversations[conversation_id]
        
        return {"status": "reset", "conversation_id": conversation_id}
        
    except Exception as e:
        logger.error(f"Error resetting conversation: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/agents/status")
async def agents_status():
    """Get status of all worker agents"""
    
    return {
        "agents": manager.get_worker_status()
    }

# Run with: uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
if __name__ == "__main__":
    import uvicorn
    logger.info("Starting HyperTask AI API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)