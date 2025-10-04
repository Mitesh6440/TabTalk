let currentUrl = '';
let lastProcessedUrl = '';

const API_URL_ENDPOINT = 'http://127.0.0.1:8000/api/setup-url';
const API_QUESTION_ENDPOINT = 'http://127.0.0.1:8000/api/ask-question';

function addMessage(text, isUser) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
  
  if (isUser) {
    // User messages remain as plain text
    messageDiv.textContent = text;
  } else {
    // AI messages get markdown rendering
    messageDiv.innerHTML = renderMarkdown(text);
  }

  const chatMessages = document.getElementById('chat-messages');
  chatMessages.appendChild(messageDiv);

  // Smooth scroll to bottom
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: 'smooth'
  });
}

function renderMarkdown(text) {
  // Convert markdown to HTML
  let html = text
    // Bold text **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    
    // Italic text *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    
    // Code `code`
    .replace(/`(.*?)`/g, '<code>$1</code>')
    
    // Line breaks
    .replace(/\n/g, '<br>');
  
  // Handle bullet points and lists
  const lines = html.split('<br>');
  const processedLines = [];
  let inList = false;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Check for bullet points
    if (line.match(/^\* (.+)$/) || line.match(/^- (.+)$/)) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      const content = line.replace(/^[\*-] (.+)$/, '$1');
      processedLines.push(`<li>${content}</li>`);
    }
    // Check for numbered lists
    else if (line.match(/^\d+\. (.+)$/)) {
      if (!inList) {
        processedLines.push('<ul>');
        inList = true;
      }
      const content = line.replace(/^\d+\. (.+)$/, '$1');
      processedLines.push(`<li>${content}</li>`);
    }
    // Regular line
    else {
      if (inList) {
        processedLines.push('</ul>');
        inList = false;
      }
      processedLines.push(line);
    }
  }
  
  // Close any open list
  if (inList) {
    processedLines.push('</ul>');
  }
  
  return processedLines.join('<br>');
}

function showTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  typingIndicator.style.display = 'flex';
  
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.scrollTo({
    top: chatMessages.scrollHeight,
    behavior: 'smooth'
  });
}

function hideTypingIndicator() {
  const typingIndicator = document.getElementById('typing-indicator');
  typingIndicator.style.display = 'none';
}

function clearChatMessages() {
  const chatMessages = document.getElementById('chat-messages');
  chatMessages.innerHTML = '';
}

function updateCurrentUrl() {
  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url) {
      const newUrl = currentTab.url;
      
      // Check if URL has changed
      if (newUrl !== currentUrl) {
        currentUrl = newUrl;
        
        // Clear chat messages when URL changes
        clearChatMessages();
        
        // Check if URL is accessible (not chrome:// or file://)
        if (currentUrl.startsWith('http://') || currentUrl.startsWith('https://')) {
          // Automatically setup the page
          autoSetupPage();
        } else {
          addMessage('This page cannot be processed. Please navigate to a regular webpage (http/https).', false);
        }
      }
    } else {
      addMessage('Could not retrieve the current page URL.', false);
    }
  });
}

async function autoSetupPage() {
  // Show that we're processing the page
  addMessage('🔄 Processing page...', false);
  
  try {
    // Check if this is a different URL than what was last processed
    if (currentUrl !== lastProcessedUrl) {
      lastProcessedUrl = currentUrl;
    }

    const response = await sendUrlToBackend(currentUrl);
    
    if (response.error) {
      addMessage('❌ Error processing this page. Please try refreshing the page.', false);
    } else {
      addMessage('✅ Page processed successfully! You can now ask questions about this page.', false);
    }
  } catch (error) {
    addMessage('❌ Error processing this page. Please try refreshing the page.', false);
  }
}

async function sendUrlToBackend(url) {
  try {
    const response = await fetch(API_URL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error sending URL to backend:', error);
    return { error: error.message };
  }
}

async function sendQuestionToBackend(question) {
  try {
    const response = await fetch(API_QUESTION_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        question, 
        url: currentUrl 
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting answer from backend:', error);
    return { error: error.message };
  }
}

async function handleSendQuestion() {
  const userInput = document.getElementById('user-input');
  const question = userInput.value.trim();

  if (!question) return;

  addMessage(question, true);
  userInput.value = '';

  // Show typing indicator instead of "Thinking..." message
  showTypingIndicator();

  const response = await sendQuestionToBackend(question);

  // Hide typing indicator
  hideTypingIndicator();

  if (response.error) {
    addMessage('Sorry, there was an error processing your request.', false);
  } else {
    addMessage(response.answer || 'No answer provided', false);
  }
}


document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('send-button').addEventListener('click', handleSendQuestion);

  document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSendQuestion();
    }
  });

  // Update URL and check for changes when extension loads
  updateCurrentUrl();
  
  // Add a refresh mechanism to detect URL changes
  // This will help when user navigates to a new page while extension is open
  setInterval(updateCurrentUrl, 1000); // Check for URL changes every second
});
