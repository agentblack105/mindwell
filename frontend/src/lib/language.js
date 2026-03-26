import { state } from './state.js';
import { translations } from '../data/translations/index.js';

function getLocaleForLanguage(lang) {
    const localeMap = {
        en: 'en-NG',
        pidgin: 'en-NG',
        yoruba: 'yo-NG',
        igbo: 'ig-NG',
        hausa: 'ha-NG',
    };

    return localeMap[lang] || 'en-NG';
}

export function initLanguage() {
    const langButton = document.getElementById('langButton');
    const langDropdown = document.getElementById('langDropdown');
    const chevron = document.getElementById('chevron');
    const langOptions = document.querySelectorAll('.lang-option');
    const selectedLangSpan = document.getElementById('selectedLang');

    // Set initial language from state
    const currentLang = state.lang || 'en';
    if (selectedLangSpan && translations[currentLang]) {
        selectedLangSpan.textContent = translations[currentLang].selectedLang;
    }
    langOptions.forEach(opt => {
        if (opt.dataset.lang === currentLang) {
            opt.classList.add('active');
        } else {
            opt.classList.remove('active');
        }
    });

    translateUI(currentLang);

    // Toggle dropdown
    if (langButton) {
        langButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (langDropdown) langDropdown.classList.toggle('show');
            if (chevron) chevron.classList.toggle('open');
        });
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (langButton && !langButton.contains(e.target) &&
            langDropdown && !langDropdown.contains(e.target)) {
            langDropdown.classList.remove('show');
            if (chevron) chevron.classList.remove('open');
        }
    });

    // Language selection
    if (langOptions) {
        langOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const lang = option.dataset.lang;

                // Update active state
                langOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');

                // Update selected language display
                if (selectedLangSpan && translations[lang]) {
                    selectedLangSpan.textContent = translations[lang].selectedLang;
                }

                // Set language in state and storage
                state.set('lang', lang);
                localStorage.setItem('mindwell-lang', lang);

                // Trigger translation of all UI elements
                translateUI(lang);
                window.dispatchEvent(new CustomEvent('languageChanged', { detail: lang }));

                // Close dropdown
                if (langDropdown) langDropdown.classList.remove('show');
                if (chevron) chevron.classList.remove('open');
            });
        });
    }
}

