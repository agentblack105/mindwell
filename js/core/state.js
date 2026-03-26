// ============================================================================
// STATE MANAGEMENT - Global application state
// ============================================================================

// State variables
let currentLang = localStorage.getItem('mindwell-language') || 'en';
let currentUser = null;
let currentAssessment = null;
let currentQuestionIndex = 0;
let answers = [];
let score = 0;
let maxScore = 27;
let assessmentHistory = [];
let lastAssessment = null;
let assessmentChart = null;

// Make state available globally
if (typeof window !== 'undefined') {
    window.state = {
        currentLang,
        currentUser,
        currentAssessment,
        currentQuestionIndex,
        answers,
        score,
        maxScore,
        assessmentHistory,
        lastAssessment,
        assessmentChart
    };
}

// State update functions
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('mindwell-language', lang);
    if (typeof window !== 'undefined') {
        window.state.currentLang = lang;
    }
}

function setUser(user) {
    currentUser = user;
    if (typeof window !== 'undefined') {
        window.state.currentUser = user;
    }
}

function setAssessment(assessment) {
    currentAssessment = assessment;
    if (typeof window !== 'undefined') {
        window.state.currentAssessment = assessment;
    }
}

function setQuestionIndex(index) {
    currentQuestionIndex = index;
    if (typeof window !== 'undefined') {
        window.state.currentQuestionIndex = index;
    }
}

function setAnswers(newAnswers) {
    answers = newAnswers;
    if (typeof window !== 'undefined') {
        window.state.answers = newAnswers;
    }
}

function addAnswer(value) {
    answers.push(value);
    if (typeof window !== 'undefined') {
        window.state.answers = answers;
    }
}

function setScore(newScore) {
    score = newScore;
    if (typeof window !== 'undefined') {
        window.state.score = newScore;
    }
}

function setMaxScore(newMax) {
    maxScore = newMax;
    if (typeof window !== 'undefined') {
        window.state.maxScore = newMax;
    }
}

function setHistory(history) {
    assessmentHistory = history;
    if (typeof window !== 'undefined') {
        window.state.assessmentHistory = history;
    }
}

function addToHistory(item) {
    assessmentHistory.push(item);
    if (typeof window !== 'undefined') {
        window.state.assessmentHistory = assessmentHistory;
    }
}

function setLastAssessment(assessment) {
    lastAssessment = assessment;
    if (typeof window !== 'undefined') {
        window.state.lastAssessment = assessment;
    }
}

function resetAssessment() {
    currentAssessment = null;
    currentQuestionIndex = 0;
    answers = [];
    score = 0;
    if (typeof window !== 'undefined') {
        window.state.currentAssessment = null;
        window.state.currentQuestionIndex = 0;
        window.state.answers = [];
        window.state.score = 0;
    }
}