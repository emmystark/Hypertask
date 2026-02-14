#!/usr/bin/env python
"""Test script to verify models are functional"""
import asyncio
import sys
import os

sys.path.insert(0, '/Users/iboro/Downloads/hypertask-app/ai-agents')
os.chdir('/Users/iboro/Downloads/hypertask-app/ai-agents')

from agents.copybot import copybot
from agents.designbot import designbot
from loguru import logger

async def test_models():
    print("\n" + "="*60)
    print("TESTING AI AGENT MODELS")
    print("="*60)
    
    # Test CopyBot
    print("\n[1/2] Testing CopyBot (Text Generation)...")
    try:
        slogan = await copybot.generate_slogan("TechVision")
        if slogan:
            print(f"✅ SUCCESS: {slogan}")
        else:
            print("❌ FAILED: Returned None")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
    
    # Test DesignBot
    print("\n[2/2] Testing DesignBot (Image Generation)...")
    try:
        logo_result = await designbot.generate_logo("TechVision")
        if logo_result:
            if logo_result.get('is_placeholder'):
                print(f"⚠️  PARTIAL: Using placeholder (HF API busy or throttled)")
                print(f"   Size: {logo_result.get('size')}")
            else:
                print(f"✅ SUCCESS: Generated real image")
                print(f"   Size: {logo_result.get('size')}")
        else:
            print("❌ FAILED: No result returned")
    except Exception as e:
        print(f"❌ FAILED: {str(e)}")
    
    print("\n" + "="*60)
    print("TEST COMPLETE")
    print("="*60 + "\n")

if __name__ == "__main__":
    asyncio.run(test_models())
