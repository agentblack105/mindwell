// ─── Screening Page ───────────────────────────────────────────────────────
import { state } from '../lib/state.js';
import { api } from '../lib/api.js';
import { router } from '../lib/router.js';
import { QUESTIONS } from '../data/questions.js';
import { translations } from '../data/translations/index.js';

let currentTool = null;
let currentQ = 0;
let answers = {};
let lastResultsData = null;

// Listen for language change to re-render questions
window.addEventListener('languageChanged', () => {
    const activePanel = document.getElementById('activeAssessment');
    const resultsPanel = document.getElementById('resultsDisplay');

    if (activePanel && !activePanel.classList.contains('hidden') && currentTool) {
        renderQuestion();
    } else if (resultsPanel && !resultsPanel.classList.contains('hidden') && lastResultsData) {
        // Re-evaluate severity and riskLabel in the new language
        const { severity, riskLabel } = getSeverity(currentTool, lastResultsData.score);
        showResults(lastResultsData.score, lastResultsData.maxScore, severity, riskLabel, lastResultsData.riskData);
    }
});

export function ScreeningPage(container) {
    currentTool = null;
    currentQ = 0;
    answers = {};

    // Initial render of the entire structure
    container.innerHTML = `
        <div id="screeningSection" class="container">
            <!-- Privacy Notice -->
            <div class="privacy-notice" id="privacyNoticeBox">
                <strong id="privacyTitle">🔒 Your Privacy Matters</strong>
                <p id="privacyText">This screening is completely anonymous. We don't collect any personal information.
                    Your responses are confidential and protected under NDPR guidelines.</p>
            </div>

            <!-- Assessment Type Selection -->
            <div id="assessmentTypeSelection">
                <h2 class="section-title" id="feelToday">How are you feeling today?</h2>
                <p class="section-subtitle" id="chooseTool">Choose a screening tool to check your mental well-being</p>

                <div class="assessment-type-grid">
                    <div class="assessment-type-card" data-assessment="phq9">
                        <h3>PHQ-9</h3>
                        <p id="phq9Desc">Depression screening questionnaire</p>
                        <span class="assessment-badge" id="phq9Time">9 questions • 3 mins</span>
                    </div>
                    <div class="assessment-type-card" data-assessment="gad7">
                        <h3>GAD-7</h3>
                        <p id="gad7Desc">Anxiety screening questionnaire</p>
                        <span class="assessment-badge" id="gad7Time">7 questions • 2 mins</span>
                    </div>
                </div>
            </div>

            <!-- Assessment Container -->
            <div id="activeAssessment" class="assessment assessment-card hidden">
                <div class="progress-container">
                    <div class="progress-header">
                        <span id="questionCounter">Question 1 / 9</span>
                        <span id="questionPercent">0%</span>
                    </div>
                    <div class="progress-bar-bg">
                        <div class="progress-bar-fill" id="progressBar" style="width: 0%;"></div>
                    </div>
                </div>
                <div id="questionContainer"></div>
                <div id="backButtonContainer" class="back-button-container"></div>
            </div>

            <!-- Loading Screen -->
            <div id="loadingScreen" class="loading hidden">
                <div class="loading-container">
                    <div class="skeleton-grid">
                        <div class="skeleton-bar">
                            <div class="skeleton-shine"></div>
                        </div>
                        <div class="skeleton-bar">
                            <div class="skeleton-shine" style="animation-delay: 0.1s;"></div>
                        </div>
                        <div class="skeleton-bar">
                            <div class="skeleton-shine" style="animation-delay: 0.2s;"></div>
                        </div>
                    </div>
                    <p class="loading-text" id="loadingMessage">Calculating your results...</p>
                </div>
            </div>

            <!-- Results Display -->
            <div id="resultsDisplay" class="results result-card hidden"></div>
        </div>
    `;

    // Event Listeners for Tool Selection
    container.querySelectorAll('.assessment-type-card').forEach(card => {
        card.addEventListener('click', () => {
            currentTool = card.dataset.assessment;
            currentQ = 0;
            answers = {};
            document.getElementById('assessmentTypeSelection').classList.add('hidden');
            document.getElementById('privacyNoticeBox').classList.add('hidden');
            document.getElementById('activeAssessment').classList.remove('hidden');
            renderQuestion();
        });
    });
}

function renderQuestion() {
    const qs = QUESTIONS[currentTool];
    if (!qs) return;
    const q = qs[currentQ];
    const total = qs.length;
    const pct = Math.round(((currentQ) / total) * 100);
    const lang = state.lang || 'en';

    // Update Progress
    document.getElementById('questionCounter').textContent = `Question ${currentQ + 1} / ${total}`;
    document.getElementById('questionPercent').textContent = `${pct}%`;
    document.getElementById('progressBar').style.width = `${pct}%`;

    // Render Question
    const qContainer = document.getElementById('questionContainer');
    qContainer.innerHTML = `
        <h3 class="question-text">${q.text[lang] || q.text.en}</h3>
        <p class="question-instruction">Over the last 2 weeks, how often have you been bothered by this?</p>
        <div class="options-grid">
            ${q.options.map(opt => `
                <button class="option-button" data-value="${opt.value}">${opt.label[lang] || opt.label.en}</button>
            `).join('')}
        </div>
    `;

    qContainer.querySelectorAll('.option-button').forEach(btn => {
        btn.addEventListener('click', () => {
            answers[`${currentTool}_q${currentQ + 1}`] = parseInt(btn.dataset.value);
            currentQ++;
            if (currentQ >= total) {
                document.getElementById('activeAssessment').classList.add('hidden');
                document.getElementById('loadingScreen').classList.remove('hidden');
                processResults();
            } else {
                renderQuestion();
            }
        });
    });

    // Back Button
    const backContainer = document.getElementById('backButtonContainer');
    if (currentQ > 0) {
        backContainer.innerHTML = `<button class="back-button" id="backBtn">Previous Question</button>`;
        document.getElementById('backBtn').addEventListener('click', () => {
            currentQ--;
            renderQuestion();
        });
    } else {
        backContainer.innerHTML = '';
    }
}