// Translation function
export function translateUI(lang) {
    const t = translations[lang];
    if (!t) return;

    // Header
    const logoText = document.getElementById('logoText');
    if (logoText) logoText.textContent = t.logoText;

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.textContent = t.logout;

    // Navigation Tabs
    const tabDashboard = document.getElementById('tabDashboard');
    if (tabDashboard) tabDashboard.textContent = t.tabDashboard;

    const tabScreening = document.getElementById('tabScreening');
    if (tabScreening) tabScreening.textContent = t.tabScreening;

    const tabResources = document.getElementById('tabResources');
    if (tabResources) tabResources.textContent = t.tabResources;

    const tabEducation = document.getElementById('tabEducation');
    if (tabEducation) tabEducation.textContent = t.tabEducation;

    // Auth Tabs
    const loginTab = document.getElementById('loginTab');
    if (loginTab) loginTab.textContent = t.loginTab;

    const signupTab = document.getElementById('signupTab');
    if (signupTab) signupTab.textContent = t.signupTab;

    // Login Form
    const loginTitle = document.getElementById('loginTitle');
    if (loginTitle) loginTitle.textContent = t.loginTitle;

    const loginSubtitle = document.getElementById('loginSubtitle');
    if (loginSubtitle) loginSubtitle.textContent = t.loginSubtitle;

    const loginUsernameLabel = document.getElementById('loginUsernameLabel');
    if (loginUsernameLabel) loginUsernameLabel.textContent = t.loginUsernameLabel;

    const loginPasswordLabel = document.getElementById('loginPasswordLabel');
    if (loginPasswordLabel) loginPasswordLabel.textContent = t.loginPasswordLabel;

    const loginUsername = document.getElementById('loginUsername');
    if (loginUsername) loginUsername.placeholder = t.loginUsernamePlaceholder;

    const loginPassword = document.getElementById('loginPassword');
    if (loginPassword) loginPassword.placeholder = t.loginPasswordPlaceholder;

    const loginPrivacyNote = document.getElementById('loginPrivacyNote');
    if (loginPrivacyNote) loginPrivacyNote.innerHTML = `<small>${t.loginPrivacyNote}</small>`;

    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) loginBtn.textContent = t.loginBtn;

    const loginSwitchPrompt = document.getElementById('loginSwitchPrompt');
    if (loginSwitchPrompt) loginSwitchPrompt.textContent = t.loginSwitchPrompt;

    const loginSwitchAction = document.getElementById('loginSwitchAction');
    if (loginSwitchAction) loginSwitchAction.textContent = t.loginSwitchAction;

    // Signup Form
    const signupTitle = document.getElementById('signupTitle');
    if (signupTitle) signupTitle.textContent = t.signupTitle;

    const signupSubtitle = document.getElementById('signupSubtitle');
    if (signupSubtitle) signupSubtitle.textContent = t.signupSubtitle;

    const signupUsernameLabel = document.getElementById('signupUsernameLabel');
    if (signupUsernameLabel) signupUsernameLabel.textContent = t.signupUsernameLabel;

    const signupPasswordLabel = document.getElementById('signupPasswordLabel');
    if (signupPasswordLabel) signupPasswordLabel.textContent = t.signupPasswordLabel;

    const confirmPasswordLabel = document.getElementById('confirmPasswordLabel');
    if (confirmPasswordLabel) confirmPasswordLabel.textContent = t.signupConfirmLabel;

    const signupUsername = document.getElementById('signupUsername');
    if (signupUsername) signupUsername.placeholder = t.signupUsernamePlaceholder;

    const signupUsernameHint = document.getElementById('signupUsernameHint');
    if (signupUsernameHint) signupUsernameHint.textContent = t.signupUsernameHint;

    const signupPassword = document.getElementById('signupPassword');
    if (signupPassword) signupPassword.placeholder = t.signupPasswordPlaceholder;

    const confirmPassword = document.getElementById('confirmPassword');
    if (confirmPassword) confirmPassword.placeholder = t.signupConfirmPlaceholder;

    const signupPrivacyNote = document.getElementById('signupPrivacyNote');
    if (signupPrivacyNote) signupPrivacyNote.innerHTML = `<small>${t.signupPrivacyNote}</small>`;

    const signupBtn = document.getElementById('signupBtn');
    if (signupBtn) signupBtn.textContent = t.signupBtn;

    const signupSwitchPrompt = document.getElementById('signupSwitchPrompt');
    if (signupSwitchPrompt) signupSwitchPrompt.textContent = t.signupSwitchPrompt;

    const signupSwitchAction = document.getElementById('signupSwitchAction');
    if (signupSwitchAction) signupSwitchAction.textContent = t.signupSwitchAction;

    const loginError = document.getElementById('loginError');
    if (loginError?.dataset.i18nKey && t[loginError.dataset.i18nKey]) {
        loginError.textContent = t[loginError.dataset.i18nKey];
    }

    const signupError = document.getElementById('signupError');
    if (signupError?.dataset.i18nKey && t[signupError.dataset.i18nKey]) {
        signupError.textContent = t[signupError.dataset.i18nKey];
    }

    // Dashboard
    const welcomeBack = document.getElementById('welcomeBack');
    if (welcomeBack) welcomeBack.textContent = t.welcomeBack;

    const totalAssessmentsLabel = document.getElementById('totalAssessmentsLabel');
    if (totalAssessmentsLabel) totalAssessmentsLabel.textContent = t.totalAssessments;

    const avgScoreLabel = document.getElementById('avgScoreLabel');
    if (avgScoreLabel) avgScoreLabel.textContent = t.avgScore;

    const lowRiskLabel = document.getElementById('lowRiskLabel');
    if (lowRiskLabel) lowRiskLabel.textContent = t.lowRisk;

    const moderateRiskLabel = document.getElementById('moderateRiskLabel');
    if (moderateRiskLabel) moderateRiskLabel.textContent = t.moderateRisk;

    const highRiskLabel = document.getElementById('highRiskLabel');
    if (highRiskLabel) highRiskLabel.textContent = t.highRisk;

    const lastAssessmentLabel = document.getElementById('lastAssessmentLabel');
    if (lastAssessmentLabel) lastAssessmentLabel.textContent = t.lastAssessment;

    const progressTitle = document.getElementById('progressTitle');
    if (progressTitle) progressTitle.textContent = t.yourProgress;

    const recentTitle = document.getElementById('recentTitle');
    if (recentTitle) recentTitle.textContent = t.recentAssessments;

    const noAssessments = document.getElementById('noAssessments');
    if (noAssessments) noAssessments.textContent = t.noAssessments;

    const newAssessmentBtn = document.getElementById('newAssessmentBtn');
    if (newAssessmentBtn) newAssessmentBtn.textContent = t.newAssessment;

    const findHelpBtn = document.getElementById('findHelpBtn');
    if (findHelpBtn) findHelpBtn.textContent = t.findHelp;

    const learnMoreBtn = document.getElementById('learnMoreBtn');
    if (learnMoreBtn) learnMoreBtn.textContent = t.learnMore;

    // Update welcome user if logged in
    const welcomeUser = document.getElementById('welcomeUser');
    const dashboardUsername = document.getElementById('dashboardUsername');

    const currentUser = state.user;
    if (currentUser) {
        if (welcomeUser) welcomeUser.textContent = currentUser;
        if (dashboardUsername) dashboardUsername.textContent = currentUser;
    }

    const currentDate = document.getElementById('currentDate');
    if (currentDate) {
        currentDate.textContent = new Date().toLocaleDateString(getLocaleForLanguage(lang), {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    }

    // Privacy Notice
    const privacyTitle = document.getElementById('privacyTitle');
    if (privacyTitle) privacyTitle.innerHTML = t.privacyTitle;

    const privacyText = document.getElementById('privacyText');
    if (privacyText) privacyText.textContent = t.privacyText;

    // Assessment Selection
    const feelToday = document.getElementById('feelToday');
    if (feelToday) feelToday.textContent = t.feelToday;

    const chooseTool = document.getElementById('chooseTool');
    if (chooseTool) chooseTool.textContent = t.chooseTool;

    const phq9Desc = document.getElementById('phq9Desc');
    if (phq9Desc) phq9Desc.textContent = t.phq9Desc;

    const phq9Time = document.getElementById('phq9Time');
    if (phq9Time) phq9Time.textContent = t.phq9Time;

    const gad7Desc = document.getElementById('gad7Desc');
    if (gad7Desc) gad7Desc.textContent = t.gad7Desc;

    const gad7Time = document.getElementById('gad7Time');
    if (gad7Time) gad7Time.textContent = t.gad7Time;

    // Resources
    const resourcesTitle = document.getElementById('resourcesTitle');
    if (resourcesTitle) resourcesTitle.textContent = t.resourcesTitle;

    const allStates = document.getElementById('allStates');
    if (allStates) allStates.textContent = t.allStates;

    const allServices = document.getElementById('allServices');
    if (allServices) allServices.textContent = t.allServices;

    const crisisHotline = document.getElementById('crisisHotline');
    if (crisisHotline) crisisHotline.textContent = t.crisisHotline;

    const therapist = document.getElementById('therapist');
    if (therapist) therapist.textContent = t.therapist;

    const supportGroup = document.getElementById('supportGroup');
    if (supportGroup) supportGroup.textContent = t.supportGroup;

    const clinic = document.getElementById('clinic');
    if (clinic) clinic.textContent = t.clinic;

    // Education
    const educationTitle = document.getElementById('educationTitle');
    if (educationTitle) educationTitle.textContent = t.educationTitle;

    const depressionTitle = document.getElementById('depressionTitle');
    if (depressionTitle) depressionTitle.textContent = t.depressionTitle;

    const depressionDesc = document.getElementById('depressionDesc');
    if (depressionDesc) depressionDesc.textContent = t.depressionDesc;

    const depressionLearn = document.getElementById('depressionLearn');
    if (depressionLearn) depressionLearn.textContent = t.learnMore;

    const anxietyTitle = document.getElementById('anxietyTitle');
    if (anxietyTitle) anxietyTitle.textContent = t.anxietyTitle;

    const anxietyDesc = document.getElementById('anxietyDesc');
    if (anxietyDesc) anxietyDesc.textContent = t.anxietyDesc;

    const anxietyLearn = document.getElementById('anxietyLearn');
    if (anxietyLearn) anxietyLearn.textContent = t.learnMore;

    const ptsdTitle = document.getElementById('ptsdTitle');
    if (ptsdTitle) ptsdTitle.textContent = t.ptsdTitle;

    const ptsdDesc = document.getElementById('ptsdDesc');
    if (ptsdDesc) ptsdDesc.textContent = t.ptsdDesc;

    const ptsdLearn = document.getElementById('ptsdLearn');
    if (ptsdLearn) ptsdLearn.textContent = t.learnMore;

    const bipolarTitle = document.getElementById('bipolarTitle');
    if (bipolarTitle) bipolarTitle.textContent = t.bipolarTitle;

    const bipolarDesc = document.getElementById('bipolarDesc');
    if (bipolarDesc) bipolarDesc.textContent = t.bipolarDesc;

    const bipolarLearn = document.getElementById('bipolarLearn');
    if (bipolarLearn) bipolarLearn.textContent = t.learnMore;

    // When to Seek Help
    const seekHelpTitle = document.getElementById('seekHelpTitle');
    if (seekHelpTitle) seekHelpTitle.textContent = t.seekHelpTitle;

    const seekHelpDesc = document.getElementById('seekHelpDesc');
    if (seekHelpDesc) seekHelpDesc.textContent = t.seekHelpDesc;

    const symptom1 = document.getElementById('symptom1');
    if (symptom1) symptom1.innerHTML = t.symptom1;

    const symptom2 = document.getElementById('symptom2');
    if (symptom2) symptom2.innerHTML = t.symptom2;

    const symptom3 = document.getElementById('symptom3');
    if (symptom3) symptom3.innerHTML = t.symptom3;

    const symptom4 = document.getElementById('symptom4');
    if (symptom4) symptom4.innerHTML = t.symptom4;

    const symptom5 = document.getElementById('symptom5');
    if (symptom5) symptom5.innerHTML = t.symptom5;

    const symptom6 = document.getElementById('symptom6');
    if (symptom6) symptom6.innerHTML = t.symptom6;

    // Chat
    const chatStatus = document.getElementById('chatStatus');
    if (chatStatus) chatStatus.textContent = t.chatStatus;

    const welcomeMessage = document.getElementById('welcomeMessage');
    if (welcomeMessage) welcomeMessage.textContent = t.welcomeMessage;

    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.placeholder = t.chatPlaceholder;

    const chatTitle = document.querySelector('.chat-title');
    if (chatTitle) chatTitle.textContent = t.chatTitle;
}
