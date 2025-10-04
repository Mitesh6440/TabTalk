def get_relevant_docs(vectorstore, question: str, k: int = 4):
    """Retrieve top-k relevant documents from vectorstore."""
    if not vectorstore:
        raise ValueError("Vectorstore cannot be None")
    
    if not question or not question.strip():
        raise ValueError("Question cannot be empty")
    
    if k <= 0:
        raise ValueError("k must be a positive integer")
    
    try:
        retriever = vectorstore.as_retriever(search_kwargs={"k": k})
        relevant_docs = retriever.get_relevant_documents(question)
        
        if not relevant_docs:
            raise ValueError("No relevant documents found")
        
        context = "\n\n".join([doc.page_content for doc in relevant_docs if doc.page_content])
        
        if not context or not context.strip():
            raise ValueError("No relevant content found in retrieved documents")
        
        return relevant_docs, context
    except Exception as e:
        raise RuntimeError(f"Failed to retrieve relevant documents: {str(e)}")
