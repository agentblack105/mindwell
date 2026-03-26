// ============================================================================
// CHAT FUNCTIONS - AI Chat Bot Interface (Backend-Connected)
// ============================================================================

const API_BASE = 'http://localhost:8000/api/v1';

// Backend session state
let sessionToken = null;
let chatSessionId = null;

// DOM Elements
const chatButton = document.getElementById('chatButton');
const chatWindow = document.getElementById('chatWindow');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');
const chatMessages = document.getElementById('chatMessages');
const typingIndicator = document.getElementById('typingIndicator');

// ─── Backend session management ──────────────────────────────────────────────

async function ensureBackendSession() {
    if (sessionToken) return sessionToken;
    try {
        const lang = currentLang === 'pidgin' ? 'pcm' : currentLang;
        const res = await fetch(`${API_BASE}/sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ language: lang })
        });
        if (!res.ok) throw new Error('Session creation failed');
        const data = await res.json();
        sessionToken = data.session_token;

        // Record consent
        await fetch(`${API_BASE}/sessions/consent`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': sessionToken
            },
            body: JSON.stringify({ policy_version: '1.0' })
        });

        return sessionToken;
    } catch (err) {
        console.error('Backend session error:', err);
        return null;
    }
}

async function ensureChatSession() {
    if (chatSessionId) return chatSessionId;
    const token = await ensureBackendSession();
    if (!token) return null;
    try {
        const res = await fetch(`${API_BASE}/chats/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            }
        });
        if (!res.ok) throw new Error('Chat session creation failed');
        const data = await res.json();
        chatSessionId = data.id;
        return chatSessionId;
    } catch (err) {
        console.error('Chat session error:', err);
        return null;
    }
}

// ─── Send message to backend ──────────────────────────────────────────────

