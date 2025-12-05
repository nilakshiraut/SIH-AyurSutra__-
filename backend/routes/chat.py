"""
WebSocket Chat Endpoint
Handles real-time conversation with AyurSutra Bot
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import json
import pickle
import os
import asyncio
from datetime import datetime
from utils.nlp_processor import clean_text, match_intent, extract_dosha_keywords
from Training.prakritimodel import calculate_dosha_scores
from Training.panchakarma_model import get_panchakarma_recommendations

router = APIRouter()

# Load chatbot model and intents
models_dir = os.path.join(os.path.dirname(__file__), '..', 'Models')
chatbot_model = None
intents_data = None

try:
    with open(os.path.join(models_dir, 'chatbot_model.pkl'), 'rb') as f:
        chatbot_model = pickle.load(f)
    with open(os.path.join(models_dir, 'intents.pkl'), 'rb') as f:
        intents_data = pickle.load(f)
except:
    print("Warning: Chatbot models not found. Please train models first.")

# Assessment questions flow
ASSESSMENT_QUESTIONS = [
    {
        'id': 'body_frame',
        'question': "What best describes your body frame?",
        'options': ['Thin and light', 'Medium build', 'Heavy and large'],
        'context': 'physical'
    },
    {
        'id': 'skin_type',
        'question': "How would you describe your skin?",
        'options': ['Dry and rough', 'Oily and sensitive', 'Smooth and oily', 'Normal'],
        'context': 'physical'
    },
    {
        'id': 'hair_texture',
        'question': "What is your hair texture like?",
        'options': ['Thin and dry', 'Fine and oily', 'Thick and oily', 'Normal'],
        'context': 'physical'
    },
    {
        'id': 'appetite',
        'question': "How would you describe your appetite?",
        'options': ['Irregular and variable', 'Strong and regular', 'Moderate and steady'],
        'context': 'digestive'
    },
    {
        'id': 'digestion',
        'question': "How is your digestion?",
        'options': ['Irregular', 'Strong and fast', 'Slow'],
        'context': 'digestive'
    },
    {
        'id': 'energy_level',
        'question': "What are your energy levels like?",
        'options': ['Variable and irregular', 'High and consistent', 'Low and steady'],
        'context': 'lifestyle'
    },
    {
        'id': 'sleep',
        'question': "How would you describe your sleep?",
        'options': ['Light and interrupted', 'Moderate', 'Deep and sound'],
        'context': 'lifestyle'
    },
    {
        'id': 'temperament',
        'question': "Which best describes your temperament?",
        'options': ['Anxious and creative', 'Intense and ambitious', 'Calm and stable'],
        'context': 'mental'
    },
    {
        'id': 'stress_response',
        'question': "How do you typically respond to stress?",
        'options': ['Worried and anxious', 'Irritable and angry', 'Calm and peaceful'],
        'context': 'mental'
    },
    {
        'id': 'weather_preference',
        'question': "What weather do you prefer?",
        'options': ['Warm and sunny', 'Cool and moderate', 'Warm and humid'],
        'context': 'lifestyle'
    }
]

# Map options to dosha values
OPTION_MAPPING = {
    'body_frame': {
        'Thin and light': 'thin',
        'Medium build': 'medium',
        'Heavy and large': 'heavy'
    },
    'skin_type': {
        'Dry and rough': 'dry',
        'Oily and sensitive': 'oily',
        'Smooth and oily': 'oily',
        'Normal': 'normal'
    },
    'hair_texture': {
        'Thin and dry': 'thin',
        'Fine and oily': 'fine',
        'Thick and oily': 'thick',
        'Normal': 'normal'
    },
    'appetite': {
        'Irregular and variable': 'irregular',
        'Strong and regular': 'strong',
        'Moderate and steady': 'regular'
    },
    'digestion': {
        'Irregular': 'irregular',
        'Strong and fast': 'strong',
        'Slow': 'slow'
    },
    'energy_level': {
        'Variable and irregular': 'variable',
        'High and consistent': 'high',
        'Low and steady': 'low'
    },
    'sleep': {
        'Light and interrupted': 'light',
        'Moderate': 'moderate',
        'Deep and sound': 'deep'
    },
    'temperament': {
        'Anxious and creative': 'anxious',
        'Intense and ambitious': 'intense',
        'Calm and stable': 'calm'
    },
    'stress_response': {
        'Worried and anxious': 'worried',
        'Irritable and angry': 'irritable',
        'Calm and peaceful': 'calm'
    },
    'weather_preference': {
        'Warm and sunny': 'warm',
        'Cool and moderate': 'cool',
        'Warm and humid': 'warm'
    }
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.user_sessions: dict[str, dict] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        if session_id not in self.user_sessions:
            self.user_sessions[session_id] = {
                'assessment_data': {},
                'current_question': 0,
                'assessment_complete': False,
                'dosha_results': None,
                'panchakarma_recs': None,
                'has_sent_welcome': False  # Track if welcome message was sent
            }
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
    
    async def send_personal_message(self, message: dict, session_id: str):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)
    
    async def send_typing_indicator(self, session_id: str):
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json({
                'type': 'typing',
                'sender': 'bot'
            })

manager = ConnectionManager()

async def simulate_typing_delay():
    """Simulate bot thinking time"""
    await asyncio.sleep(0.5)

async def get_bot_response(user_message: str, session: dict, session_id: str) -> str:
    """Get appropriate bot response based on user message and session state"""
    # If assessment is complete, handle general conversation
    if session['assessment_complete']:
        if chatbot_model and intents_data:
            try:
                intent_tag = chatbot_model.predict([clean_text(user_message)])[0]
                intent = next((i for i in intents_data['intents'] if i['tag'] == intent_tag), None)
                if intent:
                    import random
                    return random.choice(intent['responses'])
            except:
                pass
        return "You've completed your assessment! Would you like to see your results again?"
    
    # If assessment is in progress, continue with it
    if session['current_question'] < len(ASSESSMENT_QUESTIONS):
        current_q = ASSESSMENT_QUESTIONS[session['current_question']]
        if user_message in current_q['options']:
            # Valid option selected, handled in main loop
            return None
        else:
            # Invalid option, re-ask question
            return f"{current_q['question']} Please select one of the options below:"
    
    # If no assessment in progress, check if user wants to start
    start_keywords = ['start', 'begin', 'yes', 'ready', 'assessment']
    if any(keyword in user_message.lower() for keyword in start_keywords):
        return None  # Will start assessment in main loop
    
    # General conversation before assessment starts
    if chatbot_model and intents_data:
        try:
            intent_tag = chatbot_model.predict([clean_text(user_message)])[0]
            intent = next((i for i in intents_data['intents'] if i['tag'] == intent_tag), None)
            if intent:
                import random
                return random.choice(intent['responses'])
        except:
            pass
    
    # Default response
    return "I'm here to help you with your Ayurvedic assessment. Type 'start' to begin!"

@router.websocket("/ws/chat")
async def websocket_endpoint(websocket: WebSocket):
    session_id = None
    try:
        # Get session ID from query params or generate one
        session_id = websocket.query_params.get("session_id", f"session_{datetime.now().timestamp()}")
        
        await manager.connect(websocket, session_id)
        session = manager.user_sessions[session_id]
        
        # Send welcome message ONLY ONCE per session
        if not session.get('has_sent_welcome', False):
            print(f"Sending welcome message to session {session_id}")
            await manager.send_personal_message({
                'type': 'message',
                'sender': 'bot',
                'text': "Namaste! 🌿 I'm AyurSutra Bot, your Ayurvedic wellness assistant. I'll help you discover your Dosha (Prakriti) and recommend personalized Panchakarma therapies. Are you ready to begin your assessment?",
                'timestamp': datetime.now().isoformat()
            }, session_id)
            session['has_sent_welcome'] = True
            print(f"Welcome message sent and flagged for session {session_id}")
        else:
            print(f"Welcome message already sent for session {session_id}, skipping")
        
        while True:
            # Wait for user message
            data = await websocket.receive_json()
            print(f"Received data from client: {data}")
            user_message = data.get('message', '').strip()
            
            if not user_message:
                print("Empty message received, skipping")
                continue
            
            print(f"Processing user message: {user_message}")
            
            # Simulate typing
            await simulate_typing_delay()
            await manager.send_typing_indicator(session_id)
            await asyncio.sleep(1)
            
            # Check if assessment is in progress
            if session['current_question'] < len(ASSESSMENT_QUESTIONS):
                current_q = ASSESSMENT_QUESTIONS[session['current_question']]
                
                # Check if user selected a valid option
                if user_message in current_q['options']:
                    # Map answer to dosha value
                    question_id = current_q['id']
                    dosha_value = OPTION_MAPPING.get(question_id, {}).get(user_message, user_message.lower())
                    session['assessment_data'][question_id] = dosha_value
                    
                    session['current_question'] += 1
                    
                    # Check if assessment is complete
                    if session['current_question'] >= len(ASSESSMENT_QUESTIONS):
                        # Calculate dosha results
                        dosha_results = calculate_dosha_scores(session['assessment_data'])
                        session['dosha_results'] = dosha_results
                        
                        # Get Panchakarma recommendations
                        panchakarma_recs = get_panchakarma_recommendations(dosha_results)
                        session['panchakarma_recs'] = panchakarma_recs
                        session['assessment_complete'] = True
                        
                        # Send results
                        await manager.send_personal_message({
                            'type': 'assessment_complete',
                            'sender': 'bot',
                            'dosha_results': dosha_results,
                            'panchakarma_recs': panchakarma_recs,
                            'timestamp': datetime.now().isoformat()
                        }, session_id)
                    else:
                        # Ask next question
                        next_q = ASSESSMENT_QUESTIONS[session['current_question']]
                        await manager.send_personal_message({
                            'type': 'question',
                            'sender': 'bot',
                            'text': next_q['question'],
                            'question_id': next_q['id'],
                            'options': next_q['options'],
                            'progress': {
                                'current': session['current_question'] + 1,
                                'total': len(ASSESSMENT_QUESTIONS)
                            },
                            'timestamp': datetime.now().isoformat()
                        }, session_id)
                else:
                    # Invalid option, re-ask current question
                    await manager.send_personal_message({
                        'type': 'question',
                        'sender': 'bot',
                        'text': f"{current_q['question']} Please select one of the options below:",
                        'question_id': current_q['id'],
                        'options': current_q['options'],
                        'progress': {
                            'current': session['current_question'] + 1,
                            'total': len(ASSESSMENT_QUESTIONS)
                        },
                        'timestamp': datetime.now().isoformat()
                    }, session_id)
            
            # Check if user wants to start assessment
            elif user_message.lower() in ['start', 'begin', 'yes', 'ready', 'let\'s start', 'let\'s begin']:
                # Start assessment
                session['current_question'] = 0
                session['assessment_data'] = {}
                first_q = ASSESSMENT_QUESTIONS[0]
                await manager.send_personal_message({
                    'type': 'question',
                    'sender': 'bot',
                    'text': first_q['question'],
                    'question_id': first_q['id'],
                    'options': first_q['options'],
                    'progress': {
                        'current': 1,
                        'total': len(ASSESSMENT_QUESTIONS)
                    },
                    'timestamp': datetime.now().isoformat()
                }, session_id)
            
            else:
                # Handle general conversation
                bot_response = await get_bot_response(user_message, session, session_id)
                
                if bot_response:
                    await manager.send_personal_message({
                        'type': 'message',
                        'sender': 'bot',
                        'text': bot_response,
                        'timestamp': datetime.now().isoformat()
                    }, session_id)
    
    except WebSocketDisconnect:
        if session_id:
            manager.disconnect(session_id)
    except Exception as e:
        import traceback
        print(f"WebSocket error: {e}")
        print(f"Traceback: {traceback.format_exc()}")
        if session_id:
            manager.disconnect(session_id)

