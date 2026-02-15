"""
Master Chatbot - Conversational AI for HyperTask
"""
import os
from typing import Dict, Any, List, Optional
from loguru import logger

class MasterChatbot:
    """
    Master AI that chats with users before executing tasks
    """
    
    def __init__(self):
        self.name = "HyperTask Assistant"
        
        # Task detection keywords
        self.task_patterns = {
            "design": ["logo", "design", "visual", "graphic", "image", "icon", "brand identity"],
            "copywriting": ["slogan", "tagline", "copy", "write", "content", "text"],
            "pitch_deck": ["pitch deck", "presentation", "slides", "deck"],
            "landing_page": ["landing page", "website copy", "web content", "homepage"],
        }
        
        logger.info(f"Initialized {self.name}")
    
    async def chat(self, user_message: str, conversation_history: List[Dict] = None) -> Dict[str, Any]:
        """
        Chat with user to understand their needs
        
        Returns:
            - response: Chatbot's conversational response
            - detected_tasks: List of tasks detected
            - ready_to_execute: Whether we have enough info to start
        """
        
        history = conversation_history or []
        
        # Detect tasks in message
        detected_tasks = self._detect_tasks(user_message)
        
        # Determine conversation state
        is_greeting = any(word in user_message.lower() for word in ["hi", "hello", "hey", "sup", "yo"])
        is_question = "?" in user_message
        has_clear_task = len(detected_tasks) > 0
        
        # Generate response based on state
        if is_greeting and len(history) <= 1:
            response_text = self._generate_greeting()
            ready_to_execute = False
            
        elif has_clear_task:
            # User has given clear task
            response_text = self._generate_task_confirmation(user_message, detected_tasks)
            ready_to_execute = True
            
        elif is_question:
            response_text = self._answer_question(user_message)
            ready_to_execute = False
            
        else:
            # Clarify needs
            response_text = self._clarify_needs(user_message, len(history))
            ready_to_execute = False
        
        return {
            "response": response_text,
            "detected_tasks": detected_tasks,
            "ready_to_execute": ready_to_execute,
            "requires_clarification": not has_clear_task and not is_greeting
        }
    
    def _detect_tasks(self, message: str) -> List[str]:
        """Detect what tasks are needed"""
        
        message_lower = message.lower()
        detected = []
        
        for task_type, keywords in self.task_patterns.items():
            if any(keyword in message_lower for keyword in keywords):
                detected.append(task_type)
        
        return list(set(detected))
    
    def _generate_greeting(self) -> str:
        """Generate greeting"""
        return """Hey there! 👋 I'm your HyperTask Assistant.

I can help you with:
• Logo & Brand Design (50 HYPER)
• Copywriting & Slogans (20 HYPER)
• Pitch Decks (30 HYPER)
• Landing Pages (25 HYPER)

What would you like to create today?"""
    
    def _generate_task_confirmation(self, message: str, tasks: List[str]) -> str:
        """Generate confirmation for detected tasks"""
        
        task_descriptions = {
            "design": "create a professional logo",
            "copywriting": "write compelling copy",
            "pitch_deck": "generate a pitch deck outline",
            "landing_page": "write landing page copy",
        }
        
        task_costs = {
            "design": 50,
            "copywriting": 20,
            "pitch_deck": 30,
            "landing_page": 25,
        }
        
        task_list = [task_descriptions.get(t, t) for t in tasks]
        total_cost = sum(task_costs.get(t, 20) for t in tasks)
        burn_fee = round(total_cost * 0.05, 2)
        
        if len(task_list) == 1:
            task_str = task_list[0]
        else:
            task_str = " and ".join(task_list)
        
        response = f"""Perfect! I understand you want to {task_str}.

Here's the breakdown:
"""
        for task in tasks:
            cost = task_costs.get(task, 20)
            desc = task_descriptions.get(task, task)
            response += f"• {desc.title()}: {cost} HYPER\n"
        
        response += f"\n**Total: {total_cost} HYPER** (+ {burn_fee} HYPER burn fee)"
        response += f"\n\nReady to start? I'll dispatch our specialist AI agents!"
        
        return response
    
    def _answer_question(self, question: str) -> str:
        """Answer user questions"""
        
        question_lower = question.lower()
        
        if "cost" in question_lower or "price" in question_lower or "how much" in question_lower:
            return """Our pricing is transparent:

• **Logo Design**: 50 HYPER
• **Copywriting**: 20 HYPER  
• **Pitch Deck**: 30 HYPER
• **Landing Page**: 25 HYPER

All payments are held in escrow until you approve the work.
Plus, 5% is burned to support the $HYPER ecosystem."""
        
        elif "how" in question_lower and "work" in question_lower:
            return """Here's how HyperTask works:

1. You describe what you need
2. I analyze and estimate costs
3. Payment locks in escrow
4. Specialist AI agents work on your tasks
5. You review the deliverables
6. Approve & agents get paid automatically

It's trustless, fast, and powered by Monad!"""
        
        else:
            return "That's a great question! Could you tell me more about what you'd like to create? I can help with logos, copy, pitch decks, or landing pages."
    
    def _clarify_needs(self, message: str, history_length: int) -> str:
        """Ask clarifying questions"""
        
        prompts = [
            "I'd love to help! Could you tell me more about what you're looking to create?",
            "Interesting! What's the main goal you're trying to achieve?",
            "Got it! Are you looking for design work, copywriting, or both?",
        ]
        
        idx = history_length % len(prompts)
        return prompts[idx]


# Global instance
master_chatbot = MasterChatbot()