async function sendMessageToBackend(message) {
    const csId = await ensureChatSession();
    const token = sessionToken;
    if (!csId || !token) return getFallbackResponse(message);

    try {
        const lang = currentLang === 'pidgin' ? 'pcm' : currentLang;
        const res = await fetch(`${API_BASE}/chats/${csId}/message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Session-Token': token
            },
            body: JSON.stringify({
                role: 'user',
                content: message,
                language: lang
            })
        });
        if (!res.ok) throw new Error(`Chat API error ${res.status}`);
        const data = await res.json();
        // The API returns an array of [user_msg, ai_msg]
        if (Array.isArray(data) && data.length >= 2) {
            return data[1].content;
        }
        // If it returns an object with messages
        if (data.messages && data.messages.length >= 2) {
            return data.messages[data.messages.length - 1].content;
        }
        return data.content || getFallbackResponse(message);
    } catch (err) {
        console.error('Chat send error:', err);
        return getFallbackResponse(message);
    }
}

// ─── Rich fallback (when backend is unavailable) ─────────────────────────

function getFallbackResponse(message) {
    const lower = message.toLowerCase();
    const t = translations[currentLang]?.aiResponses;

    // Crisis keywords — always take priority
    const crisisWords = ['suicide', 'kill myself', 'die', 'end my life', 'self harm', 'hurt myself', 'no reason to live'];
    if (crisisWords.some(w => lower.includes(w))) {
        return "⚠️ I'm concerned about what you've shared. You are not alone. Please reach out to a crisis helpline immediately:\n\n📞 Lagos: 0800 111 6264\n📞 National: 0800 800 2000\n📞 MANI: 0809 111 6264\n\nYour life matters. Someone is ready to listen right now.";
    }

    // Emotional keywords — varied, empathetic responses
    if (lower.includes('sad') || lower.includes('depressed') || lower.includes('unhappy') || lower.includes('down') || lower.includes('low')) {
        const responses = [
            "I hear you, and I want you to know that feeling this way is valid. Depression can feel overwhelming, but it doesn't define you. Would you like to take a quick PHQ-9 screening to better understand what you're experiencing?",
            "Thank you for sharing that with me. Sadness can be heavy to carry alone. Some things that might help: talking to someone you trust, gentle physical activity, or even just acknowledging how you feel — like you're doing now. Want to explore some coping strategies?",
            "I'm sorry you're feeling this way. You've taken a brave step by talking about it. Remember, seeking help is a sign of strength, not weakness. Would you like me to show you some resources near you?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lower.includes('anxious') || lower.includes('worry') || lower.includes('panic') || lower.includes('nervous') || lower.includes('scared') || lower.includes('fear')) {
        const responses = [
            "Anxiety can feel like a storm inside, but storms do pass. Let me share a quick grounding exercise: Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, and 1 you can taste. This can help bring you back to the present moment.",
            "I understand that anxiety can be really difficult. You're not alone in this. Would you like to take a GAD-7 screening? It can help you understand your anxiety levels better, and I can suggest some helpful techniques.",
            "Living with worry is exhausting. Have you tried deep breathing? Breathe in for 4 seconds, hold for 7, and breathe out for 8. Doing this 3-4 times can help calm your nervous system. Would you like more coping tips?"
        ];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    if (lower.includes('sleep') || lower.includes('tired') || lower.includes('insomnia') || lower.includes('exhausted')) {
        return "Sleep difficulties often signal that something deeper needs attention. Try this tonight: avoid screens 1 hour before bed, keep your room cool and dark, and try a body scan meditation. If sleep problems persist for more than 2 weeks, it might be worth speaking with a professional. Would you like to take a quick screening?";
    }

    if (lower.includes('angry') || lower.includes('frustrated') || lower.includes('upset') || lower.includes('annoyed')) {
        return "It's completely okay to feel angry — anger is a natural emotion. What matters is how we process it. Some helpful approaches: take a few deep breaths before responding, step away from the situation briefly, write down what's bothering you, or try physical activity. Would you like to talk about what's causing these feelings?";
    }

    if (lower.includes('lonely') || lower.includes('alone') || lower.includes('isolated') || lower.includes('no friends')) {
        return "Loneliness can be one of the most painful experiences. But remember — you're reaching out right now, and that takes courage. In Nigeria, there are support communities like MANI (Mentally Aware Nigeria Initiative) that offer virtual support groups. You're not as alone as you might feel. Want me to connect you with some resources?";
    }

    if (lower.includes('breakup') || lower.includes('broke up') || lower.includes('girlfriend') || lower.includes('boyfriend') || lower.includes('relationship') || lower.includes('heartbreak')) {
        return "Heartbreak is real grief, and it's okay to feel the weight of it. Give yourself permission to feel these emotions without judgment. Some things that might help: lean on friends or family, maintain your routines, avoid making big decisions right now, and be patient with yourself. Healing isn't linear. Would you like to talk more about what you're going through?";
    }

    if (lower.includes('stress') || lower.includes('overwhelmed') || lower.includes('pressure') || lower.includes('too much')) {
        return "When everything feels like too much, it helps to break things down. Try this: write down everything on your mind, then circle just the ONE thing you can do something about today. You don't have to solve everything at once. Would you like to explore some stress management techniques?";
    }

    if (lower.includes('happy') || lower.includes('good') || lower.includes('great') || lower.includes('better') || lower.includes('fine') || lower.includes('okay')) {
        return "That's wonderful to hear! 😊 Maintaining good mental health is just as important as addressing challenges. Keep doing what works for you — whether that's connecting with loved ones, staying active, or taking time for yourself. Is there anything specific you'd like to explore or learn about today?";
    }

    if (lower.includes('help') || lower.includes('resource') || lower.includes('therapist') || lower.includes('counselor') || lower.includes('doctor')) {
        return "I'd love to help you find support! Here are some options:\n\n🏥 Lagos: Federal Neuro-Psychiatric Hospital Yaba — 0802 307 6932\n📞 Crisis Hotline: 0800 111 6264 (24/7)\n🤝 MANI Support: 0809 111 6264\n📧 info@mentallyaware.org\n\nYou can also check the Resources tab for more options filtered by state. Would you like help with anything else?";
    }

    if (lower.includes('result') || lower.includes('score') || lower.includes('assessment') || lower.includes('test')) {
        if (lastAssessment) {
            return `Based on your recent ${lastAssessment.type.toUpperCase()} assessment, you scored ${lastAssessment.score}/${lastAssessment.maxScore}, which indicates a "${lastAssessment.riskLabel}" level. ${lastAssessment.message}\n\nRemember, this is a screening tool, not a diagnosis. If you have concerns, please speak with a mental health professional. Would you like to take another assessment or discuss your results?`;
        }
        return "You haven't taken any assessments yet. Would you like to try one? We offer PHQ-9 (depression screening) and GAD-7 (anxiety screening). They only take a few minutes and can give you helpful insights. Just head to the Screening tab!";
    }

    if (lower.includes('thank')) {
        return "You're very welcome! Remember, taking care of your mental health is one of the most important things you can do. I'm always here whenever you need to talk. Take care of yourself! 💚";
    }

    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('good morning') || lower.includes('good evening')) {
        const greetings = [
            "Hello! 👋 Welcome to MindWell. I'm here to listen and support you. How are you feeling today?",
            "Hi there! It's great that you're here. Whether you want to chat, take a mental health screening, or find resources — I'm here for you. What's on your mind?",
            "Hey! Welcome. This is a safe space where you can share whatever you're feeling. No judgments, just support. How can I help you today?"
        ];
        return greetings[Math.floor(Math.random() * greetings.length)];
    }

    // Money, irrelevant, or off-topic
    if (lower.includes('money') || lower.includes('send me') || lower.includes('bitcoin') || lower.includes('lottery')) {
        return "I appreciate your message! I'm a mental health support assistant, so I'm best equipped to help with emotional wellbeing, mental health questions, and connecting you with professional resources. Is there anything related to your mental health or wellbeing I can help with today?";
    }

    // Default — engaging and open-ended
    const defaults = [
        "Thank you for sharing. I'd love to understand more about what you're going through. Could you tell me a bit more about how you've been feeling lately?",
        "I appreciate you opening up. Mental health is a journey, and every conversation matters. What's been on your mind recently?",
        "I'm here for you. Sometimes just talking things through can help bring clarity. Would you like to tell me more about what's going on, or would you prefer to try one of our screening tools?"
    ];
    return defaults[Math.floor(Math.random() * defaults.length)];
}

// ─── Toggle chat window ──────────────────────────────────────────────────

if (chatButton) {
    chatButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (chatWindow) chatWindow.classList.toggle('open');

        if (chatWindow && chatWindow.classList.contains('open')) {
            chatButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
            `;
            // Start backend session in background when chat opens
            ensureBackendSession();
        } else {
            chatButton.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
            `;
        }
    });
}

// Enable/disable send button
if (chatInput) {
    chatInput.addEventListener('input', () => {
        if (chatSend) chatSend.disabled = !chatInput.value.trim();
    });
}

// ─── Handle message submission ─────────────────────────────────────────────

if (chatForm) {
    chatForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const message = chatInput?.value.trim();
        if (!message) return;

        addUserMessage(message);
        if (chatInput) chatInput.value = '';
        if (chatSend) chatSend.disabled = true;

        showTypingIndicator();
        updateChatStatus('Thinking...');

        try {
            const response = await sendMessageToBackend(message);
            hideTypingIndicator();
            updateChatStatus('Here to listen');
            addBotMessage(response);
        } catch (err) {
            hideTypingIndicator();
            updateChatStatus('Here to listen');
            addBotMessage(getFallbackResponse(message));
        }
    });
}

// ─── UI helpers ─────────────────────────────────────────────────────────

function showTypingIndicator() {
    if (typingIndicator) typingIndicator.classList.remove('hidden');
    scrollToBottom();
}

function hideTypingIndicator() {
    if (typingIndicator) typingIndicator.classList.add('hidden');
}

function updateChatStatus(text) {
    const el = document.getElementById('chatStatus');
    if (el) el.textContent = text;
}

function addUserMessage(text) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message user';
    messageDiv.innerHTML = `<div class="message-bubble">${escapeHtml(text)}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function addBotMessage(text) {
    if (!chatMessages) return;
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message bot';
    // Convert newlines to <br> for formatting
    const formatted = escapeHtml(text).replace(/\n/g, '<br>');
    messageDiv.innerHTML = `<div class="message-bubble">${formatted}</div>`;
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
}

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function scrollToBottom() {
    if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
}

// ─── Open chat with assessment context ──────────────────────────────────

function openChatWithContext() {
    if (!chatWindow || !chatMessages) return;

    chatWindow.classList.add('open');

    if (chatButton) {
        chatButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
        `;
    }

    // Clear previous messages
    while (chatMessages.children.length > 1) {
        chatMessages.removeChild(chatMessages.lastChild);
    }

    // Update welcome message
    const welcomeMsg = chatMessages.querySelector('.message.bot');
    if (welcomeMsg) {
        const t = translations[currentLang];
        welcomeMsg.innerHTML = `<div class="message-bubble">${t?.welcomeMessage || "Hello! I'm here to listen. How are you feeling today?"}</div>`;
    }

    // Add contextual response based on assessment
    setTimeout(() => {
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            let response;
            if (lastAssessment) {
                if (lastAssessment.riskLevel === 'Low') {
                    response = `Great news! Your ${lastAssessment.type.toUpperCase()} results show minimal severity (${lastAssessment.score}/${lastAssessment.maxScore}). Keep taking care of yourself! Is there anything else you'd like to discuss?`;
                } else if (lastAssessment.riskLevel === 'Moderate' || lastAssessment.riskLevel === 'Moderately Severe') {
                    response = `I've reviewed your ${lastAssessment.type.toUpperCase()} results (${lastAssessment.score}/${lastAssessment.maxScore}). The score suggests you may be experiencing some challenges. I'd recommend speaking with a mental health professional. Would you like me to help you find resources near you?`;
                } else if (lastAssessment.riskLevel === 'Severe') {
                    response = `Thank you for completing the ${lastAssessment.type.toUpperCase()} screening. Your score of ${lastAssessment.score}/${lastAssessment.maxScore} suggests you may be going through a very difficult time. Please know that help is available.\n\n📞 Crisis Hotline: 0800 111 6264\n🏥 Yaba Neuro-Psychiatric Hospital: 0802 307 6932\n\nWould you like to talk about what you're experiencing?`;
                }
            } else {
                response = "I see you've just finished an assessment. How are you feeling about the process? Is there anything you'd like to discuss?";
            }
            addBotMessage(response);
        }, 1200);
    }, 400);
}