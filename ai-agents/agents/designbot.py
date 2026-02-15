"""
Enhanced DesignBot - Professional Logo & Graphic Design Agent
Uses state-of-the-art image generation models
"""
import os
import base64
import httpx
from io import BytesIO
from typing import Dict, Any, Optional
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageEnhance
from loguru import logger
import asyncio

class DesignBot:
    """AI Agent for professional logo and graphic design"""
    
    def __init__(self):
        self.name = "DesignBot"
        self.cost = 50
        self.specialty = "Logo & Graphic Design"
        self.status = "idle"
        
        self.hf_token = os.getenv("HF_TOKEN")
        self.api_url = "https://api-inference.huggingface.co/models/"
        
        # Use best free models on HuggingFace
        self.models = {
            "primary": "black-forest-labs/FLUX.1-schnell",  # Fast, high quality
            "fallback": "stabilityai/stable-diffusion-xl-base-1.0"  # Backup
        }
        
        logger.info(f"Initialized {self.name} with FLUX.1-schnell")
    
    async def generate_logo(
        self,
        brand_name: str,
        style: str = "modern minimalist",
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Generate a professional, sleek logo based on user input
        
        Args:
            brand_name: The brand name for the logo
            style: Design style (modern, vintage, tech, etc.)
            context: Additional context like colors, industry, mood
        """
        
        ctx = context or {}
        
        # Extract context
        colors = ctx.get("colors", ["purple", "cyan"])
        industry = ctx.get("industry", "technology")
        mood = ctx.get("mood", "professional")
        
        # Build intelligent prompt
        prompt = self._build_smart_prompt(brand_name, style, colors, industry, mood)
        negative_prompt = self._build_negative_prompt()
        
        logger.info(f"{self.name} generating logo for '{brand_name}' with style '{style}'")
        
        try:
            if self.hf_token:
                # Try primary model first
                image_bytes = await self._call_hf_image_api(
                    prompt, 
                    negative_prompt, 
                    model=self.models["primary"]
                )
                
                if image_bytes:
                    img = Image.open(BytesIO(image_bytes))
                    
                    # Post-process for better quality
                    img = self._enhance_image(img)
                    
                    img_base64 = self._image_to_base64(img)
                    
                    logger.success(f"{self.name} generated professional logo via FLUX.1")
                    return {
                        "image_base64": f"data:image/png;base64,{img_base64}",
                        "format": "PNG",
                        "size": img.size,
                        "brand_name": brand_name,
                        "model_used": "FLUX.1-schnell"
                    }
                
                # Try fallback model
                logger.info(f"{self.name} trying fallback model")
                image_bytes = await self._call_hf_image_api(
                    prompt,
                    negative_prompt,
                    model=self.models["fallback"]
                )
                
                if image_bytes:
                    img = Image.open(BytesIO(image_bytes))
                    img = self._enhance_image(img)
                    img_base64 = self._image_to_base64(img)
                    
                    logger.success(f"{self.name} generated logo via SDXL fallback")
                    return {
                        "image_base64": f"data:image/png;base64,{img_base64}",
                        "format": "PNG",
                        "size": img.size,
                        "brand_name": brand_name,
                        "model_used": "SDXL"
                    }
                    
        except Exception as e:
            logger.warning(f"HF Image API failed: {e}, using enhanced placeholder")
        
        # Create enhanced placeholder if API fails
        return self._create_professional_logo(brand_name, colors, style)
    
    def _build_smart_prompt(
        self, 
        brand_name: str, 
        style: str, 
        colors: list,
        industry: str,
        mood: str
    ) -> str:
        """Build an intelligent, detailed prompt for better results"""
        
        # Color processing
        color_str = " and ".join(colors) if colors else "vibrant purple and cyan"
        
        # Style mappings for better results
        style_modifiers = {
            "modern minimalist": "clean, minimal, geometric, contemporary",
            "modern": "sleek, contemporary, professional, refined",
            "vintage": "retro, classic, timeless, elegant",
            "tech": "futuristic, digital, innovative, cutting-edge",
            "luxury": "premium, elegant, sophisticated, high-end",
            "playful": "fun, creative, dynamic, energetic",
            "corporate": "professional, trustworthy, established, formal"
        }
        
        style_desc = style_modifiers.get(style.lower(), style)
        
        # Build comprehensive prompt
        prompt = f"""professional logo design for {brand_name}, {style_desc} style, 
{color_str} color palette, {industry} industry, {mood} mood,
vector art style, flat design, sharp and crisp, centered composition,
white or transparent background, high contrast, modern typography,
award-winning design, trending on dribbble, 8k quality, masterpiece"""
        
        return prompt.strip()
    
    def _build_negative_prompt(self) -> str:
        """Build negative prompt to avoid unwanted elements"""
        
        return """blurry, low quality, pixelated, distorted, 3d render, realistic photo,
watermark, text overlay, signature, complex background, cluttered, messy,
amateur, unprofessional, low resolution, jpeg artifacts, noise"""
    
    async def _call_hf_image_api(
        self, 
        prompt: str, 
        negative_prompt: str,
        model: str
    ) -> Optional[bytes]:
        """Call HuggingFace Image Generation API with retries"""
        
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "negative_prompt": negative_prompt,
                "num_inference_steps": 4,  # FLUX.1-schnell is optimized for 4 steps
                "guidance_scale": 0.0,  # FLUX.1-schnell doesn't need guidance
            }
        }
        
        # Try with retries
        for attempt in range(2):
            try:
                async with httpx.AsyncClient(timeout=90.0) as client:
                    response = await client.post(
                        f"{self.api_url}{model}",
                        headers=headers,
                        json=payload
                    )
                    
                    if response.status_code == 200:
                        return response.content
                    
                    if response.status_code == 503:
                        # Model is loading, wait and retry
                        logger.info(f"Model loading, waiting... (attempt {attempt + 1})")
                        await asyncio.sleep(10)
                        continue
                        
            except Exception as e:
                logger.error(f"API call failed (attempt {attempt + 1}): {e}")
                if attempt < 1:
                    await asyncio.sleep(5)
        
        return None
    
    def _enhance_image(self, img: Image.Image) -> Image.Image:
        """Post-process image for better quality"""
        
        try:
            # Resize to standard logo size if needed
            if img.size[0] > 1024 or img.size[1] > 1024:
                img.thumbnail((1024, 1024), Image.Resampling.LANCZOS)
            
            # Enhance sharpness
            enhancer = ImageEnhance.Sharpness(img)
            img = enhancer.enhance(1.2)
            
            # Enhance contrast slightly
            enhancer = ImageEnhance.Contrast(img)
            img = enhancer.enhance(1.1)
            
            return img
            
        except Exception as e:
            logger.warning(f"Image enhancement failed: {e}")
            return img
    
    def _create_professional_logo(
        self, 
        brand_name: str, 
        colors: list,
        style: str
    ) -> Dict[str, Any]:
        """Create a professional-looking placeholder logo"""
        
        # Create high-res image
        img = Image.new('RGB', (1024, 1024), color='white')
        draw = ImageDraw.Draw(img)
        
        # Parse colors
        primary = self._parse_color(colors[0] if colors else "#8B5CF6")
        secondary = self._parse_color(colors[1] if len(colors) > 1 else "#06B6D4")
        
        center = 512
        
        # Create modern design based on style
        if "minimal" in style.lower():
            # Minimalist geometric design
            self._draw_minimal_logo(draw, center, primary, secondary, brand_name)
        elif "tech" in style.lower():
            # Tech-focused design
            self._draw_tech_logo(draw, center, primary, secondary, brand_name)
        else:
            # Default modern design
            self._draw_modern_logo(draw, center, primary, secondary, brand_name)
        
        # Add brand name
        self._add_brand_text(draw, brand_name, center, primary)
        
        img_base64 = self._image_to_base64(img)
        
        logger.info(f"{self.name} generated professional placeholder logo")
        return {
            "image_base64": f"data:image/png;base64,{img_base64}",
            "format": "PNG",
            "size": (1024, 1024),
            "brand_name": brand_name,
            "is_placeholder": True,
            "style": style
        }
    
    def _draw_minimal_logo(self, draw, center, primary, secondary, brand_name):
        """Draw minimalist logo"""
        # Simple circle with gradient effect
        for i in range(20, 0, -1):
            radius = i * 10
            alpha = int(255 * (i / 20))
            color = self._blend_colors(primary, secondary, i / 20)
            draw.ellipse(
                [center - radius, center - radius, center + radius, center + radius],
                fill=color,
                outline=None
            )
        
        # Add geometric accent
        initial = brand_name[0].upper() if brand_name else "B"
        accent_size = 80
        draw.rectangle(
            [center - accent_size, center - accent_size, 
             center + accent_size, center + accent_size],
            outline=primary,
            width=8
        )
    
    def _draw_tech_logo(self, draw, center, primary, secondary, brand_name):
        """Draw tech-focused logo"""
        # Hexagonal pattern
        for i in range(5):
            radius = 150 - i * 25
            color = self._blend_colors(primary, secondary, i / 5)
            
            # Draw hexagon
            points = []
            for angle in range(0, 360, 60):
                import math
                x = center + radius * math.cos(math.radians(angle))
                y = center + radius * math.sin(math.radians(angle))
                points.append((x, y))
            
            draw.polygon(points, fill=color, outline=primary if i == 0 else None)
    
    def _draw_modern_logo(self, draw, center, primary, secondary, brand_name):
        """Draw modern gradient logo"""
        # Gradient circles
        for i in range(15, 0, -1):
            radius = i * 18
            color = self._blend_colors(primary, secondary, i / 15)
            draw.ellipse(
                [center - radius, center - radius, center + radius, center + radius],
                fill=color,
                outline=None
            )
    
    def _add_brand_text(self, draw, brand_name, center, color):
        """Add brand name to logo"""
        
        initial = brand_name[0].upper() if brand_name else "B"
        
        try:
            # Try to load a good font
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 180)
        except:
            try:
                font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 180)
            except:
                font = ImageFont.load_default()
        
        # Calculate text position
        bbox = draw.textbbox((0, 0), initial, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        text_x = (1024 - text_width) // 2
        text_y = (1024 - text_height) // 2
        
        # Draw with shadow for depth
        draw.text((text_x + 4, text_y + 4), initial, fill=(0, 0, 0, 80), font=font)
        draw.text((text_x, text_y), initial, fill='white', font=font)
    
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
            "gold": (234, 179, 8),
            "silver": (192, 192, 192),
        }
        
        color_lower = color.lower()
        if color_lower in color_map:
            return color_map[color_lower]
        
        if color.startswith("#"):
            color = color[1:]
            try:
                return tuple(int(color[i:i+2], 16) for i in (0, 2, 4))
            except:
                pass
        
        return (139, 92, 246)  # Default purple
    
    def _blend_colors(self, color1: tuple, color2: tuple, ratio: float) -> tuple:
        """Blend two colors smoothly"""
        return tuple(int(color1[i] * ratio + color2[i] * (1 - ratio)) for i in range(3))
    
    def _image_to_base64(self, img: Image.Image) -> str:
        """Convert PIL Image to base64 string"""
        buffered = BytesIO()
        img.save(buffered, format="PNG", optimize=True)
        return base64.b64encode(buffered.getvalue()).decode()
    
    def get_status(self) -> Dict[str, Any]:
        return {
            "name": self.name,
            "cost": self.cost,
            "specialty": self.specialty,
            "status": self.status,
            "model": self.models["primary"]
        }


# Global instance
designbot = DesignBot()