async function processResults() {
    // Calculate score locally
    const score = Object.values(answers).reduce((s, v) => s + v, 0);
    const maxScore = currentTool === 'phq9' ? 27 : 21;

    let riskData = null;
    try {
        const result = await api.submitAssessment(currentTool, answers);
        if (result?.id) {
            riskData = await api.predictRisk(result.id);
        }
    } catch (e) { console.warn('Backend assessment failed', e); }

    const { severity, riskLabel } = getSeverity(currentTool, score);

    // Save to history
    const entry = { type: currentTool, score, maxScore, riskLevel: severity, riskLabel, date: new Date().toISOString() };
    if (!state.assessmentHistory) state.assessmentHistory = [];
    state.assessmentHistory.push(entry);
    state.set('lastAssessment', entry);
    state.saveHistory();

    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
        lastResultsData = { score, maxScore, riskData };
        showResults(score, maxScore, severity, riskLabel, riskData);
    }, 1500);
}

function showResults(score, maxScore, severity, riskLabel, riskData) {
    const pct = Math.round((score / maxScore) * 100);
    const color = severity === 'Severe' ? '#ef4444' : severity === 'Moderate' || severity === 'Moderately Severe' ? '#f59e0b' : '#10b981';
    const toolName = currentTool.toUpperCase();

    let riskHtml = '';
    if (riskData?.predictions) {
        const r = riskData.predictions.rules_v1;
        const ml = riskData.predictions.logreg_v1;
        riskHtml = `
            <div class="ml-analysis-card" style="margin-top:2rem">
                <h4>🤖 ML Risk Analysis Comparison</h4>
                <div class="risk-compare">
                    <div class="risk-item">
                        <span>Rules Engine</span>
                        <span class="assessment-badge" style="background:${r.predicted_risk === 'high' ? 'var(--danger-color)' : r.predicted_risk === 'moderate' ? 'var(--warning-color)' : 'var(--success-color)'}; color:white">${r.predicted_risk.toUpperCase()}</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted)">${Math.round(r.confidence * 100)}% conf.</span>
                    </div>
                    <div class="risk-item">
                        <span>ML Model</span>
                        <span class="assessment-badge" style="background:${ml.predicted_risk === 'high' ? 'var(--danger-color)' : ml.predicted_risk === 'moderate' ? 'var(--warning-color)' : 'var(--success-color)'}; color:white">${ml.predicted_risk.toUpperCase()}</span>
                        <span style="font-size: 0.8rem; color: var(--text-muted)">${Math.round(ml.confidence * 100)}% conf.</span>
                    </div>
                </div>
            </div>
        `;
    }

    const lang = state.lang || 'en';
    const t = translations[lang];

    const resultsDisplay = document.getElementById('resultsDisplay');
    resultsDisplay.classList.remove('hidden');
    resultsDisplay.innerHTML = `
        <div class="result-header">
            <h2 class="result-title">${toolName.toUpperCase()} ${t.results || 'Results'}</h2>
        </div>

        <div class="result-content">
            <div class="chart-container">
                <div class="score-display">
                    <span class="score-number" style="color: ${color}">${score}</span>
                    <span class="score-total">/ ${maxScore}</span>
                </div>
            </div>

            <div class="result-text">
                <div class="risk-level" style="color: ${color}">
                    ${riskLabel}
                </div>
                <div class="risk-message">
                    <p>${getResultText(severity, t)}</p>
                    ${riskHtml}
                </div>
            </div>
        </div>

        <div class="quick-actions" style="margin-top: 2rem;">
            <button class="quick-action-btn" id="talkToAiBtn" style="background: linear-gradient(145deg, #004225, #008080); color: #F5F5DC;">${t.chatWithAI || 'Talk to MindWell AI'}</button>
            <button class="quick-action-btn" id="findResourcesBtn">${t.findHelp || 'Find Resources Nearby'}</button>
            <button class="quick-action-btn" id="retakeBtn">${t.restart || 'Take Another Screening'}</button>
        </div>
    `;

    document.getElementById('talkToAiBtn')?.addEventListener('click', () => document.getElementById('chatButton')?.click());
    document.getElementById('findResourcesBtn')?.addEventListener('click', () => router.navigate('/resources'));
    document.getElementById('retakeBtn')?.addEventListener('click', () => {
        const page = document.getElementById('page');
        if (page) ScreeningPage(page);
    });
}

function getSeverity(tool, score) {
    const lang = state.lang || 'en';
    const t = translations[lang];

    if (tool === 'phq9') {
        if (score <= 4) return { severity: 'Minimal', riskLabel: t.low };
        if (score <= 9) return { severity: 'Mild', riskLabel: t.low };
        if (score <= 14) return { severity: 'Moderate', riskLabel: t.moderate };
        if (score <= 19) return { severity: 'Moderately Severe', riskLabel: t.high };
        return { severity: 'Severe', riskLabel: t.high };
    }
    // GAD-7
    if (score <= 4) return { severity: 'Minimal', riskLabel: t.low };
    if (score <= 9) return { severity: 'Mild', riskLabel: t.low };
    if (score <= 14) return { severity: 'Moderate', riskLabel: t.moderate };
    return { severity: 'Severe', riskLabel: t.high };
}

function getResultText(severity, t) {
    if (severity === 'Minimal' || severity === 'Mild') return t.lowMsg;
    if (severity === 'Moderate') return t.moderateMsg;
    return t.highMsg;
}
