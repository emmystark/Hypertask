"""
Model Loader - Handles loading and initialization of AI models
"""
import os
import torch
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from diffusers import DiffusionPipeline
from loguru import logger
from typing import Optional, Dict, Any

class ModelLoader:
    """Load and manage AI models for HyperTask agents"""
    
    def __init__(self):
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        self.hf_token = os.getenv("HF_TOKEN")
        self.use_4bit = os.getenv("USE_4BIT_QUANTIZATION", "true").lower() == "true"
        self.models: Dict[str, Any] = {}
        self.tokenizers: Dict[str, Any] = {}
        
        logger.info(f"Initializing ModelLoader on device: {self.device}")
    
    def load_text_model(
        self, 
        model_name: str = "meta-llama/Meta-Llama-3.1-70B-Instruct",
        load_in_4bit: Optional[bool] = None
    ):
        """
        Load text generation model (LLaMA, Mistral, etc.)
        
        Args:
            model_name: HuggingFace model identifier
            load_in_4bit: Whether to use 4-bit quantization (defaults to env setting)
        """
        if model_name in self.models:
            logger.info(f"Model {model_name} already loaded")
            return self.models[model_name], self.tokenizers[model_name]
        
        try:
            logger.info(f"Loading text model: {model_name}")
            
            # Configure quantization for memory efficiency
            quantization_config = None
            if (load_in_4bit if load_in_4bit is not None else self.use_4bit):
                quantization_config = BitsAndBytesConfig(
                    load_in_4bit=True,
                    bnb_4bit_compute_dtype=torch.float16,
                    bnb_4bit_use_double_quant=True,
                    bnb_4bit_quant_type="nf4"
                )
                logger.info("Using 4-bit quantization for memory efficiency")
            
            # Load tokenizer
            tokenizer = AutoTokenizer.from_pretrained(
                model_name,
                token=self.hf_token,
                trust_remote_code=True
            )
            
            # Load model
            model = AutoModelForCausalLM.from_pretrained(
                model_name,
                token=self.hf_token,
                quantization_config=quantization_config,
                device_map="auto" if self.device == "cuda" else None,
                trust_remote_code=True,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32
            )
            
            self.models[model_name] = model
            self.tokenizers[model_name] = tokenizer
            
            logger.success(f"Successfully loaded {model_name}")
            return model, tokenizer
            
        except Exception as e:
            logger.error(f"Failed to load {model_name}: {str(e)}")
            raise
    
    def load_image_model(
        self, 
        model_name: str = "black-forest-labs/FLUX.1-dev"
    ):
        """
        Load image generation model (FLUX, Stable Diffusion, etc.)
        
        Args:
            model_name: HuggingFace model identifier
        """
        if model_name in self.models:
            logger.info(f"Model {model_name} already loaded")
            return self.models[model_name]
        
        try:
            logger.info(f"Loading image model: {model_name}")
            
            # Load diffusion pipeline
            pipeline = DiffusionPipeline.from_pretrained(
                model_name,
                token=self.hf_token,
                torch_dtype=torch.float16 if self.device == "cuda" else torch.float32,
                use_safetensors=True
            )
            
            if self.device == "cuda":
                pipeline = pipeline.to("cuda")
            
            self.models[model_name] = pipeline
            
            logger.success(f"Successfully loaded {model_name}")
            return pipeline
            
        except Exception as e:
            logger.error(f"Failed to load {model_name}: {str(e)}")
            raise
    
    def unload_model(self, model_name: str):
        """Unload a model to free memory"""
        if model_name in self.models:
            del self.models[model_name]
            if model_name in self.tokenizers:
                del self.tokenizers[model_name]
            
            # Clear CUDA cache
            if self.device == "cuda":
                torch.cuda.empty_cache()
            
            logger.info(f"Unloaded model: {model_name}")
    
    def get_model_info(self) -> Dict[str, Any]:
        """Get information about loaded models"""
        return {
            "device": self.device,
            "loaded_models": list(self.models.keys()),
            "cuda_available": torch.cuda.is_available(),
            "cuda_device_count": torch.cuda.device_count() if torch.cuda.is_available() else 0,
            "4bit_quantization": self.use_4bit
        }


# Global model loader instance
model_loader = ModelLoader()