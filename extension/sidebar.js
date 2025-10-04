let currentUrl = '';

const API_URL_ENDPOINT = 'http://127.0.0.1:8000/api/setup-url';
const API_QUESTION_ENDPOINT = 'http://127.0.0.1:8000/api/ask-question';

function addMessage(text, isUser) {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message');
  messageDiv.classList.add(isUser ? 'user-message' : 'bot-message');
  messageDiv.textContent = text;

  const chatMessages = document.getElementById('chat-messages');
  chatMessages.appendChild(messageDiv);

  chatMessages.scrollTop = chatMessages.scrollHeight;
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
      throw new Error('Failed to send URL to backend');
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
      throw new Error('Failed to get answer from backend');
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

  addMessage('Thinking...', false);

  const response = await sendQuestionToBackend(question);

  const chatMessages = document.getElementById('chat-messages');
  chatMessages.removeChild(chatMessages.lastChild);

  if (response.error) {
    addMessage('Sorry, there was an error processing your request.', false);
  } else {
    addMessage(response.answer || 'No answer provided', false);
  }
}

async function handleSendUrl() {
  const sendUrlButton = document.getElementById('send-url-button');
  sendUrlButton.disabled = true;
  sendUrlButton.textContent = 'Sending...';

  try {
    const response = await sendUrlToBackend(currentUrl);
    if (response.error) {
      addMessage('Error connecting to the chatbot. Please try again.', false);
    } else {
      addMessage('Hello! I can answer questions about this page. What would you like to know?', false);
    }
  } catch (error) {
    addMessage('Error connecting to the chatbot. Please try again.', false);
  } finally {
    sendUrlButton.disabled = false;
    sendUrlButton.textContent = 'Send URL to Chatbot';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('send-button').addEventListener('click', handleSendQuestion);

  document.getElementById('send-url-button').addEventListener('click', handleSendUrl);

  document.getElementById('user-input').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      handleSendQuestion();
    }
  });

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    const currentTab = tabs[0];
    if (currentTab && currentTab.url) {
      currentUrl = currentTab.url;
      addMessage('Click the "Send URL to Chatbot" button to start the conversation.', false);
    } else {
      addMessage('Could not retrieve the current page URL.', false);
    }
  });
});
