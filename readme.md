# TabTalk - AI-Powered Webpage Chatbot

**TabTalk** is a Chrome extension that transforms any webpage into an interactive AI chatbot. Simply navigate to any website, and TabTalk automatically processes the page content, allowing you to ask questions and get intelligent answers about the page using Google's Gemini AI.

## 🚀 Project Summary

### **From User Perspective:**
- **Zero Setup Required**: Just install the extension and start chatting with any webpage
- **Automatic Processing**: Pages are processed automatically when you navigate to them
- **ChatGPT-Style Interface**: Clean, dark theme interface that feels familiar
- **Instant Q&A**: Ask questions about any webpage content immediately
- **Smart Responses**: AI understands context and provides relevant answers

### **From Technical Perspective:**
- **Chrome Extension**: Manifest V3 sidebar extension with modern UI
- **FastAPI Backend**: Python-based REST API with CORS support
- **AI Integration**: Google Gemini AI for intelligent responses
- **Vector Search**: FAISS-based semantic search for relevant content
- **Content Processing**: LangChain-powered webpage content extraction
- **Real-time Communication**: Automatic URL detection and processing

## ✨ Key Features

### **🤖 AI-Powered Intelligence**
- **Google Gemini Integration**: Uses Google's latest AI model for responses
- **Context-Aware Answers**: AI understands webpage content and context
- **Semantic Search**: Finds relevant content using vector embeddings
- **Markdown Rendering**: Beautiful formatting for AI responses

### **🎨 Modern Interface**
- **ChatGPT-Style Design**: Dark theme with green accents
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: Natural message transitions
- **Typing Indicators**: Visual feedback during AI processing

### **⚡ Automatic Processing**
- **Zero-Click Setup**: Pages are processed automatically
- **URL Detection**: Automatically detects page changes
- **Smart Caching**: Efficient memory management
- **Error Handling**: Graceful fallbacks for processing issues

### **🔧 Technical Excellence**
- **FastAPI Backend**: High-performance async API
- **Vector Database**: FAISS for fast semantic search
- **Content Extraction**: Multiple fallback methods for webpage content
- **Security**: Input validation and error handling

## 🏗️ Architecture

### **Backend Components (Python/FastAPI)**
```
backend/
├── server.py          # Main FastAPI application
├── loader.py          # Webpage content extraction
├── text_processor.py  # Text chunking and vector store
├── retriever.py       # Semantic search functionality
└── llm.py            # Google Gemini AI integration
```

### **Frontend Components (Chrome Extension)**
```
extension/
├── manifest.json      # Extension configuration
├── sidebar.html      # ChatGPT-style UI
├── sidebar.js        # Automatic processing logic
├── sidebar.css       # Dark theme styling
└── background.js     # Service worker
```

## 🛠️ Setup Instructions

### **Prerequisites**
- **Python 3.8+** (for backend)
- **Google AI API Key** 
- **Chrome Browser** (for extension)

### **Step 1: Backend Setup**

1. **Clone and Navigate**:
   ```bash
   git clone <repository-url>
   cd TabTalk/backend
   ```

2. **Install Dependencies**:
   ```bash
   pip install -r ../requirements.txt
   ```

3. **Get Google AI API Key**:
   - Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key (free)
   - Copy the API key

4. **Configure Environment**:
   ```bash
   # Copy the template
   cp ../env.template .env
   
   # Edit .env and add your API key
   GOOGLE_API_KEY="your-api-key-here"
   ```

5. **Start the Server**:
   ```bash
   python server.py
   ```
   Server will run on `http://127.0.0.1:8000`

### **Step 2: Chrome Extension Setup**

1. **Open Chrome Extensions**:
   - Go to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

2. **Load the Extension**:
   - Click "Load unpacked"
   - Select the `extension` folder from the project
   - TabTalk should appear in your extensions

3. **Start Using TabTalk**:
   - Navigate to any webpage
   - Click the TabTalk extension icon
   - The sidebar will open automatically
   - Start asking questions about the page!

## 🎯 How It Works

### **User Workflow**
1. **Navigate** to any webpage
2. **Click** TabTalk extension icon
3. **Wait** for automatic processing (2-3 seconds)
4. **Ask** questions about the page content
5. **Get** intelligent AI responses

