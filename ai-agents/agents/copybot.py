"""
Enhanced CopyBot - Multiple copywriting capabilities
"""
import os
import httpx
from loguru import logger
from typing import Dict, Any, Optional, List

class CopyBot:
    """Enhanced copywriting agent with multiple capabilities"""
    
    def __init__(self):
        self.name = "CopyBot"
        self.cost = 20
        self.specialty = "Copywriting & Marketing"
        self.status = "idle"
        
        self.hf_token = os.getenv("HF_TOKEN")
        self.api_url = "https://api-inference.huggingface.co/models/"
        self.model_name = "mistralai/Mistral-7B-Instruct-v0.2"
        
        logger.info(f"Initialized {self.name}")
    
    async def generate_slogan(
        self, 
        brand_name: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate catchy slogan"""
        
        ctx = context or {}
        brand_voice = ctx.get("brand_voice", "professional and friendly")
        industry = ctx.get("industry", "")
        
        prompt = f"""Create a memorable slogan for "{brand_name}".

Industry: {industry if industry else 'general'}
Brand voice: {brand_voice}

Requirements:
- Maximum 8 words
- Catchy and memorable
- Reflects brand personality

Output only the slogan, nothing else.

Slogan:"""

        try:
            if self.hf_token:
                slogan = await self._call_api(prompt)
                if slogan:
                    logger.success(f"{self.name} generated slogan")
                    return slogan
        except Exception as e:
            logger.warning(f"API failed: {e}")
        
        # Fallback templates
        return self._generate_fallback_slogan(brand_name, ctx)
    
    async def generate_landing_page(
        self,
        brand_name: str,
        product_description: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate landing page copy"""
        
        ctx = context or {}
        
        sections = {}
        
        # Hero section with fallback
        sections['hero'] = {
            'headline': f'Transform Your Business with {brand_name}',
            'subheadline': f'The smartest solution for {product_description}',
            'cta': 'Get Started'
        }
        
        # Features section
        sections['features'] = [
            {
                'title': 'Fast & Efficient',
                'description': f'{brand_name} delivers results in record time'
            },
            {
                'title': 'Easy to Use',
                'description': 'Intuitive interface designed for everyone'
            },
            {
                'title': 'Reliable',
                'description': 'Built on proven technology you can trust'
            }
        ]
        
        # Benefits section
        sections['benefits'] = [
            'Save time and resources',
            'Increase productivity',
            'Achieve better results',
            'Scale with confidence'
        ]
        
        logger.success(f"{self.name} generated landing page")
        return sections
    
    async def generate_pitch_deck_copy(
        self,
        brand_name: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate pitch deck slide content"""
        
        ctx = context or {}
        problem = ctx.get('problem', 'Market inefficiency')
        solution = ctx.get('solution', f'{brand_name} provides an innovative solution')
        
        slides = {
            'cover': {
                'title': brand_name,
                'subtitle': 'Revolutionizing the Industry',
                'tagline': await self.generate_slogan(brand_name, ctx)
            },
            'problem': {
                'title': 'The Problem',
                'points': [
                    problem,
                    'Current solutions are inadequate',
                    'Market opportunity is huge'
                ]
            },
            'solution': {
                'title': 'Our Solution',
                'points': [
                    solution,
                    'Built on cutting-edge technology',
                    'Proven results'
                ]
            },
            'market': {
                'title': 'Market Opportunity',
                'points': [
                    'Large addressable market',
                    'Growing demand',
                    'First-mover advantage'
                ]
            },
            'traction': {
                'title': 'Traction',
                'points': [
                    'Early adopters onboarded',
                    'Positive feedback',
                    'Revenue growing'
                ]
            },
            'ask': {
                'title': 'The Ask',
                'points': [
                    'Seeking investment to scale',
                    'Expand team and reach',
                    'Accelerate growth'
                ]
            }
        }
        
        logger.success(f"{self.name} generated pitch deck")
        return slides
    
    async def generate_social_post(
        self,
        brand_name: str,
        platform: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate social media post"""
        
        ctx = context or {}
        
        templates = {
            'twitter': f"🚀 Excited to introduce {brand_name}! Transforming the way you work. #Innovation #Tech",
            'linkedin': f"We're thrilled to announce {brand_name} - revolutionizing productivity and efficiency. Learn more about how we're making a difference.",
            'instagram': f"✨ Say hello to {brand_name}! Your new favorite tool. Link in bio. #NewProduct #Innovation",
            'facebook': f"Introducing {brand_name}! We've built something amazing and can't wait to share it with you. Check it out!"
        }
        
        return templates.get(platform.lower(), templates['twitter'])
    
    async def _call_api(self, prompt: str, max_tokens: int = 100) -> Optional[str]:
        """Call HuggingFace API"""
        
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_tokens,
                "temperature": 0.7,
                "return_full_text": False
            }
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{self.api_url}{self.model_name}",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                result = response.json()
                if isinstance(result, list) and len(result) > 0:
                    text = result[0].get("generated_text", "").strip()
                    return text.split('\n')[0].strip().strip('"\'')
        
        return None
    
    def _generate_fallback_slogan(self, brand_name: str, context: Dict[str, Any]) -> str:
        """Fallback slogan generation"""
        
        templates = [
            f"{brand_name}: Excellence in Innovation",
            f"{brand_name}: Your Partner in Success",
            f"Experience the {brand_name} Difference",
            f"{brand_name}: Quality Meets Innovation",
            f"Choose {brand_name}, Choose Excellence",
            f"{brand_name}: Building Better Futures",
        ]
        
        index = hash(brand_name) % len(templates)
        return templates[index]
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "cost": self.cost,
            "specialty": self.specialty,
            "status": self.status,
            "model": self.model_name
        }


# Global instance
copybot = CopyBot()