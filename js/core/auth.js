// ============================================================================
// AUTHENTICATION FUNCTIONS - Login, Signup, Logout
// ============================================================================

// DOM Elements
const loginTabBtn = document.getElementById('loginTab');
const signupTabBtn = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const loginBtn = document.getElementById('loginBtn');
const signupBtn = document.getElementById('signupBtn');
const logoutBtn = document.getElementById('logoutBtn');
const authSection = document.getElementById('authSection');
const dashboardSection = document.getElementById('dashboardSection');
const navTabs = document.getElementById('navTabs');
const userInfo = document.getElementById('userInfo');
const dashboardUsername = document.getElementById('dashboardUsername');
const welcomeUser = document.getElementById('welcomeUser');
const currentDate = document.getElementById('currentDate');

// Switch between login and signup tabs
if (loginTabBtn && signupTabBtn) {
    loginTabBtn.addEventListener('click', (e) => {
        e.preventDefault();
        loginTabBtn.classList.add('active');
        signupTabBtn.classList.remove('active');
        if (loginForm) loginForm.classList.remove('hidden');
        if (signupForm) signupForm.classList.add('hidden');
    });

    signupTabBtn.addEventListener('click', (e) => {
        e.preventDefault();
        signupTabBtn.classList.add('active');
        loginTabBtn.classList.remove('active');
        if (signupForm) signupForm.classList.remove('hidden');
        if (loginForm) loginForm.classList.add('hidden');
    });
}

// Login handler
if (loginBtn) {
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('loginUsername')?.value;
        const password = document.getElementById('loginPassword')?.value;
        
        if (!username) {
            alert(translations[currentLang]?.passwordsNoMatch || 'Please enter a username');
            return;
        }
        
        // Set current user
        currentUser = username;
        setUser(username);
        
        // Update UI
        if (authSection) authSection.classList.add('hidden');
        if (dashboardSection) dashboardSection.classList.remove('hidden');
        if (navTabs) navTabs.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'flex';
        
        // Update welcome messages
        if (dashboardUsername) dashboardUsername.textContent = username;
        if (welcomeUser) {
            const t = translations[currentLang];
            welcomeUser.textContent = `${t?.welcomeBack || 'Welcome back,'} ${username}`;
        }
        
        // Set current date
        if (currentDate) {
            currentDate.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Load history from session storage
        loadHistory();
        
        // Update dashboard
        if (typeof updateDashboard === 'function') updateDashboard();
        
        // Open dashboard tab
        if (typeof openTab === 'function') openTab('dashboard');
    });
}

// Signup handler
if (signupBtn) {
    signupBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('signupUsername')?.value;
        const password = document.getElementById('signupPassword')?.value;
        const confirm = document.getElementById('confirmPassword')?.value;
        const t = translations[currentLang];
        
        if (!username) {
            alert(t?.passwordsNoMatch || 'Please enter a username');
            return;
        }
        
        if (password !== confirm) {
            alert(t?.passwordsNoMatch || 'Passwords do not match');
            return;
        }
        
        // Set current user
        currentUser = username;
        setUser(username);
        
        // Update UI
        if (authSection) authSection.classList.add('hidden');
        if (dashboardSection) dashboardSection.classList.remove('hidden');
        if (navTabs) navTabs.style.display = 'flex';
        if (userInfo) userInfo.style.display = 'flex';
        
        // Update welcome messages
        if (dashboardUsername) dashboardUsername.textContent = username;
        if (welcomeUser) {
            welcomeUser.textContent = `${t?.welcomeBack || 'Welcome back,'} ${username}`;
        }
        
        // Set current date
        if (currentDate) {
            currentDate.textContent = new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        }
        
        // Load history from session storage
        loadHistory();
        
        // Update dashboard
        if (typeof updateDashboard === 'function') updateDashboard();
        
        // Open dashboard tab
        if (typeof openTab === 'function') openTab('dashboard');
    });
}

// Logout handler
if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Clear current user
        currentUser = null;
        setUser(null);
        
        // Update UI
        if (dashboardSection) dashboardSection.classList.add('hidden');
        if (authSection) authSection.classList.remove('hidden');
        if (navTabs) navTabs.style.display = 'none';
        if (userInfo) userInfo.style.display = 'none';
        
        // Reset auth tabs
        if (loginTabBtn && signupTabBtn) {
            loginTabBtn.classList.add('active');
            signupTabBtn.classList.remove('active');
            if (loginForm) loginForm.classList.remove('hidden');
            if (signupForm) signupForm.classList.add('hidden');
        }
        
        // Clear form fields
        const loginUsername = document.getElementById('loginUsername');
        const loginPassword = document.getElementById('loginPassword');
        const signupUsername = document.getElementById('signupUsername');
        const signupPassword = document.getElementById('signupPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        
        if (loginUsername) loginUsername.value = '';
        if (loginPassword) loginPassword.value = '';
        if (signupUsername) signupUsername.value = '';
        if (signupPassword) signupPassword.value = '';
        if (confirmPassword) confirmPassword.value = '';
    });
}

// Load history from session storage
function loadHistory() {
    const saved = sessionStorage.getItem('assessmentHistory');
    if (saved) {
        try {
            assessmentHistory = JSON.parse(saved);
            setHistory(assessmentHistory);
        } catch (e) {
            assessmentHistory = [];
            setHistory([]);
        }
    }
}

// Save history to session storage
function saveHistory() {
    sessionStorage.setItem('assessmentHistory', JSON.stringify(assessmentHistory));
}