### **Technical Workflow**
1. **URL Detection**: Extension detects page changes
2. **Content Extraction**: Backend extracts webpage text
3. **Text Processing**: Content is chunked and vectorized
4. **Vector Storage**: FAISS stores embeddings for search
5. **Question Processing**: User questions trigger semantic search
6. **AI Generation**: Gemini AI generates contextual answers

## 📡 API Endpoints

### **POST `/api/setup-url`**
Processes a URL and creates vector embeddings.

**Request**:
```json
{
  "url": "https://example.com"
}
```

**Response**:
```json
{
  "message": "URL setup complete for https://example.com"
}
```

### **POST `/api/ask-question`**
Asks a question about processed content.

**Request**:
```json
{
  "url": "https://example.com",
  "question": "What is this page about?"
}
```

**Response**:
```json
{
  "answer": "This page is about..."
}
```

### **GET `/health`**
Health check endpoint.

**Response**:
```json
{
  "status": "healthy",
  "message": "TabTalk API is running"
}
```

## 🔧 Dependencies

### **Backend Dependencies**
- **FastAPI**: Modern web framework
- **LangChain**: LLM framework for AI integration
- **Google Gemini**: AI model integration
- **FAISS**: Vector database for semantic search
- **Unstructured**: Document processing
- **BeautifulSoup**: HTML parsing

### **Frontend Dependencies**
- **Chrome Extension APIs**: Native browser functionality
- **Font Awesome**: Icons
- **Google Fonts**: Inter typography

## 🚨 Troubleshooting

### **Common Issues**

1. **"GOOGLE_API_KEY environment variable is required"**
   - Ensure `.env` file exists in `backend/` directory
   - Verify API key is correctly set
   - Restart the backend server

2. **"Failed to load content from URL"**
   - Check if URL is accessible
   - Some websites block automated extraction
   - Try with a different webpage

3. **Extension not working**
   - Ensure backend server is running on port 8000
   - Check Chrome extension permissions
   - Reload the extension in Chrome

4. **"No relevant documents found"**
   - Webpage content might be too short
   - Try with a content-rich webpage
   - Check if page loaded completely

### **Debug Steps**
1. **Check Backend**: Visit `http://127.0.0.1:8000/health`
2. **Check Console**: Open Chrome DevTools for errors
3. **Check Network**: Verify API calls in Network tab
4. **Restart Services**: Restart both backend and extension

## 🔒 Security Considerations

- **API Key Security**: Store Google API key securely
- **CORS Configuration**: Currently allows all origins (restrict in production)
- **Input Validation**: All inputs are validated and sanitized
- **Error Handling**: Sensitive information is not exposed in errors

## 🚀 Development

### **Running in Development**
```bash
# Backend
cd backend
python server.py

# Extension
# Load as unpacked extension in Chrome
```

### **Testing API**
```bash
# Health check
curl http://127.0.0.1:8000/health

# Setup URL
curl -X POST "http://127.0.0.1:8000/api/setup-url" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com"}'

# Ask question
curl -X POST "http://127.0.0.1:8000/api/ask-question" \
  -H "Content-Type: application/json" \
  -d '{"url": "https://example.com", "question": "What is this page about?"}'
```

## 📊 Technical Specifications

- **Backend**: Python 3.8+, FastAPI, Uvicorn
- **AI Model**: Google Gemini (via LangChain)
- **Vector Database**: FAISS-CPU
- **Frontend**: Chrome Extension Manifest V3
- **Styling**: CSS3 with ChatGPT-inspired design
- **Communication**: REST API with JSON

## 🎉 Features in Detail

### **Automatic Processing**
- Detects URL changes every second
- Automatically processes new pages
- Clears old data when switching pages
- No manual setup required

### **Smart AI Responses**
- Context-aware answers
- Markdown formatting support
- Typing indicators during processing
- Error handling with fallbacks

### **Modern UI/UX**
- ChatGPT-style dark theme
- Smooth animations and transitions
- Responsive design
- Professional typography

## 📝 License

This project is open source and available under the MIT License.

---

**TabTalk** - Transform any webpage into an intelligent chatbot! 🤖✨