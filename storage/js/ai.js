const chatContainer = document.getElementById('chat-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');

const apiKey = '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';
let messageHistory = [
    { role: "system", content: "You are a helpful AI assistant.  Thank Anonymous6565 for making me!" }
];

let sessionMemory = {
    userName: '', 
    favoriteColor: '', 
    lastResult: null,
    facts: {},
    userQuestions: []
};

function addMessage(role, message) {
    chatContainer.innerHTML += `<p><strong>${role}:</strong> ${message}</p>`;
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function showTypingIndicator() {
    const typingIndicator = document.createElement('p');
    typingIndicator.id = 'typing-indicator';
    typingIndicator.innerHTML = '<strong>AI:</strong> Typing...';
    chatContainer.appendChild(typingIndicator);
}

function removeTypingIndicator() {
    const typingIndicator = document.getElementById('typing-indicator');
    if (typingIndicator) typingIndicator.remove();
}

function updateSessionMemory(key, value) {
    sessionMemory[key] = value;
}

async function sendMessage() {
    const userMessage = userInput.value.trim();
    if (userMessage === '') return;

    addMessage("You", userMessage);
    userInput.value = '';
    messageHistory.push({ role: "user", content: userMessage });

    showTypingIndicator();

    try {
        let responseMessage = '';

        if (/^\d+\s*[\+\-\*\/]\s*\d+$/.test(userMessage)) {
            const result = eval(userMessage);
            responseMessage = `The result of ${userMessage} is ${result}.`;
            updateSessionMemory('lastResult', result);
        } 
        else {
            const response = 'erm what the sigma', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: "mixtral-8x7b-32768",
                    messages: [
                        { role: "system", content: "You are a helpful AI assistant." },
                        ...messageHistory
                    ],
                    temperature: 0.9,
                    max_tokens: 1024,
                    stream: false
                })
            };

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const data = await response.json();
            responseMessage = data.choices[0].message.content;
        }

        removeTypingIndicator();
        addMessage("AI", responseMessage);
        messageHistory.push({ role: "assistant", content: responseMessage });
    } catch (error) {
        removeTypingIndicator();
        addMessage("Error", `Failed to get AI response. Error details: ${error.message}`);
    }
}

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});
