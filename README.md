# AyurSutra - Ayurvedic Dosha Detection & Panchakarma Recommendation Chatbot

A modern, interactive chatbot application that determines a user's Ayurvedic Dosha (Prakriti) through conversational AI and recommends personalized Panchakarma therapies based on the assessment.

## 🌿 Features

- **Conversational Dosha Assessment**: Interactive chatbot that asks questions about physical characteristics, mental traits, digestive patterns, sleep, and lifestyle habits
- **ML-Powered Classification**: Custom ML model to classify responses into Dosha types (Vata, Pitta, Kapha, or combinations)
- **Panchakarma Recommendations**: Personalized therapy recommendations including Vamana, Virechana, Basti, Nasya, and Raktamokshana
- **Modern UI/UX**: Beautiful, minimalist interface with smooth animations, glassmorphism effects, and dark/light mode
- **PDF Reports**: Downloadable comprehensive PDF reports with personalized recommendations
- **Real-time Chat**: WebSocket-based real-time chat interface with typing indicators

## 🛠️ Tech Stack

### Backend
- **FastAPI** (Python ≥3.10)
- **TensorFlow** & **scikit-learn** for ML models
- **NLTK** for NLP processing
- **SQLAlchemy** for database
- **WebSockets** for real-time communication
- **WeasyPrint** for PDF generation

### Frontend
- **React.js** with **Vite**
- **Zustand** for state management
- **React Router** for navigation
- Modern CSS with animations and glassmorphism

## 📁 Project Structure

```
AyurSutra-Chatbot/
├── backend/                                  # FastAPI Backend Server
│   ├── app.py                                # Main FastAPI application
│   ├── ayursutra.db                           # SQLite database file
│   ├── requirements.txt                       # Python dependencies
│   ├── run_training.py                        # ML model training script
│   ├── setup.py                               # Package setup configuration
│   │
│   ├── database/                              # Database Layer
│   │   ├── __init__.py
│   │   ├── database.py                        # SQLAlchemy engine setup
│   │   └── models.py                          # Database models
│   │
│   ├── Models/                                # ML Model Files
│   │   ├── chatbot_model.pkl                  # Trained chatbot model
│   │   ├── intents.pkl                        # Intent classification data
│   │   ├── panchakarma_recommendations.pkl
│   │   └── prakriti_weights.pkl               # Dosha prediction weights
│   │
│   ├── routes/                                # API Endpoints
│   │   ├── __init__.py
│   │   ├── assessment.py                      # Dosha assessment logic
│   │   ├── chat.py                            # Chatbot conversation handling
│   │   └── pdf.py                             # PDF generation endpoints
│   │
│   ├── Training/                              # ML Training Scripts & Data
│   │   ├── __init__.py
│   │   ├── botmodel.py                        # Chatbot model training
│   │   ├── intents.json                       # Training intents
│   │   ├── panchakarma_model.py               # Therapy recommendation model
│   │   └── prakritimodel.py                   # Dosha prediction model
│   │
│   └── utils/                                 # Utility Functions
│       ├── __init__.py
│       ├── nlp_processor.py                   # Text processing utilities
│       └── simple_pdf_generator.py            # PDF report generator
│
├── frontend/                                  # React Frontend (Vite + React)
│   ├── index.html                             # Root HTML template
│   ├── package.json                           # Frontend dependencies
│   ├── package-lock.json                      # Dependency lock file
│   ├── vite.config.js                         # Vite configuration
│   │
│   ├── public/                                # Static Assets
│   │   └── _redirects                         # SPA routing support
│   │
│   └── src/                                   # React Application Source
│       ├── App.jsx                            # Main app component
│       ├── main.jsx                           # Application entry point
│       │
│       ├── components/                         # Reusable Components
│       │   ├── Chat/
│       │   │   ├── ChatContainer.jsx
│       │   │   ├── ChatContainer.css
│       │   │   ├── MessageBubble.jsx
│       │   │   ├── MessageBubble.css
│       │   │   ├── InputBox.jsx
│       │   │   ├── InputBox.css
│       │   │   ├── TypingIndicator.jsx
│       │   │   └── TypingIndicator.css
│       │   │
│       │   ├── Assessment/
│       │   │   ├── DoshaResult.jsx
│       │   │   ├── DoshaResult.css
│       │   │   ├── TherapyCard.jsx
│       │   │   └── TherapyCard.css
│       │   │
│       │   └── UI/
│       │       ├── Avatar.jsx
│       │       └── Avatar.css
│       │
│       ├── pages/
│       │   ├── Chat.jsx
│       │   ├── Chat.css
│       │   ├── Results.jsx
│       │   └── Results.css
│       │
│       ├── services/
│       │   └── websocket.js                   # WebSocket real-time client
│       │
│       ├── store/
│       │   └── chatStore.js                   # Zustand global state
│       │
│       └── styles/
│           └── global.css                     # Global styling
│
├── Images/                                    # Therapy Images
│   ├── Basti.png
│   ├── Nasya.png
│   ├── Raktamokshana.png
│   ├── vamana.png
│   └── Virechana.png
│
└── Documentation/                             # Project Documentation
    ├── PROJECT_SUMMARY.md
    ├── QUICKSTART.md
    └── README.md

```

