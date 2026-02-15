"""
Enhanced Manager Agent - Smart orchestration with conversation context
"""
from typing import Dict, Any, List, Optional
from loguru import logger

# Import the enhanced agents
from agents.copybot import copybot
from agents.designbot import designbot

class ConversationManager:
    """Manages conversation state and context"""
    
    def __init__(self):
        self.conversations: Dict[str, Dict[str, Any]] = {}
    
    def get_or_create(self, conversation_id: str) -> Dict[str, Any]:
        """Get or create conversation state"""
        if conversation_id not in self.conversations:
            self.conversations[conversation_id] = {
                "id": conversation_id,
                "messages": [],
                "brand_name": None,
                "industry": None,
                "extracted_info": {},
                "ready_to_execute": False,
                "analysis": None
            }
        return self.conversations[conversation_id]
    
    def add_message(self, conversation_id: str, role: str, content: str):
        """Add message to conversation history"""
        conv = self.get_or_create(conversation_id)
        conv["messages"].append({
            "role": role,
            "content": content,
            "timestamp": __import__("time").time()
        })
    
    def get_context(self, conversation_id: str) -> str:
        """Get conversation context summary"""
        conv = self.get_or_create(conversation_id)
        messages = conv["messages"][-5:]  # Last 5 messages
        return " | ".join([f"{m['role']}: {m['content']}" for m in messages])
    
    def update_extracted_info(self, conversation_id: str, info: Dict[str, Any]):
        """Update extracted information"""
        conv = self.get_or_create(conversation_id)
        conv["extracted_info"].update(info)
    
    def mark_ready(self, conversation_id: str, analysis: Dict[str, Any]):
        """Mark conversation as ready to execute"""
        conv = self.get_or_create(conversation_id)
        conv["ready_to_execute"] = True
        conv["analysis"] = analysis


