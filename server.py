from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Optional

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



url_data: Dict[str, str] = {}

@app.post("/api/setup-url")
async def setup_url(request: URLRequest):
    return handle_url(request.url)

@app.post("/api/ask-question")
async def ask_question(request: QuestionRequest):
    return handle_question(request.question, request.url)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)