## 🚀 Setup Instructions

### Prerequisites

- Python 3.10 or higher
- Node.js 16 or higher
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
python -m venv venv
```

3. Activate the virtual environment:
- **Windows:**
```bash
venv\Scripts\activate
```
- **Linux/Mac:**
```bash
source venv/bin/activate
```

4. Install dependencies:
```bash
pip install -r requirements.txt
```

5. Download NLTK data (if not already downloaded):
```python
python -c "import nltk; nltk.download('punkt'); nltk.download('stopwords'); nltk.download('wordnet')"
```

6. Train the ML models:
```bash
python Training/botmodel.py
python Training/prakritimodel.py
python Training/panchakarma_model.py
```

7. Create a `.env` file (optional, defaults are set):
```env
DATABASE_URL=sqlite:///./ayursutra.db
SECRET_KEY=your_secret_key_here
HOST=127.0.0.1
PORT=8000
```

8. Run the server:
```bash
python app.py
```

The backend will be available at `http://127.0.0.1:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are set):
```env
VITE_WS_URL=ws://127.0.0.1:8000/ws
VITE_API_URL=http://127.0.0.1:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## 📖 Usage

1. Start both backend and frontend servers
2. Open your browser and navigate to `http://localhost:5173`
3. Click "Begin Your Assessment" to start the chatbot
4. Answer the assessment questions through the chat interface
5. View your Dosha results and Panchakarma recommendations
6. Download your personalized PDF report

## 🎨 Features in Detail

### Dosha Assessment
The chatbot asks 10 comprehensive questions covering:
- Physical characteristics (body frame, skin type, hair texture)
- Digestive patterns (appetite, digestion)
- Lifestyle habits (energy levels, sleep patterns)
- Mental traits (temperament, stress response)
- Weather preferences

### Panchakarma Therapies
Based on your Dosha assessment, the system recommends:
- **Primary therapies** specific to your dominant Dosha
- **Secondary therapies** for balance
- **Contraindications** to avoid
- **Detailed descriptions** of each therapy
- **Dietary recommendations** (Ahara)
- **Lifestyle modifications** (Vihara)
- **Yoga and Pranayama** practices

### PDF Reports
Comprehensive reports include:
- Dosha assessment results with visual charts
- Recommended Panchakarma therapies
- Dietary guidelines
- Lifestyle modifications
- Yoga and Pranayama practices
- Important disclaimers

## 🔧 API Endpoints

### WebSocket
- `ws://127.0.0.1:8000/ws/chat` - Real-time chat endpoint

### REST API
- `GET /` - API information
- `GET /health` - Health check
- `POST /api/assessment/calculate` - Calculate dosha scores
- `GET /api/assessment/{session_id}` - Get assessment results
- `POST /api/pdf/generate` - Generate PDF report

API documentation available at `http://127.0.0.1:8000/docs` (Swagger UI)

## 🎯 Key Features

- **Modern UI Design**: Unique, beautiful interface with gradient backgrounds, glassmorphism, and smooth animations
- **Real-time Chat**: WebSocket-based chat with typing indicators and message history
- **Responsive Design**: Mobile-first approach, works on all devices
- **Dark/Light Mode**: Theme toggle for user preference
- **Progress Tracking**: Visual progress indicator during assessment
- **Interactive Questions**: Multiple choice options with smooth animations
- **Visual Results**: Circular progress charts for Dosha percentages
- **Comprehensive Reports**: Detailed PDF reports with all recommendations

## ⚠️ Important Notes

- This assessment is for **informational purposes only** and is not a substitute for professional medical advice
- Panchakarma therapies should be performed under the supervision of trained Ayurvedic physicians
- Always consult with qualified healthcare providers for medical conditions

## 🐛 Troubleshooting

### Backend Issues
- Ensure Python 3.10+ is installed
- Check that all dependencies are installed correctly
- Verify NLTK data is downloaded
- Ensure models are trained before running the server

### Frontend Issues
- Clear browser cache if styles don't load
- Check that backend is running on port 8000
- Verify WebSocket connection in browser console

### Model Training
- If models fail to train, check that all dependencies are installed
- Ensure `Training/intents.json` exists
- Check file permissions for Models directory

## 📝 License

This project is for educational purposes. Please ensure compliance with medical regulations when using for health-related applications.

## 🙏 Acknowledgments

- Based on Ayurvedic principles from classical texts
- Inspired by traditional Panchakarma practices
- Modern implementation with contemporary web technologies

---

**Namaste! 🌿** May you find balance and wellness on your Ayurvedic journey.

