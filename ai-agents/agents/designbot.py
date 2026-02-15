"""
DesignBot - Image Generation Agent  
"""
import os
import base64
import httpx
from io import BytesIO
from typing import Dict, Any, Optional
from PIL import Image, ImageDraw, ImageFont
from loguru import logger

class DesignBot:
    """AI Agent for logo and graphic design"""
    
    def __init__(self):
        self.name = "DesignBot"
        self.cost = 50
        self.specialty = "Logo & Graphic Design"
        self.status = "idle"
        
        self.hf_token = os.getenv("HF_TOKEN")
        self.api_url = "https://api-inference.huggingface.co/models/"
        self.model_name = "stabilityai/stable-diffusion-2-1"
        
        logger.info(f"Initialized {self.name}")
    
    async def generate_logo(
        self,
        brand_name: str,
        style: str = "modern minimalist",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate a logo for a brand"""
        
        ctx = context or {}
        colors = ctx.get("colors", ["purple", "cyan"])
        
        try:
            if self.hf_token:
                prompt = f"professional logo design for {brand_name}, {style} style, using {' and '.join(colors)} colors, clean, minimalist, high quality"
                
                image_bytes = await self._call_hf_image_api(prompt)
                if image_bytes:
                    img = Image.open(BytesIO(image_bytes))
                    img_base64 = self._image_to_base64(img)
                    
                    logger.success(f"{self.name} generated logo via API")
                    return {
                        "image_base64": f"data:image/png;base64,{img_base64}",
                        "format": "PNG",
                        "size": img.size,
                        "brand_name": brand_name
                    }
        except Exception as e:
            logger.warning(f"HF Image API failed: {e}, using fallback")
        
        # Fallback to generated placeholder
        return self._create_placeholder_logo(brand_name, colors)
    
    async def _call_hf_image_api(self, prompt: str) -> Optional[bytes]:
        """Call HuggingFace Image Generation API"""
        
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        payload = {"inputs": prompt}
        
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.api_url}{self.model_name}",
                headers=headers,
                json=payload
            )
            
            if response.status_code == 200:
                return response.content
            
            return None
    
    def _create_placeholder_logo(
        self, 
        brand_name: str, 
        colors: list
    ) -> Dict[str, Any]:
        """Create a nice-looking placeholder logo"""
        
        # Create image
        img = Image.new('RGB', (800, 800), color='white')
        draw = ImageDraw.Draw(img)
        
        # Parse color
        primary_color = self._parse_color(colors[0] if colors else "#8B5CF6")
        secondary_color = self._parse_color(colors[1] if len(colors) > 1 else "#06B6D4")
        
        # Draw gradient-like circles
        center = 400
        for i in range(10, 0, -1):
            radius = i * 25
            color = self._blend_colors(primary_color, secondary_color, i / 10)
            draw.ellipse(
                [center - radius, center - radius, center + radius, center + radius],
                fill=color,
                outline=None
            )
        
        # Draw brand initial
        initial = brand_name[0].upper() if brand_name else "B"
        
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 200)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 200)
            except:
                font = ImageFont.load_default()
        
        # Draw text with shadow
        bbox = draw.textbbox((0, 0), initial, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = (800 - text_width) // 2
        text_y = (800 - text_height) // 2
        
        draw.text((text_x + 5, text_y + 5), initial, fill=(0, 0, 0, 100), font=font)
        draw.text((text_x, text_y), initial, fill='white', font=font)
        
        # Convert to base64
        img_base64 = self._image_to_base64(img)
        
        logger.info(f"{self.name} generated placeholder logo")
        return {
            "image_base64": f"data:image/png;base64,{img_base64}",
            "format": "PNG",
            "size": (800, 800),
            "brand_name": brand_name,
            "is_placeholder": True
        }
    
    def _parse_color(self, color: str) -> tuple:
        """Parse color string to RGB tuple"""
        
        color_map = {
            "purple": (139, 92, 246),
            "cyan": (6, 182, 212),
            "blue": (59, 130, 246),
            "green": (16, 185, 129),
            "red": (239, 68, 68),
            "orange": (245, 158, 11),
            "pink": (236, 72, 153),
            "brown": (120, 53, 15),
            "cream": (245, 222, 179),
        }
        
        if color.lower() in color_map:
            return color_map[color.lower()]
        
        if color.startswith("#"):
            color = color[1:]
            return tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
        
        return (139, 92, 246)
    
    def _blend_colors(self, color1: tuple, color2: tuple, ratio: float) -> tuple:
        """Blend two colors"""
        return tuple(int(color1[i] * ratio + color2[i] * (1 - ratio)) for i in range(3))
    
    def _image_to_base64(self, img: Image.Image) -> str:
        """Convert PIL Image to base64 string"""
        buffered = BytesIO()
        img.save(buffered, format="PNG")
        return base64.b64encode(buffered.getvalue()).decode()
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "cost": self.cost,
            "specialty": self.specialty,
            "status": self.status,
            "model": self.model_name
        }


# Global instance
designbot = DesignBot()