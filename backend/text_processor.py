from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import FAISS
from langchain_google_genai import GoogleGenerativeAIEmbeddings
import os

def split_text_into_chunks(text: str):
    """Split long text into manageable document chunks."""
    if not text or not text.strip():
        raise ValueError("Text cannot be empty")
    
    splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
    return splitter.create_documents([text])

def create_vectorstore(docs):
    """Create FAISS vectorstore from document chunks."""
    if not docs:
        raise ValueError("No documents provided for vectorstore creation")
    
    # Check if Google API key is available
    if not os.getenv("GOOGLE_API_KEY"):
        raise ValueError("GOOGLE_API_KEY environment variable is required")
    
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")
        vectorstore = FAISS.from_documents(docs, embeddings)
        return vectorstore
    except Exception as e:
        raise RuntimeError(f"Failed to create vectorstore: {str(e)}")