class ManagerAgent:
    """Enhanced manager that coordinates worker agents with smart conversation handling"""
    
    def __init__(self):
        self.name = "ManagerAgent"
        self.worker_agents = {
            "copybot": copybot,
            "designbot": designbot
        }
        self.conversation_manager = ConversationManager()
        logger.info(f"Initialized {self.name} with enhanced conversation handling")
    
    async def handle_chat_message(
        self,
        message: str,
        conversation_id: str
    ) -> Dict[str, Any]:
        """
        Handle incoming chat messages with intelligent conversation flow
        Returns structured response for frontend
        """
        
        logger.info(f"Processing message in conversation {conversation_id}: {message[:100]}...")
        
        # Get conversation state
        conv = self.conversation_manager.get_or_create(conversation_id)
        self.conversation_manager.add_message(conversation_id, "user", message)
        
        # Analyze the message in context
        analysis = await self._analyze_with_context(message, conv)
        
        # Determine response strategy
        if analysis["needs_clarification"]:
            response = self._generate_clarification_response(analysis, conv)
            return {
                "response": response,
                "ready_to_execute": False,
                "conversation_id": conversation_id,
                "extracted_info": conv["extracted_info"]
            }
        
        elif analysis["has_enough_info"]:
            # We have enough to proceed
            task_analysis = self.analyze_request(message, conv["extracted_info"])
            self.conversation_manager.mark_ready(conversation_id, task_analysis)
            
            response = self._generate_ready_response(task_analysis)
            return {
                "response": response,
                "ready_to_execute": True,
                "conversation_id": conversation_id,
                "analysis": task_analysis,
                "extracted_info": conv["extracted_info"]
            }
        
        else:
            # Continue gathering information
            self.conversation_manager.update_extracted_info(
                conversation_id, 
                analysis["extracted_info"]
            )
            
            response = self._generate_continuation_response(analysis, conv)
            return {
                "response": response,
                "ready_to_execute": False,
                "conversation_id": conversation_id,
                "extracted_info": conv["extracted_info"]
            }
    
    async def _analyze_with_context(
        self,
        message: str,
        conv: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Analyze message with conversation context"""
        
        message_lower = message.lower()
        extracted = conv["extracted_info"]
        
        # Extract information
        new_info = {}
        
        # Extract brand name
        if not extracted.get("brand_name"):
            brand = self._extract_brand_name(message)
            if brand and brand != "Brand":
                new_info["brand_name"] = brand
        
        # Detect task type
        needs_design = any(word in message_lower for word in [
            'logo', 'design', 'visual', 'graphic', 'image', 'icon', 'brand identity'
        ])
        
        needs_copy = any(word in message_lower for word in [
            'slogan', 'copy', 'text', 'tagline', 'campaign', 'write', 'content',
            'landing page', 'pitch deck', 'email', 'social', 'headline', 'description'
        ])
        
        if needs_design:
            new_info["needs_design"] = True
        if needs_copy:
            new_info["needs_copy"] = True
        
        # Extract style/tone
        style_keywords = {
            "modern": ["modern", "contemporary", "sleek", "clean"],
            "vintage": ["vintage", "retro", "classic", "old-school"],
            "tech": ["tech", "digital", "futuristic", "innovative"],
            "luxury": ["luxury", "premium", "elegant", "sophisticated"],
            "playful": ["playful", "fun", "energetic", "vibrant"],
            "minimalist": ["minimal", "simple", "minimalist"],
            "professional": ["professional", "corporate", "business"]
        }
        
        for style, keywords in style_keywords.items():
            if any(kw in message_lower for kw in keywords):
                new_info["style"] = style
                break
        
        # Extract colors
        colors = self._extract_colors(message)
        if colors:
            new_info["colors"] = colors
        
        # Extract industry
        industry_keywords = {
            "fintech": ["fintech", "finance", "banking", "payment", "crypto", "investment"],
            "saas": ["saas", "software", "platform", "app", "tool"],
            "ecommerce": ["ecommerce", "shop", "store", "retail", "product"],
            "healthcare": ["healthcare", "medical", "health", "wellness", "fitness"],
            "education": ["education", "learning", "course", "training"],
            "tech": ["tech", "technology", "ai", "machine learning"]
        }
        
        for industry, keywords in industry_keywords.items():
            if any(kw in message_lower for kw in keywords):
                new_info["industry"] = industry
                break
        
        # Extract product description
        if " for " in message_lower or " that " in message_lower:
            # Try to extract what the product does
            for phrase in [" for ", " that ", " which "]:
                if phrase in message_lower:
                    parts = message_lower.split(phrase, 1)
                    if len(parts) > 1:
                        desc = parts[1].split('.')[0].strip()
                        if len(desc) > 10 and len(desc) < 200:
                            new_info["product_description"] = desc
                        break
        
        # Check if we have enough information
        has_brand = bool(extracted.get("brand_name") or new_info.get("brand_name"))
        has_task = bool(
            extracted.get("needs_design") or extracted.get("needs_copy") or
            new_info.get("needs_design") or new_info.get("needs_copy")
        )
        
        has_enough_info = has_brand and has_task
        
        # Determine if clarification is needed
        needs_clarification = False
        clarification_reason = None
        
        if not has_brand and len(conv["messages"]) > 2:
            needs_clarification = True
            clarification_reason = "brand_name"
        
        if has_brand and not has_task:
            needs_clarification = True
            clarification_reason = "task_type"
        
        return {
            "extracted_info": new_info,
            "has_enough_info": has_enough_info,
            "needs_clarification": needs_clarification,
            "clarification_reason": clarification_reason,
            "needs_design": needs_design or extracted.get("needs_design", False),
            "needs_copy": needs_copy or extracted.get("needs_copy", False)
        }
    
    def _generate_clarification_response(
        self,
        analysis: Dict[str, Any],
        conv: Dict[str, Any]
    ) -> str:
        """Generate smart clarification questions"""
        
        reason = analysis["clarification_reason"]
        
        if reason == "brand_name":
            return "I'd love to help! What's the name of your brand or company?"
        
        elif reason == "task_type":
            brand = conv["extracted_info"].get("brand_name", "your brand")
            return f"Great! What would you like me to create for {brand}?\n\n• Logo Design (50 HYPER)\n• Copywriting/Slogan (20 HYPER)\n• Landing Page (25 HYPER)\n• Pitch Deck (30 HYPER)\n• Full Brand Package (Logo + Copy)"
        
        else:
            return "Could you tell me a bit more about what you're looking for? Any specific style or theme in mind?"
    
    def _generate_continuation_response(
        self,
        analysis: Dict[str, Any],
        conv: Dict[str, Any]
    ) -> str:
        """Generate response to continue gathering info"""
        
        extracted = {**conv["extracted_info"], **analysis["extracted_info"]}
        
        brand = extracted.get("brand_name", "your brand")
        
        responses = [
            f"Got it! I'm working on something for {brand}. ",
        ]
        
        # Acknowledge what we know
        if extracted.get("style"):
            responses.append(f"I'll use a {extracted['style']} style. ")
        
        if extracted.get("colors"):
            responses.append(f"Using {', '.join(extracted['colors'])} colors. ")
        
        if extracted.get("industry"):
            responses.append(f"Perfect for the {extracted['industry']} industry. ")
        
        # Ask for what's missing
        if not extracted.get("style") and analysis.get("needs_design"):
            responses.append("\n\nWhat style are you thinking? (modern, minimalist, tech, vintage, playful)")
        
        elif not extracted.get("product_description") and analysis.get("needs_copy"):
            responses.append(f"\n\nWhat does {brand} do? (e.g., 'helps people invest easily', 'connects freelancers')")
        
        else:
            responses.append("\n\nAnything else you'd like to add before we start?")
        
        return "".join(responses)
    
    def _generate_ready_response(self, task_analysis: Dict[str, Any]) -> str:
        """Generate response when ready to execute"""
        
        brand = task_analysis["brand_name"]
        tasks = task_analysis["tasks"]
        cost = task_analysis["total_cost"]
        
        response = [f"Perfect! Here's what I'll create for {brand}:\n"]
        
        for task in tasks:
            response.append(f"\n• {task['description']} ({task['cost']} HYPER)")
        
        response.append(f"\n\n**Total Cost:** {cost} HYPER")
        response.append(f"\n**Burn Fee (5%):** {task_analysis['burn_fee']} HYPER")
        response.append(f"\n**Estimated Time:** {task_analysis['estimated_time']} seconds")
        
        return "".join(response)
    
    def analyze_request(
        self,
        user_prompt: str,
        extracted_info: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Analyze user request and determine required agents"""
        
        logger.info(f"Analyzing: {user_prompt}")
        
        info = extracted_info or {}
        prompt_lower = user_prompt.lower()
        
        # Determine what's needed
        needs_design = info.get("needs_design", False) or any(word in prompt_lower for word in [
            'logo', 'design', 'visual', 'graphic', 'image', 'icon', 'brand'
        ])
        
        needs_copy = info.get("needs_copy", False) or any(word in prompt_lower for word in [
            'slogan', 'copy', 'text', 'tagline', 'campaign', 'write', 'content',
            'landing page', 'pitch deck', 'email', 'social'
        ])
        
        # Extract brand name
        brand_name = info.get("brand_name") or self._extract_brand_name(user_prompt)
        
        # Build task list
        tasks = []
        total_cost = 0
        
        if needs_design:
            tasks.append({
                "agent": "designbot",
                "task_type": "logo_generation",
                "cost": designbot.cost,
                "description": f"Professional logo design for {brand_name}",
                "context": {
                    "style": info.get("style", "modern minimalist"),
                    "colors": info.get("colors", ["purple", "cyan"]),
                    "industry": info.get("industry", "technology")
                }
            })
            total_cost += designbot.cost
        
        if needs_copy:
            # Determine specific copy type
            if 'landing page' in prompt_lower:
                tasks.append({
                    "agent": "copybot",
                    "task_type": "landing_page",
                    "cost": 25,
                    "description": f"Complete landing page copy for {brand_name}",
                    "context": {
                        "user_prompt": user_prompt,
                        "product_description": info.get("product_description", "innovative solution"),
                        "industry": info.get("industry", "saas"),
                        "target_audience": info.get("target_audience", "professionals")
                    }
                })
                total_cost += 25
            elif 'pitch deck' in prompt_lower:
                tasks.append({
                    "agent": "copybot",
                    "task_type": "pitch_deck",
                    "cost": 30,
                    "description": f"Investor pitch deck for {brand_name}",
                    "context": {
                        "user_prompt": user_prompt,
                        "industry": info.get("industry", "saas")
                    }
                })
                total_cost += 30
            else:
                # Use the smart generate_copy_from_prompt
                tasks.append({
                    "agent": "copybot",
                    "task_type": "smart_copy",
                    "cost": copybot.cost,
                    "description": f"Professional copy for {brand_name}",
                    "context": {
                        "user_prompt": user_prompt,
                        "product_description": info.get("product_description", ""),
                        "industry": info.get("industry", "saas"),
                        "target_audience": info.get("target_audience", "professionals"),
                        "tone": info.get("tone", "professional")
                    }
                })
                total_cost += copybot.cost
        
        # Default to both if unclear
        if not needs_design and not needs_copy:
            tasks = [
                {
                    "agent": "designbot",
                    "task_type": "logo_generation",
                    "cost": designbot.cost,
                    "description": f"Professional logo for {brand_name}",
                    "context": {
                        "style": info.get("style", "modern minimalist"),
                        "colors": info.get("colors", ["purple", "cyan"])
                    }
                },
                {
                    "agent": "copybot",
                    "task_type": "smart_copy",
                    "cost": copybot.cost,
                    "description": f"Professional copy for {brand_name}",
                    "context": {
                        "user_prompt": user_prompt,
                        "industry": info.get("industry", "saas")
                    }
                }
            ]
            total_cost = designbot.cost + copybot.cost
        
        burn_fee = round(total_cost * 0.05, 2)
        
        return {
            "user_prompt": user_prompt,
            "brand_name": brand_name,
            "tasks": tasks,
            "total_cost": total_cost,
            "burn_fee": burn_fee,
            "estimated_time": len(tasks) * 30,
            "extracted_info": info
        }
    
    async def execute_tasks(
        self,
        analysis: Dict[str, Any],
        conversation_id: Optional[str] = None
    ) -> Dict[str, Any]:
        """Execute all analyzed tasks with proper formatting"""
        
        logger.info(f"Executing {len(analysis['tasks'])} tasks")
        
        brand_name = analysis.get("brand_name", "Brand")
        deliverables = []
        
        for task in analysis["tasks"]:
            agent_name = task["agent"]
            task_type = task["task_type"]
            context = task.get("context", {})
            
            try:
                logger.info(f"Running {task_type} with {agent_name}")
                
                if task_type == "logo_generation":
                    result = await designbot.generate_logo(
                        brand_name=brand_name,
                        style=context.get("style", "modern minimalist"),
                        context=context
                    )
                    
                    deliverables.append({
                        "id": "design",
                        "type": "image",
                        "name": f"{brand_name}_Logo",
                        "content": result["image_base64"],
                        "agent": "DesignBot",
                        "metadata": {
                            "size": result["size"],
                            "format": result["format"],
                            "model_used": result.get("model_used", "Generated")
                        }
                    })
                
                elif task_type == "smart_copy":
                    # Use the new smart copy generation
                    result = await copybot.generate_copy_from_prompt(
                        user_prompt=context.get("user_prompt", "Generate professional copy"),
                        brand_name=brand_name,
                        context=context
                    )
                    
                    deliverables.append({
                        "id": "copy",
                        "type": "markdown",
                        "name": f"{brand_name}_{result['copy_type'].title().replace('_', ' ')}",
                        "content": result["content"],
                        "agent": "CopyBot",
                        "metadata": {
                            "copy_type": result["copy_type"],
                            "word_count": result["metadata"]["word_count"],
                            "industry": result["industry"],
                            "techniques_used": result["techniques_used"]
                        }
                    })
                
                elif task_type == "landing_page":
                    page_copy = await copybot.generate_landing_page(
                        brand_name=brand_name,
                        product_description=context.get("product_description", "innovative solution"),
                        context=context
                    )
                    
                    deliverables.append({
                        "id": "landing_page",
                        "type": "markdown",
                        "name": f"{brand_name}_Landing_Page",
                        "content": page_copy["hero"]["long_form_content"],
                        "agent": "CopyBot",
                        "metadata": {
                            "copy_type": "landing_page",
                            "sections": ["hero", "features", "testimonials", "cta", "faq"]
                        }
                    })
                
                elif task_type == "pitch_deck":
                    deck = await copybot.generate_pitch_deck_copy(
                        brand_name=brand_name,
                        context=context
                    )
                    
                    # Format pitch deck nicely
                    formatted_deck = self._format_pitch_deck(deck, brand_name)
                    
                    deliverables.append({
                        "id": "pitch_deck",
                        "type": "markdown",
                        "name": f"{brand_name}_Pitch_Deck",
                        "content": formatted_deck,
                        "agent": "CopyBot",
                        "metadata": {
                            "copy_type": "pitch_deck",
                            "slides": len(deck.get("slides", []))
                        }
                    })
                
                logger.success(f"{task_type} completed")
                
            except Exception as e:
                logger.error(f"Task {task_type} failed: {str(e)}")
                import traceback
                traceback.print_exc()
                continue
        
        return {
            "deliverables": deliverables,
            "total_cost": analysis["total_cost"],
            "burn_fee": analysis["burn_fee"],
            "status": "completed" if deliverables else "failed"
        }
    
    def _format_pitch_deck(self, deck: Dict[str, Any], brand_name: str) -> str:
        """Format pitch deck into nice markdown"""
        
        slides = deck.get("slides", [])
        
        formatted = [f"# {brand_name} - Pitch Deck\n"]
        
        for i, slide in enumerate(slides, 1):
            formatted.append(f"\n---\n\n## Slide {i}: {slide['title']}\n\n")
            formatted.append(f"{slide['content']}\n")
        
        return "".join(formatted)
    
    async def process_request(
        self,
        user_prompt: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Complete end-to-end processing (for direct execution)"""
        
        # Analyze
        analysis = self.analyze_request(user_prompt, context)
        
        # Execute
        result = await self.execute_tasks(analysis)
        
        # Compile result
        return {
            "analysis": analysis,
            "deliverables": result["deliverables"],
            "transaction": {
                "total": analysis["total_cost"],
                "breakdown": [
                    {"agent": task["agent"], "amount": task["cost"]}
                    for task in analysis["tasks"]
                ],
                "burn_fee": analysis["burn_fee"]
            },
            "status": result["status"]
        }
    
    def _extract_brand_name(self, prompt: str) -> str:
        """Enhanced brand name extraction"""
        
        prompt_lower = prompt.lower()
        
        # Pattern: "called [name]"
        if " called " in prompt_lower:
            parts = prompt.split(" called ")
            if len(parts) > 1:
                name = parts[1].split()[0]
                return name.strip('"\'.,').capitalize()
        
        # Pattern: "named [name]"
        if " named " in prompt_lower:
            parts = prompt.split(" named ")
            if len(parts) > 1:
                name = parts[1].split()[0]
                return name.strip('"\'.,').capitalize()
        
        # Pattern: "for [name]"
        if " for " in prompt_lower:
            parts = prompt.split(" for ")
            if len(parts) > 1:
                # Take up to 3 words
                words = parts[1].split()[:3]
                # Stop at common words
                stop_words = ["that", "which", "who", "where", "when", "a", "an", "the"]
                filtered = []
                for word in words:
                    if word.lower() in stop_words:
                        break
                    filtered.append(word)
                if filtered:
                    name = " ".join(filtered)
                    return name.strip('"\'.,').title()
        
        # Pattern: "[name] brand/company/startup"
        for keyword in ["brand", "company", "startup", "business", "app", "platform"]:
            if keyword in prompt_lower:
                words = prompt_lower.split()
                try:
                    idx = words.index(keyword)
                    if idx > 0:
                        return words[idx - 1].strip('"\'.,').capitalize()
                except ValueError:
                    continue
        
        return "Brand"
    
    def _extract_colors(self, text: str) -> List[str]:
        """Extract color mentions from text"""
        
        common_colors = [
            "red", "blue", "green", "yellow", "purple", "orange", "pink",
            "cyan", "magenta", "brown", "black", "white", "gray", "grey",
            "gold", "silver", "bronze", "teal", "navy", "maroon", "lime",
            "indigo", "violet", "turquoise", "coral", "salmon"
        ]
        
        text_lower = text.lower()
        found_colors = []
        
        for color in common_colors:
            if color in text_lower:
                found_colors.append(color)
        
        return found_colors[:3]  # Max 3 colors
    
    def get_worker_status(self) -> List[Dict[str, Any]]:
        """Get status of all workers"""
        return [agent.get_status() for agent in self.worker_agents.values()]
    
    def get_conversation_state(self, conversation_id: str) -> Dict[str, Any]:
        """Get current conversation state"""
        return self.conversation_manager.get_or_create(conversation_id)


# Global instance
manager = ManagerAgent()