"""
CopyBot - Text Generation Agent
Uses Hugging Face Inference API to avoid local model loading issues
"""
import os
import httpx
from loguru import logger
from typing import Dict, Any, Optional

class CopyBot:
    """AI Agent for copywriting using HuggingFace Inference API"""
    
    def __init__(self):
        self.name = "CopyBot"
        self.cost = 20
        self.specialty = "Copywriting & Marketing"
        self.status = "idle"
        
        # Use HF Inference API instead of loading model locally
        self.hf_token = os.getenv("HF_TOKEN")
        self.api_url = "https://api-inference.huggingface.co/models/"
        
        # Use Llama 3.1 for superior copywriting
        self.model_name = "meta-llama/Llama-3.1-70b-Instruct"
        self.model_fallback = "mistralai/Mistral-7B-Instruct-v0.2"
        
        logger.info(f"Initialized {self.name} with Llama 3.1 Model")
    
    
    async def generate_slogan(
        self, 
        brand_name: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate a catchy slogan for a brand"""
        
        ctx = context or {}
        brand_voice = ctx.get("brand_voice", "professional and friendly")
        
        prompt = f"""Create a short, memorable slogan for a brand called "{brand_name}".

Brand voice: {brand_voice}

Requirements:
- Must be catchy and memorable
- Maximum 8 words
- No explanation, just the slogan

Slogan:"""

        try:
            if self.hf_token:
                # Try HuggingFace API first
                slogan = await self._call_hf_api(prompt)
                if slogan:
                    logger.success(f"{self.name} generated slogan via API")
                    return slogan
        except Exception as e:
            logger.warning(f"HF API failed: {str(e)}, using fallback")
        
        # Fallback to template-based generation
        return self._generate_fallback_slogan(brand_name, ctx)
    
    async def generate_ad_copy(
        self,
        product: str,
        platform: str = "social_media",
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate advertising copy"""
        
        ctx = context or {}
        prompt = f"""Write compelling {platform} ad copy for: {product}

Make it engaging and action-oriented. Maximum 50 words.

Ad copy:"""

        try:
            if self.hf_token:
                copy = await self._call_hf_api(prompt)
                if copy:
                    return copy
        except Exception as e:
            logger.warning(f"HF API failed: {str(e)}")
        
        return f"Discover {product} - Excellence you can trust. Limited time offer!"
    
    async def _call_hf_api(self, prompt: str) -> Optional[str]:
        """Call HuggingFace Inference API with automatic fallback"""
        
        models_to_try = [self.model_name, self.model_fallback]
        
        for model in models_to_try:
            try:
                headers = {"Authorization": f"Bearer {self.hf_token}"}
                payload = {
                    "inputs": prompt,
                    "parameters": {
                        "max_new_tokens": 100,
                        "temperature": 0.7,
                        "top_p": 0.9,
                        "return_full_text": False
                    }
                }
                
                async with httpx.AsyncClient(timeout=45.0) as client:
                    response = await client.post(
                        f"{self.api_url}{model}",
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        if isinstance(result, list) and len(result) > 0:
                            text = result[0].get("generated_text", "").strip()
                            lines = text.split('\n')
                            slogan = lines[0].strip().strip('"').strip("'")
                            if slogan:
                                logger.success(f"✅ Generated via {model}")
                                return slogan
                    else:
                        logger.debug(f"Model {model} returned status {response.status_code}")
            except Exception as e:
                logger.debug(f"Model {model} failed: {str(e)}")
        
        logger.warning("All API models failed, using template")
        return None
    
    def _generate_fallback_slogan(
        self, 
        brand_name: str, 
        context: Dict[str, Any]
    ) -> str:
        """Generate slogan using templates when API fails"""
        
        templates = [
            f"{brand_name}: Where Excellence Meets Innovation",
            f"{brand_name}: Your Partner in Success",
            f"{brand_name}: Quality You Can Trust",
            f"Experience {brand_name} Difference",
            f"{brand_name}: Making Life Better",
            f"Choose {brand_name}, Choose Quality",
            f"{brand_name}: Innovation for Tomorrow",
        ]
        
        # Use hash of brand name to pick consistent template
        index = hash(brand_name) % len(templates)
        return templates[index]
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "name": self.name,
            "cost": self.cost,
            "specialty": self.specialty,
            "status": self.status,
            "model": self.model_name
        }


# Global instance
copybot = CopyBot()