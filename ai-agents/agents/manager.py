"""
Manager Agent - Orchestrates tasks between agents
"""
from typing import Dict, Any, List, Optional
from loguru import logger
from agents.copybot import copybot
from agents.designbot import designbot

class ManagerAgent:
    """Coordinates worker agents and task execution"""
    
    def __init__(self):
        self.name = "ManagerAgent"
        self.worker_agents = {
            "copybot": copybot,
            "designbot": designbot
        }
        logger.info(f"Initialized {self.name}")
    
    def analyze_request(self, user_prompt: str) -> Dict[str, Any]:
        """Analyze user request and determine required agents"""
        
        logger.info(f"Analyzing: {user_prompt}")
        
        prompt_lower = user_prompt.lower()
        
        # Determine what's needed
        needs_design = any(word in prompt_lower for word in [
            'logo', 'design', 'visual', 'graphic', 'image', 'icon', 'brand'
        ])
        
        needs_copy = any(word in prompt_lower for word in [
            'slogan', 'copy', 'text', 'tagline', 'campaign', 'write', 'content',
            'landing page', 'pitch deck', 'email', 'social'
        ])
        
        # Extract brand name
        brand_name = self._extract_brand_name(user_prompt)
        
        # Build task list
        tasks = []
        total_cost = 0
        
        if needs_design:
            tasks.append({
                "agent": "designbot",
                "task_type": "logo_generation",
                "cost": designbot.cost,
                "description": f"Create logo for {brand_name}"
            })
            total_cost += designbot.cost
        
        if needs_copy:
            # Determine specific copy type
            if 'landing page' in prompt_lower:
                tasks.append({
                    "agent": "copybot",
                    "task_type": "landing_page",
                    "cost": 25,
                    "description": f"Generate landing page copy for {brand_name}"
                })
                total_cost += 25
            elif 'pitch deck' in prompt_lower:
                tasks.append({
                    "agent": "copybot",
                    "task_type": "pitch_deck",
                    "cost": 30,
                    "description": f"Create pitch deck outline for {brand_name}"
                })
                total_cost += 30
            else:
                tasks.append({
                    "agent": "copybot",
                    "task_type": "slogan_generation",
                    "cost": copybot.cost,
                    "description": f"Generate slogan for {brand_name}"
                })
                total_cost += copybot.cost
        
        # Default to both if unclear
        if not needs_design and not needs_copy:
            tasks = [
                {
                    "agent": "designbot",
                    "task_type": "logo_generation",
                    "cost": designbot.cost,
                    "description": f"Create logo for {brand_name}"
                },
                {
                    "agent": "copybot",
                    "task_type": "slogan_generation",
                    "cost": copybot.cost,
                    "description": f"Generate slogan for {brand_name}"
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
            "estimated_time": len(tasks) * 30
        }
    
    async def execute_tasks(
        self,
        analysis: Dict[str, Any],
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Execute all analyzed tasks"""
        
        logger.info(f"Executing {len(analysis['tasks'])} tasks")
        
        ctx = context or {}
        brand_name = analysis.get("brand_name", "Brand")
        deliverables = []
        
        for task in analysis["tasks"]:
            agent_name = task["agent"]
            task_type = task["task_type"]
            
            try:
                logger.info(f"Running {task_type} with {agent_name}")
                
                if task_type == "logo_generation":
                    result = await designbot.generate_logo(
                        brand_name=brand_name,
                        style=ctx.get("design_style", "modern minimalist"),
                        context=ctx
                    )
                    
                    deliverables.append({
                        "id": "design",
                        "type": "image",
                        "name": f"{brand_name} Logo.png",
                        "content": result["image_base64"],
                        "agent": "DesignBot",
                        "metadata": {
                            "size": result["size"],
                            "format": result["format"]
                        }
                    })
                
                elif task_type == "slogan_generation":
                    slogan = await copybot.generate_slogan(
                        brand_name=brand_name,
                        context=ctx
                    )
                    
                    deliverables.append({
                        "id": "copy",
                        "type": "text",
                        "name": "Slogan",
                        "content": slogan,
                        "agent": "CopyBot",
                        "metadata": {
                            "brand_name": brand_name
                        }
                    })
                
                elif task_type == "landing_page":
                    page_copy = await copybot.generate_landing_page(
                        brand_name=brand_name,
                        product_description=ctx.get("product_description", "innovative solution"),
                        context=ctx
                    )
                    
                    deliverables.append({
                        "id": "landing_page",
                        "type": "content",
                        "name": "Landing Page Copy",
                        "content": page_copy,
                        "agent": "CopyBot",
                        "metadata": {
                            "sections": list(page_copy.keys())
                        }
                    })
                
                elif task_type == "pitch_deck":
                    deck = await copybot.generate_pitch_deck_copy(
                        brand_name=brand_name,
                        context=ctx
                    )
                    
                    deliverables.append({
                        "id": "pitch_deck",
                        "type": "presentation",
                        "name": "Pitch Deck",
                        "content": deck,
                        "agent": "CopyBot",
                        "metadata": {
                            "slides": len(deck)
                        }
                    })
                
                logger.success(f"{task_type} completed")
                
            except Exception as e:
                logger.error(f"Task {task_type} failed: {str(e)}")
                continue
        
        return {
            "deliverables": deliverables,
            "total_cost": analysis["total_cost"],
            "burn_fee": analysis["burn_fee"],
            "status": "completed" if deliverables else "failed"
        }
    
    async def process_request(
        self,
        user_prompt: str,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Complete end-to-end processing"""
        
        # Analyze
        analysis = self.analyze_request(user_prompt)
        
        # Execute
        result = await self.execute_tasks(analysis, context)
        
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
        """Extract brand name from prompt"""
        
        prompt_lower = prompt.lower()
        
        # Pattern: "called [name]"
        if " called " in prompt_lower:
            parts = prompt_lower.split(" called ")
            if len(parts) > 1:
                name = parts[1].split()[0]
                return name.strip('"\'').capitalize()
        
        # Pattern: "for [name]"
        if " for " in prompt_lower:
            parts = prompt_lower.split(" for ")
            if len(parts) > 1:
                words = parts[1].split()[:2]
                name = " ".join(words)
                return name.strip('"\'').title()
        
        # Pattern: "[name] brand/company"
        for keyword in ["brand", "company", "startup", "business"]:
            if keyword in prompt_lower:
                words = prompt_lower.split()
                try:
                    idx = words.index(keyword)
                    if idx > 0:
                        return words[idx - 1].strip('"\'').capitalize()
                except ValueError:
                    continue
        
        return "Brand"
    
    def get_worker_status(self) -> List[Dict[str, Any]]:
        """Get status of all workers"""
        return [agent.get_status() for agent in self.worker_agents.values()]


# Global instance
manager = ManagerAgent()