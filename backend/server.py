from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, HttpUrl
from typing import Dict
from dotenv import load_dotenv
import os

from loader import extract_text_from_url
from text_processor import split_text_into_chunks, create_vectorstore
from retriever import get_relevant_docs
from llm import generate_answer

load_dotenv()

app = FastAPI(title="TabTalk API", version="1.0.0")

# Allow Chrome Extension access
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev; restrict in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for URL content / vectorstore
url_data: Dict[str, Dict] = {}

# Pydantic models
class SetupURLRequest(BaseModel):
    url: HttpUrl

class AskQuestionRequest(BaseModel):
    url: HttpUrl
    question: str

# ----------------------------
# Endpoint: Setup / Store URL
# ----------------------------
@app.post("/api/setup-url")
async def setup_url(request: SetupURLRequest):
    """Extracts text from URL and creates vector store for retrieval."""
    url = str(request.url)
    
    # Check if Google API key is available
    if not os.getenv("GOOGLE_API_KEY"):
        raise HTTPException(
            status_code=500, 
            detail="GOOGLE_API_KEY environment variable is required"
        )

    try:
        # Clear all existing data to ensure fresh processing for new URL
        # This prevents mixing data from different pages
        url_data.clear()
        
        text = extract_text_from_url(url)
        chunks = split_text_into_chunks(text)
        vectorstore = create_vectorstore(chunks)

        # Save vectorstore in memory (fresh data only)
        url_data[url] = {"vectorstore": vectorstore, "text": text}
        return {"message": f"URL setup complete for {url}"}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

# ----------------------------
# Endpoint: Ask Question
# ----------------------------
@app.post("/api/ask-question")
async def ask_question(request: AskQuestionRequest):
    """Retrieve relevant chunks from stored URL and generate AI answer."""
    url = str(request.url)
    question = request.question

    if not question or not question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")

    if url not in url_data:
        raise HTTPException(status_code=404, detail="URL not found. Please setup URL first.")

    try:
        vectorstore = url_data[url]["vectorstore"]

        # Retrieve relevant context
        relevant_docs, context = get_relevant_docs(vectorstore, question)

        # Generate answer using Gemini
        answer = generate_answer(context, question)

        return {"answer": answer}

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


# ----------------------------
# Health Check Endpoint
# ----------------------------
@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "healthy", "message": "TabTalk API is running"}

# ----------------------------
# Run server
# ----------------------------
if __name__ == "__main__":
    import uvicorn
    
    # Check if Google API key is available
    if not os.getenv("GOOGLE_API_KEY"):
        print("Warning: GOOGLE_API_KEY environment variable is not set!")
        print("Please set your Google API key in the .env file")
    
    uvicorn.run(app, host="127.0.0.1", port=8000)
