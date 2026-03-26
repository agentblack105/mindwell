// ─── Header Component ─────────────────────────────────────────────────────
import { state } from '../lib/state.js';
import { router } from '../lib/router.js';
import { initLanguage, translateUI } from '../lib/language.js';
import { resetChat } from '../lib/gemini.js';

export function renderHeader() {
  return `
    <header class="header">
        <div class="logo-container" id="logo-home">
            <div class="logo">
                <svg viewBox="0 0 24 24" fill="none">
                    <path
                        d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                        fill="currentColor" />
                    <path
                        d="M12 6C8.69 6 6 8.69 6 12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12C18 8.69 15.31 6 12 6ZM12 16C9.79 16 8 14.21 8 12C8 9.79 9.79 8 12 8C14.21 8 16 9.79 16 12C16 14.21 14.21 16 12 16Z"
                        fill="currentColor" />
                </svg>
            </div>
            <span class="logo-text" id="logoText">MindWell NG</span>
        </div>

        <!-- User Info -->
        <div class="user-info" id="userInfo" style="display: none;">
            <span class="welcome-text" id="welcomeUser"></span>
            <button class="logout-btn" id="logoutBtn">Logout</button>
        </div>

        <!-- Language Selector -->
        <div class="lang-selector" id="langSelector">
            <button class="lang-button" id="langButton">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="2" y1="12" x2="22" y2="12" />
                    <path
                        d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
                <span id="selectedLang">English</span>
                <svg class="chevron" id="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                    width="14" height="14">
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            <div class="lang-dropdown" id="langDropdown">
                <button class="lang-option active" data-lang="en">English</button>
                <button class="lang-option" data-lang="pidgin">Pidgin</button>
                <button class="lang-option" data-lang="yoruba">Yoruba</button>
                <button class="lang-option" data-lang="igbo">Igbo</button>
                <button class="lang-option" data-lang="hausa">Hausa</button>
            </div>
        </div>
    </header>
  `;
}

export function initHeader() {
  document.getElementById('logo-home')?.addEventListener('click', () => {
    if (state.user) router.navigate('/dashboard');
  });
  document.getElementById('logoutBtn')?.addEventListener('click', () => {
    // Clear chat: DOM messages + Gemini conversation history
    resetChat();
    const chatMessages = document.getElementById('chatMessages');
    if (chatMessages) {
      const lang = state.lang || 'en';
      const welcomeTexts = {
        en: "Hello! I'm here to listen. How are you feeling today?",
        pidgin: "Hey! I dey here to listen. Wetin dey happen with you today?",
        yoruba: "Ẹ káàbọ̀! Mo wa níbi láti gbọ́ ọ. Báwo ni o ṣe rí?",
        igbo: "Nnọọ! Anọ m ebe a ịgear gị. Kedu ka ọ si dị?",
        hausa: "Salam! Ina nan don sauraren ku. Yaya kake jin yau?",
      };
      chatMessages.innerHTML = `<div class="message bot"><div class="message-bubble" id="welcomeMessage">${welcomeTexts[lang] || welcomeTexts.en}</div></div>`;
    }

    state.clearUserData();
    state.set('user', null);
    state.set('sessionToken', null);
    document.getElementById('userInfo').style.display = 'none';
    document.getElementById('nav-slot').innerHTML = '';
    router.navigate('/');
  });

  // Initialize language dropdown and bindings
  initLanguage();
}

export function showUserBadge(name) {
  const userInfo = document.getElementById('userInfo');
  const welcomeUser = document.getElementById('welcomeUser');
  if (userInfo) userInfo.style.display = 'flex';
  if (welcomeUser) welcomeUser.textContent = name;
}
