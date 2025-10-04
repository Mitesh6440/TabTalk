from langchain_community.document_loaders import WebBaseLoader, UnstructuredURLLoader
import re

def extract_text_from_url(url: str) -> str:
    """Extract webpage text using WebBaseLoader, fallback to UnstructuredURLLoader."""
    if not url or not url.strip():
        raise ValueError("URL cannot be empty")
    
    # Basic URL validation
    url_pattern = re.compile(
        r'^https?://'  # http:// or https://
        r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
        r'localhost|'  # localhost...
        r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
        r'(?::\d+)?'  # optional port
        r'(?:/?|[/?]\S+)$', re.IGNORECASE)
    
    if not url_pattern.match(url):
        raise ValueError("Invalid URL format")
    
    try:
        loader = WebBaseLoader(url)
        docs = loader.load()
    except Exception as e1:
        try:
            loader = UnstructuredURLLoader(urls=[url])
            docs = loader.load()
        except Exception as e2:
            raise RuntimeError(f"Failed to load content from URL. WebBaseLoader error: {str(e1)}. UnstructuredURLLoader error: {str(e2)}")

    if not docs:
        raise ValueError("No content could be extracted from the URL")
    
    text = " ".join([doc.page_content for doc in docs if doc.page_content])
    
    if not text or not text.strip():
        raise ValueError("No text content found in the webpage")
    
    return text
