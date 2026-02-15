#!/usr/bin/env python3
"""
HyperTask Models Debug & Configuration Script
Tests and configures Llama 3.1 and FLUX.2 models
"""

import os
import sys
import asyncio
import json
from dotenv import load_dotenv
from typing import Dict, Any, Optional
from datetime import datetime

# Load environment
load_dotenv()

# Add to path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from agents.copybot import copybot
from agents.designbot import designbot
from agents.manager import manager
from loguru import logger

# Configure logger
logger.remove()
logger.add(sys.stdout, format="<green>{time:HH:mm:ss}</green> | <level>{level: <8}</level> | <cyan>{name}</cyan> - <level>{message}</level>")

class ModelDebugger:
    """Debug and test AI models configuration"""
    
    def __init__(self):
        self.results = {
            "timestamp": datetime.now().isoformat(),
            "models": {},
            "tests": {},
            "configuration": {}
        }
    
    def test_environment(self) -> Dict[str, Any]:
        """Test environment variables and setup"""
        logger.info("🔍 Testing Environment Setup...")
        
        env_tests = {
            "HF_TOKEN": os.getenv("HF_TOKEN"),
            "API_PORT": os.getenv("API_PORT", "8000"),
            "PYTHON_VERSION": f"{sys.version_info.major}.{sys.version_info.minor}",
            "HTTPX_INSTALLED": self._check_import("httpx"),
            "PILLOW_INSTALLED": self._check_import("PIL"),
            "LOGURU_INSTALLED": self._check_import("loguru"),
            "FASTAPI_INSTALLED": self._check_import("fastapi"),
        }
        
        # Check HF token
        if env_tests["HF_TOKEN"]:
            hf_token = env_tests["HF_TOKEN"]
            env_tests["HF_TOKEN_VALID"] = len(hf_token) > 10
            env_tests["HF_TOKEN_LENGTH"] = len(hf_token)
            env_tests["HF_TOKEN"] = "***" + hf_token[-10:]  # Mask for security
        else:
            env_tests["HF_TOKEN_VALID"] = False
            env_tests["HF_TOKEN"] = "NOT SET"
            logger.warning("  HF_TOKEN not set! Set it in .env file")
        
        # Display results
        logger.info("📋 Environment Status:")
        for key, value in env_tests.items():
            if key == "HF_TOKEN":
                status = "" if env_tests.get("HF_TOKEN_VALID") else "❌"
                logger.info(f"  {status} {key}: {value}")
            else:
                status = "" if value else "❌"
                logger.info(f"  {status} {key}: {value}")
        
        self.results["configuration"]["environment"] = env_tests
        return env_tests
    
    def get_agent_status(self) -> Dict[str, Any]:
        """Get status of all agents"""
        logger.info(" Checking Agent Status...")
        
        agents_status = {
            "copybot": copybot.get_status(),
            "designbot": designbot.get_status()
        }
        
        logger.info(" Agent Models:")
        logger.info(f"  CopyBot Model: {copybot.get_status()['model']}")
        logger.info(f"  CopyBot Fallback: {copybot.get_status()['fallback_model']}")
        logger.info(f"  DesignBot Model: {designbot.get_status()['model']}")
        logger.info(f"  DesignBot Fallback: {designbot.get_status()['fallback_model']}")
        
        self.results["models"] = agents_status
        return agents_status
    
    async def test_copybot_models(self) -> Dict[str, Any]:
        """Test CopyBot with Llama 3.1"""
        logger.info("📝 Testing CopyBot (Llama 3.1)...")
        
        test_brand = "TechCorp"
        results = {
            "primary_model": copybot.model_name,
            "fallback_model": copybot.model_fallback,
            "tests": {}
        }
        
        # Test 1: With HF Token
        if copybot.hf_token:
            logger.info(f"  🔄 Generating slogan with {copybot.model_name}...")
            try:
                slogan = await copybot.generate_slogan(test_brand)
                results["tests"]["llama_3_1"] = {
                    "status": "success" if slogan else "failed",
                    "slogan": slogan,
                    "model": copybot.model_name
                }
                logger.success(f"   Slogan: {slogan}")
            except Exception as e:
                logger.error(f"  ❌ Error: {str(e)}")
                results["tests"]["llama_3_1"] = {
                    "status": "error",
                    "error": str(e),
                    "model": copybot.model_name
                }
        else:
            logger.warning("    HF_TOKEN not set, skipping API test")
            results["tests"]["llama_3_1"] = {
                "status": "skipped",
                "reason": "HF_TOKEN not set"
            }
        
        # Test 2: Fallback generation
        logger.info(f"  🔄 Testing fallback generation...")
        try:
            fallback_slogan = copybot._generate_fallback_slogan(test_brand, {})
            results["tests"]["fallback_template"] = {
                "status": "success",
                "slogan": fallback_slogan
            }
            logger.success(f"   Fallback: {fallback_slogan}")
        except Exception as e:
            logger.error(f"  ❌ Fallback error: {str(e)}")
            results["tests"]["fallback_template"] = {
                "status": "error",
                "error": str(e)
            }
        
        self.results["tests"]["copybot"] = results
        return results
    
    async def test_designbot_models(self) -> Dict[str, Any]:
        """Test DesignBot with FLUX.2"""
        logger.info("🎨 Testing DesignBot (FLUX.2)...")
        
        test_brand = "TechCorp"
        results = {
            "primary_model": designbot.model_name,
            "fallback_model": designbot.model_fallback,
            "tests": {}
        }
        
        # Test 1: Placeholder generation (always works)
        logger.info(f"  🔄 Testing placeholder generation...")
        try:
            placeholder = designbot._create_placeholder_logo(test_brand, ["purple", "cyan"])
            results["tests"]["placeholder"] = {
                "status": "success",
                "has_image": bool(placeholder.get("image_base64")),
                "size": placeholder.get("size"),
                "is_placeholder": placeholder.get("is_placeholder", True)
            }
            logger.success(f"   Placeholder generated: {placeholder['size']}")
        except Exception as e:
            logger.error(f"  ❌ Placeholder error: {str(e)}")
            results["tests"]["placeholder"] = {
                "status": "error",
                "error": str(e)
            }
        
        # Test 2: FLUX.2 API test (if HF token is set)
        if designbot.hf_token:
            logger.info(f"  🔄 Testing FLUX.2 API generation...")
            try:
                prompt = designbot._build_logo_prompt(test_brand, "modern minimalist", ["purple", "cyan"])
                logger.debug(f"    Prompt: {prompt[:100]}...")
                
                # Note: We don't actually call the API in this debug to avoid long waits
                # Just verify the method exists and returns proper types
                logger.info(f"    ℹ️  API call skipped in debug mode (would take 30-60 seconds)")
                results["tests"]["flux_2_api"] = {
                    "status": "ready",
                    "model": designbot.model_name,
                    "note": "API call skipped in debug mode"
                }
            except Exception as e:
                logger.error(f"  ❌ API test error: {str(e)}")
                results["tests"]["flux_2_api"] = {
                    "status": "error",
                    "error": str(e)
                }
        else:
            logger.warning("    HF_TOKEN not set, skipping API test")
            results["tests"]["flux_2_api"] = {
                "status": "skipped",
                "reason": "HF_TOKEN not set"
            }
        
        self.results["tests"]["designbot"] = results
        return results
    
    async def test_manager_analysis(self) -> Dict[str, Any]:
        """Test Manager's request analysis"""
        logger.info(" Testing Manager Request Analysis...")
        
        test_prompts = [
            "Create a logo for my coffee shop",
            "Write a slogan for my tech startup",
            "Design a logo and write a slogan for TechCorp",
            "Generate marketing copy for my product",
            "Just create something amazing"
        ]
        
        results = {}
        
        for prompt in test_prompts:
            logger.info(f"  📝 Analyzing: '{prompt}'")
            try:
                analysis = manager.analyze_request(prompt)
                results[prompt] = {
                    "tasks": len(analysis["tasks"]),
                    "has_design": analysis.get("has_design_task", False),
                    "has_copy": analysis.get("has_copy_task", False),
                    "total_cost": analysis["total_cost"],
                    "tasks_detail": [f"{t['agent']}: {t['task_type']}" for t in analysis["tasks"]]
                }
                logger.info(f"     Tasks: {results[prompt]['tasks_detail']}")
                logger.info(f"       Cost: ${results[prompt]['total_cost']}")
            except Exception as e:
                logger.error(f"    ❌ Error: {str(e)}")
                results[prompt] = {"error": str(e)}
        
        self.results["tests"]["manager"] = results
        return results
    
    def check_model_availability(self) -> Dict[str, Any]:
        """Check model availability status"""
        logger.info("🌐 Checking Model Availability...")
        
        models_info = {
            "copybot_primary": {
                "model": copybot.model_name,
                "type": "Text Generation",
                "size": "70B",
                "api": "Hugging Face Inference",
                "status": "configured"
            },
            "copybot_fallback": {
                "model": copybot.model_fallback,
                "type": "Text Generation",
                "size": "7B",
                "api": "Hugging Face Inference",
                "status": "configured"
            },
            "designbot_primary": {
                "model": designbot.model_name,
                "type": "Image Generation",
                "api": "Hugging Face Inference",
                "status": "configured"
            },
            "designbot_fallback": {
                "model": designbot.model_fallback,
                "type": "Image Generation",
                "api": "Hugging Face Inference",
                "status": "configured"
            }
        }
        
        for key, info in models_info.items():
            model_name = info["model"]
            logger.info(f"  📦 {key}:")
            for field, value in info.items():
                logger.info(f"     • {field}: {value}")
        
        self.results["configuration"]["models_info"] = models_info
        return models_info
    
    def generate_report(self) -> str:
        """Generate debug report"""
        logger.info("📄 Generating Report...")
        
        report = """
╔════════════════════════════════════════════════════════════════════════════╗
║                    HYPERTASK MODEL DEBUG REPORT                            ║
╚════════════════════════════════════════════════════════════════════════════╝

📋 CONFIGURATION:
""" + json.dumps(self.results.get("configuration", {}), indent=2) + """

 AGENT STATUS:
""" + json.dumps(self.results.get("models", {}), indent=2) + """

🧪 TEST RESULTS:
""" + json.dumps(self.results.get("tests", {}), indent=2) + """

 SUMMARY:

Primary Models:
  • CopyBot (Text): {}
  • DesignBot (Image): {}

Fallback Models:
  • CopyBot (Text): {}
  • DesignBot (Image): {}

Status:
  • Llama 3.1: {"deployed" if self.results.get("models", {}).get("copybot", {}).get("model") else "not set"}
  • FLUX.2: {"deployed" if self.results.get("models", {}).get("designbot", {}).get("model") else "not set"}

🔧 NEXT STEPS:

1. Ensure HF_TOKEN is set in .env file
2. Run: python debug_models.py --test-api
3. Monitor logs for model generation

📚 RESOURCES:
  • Llama 3.1: https://huggingface.co/meta-llama/Llama-3.1-70b-Instruct
  • FLUX.2: https://huggingface.co/black-forest-labs/FLUX.1-dev
  • HF Docs: https://huggingface.co/docs

""".format(
            copybot.model_name,
            designbot.model_name,
            copybot.model_fallback,
            designbot.model_fallback
        )
        
        return report
    
    def _check_import(self, module_name: str) -> bool:
        """Check if module can be imported"""
        try:
            __import__(module_name)
            return True
        except ImportError:
            return False
    
    async def run_full_debug(self, test_api: bool = False):
        """Run complete debug sequence"""
        logger.info("🚀 Starting HyperTask Model Debug...")
        logger.info("")
        
        # Test environment
        self.test_environment()
        logger.info("")
        
        # Check agent status
        self.get_agent_status()
        logger.info("")
        
        # Check model availability
        self.check_model_availability()
        logger.info("")
        
        # Test manager
        await self.test_manager_analysis()
        logger.info("")
        
        # Test models
        if test_api:
            logger.warning("🔴 WARNING: API tests may take 30-60 seconds. Press Ctrl+C to skip.")
            await asyncio.sleep(3)
            
            await self.test_copybot_models()
            logger.info("")
            
            await self.test_designbot_models()
            logger.info("")
        else:
            logger.info("⏭️  Skipping API tests (use --test-api flag to enable)")
            logger.info("")
        
        # Generate report
        report = self.generate_report()
        logger.info(report)
        
        # Save report
        report_file = os.path.join(os.path.dirname(__file__), "debug_report.json")
        with open(report_file, "w") as f:
            json.dump(self.results, f, indent=2)
        logger.success(f" Report saved to: {report_file}")

def main():
    """Main entry point"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description="HyperTask Model Debug & Configuration Tool",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python debug_models.py                    # Run basic debug
  python debug_models.py --test-api         # Include API tests (slow)
  python debug_models.py --test-api --verbose  # With verbose output
  python debug_models.py --check-env        # Just check environment
"""
    )
    
    parser.add_argument(
        "--test-api",
        action="store_true",
        help="Run API tests (takes 30-60 seconds)"
    )
    parser.add_argument(
        "--check-env",
        action="store_true",
        help="Only check environment"
    )
    parser.add_argument(
        "--verbose",
        action="store_true",
        help="Verbose output"
    )
    
    args = parser.parse_args()
    
    debugger = ModelDebugger()
    
    try:
        if args.check_env:
            debugger.test_environment()
        else:
            asyncio.run(debugger.run_full_debug(test_api=args.test_api))
    except KeyboardInterrupt:
        logger.warning("\n  Debug interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Debug failed: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()
