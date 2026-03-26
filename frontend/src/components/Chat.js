// ─── Floating Chat Component (Gemini-powered) ─────────────────────────────
const CHAT_LANG_STRINGS = {
  en: { welcome: "Hello! I'm here to listen. How are you feeling today?", status: 'Here to listen', placeholder: 'Share your thoughts...' },
  pidgin: { welcome: "Hey! I dey here to listen. Wetin dey happen with you today?", status: 'I dey here for you', placeholder: 'Talk am to me...' },
  yoruba: { welcome: "Ẹ káàbọ̀! Mo wa níbi láti gbọ́ ọ. Báwo ni o ṣe rí?", status: 'Mo wa níbẹ fun ọ', placeholder: 'Pin imọ rẹ...' },
  igbo: { welcome: "Nnọọ! Anọ m ebe a ịgear gị. Kedu ka ọ si dị?", status: 'Anọ m ebe a', placeholder: 'Kọọ m ihe ọ bụ...' },
  hausa: { welcome: "Salam! Ina nan don sauraren ku. Yaya kake jin yau?", status: 'Ina nan gare ku', placeholder: 'Raba tunaninka...' },
};

import { sendToGemini, resetChat } from '../lib/gemini.js';
import { state } from '../lib/state.js';

export function renderChat() {
  return `
    <!-- AI Chat Bot -->
    <button class="chat-button" id="chatButton">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    </button>

    <div class="chat-window" id="chatWindow">
        <div class="chat-header">
            <div class="chat-avatar">🌿</div>
            <div>
                <div class="chat-title">MindWell AI Guide</div>
                <div class="chat-subtitle" id="chatStatus">Here to listen</div>
            </div>
            <button class="chat-head-close" id="chatClose" style="background:none;border:none;color:white;cursor:pointer;font-size:1.2rem;margin-left:auto">✕</button>
        </div>

        <div class="chat-messages" id="chatMessages">
            <div class="message bot">
                <div class="message-bubble" id="welcomeMessage">Hello! I'm here to listen. How are you feeling today?</div>
            </div>
        </div>

        <div class="chat-indicator hidden" id="typingIndicator">
            <span class="chat-dot"></span>
            <span class="chat-dot" style="animation-delay: 0.2s;"></span>
            <span class="chat-dot" style="animation-delay: 0.4s;"></span>
        </div>

        <form class="chat-input-form" id="chatForm">
            <input type="text" class="chat-input" id="chatInput" placeholder="Share your thoughts..." autocomplete="off">
            <button type="submit" class="chat-send" id="chatSend" disabled>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
            </button>
        </form>
    </div>
  `;
}

export function initChat() {
  const fab = document.getElementById('chatButton');
  const panel = document.getElementById('chatWindow');
  const closeBtn = document.getElementById('chatClose');
  const form = document.getElementById('chatForm');
  const input = document.getElementById('chatInput');
  const send = document.getElementById('chatSend');
  const body = document.getElementById('chatMessages');
  const typing = document.getElementById('typingIndicator');
  const sub = document.getElementById('chatStatus');

  // Apply initial language strings
  function applyChatLanguage() {
    const lang = state.lang || 'en';
    const s = CHAT_LANG_STRINGS[lang] || CHAT_LANG_STRINGS.en;
    if (sub) sub.textContent = s.status;
    if (input) input.placeholder = s.placeholder;
    const welcomeEl = document.getElementById('welcomeMessage');
    if (welcomeEl) welcomeEl.textContent = s.welcome;
  }

  applyChatLanguage();

  // Re-apply when language changes
  window.addEventListener('languageChanged', applyChatLanguage);

  let isOpen = false;

  fab?.addEventListener('click', () => {
    isOpen = !isOpen;
    panel.classList.toggle('open', isOpen);
    if (isOpen) input?.focus();
  });

  closeBtn?.addEventListener('click', () => {
    isOpen = false;
    panel.classList.remove('open');
  });

  input?.addEventListener('input', () => {
    send.disabled = !input.value.trim();
  });

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const msg = input.value.trim();
    if (!msg) return;

    // User bubble
    appendMsg('user', msg);
    input.value = '';
    send.disabled = true;

    // Typing indicator
    typing.classList.remove('hidden');
    const thinkingLang = (state.lang || 'en');
    sub.textContent = thinkingLang === 'pidgin' ? 'E dey think...' :
      thinkingLang === 'yoruba' ? 'O n ronú...' :
        thinkingLang === 'igbo' ? 'O na-eche...' :
          thinkingLang === 'hausa' ? 'Yana tunani...' :
            'Thinking...';
    scrollChat();

    try {
      const reply = await sendToGemini(msg, {
        lastAssessment: state.lastAssessment,
        lang: state.lang
      });
      typing.classList.add('hidden');
      const doneStrings = CHAT_LANG_STRINGS[state.lang || 'en'] || CHAT_LANG_STRINGS.en;
      sub.textContent = doneStrings.status;
      appendMsg('bot', reply);
    } catch {
      typing.classList.add('hidden');
      const doneStrings = CHAT_LANG_STRINGS[state.lang || 'en'] || CHAT_LANG_STRINGS.en;
      sub.textContent = doneStrings.status;
      appendMsg('bot', "I'm having trouble connecting right now. Please try again in a moment.");
    }
  });

  // Escape to close
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) {
      isOpen = false;
      panel.classList.remove('open');
    }
  });
}

function appendMsg(role, text) {
  const body = document.getElementById('chatMessages');
  if (!body) return;
  const div = document.createElement('div');
  div.className = `message ${role}`;
  // Format: convert **bold**, newlines, and escape HTML
  const safe = escapeHtml(text);
  const formatted = safe
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');
  div.innerHTML = `<div class="message-bubble">${formatted}</div>`;
  body.appendChild(div);
  scrollChat();
}

function scrollChat() {
  const body = document.getElementById('chatMessages');
  if (body) setTimeout(() => body.scrollTop = body.scrollHeight, 50);
}

function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}
