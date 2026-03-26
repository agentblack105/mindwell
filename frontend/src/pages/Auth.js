// ─── Auth Page ────────────────────────────────────────────────────────────
import { state } from '../lib/state.js';
import { api } from '../lib/api.js';
import { router } from '../lib/router.js';
import { mountNav } from '../components/Nav.js';
import { showUserBadge } from '../components/Header.js';
import { translations } from '../data/translations/index.js';

// ─── Simple password hashing (SHA-256) ────────────────────────────────────
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// ─── Credential store (localStorage) ──────────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem('mw-users') || '{}');
}

function saveUsers(users) {
  localStorage.setItem('mw-users', JSON.stringify(users));
}

// ─── Page ─────────────────────────────────────────────────────────────────
export function AuthPage(container) {
  const t = translations[state.lang] || translations.en;

  container.innerHTML = `
        <div id="authSection" class="container">
            <div class="auth-card">
                <div class="auth-tabs">
                    <button class="auth-tab active" id="loginTab">${t.loginTab}</button>
                    <button class="auth-tab" id="signupTab">${t.signupTab}</button>
                </div>

                <!-- Login Form -->
                <form id="loginForm" class="auth-form">
                    <h2 class="auth-title" id="loginTitle">${t.loginTitle}</h2>
                    <p class="auth-subtitle" id="loginSubtitle">${t.loginSubtitle}</p>

                    <div class="form-group">
                        <label for="loginUsername" id="loginUsernameLabel">${t.loginUsernameLabel}</label>
                        <input type="text" id="loginUsername" class="auth-input" placeholder="${t.loginUsernamePlaceholder}" required>
                    </div>

                    <div class="form-group">
                        <label for="loginPassword" id="loginPasswordLabel">${t.loginPasswordLabel}</label>
                        <input type="password" id="loginPassword" class="auth-input" placeholder="${t.loginPasswordPlaceholder}" required>
                    </div>

                    <div id="loginError" class="auth-error" style="display:none"></div>

                    <div class="privacy-note" id="loginPrivacyNote">
                        <small>${t.loginPrivacyNote}</small>
                    </div>

                    <button type="submit" class="auth-btn" id="loginBtn">${t.loginBtn}</button>

                    <p class="auth-switch">
                        <span id="loginSwitchPrompt">${t.loginSwitchPrompt}</span>
                        <a href="#" id="switchToSignup"><span id="loginSwitchAction">${t.loginSwitchAction}</span></a>
                    </p>
                </form>

                <!-- Signup Form -->
                <form id="signupForm" class="auth-form hidden">
                    <h2 class="auth-title" id="signupTitle">${t.signupTitle}</h2>
                    <p class="auth-subtitle" id="signupSubtitle">${t.signupSubtitle}</p>

                    <div class="form-group">
                        <label for="signupUsername" id="signupUsernameLabel">${t.signupUsernameLabel}</label>
                        <input type="text" id="signupUsername" class="auth-input" placeholder="${t.signupUsernamePlaceholder}" required minlength="3">
                        <small class="field-hint" id="signupUsernameHint">${t.signupUsernameHint}</small>
                    </div>

                    <div class="form-group">
                        <label for="signupPassword" id="signupPasswordLabel">${t.signupPasswordLabel}</label>
                        <input type="password" id="signupPassword" class="auth-input" placeholder="${t.signupPasswordPlaceholder}" required minlength="4">
                    </div>

                    <div class="form-group">
                        <label for="confirmPassword" id="confirmPasswordLabel">${t.signupConfirmLabel}</label>
                        <input type="password" id="confirmPassword" class="auth-input" placeholder="${t.signupConfirmPlaceholder}" required>
                    </div>

                    <div id="signupError" class="auth-error" style="display:none"></div>

                    <div class="privacy-note" id="signupPrivacyNote">
                        <small>${t.signupPrivacyNote}</small>
                    </div>

                    <button type="submit" class="auth-btn" id="signupBtn">${t.signupBtn}</button>

                    <p class="auth-switch">
                        <span id="signupSwitchPrompt">${t.signupSwitchPrompt}</span>
                        <a href="#" id="switchToLogin"><span id="signupSwitchAction">${t.signupSwitchAction}</span></a>
                    </p>
                </form>
            </div>
        </div>
  `;

  // ─── DOM refs ───────────────────────────────────────────────────────────
  const tabLogin = document.getElementById('loginTab');
  const tabSignup = document.getElementById('signupTab');
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  // ─── Tab / link switching ───────────────────────────────────────────────
  function showLogin() {
    tabLogin.classList.add('active'); tabSignup.classList.remove('active');
    loginForm.classList.remove('hidden'); signupForm.classList.add('hidden');
    loginError.style.display = 'none';
  }
  function showSignup() {
    tabSignup.classList.add('active'); tabLogin.classList.remove('active');
    signupForm.classList.remove('hidden'); loginForm.classList.add('hidden');
    signupError.style.display = 'none';
  }

  tabLogin.addEventListener('click', showLogin);
  tabSignup.addEventListener('click', showSignup);
  document.getElementById('switchToSignup')?.addEventListener('click', (e) => { e.preventDefault(); showSignup(); });
  document.getElementById('switchToLogin')?.addEventListener('click', (e) => { e.preventDefault(); showLogin(); });

  // ─── Login handler ──────────────────────────────────────────────────────
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginError.style.display = 'none';

    const name = document.getElementById('loginUsername').value.trim();
    const pass = document.getElementById('loginPassword').value;
    const t = translations[state.lang] || translations.en;
    if (!name || !pass) return;

    const users = getUsers();
    const hashed = await hashPassword(pass);

    if (!users[name]) {
      loginError.dataset.i18nKey = 'loginProfileNotFound';
      loginError.textContent = t.loginProfileNotFound;
      loginError.style.display = 'block';
      return;
    }
    if (users[name] !== hashed) {
      loginError.dataset.i18nKey = 'loginIncorrectPassword';
      loginError.textContent = t.loginIncorrectPassword;
      loginError.style.display = 'block';
      return;
    }

    await doLogin(name);
  });

  // ─── Signup handler ─────────────────────────────────────────────────────
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    signupError.style.display = 'none';

    const name = document.getElementById('signupUsername').value.trim();
    const pass = document.getElementById('signupPassword').value;
    const confirm = document.getElementById('confirmPassword').value;
    const t = translations[state.lang] || translations.en;

    if (!name || !pass) return;

    if (name.length < 3) {
      signupError.dataset.i18nKey = 'signupUsernameMin';
      signupError.textContent = t.signupUsernameMin;
      signupError.style.display = 'block';
      return;
    }

    if (pass.length < 4) {
      signupError.dataset.i18nKey = 'signupPasswordMin';
      signupError.textContent = t.signupPasswordMin;
      signupError.style.display = 'block';
      return;
    }

    if (pass !== confirm) {
      signupError.dataset.i18nKey = 'passwordsNoMatch';
      signupError.textContent = t.passwordsNoMatch;
      signupError.style.display = 'block';
      return;
    }

    const users = getUsers();
    if (users[name]) {
      signupError.dataset.i18nKey = 'signupUsernameTaken';
      signupError.textContent = t.signupUsernameTaken;
      signupError.style.display = 'block';
      return;
    }

    // Store credentials
    users[name] = await hashPassword(pass);
    saveUsers(users);

    await doLogin(name);
  });
}

async function doLogin(name) {
  state.set('user', name);
  state.loadUserData(name);
  try { await api.createSession(state.lang); } catch (e) { console.warn('Backend session failed, continuing offline', e); }
  showUserBadge(name);
  mountNav();
  router.navigate('/dashboard');
}
