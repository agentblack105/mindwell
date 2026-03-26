// ============================================================================
// MAIN ENTRY POINT - Initializes all modules
// ============================================================================

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('MindWell NG - Frontend initialized');
    
    // Load saved language from localStorage
    const savedLang = localStorage.getItem('mindwell-language') || 'en';
    
    // Set initial language
    setLanguage(savedLang);
    
    // Set active language option in dropdown
    const langOptions = document.querySelectorAll('.lang-option');
    langOptions.forEach(opt => {
        if (opt.dataset.lang === savedLang) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });
    
    // Update selected language display
    const selectedLang = document.getElementById('selectedLang');
    if (selectedLang && translations[savedLang]) {
        selectedLang.textContent = translations[savedLang].selectedLang;
    }
    
    // Load assessment history
    loadHistory();
    
    // Check if user is already logged in (from session)
    // For demo purposes, we'll start at login screen
    const authSection = document.getElementById('authSection');
    const dashboardSection = document.getElementById('dashboardSection');
    const navTabs = document.getElementById('navTabs');
    const userInfo = document.getElementById('userInfo');
    
    if (authSection) authSection.classList.remove('hidden');
    if (dashboardSection) dashboardSection.classList.add('hidden');
    if (navTabs) navTabs.style.display = 'none';
    if (userInfo) userInfo.style.display = 'none';
    
    // Initialize resource cards with translations
    if (typeof updateResourceCards === 'function') {
        updateResourceCards(translations[savedLang]);
    }
    
    // Add openTab function to global window object if not already defined
    if (typeof window.openTab !== 'function') {
        window.openTab = function(tabName) {
            // Hide all sections
            const sections = ['dashboardSection', 'screeningSection', 'resourcesSection', 'educationSection'];
            sections.forEach(id => {
                const el = document.getElementById(id);
                if (el) el.classList.add('hidden');
            });
            
            // Show selected section
            const sectionMap = {
                'dashboard': 'dashboardSection',
                'screening': 'screeningSection',
                'resources': 'resourcesSection',
                'education': 'educationSection'
            };
            
            const sectionId = sectionMap[tabName];
            if (sectionId) {
                const section = document.getElementById(sectionId);
                if (section) section.classList.remove('hidden');
            }
            
            // Update active tab
            document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
            const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
            if (activeTab) activeTab.classList.add('active');
            
            // Special handling for specific tabs
            if (tabName === 'dashboard' && typeof updateDashboard === 'function') {
                updateDashboard();
            }
            if (tabName === 'resources' && typeof updateResourceCards === 'function') {
                updateResourceCards(translations[currentLang]);
            }
        };
    }
    
    // Add event listeners to navigation tabs
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = tab.dataset.tab;
            if (typeof window.openTab === 'function') {
                window.openTab(tabName);
            }
        });
    });
    
    // Add event listeners to assessment cards (in case they weren't attached)
    document.querySelectorAll('[data-assessment]').forEach(card => {
        // Remove any existing listeners to avoid duplicates
        card.removeEventListener('click', window.assessmentClickHandler);
        
        // Create handler
        window.assessmentClickHandler = (e) => {
            e.preventDefault();
            const assessment = e.currentTarget.dataset.assessment;
            if (typeof startAssessment === 'function') {
                startAssessment(assessment);
            }
        };
        
        // Add new listener
        card.addEventListener('click', window.assessmentClickHandler);
    });
    
    // Fix any date formatting issues
    const lastDateEl = document.getElementById('lastAssessmentDate');
    if (lastDateEl) {
        lastDateEl.style.fontSize = '1rem';
        lastDateEl.style.wordBreak = 'break-word';
    }
    
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add keyboard support for modals/dropdowns
    document.addEventListener('keydown', (e) => {
        // Close language dropdown on Escape key
        if (e.key === 'Escape') {
            const langDropdown = document.getElementById('langDropdown');
            const chevron = document.getElementById('chevron');
            if (langDropdown && langDropdown.classList.contains('show')) {
                langDropdown.classList.remove('show');
                if (chevron) chevron.classList.remove('open');
            }
            
            // Close chat window on Escape key
            const chatWindow = document.getElementById('chatWindow');
            const chatButton = document.getElementById('chatButton');
            if (chatWindow && chatWindow.classList.contains('open')) {
                chatWindow.classList.remove('open');
                if (chatButton) {
                    chatButton.innerHTML = `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="24" height="24">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                        </svg>
                    `;
                }
            }
        }
    });
    
    // Add touch support for mobile
    if ('ontouchstart' in window) {
        document.body.classList.add('touch-device');
    }
    
    // Log successful initialization
    console.log('MindWell NG frontend ready with languages:', Object.keys(translations).join(', '));
});

// Handle page visibility change (for session management)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        // Optionally save state when user leaves
        if (currentUser) {
            saveHistory();
        }
    }
});

// Handle before unload to save data
window.addEventListener('beforeunload', () => {
    if (currentUser) {
        saveHistory();
    }
});

// Error handling for uncaught errors
window.addEventListener('error', (e) => {
    console.error('Caught error:', e.error);
    // Optionally show user-friendly error message
});

// Export functions for global use
window.translateUI = translateUI;
window.setLanguage = setLanguage;
window.startAssessment = startAssessment;
window.openChatWithContext = openChatWithContext;
window.filterResources = filterResources;
window.updateDashboard = updateDashboard;
window.loadHistory = loadHistory;
window.saveHistory = saveHistory;