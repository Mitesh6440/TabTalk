from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
import os

def generate_answer(context: str, question: str) -> str:
    """Use Gemini model to generate answer based on context and question."""
    if not context or not context.strip():
        raise ValueError("Context cannot be empty")
    
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")
    
    # Check if Google API key is available
    if not os.getenv("GOOGLE_API_KEY"):
        raise ValueError("GOOGLE_API_KEY environment variable is required")
    
    try:
        model = ChatGoogleGenerativeAI(model="gemini-2.5-pro")

        prompt = PromptTemplate.from_template("""
You are an intelligent assistant. Use the following webpage content to answer the user's question clearly and concisely.

Webpage Context:
{context}

Question: {question}

Answer:
""")

        final_prompt = prompt.format(context=context, question=question)
        response = model.invoke(final_prompt)

        return response.content
    except Exception as e:
        raise RuntimeError(f"Failed to generate answer: {str(e)}")
