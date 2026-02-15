import os
import httpx
from loguru import logger
from typing import Dict, Any, Optional, List
import asyncio
import json
import re

class CopyBot:
    """Professional copywriting agent - creates dynamic, context-aware long-form content"""
   
    def __init__(self):
        self.name = "CopyBot"
        self.cost = 20
        self.specialty = "Dynamic Long-Form Copywriting & Content Marketing"
        self.status = "idle"
       
        self.hf_token = os.getenv("HF_TOKEN")
        self.api_url = "https://api-inference.huggingface.co/models/"
        self.model_name = "meta-llama/Llama-3.2-3B-Instruct"
       
        # Industry-specific copy templates and approaches
        self.industry_frameworks = self._load_industry_frameworks()
        
        # Copywriting best practices from examples
        self.copywriting_techniques = self._load_copywriting_techniques()
       
        # Conversation history buffer
        self.conversation_history = []
        
        # User intent tracking
        self.last_intent = None
        self.last_brand_context = {}
       
        logger.info(f"Initialized {self.name} with dynamic content generation")
   
    def _load_industry_frameworks(self) -> Dict[str, Any]:
        """Load industry-specific copywriting frameworks"""
        return {
            "fintech": {
                "tone": "professional, trustworthy, security-focused",
                "key_themes": ["security", "trust", "compliance", "efficiency", "transparency"],
                "pain_points": ["complex banking", "security concerns", "hidden fees", "slow processes"],
                "voice_examples": "BarkBox-style audience understanding with financial literacy",
                "proof_style": "data-heavy with compliance badges and customer testimonials",
                "storytelling": "emphasize transparency like Death Wish Coffee's process"
            },
            "saas": {
                "tone": "friendly, innovative, productivity-focused",
                "key_themes": ["efficiency", "automation", "growth", "integration", "ROI"],
                "pain_points": ["manual processes", "tool sprawl", "poor collaboration", "time waste"],
                "voice_examples": "Tuft & Needle-style objection handling",
                "proof_style": "ROI metrics, time savings, and integration success stories",
                "storytelling": "show the process and transformation"
            },
            "ecommerce": {
                "tone": "engaging, benefit-driven, story-rich, personality-filled",
                "key_themes": ["quality", "value", "experience", "uniqueness", "lifestyle"],
                "pain_points": ["poor quality", "high prices", "bad experience", "generic products"],
                "voice_examples": "Brooklinen-style wordplay and Chubbies humor",
                "proof_style": "customer stories, reviews, and social proof",
                "storytelling": "Huckberry-style narrative that draws readers in"
            },
            "healthcare": {
                "tone": "caring, authoritative, reassuring, empathetic",
                "key_themes": ["trust", "expertise", "outcomes", "care quality", "patient-first"],
                "pain_points": ["poor care", "lack of trust", "complexity", "impersonal service"],
                "voice_examples": "Harry's about page - acknowledge customer pain points",
                "proof_style": "clinical outcomes, certifications, and patient testimonials",
                "storytelling": "focus on patient journeys and transformation"
            },
            "education": {
                "tone": "encouraging, clear, achievement-focused, supportive",
                "key_themes": ["growth", "results", "support", "accessibility", "transformation"],
                "pain_points": ["information overload", "lack of guidance", "cost", "no results"],
                "voice_examples": "Huckberry-style storytelling with success narratives",
                "proof_style": "success stories, outcomes, and before/after transformations",
                "storytelling": "student journey from struggle to success"
            },
            "tech": {
                "tone": "innovative, precise, forward-thinking, confident",
                "key_themes": ["innovation", "performance", "reliability", "cutting-edge", "efficiency"],
                "pain_points": ["outdated tech", "complexity", "poor support", "vendor lock-in"],
                "voice_examples": "Chubbies-style bold differentiation",
                "proof_style": "technical specs, benchmarks, and case studies",
                "storytelling": "emphasize the innovation process and technical depth"
            }
        }
    
    def _load_copywriting_techniques(self) -> Dict[str, Any]:
        """Load proven copywriting techniques from examples"""
        return {
            "audience_understanding": {
                "description": "Deeply understand and speak to your audience's language",
                "example": "BarkBox - sell to the dog, not just the owner",
                "application": "Use buyer's language, address their specific desires and fears"
            },
            "wordplay_and_rhyming": {
                "description": "Make copy memorable with clever wordplay and rhyming",
                "example": "Bombas 'Kids Socks That Pop', Brooklinen 'zero bull sheet'",
                "application": "Create catchy phrases that roll off the tongue and stick in memory"
            },
            "humor": {
                "description": "Use humor to make boring industries interesting",
                "example": "Chubbies' fun, bro-branded emails; Poo~Pourri's FAQ page",
                "application": "Make readers laugh while you sell - appropriate to audience"
            },
            "process_storytelling": {
                "description": "Turn process into a benefit by showing detailed craftsmanship",
                "example": "Death Wish Coffee's detailed roasting process",
                "application": "Add specificity, descriptive adjectives, show the journey"
            },
            "objection_handling": {
                "description": "Proactively address buyer concerns and objections",
                "example": "Tuft & Needle's '12 Reasons You Haven't Bought from Us Yet'",
                "application": "List common objections as questions, then answer with proof"
            },
            "storytelling": {
                "description": "Draw readers in with compelling narratives",
                "example": "Huckberry's story-first product emails",
                "application": "Begin with story, transition to benefits, end with clear CTA"
            },
            "values_communication": {
                "description": "Communicate what you stand for and against",
                "example": "Harry's about page acknowledging overpriced razors",
                "application": "State clearly what's important to you and what you won't tolerate"
            },
            "faq_selling": {
                "description": "Use FAQ pages to continue selling with personality",
                "example": "Poo~Pourri's 'Frequently Asked Q's About Poo'",
                "application": "Answer questions while reinforcing brand voice and value"
            }
        }
    
    async def _query_model(self, prompt: str, max_length: int = 2000) -> str:
        """Query the Hugging Face model for dynamic generation"""
        if not self.hf_token:
            logger.warning("HF_TOKEN not set; using template-based generation")
            return self._fallback_smart_response(prompt)
        
        headers = {"Authorization": f"Bearer {self.hf_token}"}
        payload = {
            "inputs": prompt,
            "parameters": {
                "max_new_tokens": max_length,
                "temperature": 0.7,
                "top_p": 0.9,
                "do_sample": True,
                "return_full_text": False
            }
        }
        
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    f"{self.api_url}{self.model_name}",
                    headers=headers,
                    json=payload,
                    timeout=60.0
                )
                response.raise_for_status()
                result = response.json()
                if isinstance(result, list) and len(result) > 0 and "generated_text" in result[0]:
                    return result[0]["generated_text"].strip()
                else:
                    logger.warning("Unexpected model response format")
                    return self._fallback_smart_response(prompt)
            except Exception as e:
                logger.error(f"Model query failed: {e}")
                return self._fallback_smart_response(prompt)
    
    def _fallback_smart_response(self, prompt: str) -> str:
        """Smart fallback when model is unavailable - generates structured template"""
        # Extract key info from prompt
        intent = self._parse_intent_from_prompt(prompt)
        
        if "landing page" in prompt.lower():
            return self._generate_landing_page_template(intent)
        elif "email" in prompt.lower():
            return self._generate_email_template(intent)
        elif "slogan" in prompt.lower() or "headline" in prompt.lower():
            return self._generate_headline_template(intent)
        else:
            return self._generate_general_copy_template(intent)
    
    def _parse_intent_from_prompt(self, prompt: str) -> Dict[str, Any]:
        """Parse user intent from their prompt"""
        intent = {
            "copy_type": "general",
            "industry": "saas",
            "brand_name": "Your Brand",
            "product": "",
            "tone": "professional",
            "techniques": []
        }
        
        prompt_lower = prompt.lower()
        
        # Detect copy type
        if any(word in prompt_lower for word in ["landing page", "homepage", "web page"]):
            intent["copy_type"] = "landing_page"
        elif any(word in prompt_lower for word in ["email", "newsletter", "campaign"]):
            intent["copy_type"] = "email"
        elif any(word in prompt_lower for word in ["headline", "slogan", "tagline"]):
            intent["copy_type"] = "headline"
        elif any(word in prompt_lower for word in ["product description", "product page"]):
            intent["copy_type"] = "product_description"
        elif any(word in prompt_lower for word in ["about", "about us", "company"]):
            intent["copy_type"] = "about_page"
        elif any(word in prompt_lower for word in ["faq", "questions"]):
            intent["copy_type"] = "faq"
        
        # Detect industry
        for industry in self.industry_frameworks.keys():
            if industry in prompt_lower:
                intent["industry"] = industry
                break
        
        # Detect tone preferences
        if any(word in prompt_lower for word in ["funny", "humor", "humorous", "witty"]):
            intent["tone"] = "humorous"
            intent["techniques"].append("humor")
        elif any(word in prompt_lower for word in ["professional", "formal", "corporate"]):
            intent["tone"] = "professional"
        elif any(word in prompt_lower for word in ["casual", "friendly", "conversational"]):
            intent["tone"] = "casual"
        
        # Detect specific techniques requested
        if any(word in prompt_lower for word in ["story", "storytelling", "narrative"]):
            intent["techniques"].append("storytelling")
        if any(word in prompt_lower for word in ["rhyme", "catchy", "memorable"]):
            intent["techniques"].append("wordplay_and_rhyming")
        if any(word in prompt_lower for word in ["objection", "concern", "worry"]):
            intent["techniques"].append("objection_handling")
        
        return intent
   
    def update_conversation_history(self, role: str, content: str):
        """Update the conversation history buffer"""
        self.conversation_history.append({"role": role, "content": content})
        # Keep only last 20 exchanges to avoid token limits
        if len(self.conversation_history) > 20:
            self.conversation_history = self.conversation_history[-20:]
    
    def _detect_industry(self, brand_name: str, context: Dict[str, Any]) -> str:
        """Enhanced industry detection using multiple signals"""
        history_text = " ".join([msg["content"] for msg in self.conversation_history]).lower()
        text = f"{brand_name} {context.get('industry', '')} {context.get('user_prompt', '')} {context.get('product_description', '')} {history_text}".lower()
       
        # Industry detection with expanded keywords
        industry_keywords = {
            "fintech": ['bank', 'finance', 'payment', 'fintech', 'crypto', 'wallet', 'investment', 
                       'trading', 'loan', 'credit', 'insurance', 'wealth'],
            "saas": ['software', 'saas', 'platform', 'tool', 'app', 'productivity', 'cloud', 
                    'devops', 'crm', 'analytics', 'automation', 'workflow'],
            "ecommerce": ['shop', 'store', 'ecommerce', 'retail', 'product', 'clothing', 'fashion', 
                         'marketplace', 'boutique', 'apparel', 'accessories'],
            "healthcare": ['health', 'medical', 'wellness', 'care', 'fitness', 'hospital', 'pharma',
                          'clinic', 'therapy', 'diagnosis', 'patient'],
            "education": ['education', 'learning', 'course', 'training', 'school', 'university', 
                         'edtech', 'student', 'teacher', 'curriculum'],
            "tech": ['tech', 'ai', 'machine learning', 'data', 'hardware', 'gadget', 'innovation',
                    'semiconductor', 'iot', 'robotics']
        }
        
        for industry, keywords in industry_keywords.items():
            if any(keyword in text for keyword in keywords):
                return industry
        
        return "saas"  # Default
   
    def _summarize_conversation_history(self) -> str:
        """Summarize recent conversation history for context injection"""
        if not self.conversation_history:
            return ""
        
        user_msgs = [msg["content"] for msg in self.conversation_history[-10:] if msg["role"] == "user"]
        if not user_msgs:
            return ""
        
        # Get last 3 meaningful messages
        recent = user_msgs[-3:]
        return "Previous discussion: " + " | ".join(recent)
    
    def _select_copywriting_techniques(self, intent: Dict[str, Any], industry: str) -> List[str]:
        """Select appropriate copywriting techniques based on intent and industry"""
        techniques = []
        
        # Always include audience understanding
        techniques.append("audience_understanding")
        
        # Add techniques based on industry
        framework = self.industry_frameworks[industry]
        if "wordplay" in framework.get("voice_examples", "").lower():
            techniques.append("wordplay_and_rhyming")
        if "humor" in framework.get("voice_examples", "").lower():
            techniques.append("humor")
        if "story" in framework.get("storytelling", "").lower():
            techniques.append("storytelling")
        
        # Add techniques from user intent
        if intent.get("techniques"):
            techniques.extend(intent["techniques"])
        
        # Add objection handling for landing pages
        if intent.get("copy_type") == "landing_page":
            techniques.append("objection_handling")
        
        # Add values communication for about pages
        if intent.get("copy_type") == "about_page":
            techniques.append("values_communication")
        
        return list(set(techniques))  # Remove duplicates
    
    def _build_smart_prompt(
        self,
        user_prompt: str,
        brand_name: str,
        context: Dict[str, Any]
    ) -> str:
        """Build an intelligent prompt based on user request and context"""
        
        # Parse intent from user prompt
        intent = self._parse_intent_from_prompt(user_prompt)
        
        # Detect industry
        industry = self._detect_industry(brand_name, context)
        framework = self.industry_frameworks[industry]
        
        # Get relevant copywriting techniques
        techniques = self._select_copywriting_techniques(intent, industry)
        techniques_guide = "\n".join([
            f"- {tech}: {self.copywriting_techniques[tech]['description']}"
            for tech in techniques if tech in self.copywriting_techniques
        ])
        
        # Get conversation context
        history_summary = self._summarize_conversation_history()
        
        # Build comprehensive prompt
        copy_type = intent.get("copy_type", "general")
        tone = intent.get("tone", framework["tone"])
        
        prompt = f"""You are an expert copywriter creating {copy_type} copy for '{brand_name}' in the {industry} industry.

USER REQUEST: {user_prompt}

BRAND CONTEXT:
- Product/Service: {context.get('product_description', 'innovative solution')}
- Target Audience: {context.get('target_audience', 'professionals')}
- Industry: {industry}

TONE & STYLE:
- Use a {tone} tone
- Industry-appropriate voice: {framework['tone']}
- Key themes to emphasize: {', '.join(framework['key_themes'])}
- Pain points to address: {', '.join(framework['pain_points'])}

COPYWRITING TECHNIQUES TO APPLY:
{techniques_guide}

EXAMPLES TO EMULATE:
{framework.get('voice_examples', '')}

{f"PREVIOUS CONTEXT: {history_summary}" if history_summary else ""}

STRUCTURE YOUR RESPONSE BASED ON COPY TYPE:
"""

        # Add type-specific instructions
        if copy_type == "landing_page":
            prompt += """
For a LANDING PAGE, include:
1. Hero headline (benefit-driven, memorable)
2. Subheadline (expand on the promise)
3. Why it matters (address pain points)
4. How it works (3-4 clear steps)
5. Key features/benefits (3-5 with descriptions)
6. Social proof (2-3 testimonials with metrics)
7. Objection handling (address common concerns)
8. Clear CTA with risk reversal
9. FAQ section (4-5 questions)
10. Final CTA with urgency

Use storytelling, specific details, and persuasive language throughout."""

        elif copy_type == "email":
            prompt += """
For an EMAIL, include:
1. Attention-grabbing subject line
2. Opening hook (story or question)
3. Transition to value/benefit
4. Brief product/service presentation
5. Clear, singular call-to-action
6. P.S. with added urgency or benefit

Keep it conversational and engaging. Use short paragraphs."""

        elif copy_type == "headline":
            prompt += """
For HEADLINES/SLOGANS, create 5-7 options that:
1. Are memorable and catchy (consider rhyming)
2. Communicate clear benefit
3. Use power words
4. Reflect brand personality
5. Are unique to the industry

For each, explain why it works."""

        elif copy_type == "product_description":
            prompt += """
For PRODUCT DESCRIPTION, include:
1. Benefit-driven opening
2. Key features (3-5 with benefits)
3. Detailed process/craftsmanship (if applicable)
4. Use cases/scenarios
5. Social proof snippet
6. Clear CTA

Be specific and use sensory language."""

        elif copy_type == "about_page":
            prompt += """
For ABOUT PAGE, include:
1. Mission statement (what you stand for)
2. Origin story (why you exist)
3. Problem you're solving
4. Values and principles
5. What makes you different
6. Team humanity (if relevant)
7. Call to join/connect

Be authentic and values-driven."""

        elif copy_type == "faq":
            prompt += """
For FAQ PAGE, create:
1. 8-10 common questions
2. Answers that sell while informing
3. Maintain brand voice throughout
4. Include objection handling
5. Link to relevant pages/CTAs

Keep answers concise but complete."""

        else:
            prompt += """
Create comprehensive, persuasive copy that:
1. Captures attention immediately
2. Addresses audience pain points
3. Presents clear benefits
4. Includes social proof
5. Has a compelling call-to-action

Use specific details and engaging language."""

        prompt += """

OUTPUT REQUIREMENTS:
- Write in markdown format
- Use compelling subheadings
- Include bullet points where appropriate
- Add bold emphasis for key benefits
- Keep paragraphs short and scannable
- Be specific with numbers, metrics, and details
- End with a strong call-to-action

Create copy that would make the reader stop scrolling and take action."""

        return prompt
    
    async def generate_copy_from_prompt(
        self,
        user_prompt: str,
        brand_name: Optional[str] = None,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Main method: Generate copy based on user's natural language prompt
        This is the smart entry point that handles any copywriting request
        """
        
        ctx = context or {}
        brand = brand_name or ctx.get("brand_name", "Your Brand")
        
        # Store the original prompt
        self.update_conversation_history("user", user_prompt)
        
        # Build smart prompt
        full_prompt = self._build_smart_prompt(user_prompt, brand, ctx)
        
        logger.info(f"{self.name} generating copy for prompt: {user_prompt[:100]}...")
        
        # Generate content
        content = await self._query_model(full_prompt, max_length=3000)
        
        # Store in history
        self.update_conversation_history("assistant", content)
        
        # Parse intent for metadata
        intent = self._parse_intent_from_prompt(user_prompt)
        
        return {
            "copy_type": intent.get("copy_type", "general"),
            "content": content,
            "brand_name": brand,
            "industry": self._detect_industry(brand, ctx),
            "techniques_used": self._select_copywriting_techniques(intent, self._detect_industry(brand, ctx)),
            "metadata": {
                "word_count": len(content.split()),
                "intent": intent,
                "timestamp": "generated"
            }
        }
    
    async def generate_slogan(
        self,
        brand_name: str,
        context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate slogan (legacy method, now uses smart prompt building)"""
        ctx = context or {}
        user_prompt = ctx.get("user_prompt", "Generate a catchy slogan")
        
        result = await self.generate_copy_from_prompt(
            user_prompt=user_prompt,
            brand_name=brand_name,
            context=ctx
        )
        
        return result["content"]
   
    async def generate_landing_page(
        self,
        brand_name: str,
        product_description: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate comprehensive landing page"""
        ctx = context or {}
        ctx['product_description'] = product_description
        
        user_prompt = f"Create a complete landing page for {brand_name}, which is {product_description}"
        
        result = await self.generate_copy_from_prompt(
            user_prompt=user_prompt,
            brand_name=brand_name,
            context=ctx
        )
        
        return {
            "hero": {
                "headline": f"{brand_name}: {product_description.title()}",
                "long_form_content": result["content"]
            },
            "metadata": result["metadata"]
        }
   
    async def generate_pitch_deck_copy(
        self,
        brand_name: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate pitch deck copy"""
        ctx = context or {}
        user_prompt = "Create a detailed pitch deck script with 10-12 slides"
        
        result = await self.generate_copy_from_prompt(
            user_prompt=user_prompt,
            brand_name=brand_name,
            context=ctx
        )
        
        # Try to parse into slides
        content = result["content"]
        slides = []
        
        # Simple parsing: look for numbered sections or headers
        sections = re.split(r'\n#{1,3}\s+', content)
        for i, section in enumerate(sections):
            if section.strip():
                lines = section.split('\n', 1)
                title = lines[0].strip() if lines else f"Slide {i+1}"
                content_text = lines[1].strip() if len(lines) > 1 else section.strip()
                slides.append({"title": title, "content": content_text})
        
        return {
            "slides": slides if slides else [{"title": "Pitch Deck", "content": content}],
            "metadata": result["metadata"]
        }
    
    def _generate_landing_page_template(self, intent: Dict[str, Any]) -> str:
        """Generate a landing page template when model is unavailable"""
        brand = intent.get("brand_name", "Your Brand")
        industry = intent.get("industry", "saas")
        framework = self.industry_frameworks[industry]
        
        return f"""# {brand}: Transform Your {industry.title()} Experience

## The Problem Everyone Faces
You're tired of {framework['pain_points'][0]}. Traditional solutions are expensive, complicated, and don't deliver results.

## Introducing {brand}
The {industry} solution that actually works. Built by experts who understand your challenges.

## Why {brand} Works

**🎯 {framework['key_themes'][0].title()}**
We focus on what matters most: getting you real results fast.

**⚡ {framework['key_themes'][1].title()}**
No more wasted time. Our process is streamlined for maximum efficiency.

**💪 {framework['key_themes'][2].title()}**
Join thousands of satisfied customers who've transformed their business.

## How It Works

1. **Sign Up** - Get started in under 2 minutes
2. **Customize** - Tailor it to your specific needs
3. **Launch** - Start seeing results immediately
4. **Scale** - Grow without limits

## Real Results from Real Customers

> "Absolutely game-changing. We saw 300% improvement in just 30 days."
> — Sarah M., Industry Leader

> "The best investment we've made this year. Paid for itself in week one."
> — James T., CEO

> "Finally, a solution that delivers on its promises."
> — Maria L., Founder

## Risk-Free Guarantee

Try {brand} for 30 days. If you're not completely satisfied, we'll refund every penny. No questions asked.

**Ready to transform your {industry} experience?**

👉 [Start Your Free Trial](#)

---

### Frequently Asked Questions

**Q: How long does it take to get started?**
A: Less than 2 minutes. Our onboarding is the fastest in the industry.

**Q: What if I need help?**
A: Our support team responds in under 1 hour, 24/7.

**Q: Can I cancel anytime?**
A: Absolutely. No lock-in contracts. Cancel with one click.

**Q: Is my data secure?**
A: Bank-level encryption. SOC 2 compliant. Your data is safer with us than anywhere else.

---

**The Bottom Line:** {brand} gives you the {framework['key_themes'][0]} and {framework['key_themes'][1]} you need to succeed in {industry}.

**P.S.** - Early adopters get 50% off their first year. This offer expires soon.

👉 [Claim Your Discount Now](#)
"""
    
    def _generate_email_template(self, intent: Dict[str, Any]) -> str:
        """Generate email template"""
        return """**Subject:** The one thing you're missing in your workflow

Hey there,

Quick question: How much time did you spend yesterday on tasks that could've been automated?

If you're like most professionals, probably 2-3 hours. That's 10-15 hours per week. Nearly 600 hours per year.

Here's the thing: it doesn't have to be this way.

I wanted to share something that's been a game-changer for our team...

[Product/Solution] → helps you automate the busy work so you can focus on what actually matters.

✓ Set up in under 5 minutes
✓ No technical skills needed
✓ Start seeing results today

Curious? Check it out here: [link]

Best,
[Your Name]

P.S. - We're offering a 30-day free trial. No credit card required. Just real value.
"""
    
    def _generate_headline_template(self, intent: Dict[str, Any]) -> str:
        """Generate headline options"""
        return """# Headline Options

1. **"Transform Your Work, Not Your Workflow"**
   - Promise of improvement without disruption
   - Rhyming for memorability

2. **"Stop Working Hard. Start Working Smart."**
   - Clear benefit contrast
   - Action-oriented

3. **"The [Industry] Solution That Actually Works"**
   - Positions against failed alternatives
   - Builds credibility

4. **"Doing More. Stressing Less."**
   - Simple, clear benefit
   - Memorable cadence

5. **"Your Shortcut to [Desired Outcome]"**
   - Direct benefit statement
   - Implies ease and speed

Each headline emphasizes different aspects:
- Transformation vs. efficiency
- Results vs. process
- Differentiation vs. simplicity

Choose based on your audience's primary pain point.
"""
    
    def _generate_general_copy_template(self, intent: Dict[str, Any]) -> str:
        """Generate general copy template"""
        return """# Compelling Copy That Converts

## The Hook
Start with something that makes them stop scrolling. A surprising fact. A provocative question. A bold promise.

## The Problem
Paint the picture of their current pain. Make it visceral. Make them feel it.

"You're spending hours on [task]. You're frustrated by [pain point]. You know there has to be a better way."

## The Solution
Here's where you come in. But don't just list features. Show the transformation.

"Imagine if you could [benefit]. What if [pain] was gone forever?"

## How It Works
Make it simple. Make it clear. Remove any friction.

1. Step one (easy)
2. Step two (simple)
3. Step three (done)

## Proof
Don't just make claims. Back them up.

- Customer testimonials
- Data and metrics
- Before/after stories

## The Ask
Clear, singular call-to-action. Make it risk-free.

"Start your free trial today. No credit card required."

## The Close
Reinforce the transformation one more time. Add urgency if appropriate.

"Don't spend another day struggling with [pain]. Join [number] others who've already made the switch."

---

Remember: Great copy understands the audience, addresses real pain points, and makes the path forward crystal clear.
"""
   
    def get_status(self) -> Dict[str, Any]:
        """Get current bot status"""
        return {
            "name": self.name,
            "cost": self.cost,
            "specialty": self.specialty,
            "status": self.status,
            "model": self.model_name,
            "history_length": len(self.conversation_history),
            "supported_copy_types": [
                "landing_page", "email", "headline", "product_description",
                "about_page", "faq", "pitch_deck", "general"
            ],
            "supported_industries": list(self.industry_frameworks.keys()),
            "copywriting_techniques": list(self.copywriting_techniques.keys())
        }
    
    async def analyze_prompt(self, user_prompt: str) -> Dict[str, Any]:
        """Analyze a user prompt and return what will be generated"""
        intent = self._parse_intent_from_prompt(user_prompt)
        
        return {
            "understood_intent": intent,
            "will_generate": intent.get("copy_type", "general copy"),
            "detected_industry": intent.get("industry", "saas"),
            "tone": intent.get("tone", "professional"),
            "techniques_to_apply": intent.get("techniques", []),
            "message": f"I'll create {intent.get('copy_type', 'general')} copy with a {intent.get('tone', 'professional')} tone."
        }

# Global instance
copybot = CopyBot()

# Example usage demonstrations
async def demo_usage():
    """Demonstrate the enhanced CopyBot capabilities"""
    
    print("=== CopyBot Enhanced Demo ===\n")
    
    # Example 1: Simple prompt
    result1 = await copybot.generate_copy_from_prompt(
        "Create a landing page for my fintech app that helps millennials invest",
        brand_name="InvestEasy"
    )
    print("Example 1 - Landing Page:")
    print(result1["content"][:300] + "...\n")
    
    # Example 2: Email with specific tone
    result2 = await copybot.generate_copy_from_prompt(
        "Write a funny email for my ecommerce store selling cat toys",
        brand_name="PurrfectPlay"
    )
    print("Example 2 - Humorous Email:")
    print(result2["content"][:300] + "...\n")
    
    # Example 3: Product description with storytelling
    result3 = await copybot.generate_copy_from_prompt(
        "Write a product description with storytelling for our artisanal coffee",
        brand_name="MountainBrew",
        context={"product_description": "single-origin Ethiopian coffee"}
    )
    print("Example 3 - Product Description:")
    print(result3["content"][:300] + "...\n")
    
    # Show bot status
    print("Bot Status:")
    print(copybot.get_status())

if __name__ == "__main__":
    asyncio.run(demo_usage())