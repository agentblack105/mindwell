// ============================================================================
// ASSESSMENT FUNCTIONS - PHQ-9 and GAD-7
// ============================================================================

// DOM Elements for assessments
const assessmentTypeSelection = document.getElementById('assessmentTypeSelection');
const phq9Assessment = document.getElementById('phq9Assessment');
const gad7Assessment = document.getElementById('gad7Assessment');
const loadingScreen = document.getElementById('loadingScreen');
const resultsDisplay = document.getElementById('resultsDisplay');
const phq9Counter = document.getElementById('phq9Counter');
const phq9Percent = document.getElementById('phq9Percent');
const phq9Progress = document.getElementById('phq9Progress');
const phq9QuestionContainer = document.getElementById('phq9QuestionContainer');
const phq9BackButton = document.getElementById('phq9BackButton');
const gad7Counter = document.getElementById('gad7Counter');
const gad7Percent = document.getElementById('gad7Percent');
const gad7Progress = document.getElementById('gad7Progress');
const gad7QuestionContainer = document.getElementById('gad7QuestionContainer');
const gad7BackButton = document.getElementById('gad7BackButton');
const loadingMessage = document.getElementById('loadingMessage');

// Start assessment
function startAssessment(assessment) {
    currentAssessment = assessment;
    setAssessment(assessment);
    currentQuestionIndex = 0;
    setQuestionIndex(0);
    answers = [];
    setAnswers([]);
    
    if (assessmentTypeSelection) {
        assessmentTypeSelection.classList.add('hidden');
    }
    
    if (assessment === 'phq9') {
        if (phq9Assessment) phq9Assessment.classList.remove('hidden');
        maxScore = 27;
        setMaxScore(27);
        renderQuestion('phq9');
    } else if (assessment === 'gad7') {
        if (gad7Assessment) gad7Assessment.classList.remove('hidden');
        maxScore = 21;
        setMaxScore(21);
        renderQuestion('gad7');
    }
}

// Render current question
function renderQuestion(type) {
    const questions = type === 'phq9' ? phq9Questions : gad7Questions;
    const question = questions[currentQuestionIndex];
    const t = translations[currentLang];
    
    const counterEl = type === 'phq9' ? phq9Counter : gad7Counter;
    const percentEl = type === 'phq9' ? phq9Percent : gad7Percent;
    const progressEl = type === 'phq9' ? phq9Progress : gad7Progress;
    const containerEl = type === 'phq9' ? phq9QuestionContainer : gad7QuestionContainer;
    const backButtonEl = type === 'phq9' ? phq9BackButton : gad7BackButton;
    
    // Update counter and progress
    if (counterEl) {
        counterEl.textContent = `${t?.question || 'Question'} ${currentQuestionIndex + 1} / ${questions.length}`;
    }
    
    const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
    if (percentEl) percentEl.textContent = `${Math.round(progress)}%`;
    if (progressEl) progressEl.style.width = `${progress}%`;
    
    // Build question HTML
    let html = `
        <div class="question-slide">
            <h2 class="question-title">${question.text[currentLang] || question.text.en}</h2>
            <div class="options-grid">
    `;
    
    options.forEach(option => {
        html += `
            <button class="option-button" data-value="${option.value}">
                <span class="option-text">${option.label[currentLang] || option.label.en}</span>
            </button>
        `;
    });
    
    html += '</div></div>';
    
    if (containerEl) containerEl.innerHTML = html;
    
    // Add event listeners to option buttons
    if (containerEl) {
        containerEl.querySelectorAll('.option-button').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const value = parseInt(e.currentTarget.dataset.value);
                handleAnswer(value, type);
            });
        });
    }
    
    // Handle back button
    if (currentQuestionIndex > 0 && backButtonEl) {
        backButtonEl.innerHTML = `
            <button class="back-button" id="${type}BackBtn">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                    <line x1="19" y1="12" x2="5" y2="12"/>
                    <polyline points="12 19 5 12 12 5"/>
                </svg>
                ${t?.back || 'Back'}
            </button>
        `;
        const backBtn = document.getElementById(`${type}BackBtn`);
        if (backBtn) {
            backBtn.addEventListener('click', (e) => {
                e.preventDefault();
                handleBack(type);
            });
        }
    } else if (backButtonEl) {
        backButtonEl.innerHTML = '';
    }
}

// Handle answer selection
function handleAnswer(value, type) {
    answers.push(value);
    addAnswer(value);
    
    const questions = type === 'phq9' ? phq9Questions : gad7Questions;
    
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        setQuestionIndex(currentQuestionIndex);
        renderQuestion(type);
    } else {
        // Calculate score
        score = answers.reduce((a, b) => a + b, 0);
        setScore(score);
        
        // Hide assessment
        if (type === 'phq9' && phq9Assessment) {
            phq9Assessment.classList.add('hidden');
        } else if (gad7Assessment) {
            gad7Assessment.classList.add('hidden');
        }
        
        // Show loading screen
        if (loadingScreen) loadingScreen.classList.remove('hidden');
        if (loadingMessage) {
            const t = translations[currentLang];
            loadingMessage.textContent = t?.loading || 'Calculating your results...';
        }
        
        // Simulate calculation delay (will be replaced with actual AI call)
        setTimeout(() => {
            if (loadingScreen) loadingScreen.classList.add('hidden');
            renderResults(type);
        }, 2000);
    }
}

// Handle back button
function handleBack(type) {
    if (currentQuestionIndex > 0) {
        answers.pop();
        setAnswers(answers);
        currentQuestionIndex--;
        setQuestionIndex(currentQuestionIndex);
        renderQuestion(type);
    }
}

// Render results
function renderResults(type) {
    // Determine risk level based on score
    let riskLevel = 'Low';
    let color = '#008080';
    
    if (type === 'phq9') {
        if (score >= 5 && score <= 9) {
            riskLevel = 'Moderate';
            color = '#D97706';
        } else if (score >= 10 && score <= 14) {
            riskLevel = 'Moderately Severe';
            color = '#E67E22';
        } else if (score >= 15) {
            riskLevel = 'Severe';
            color = '#BE123C';
        }
    } else { // GAD-7
        if (score >= 5 && score <= 9) {
            riskLevel = 'Moderate';
            color = '#D97706';
        } else if (score >= 10 && score <= 14) {
            riskLevel = 'Moderately Severe';
            color = '#E67E22';
        } else if (score >= 15) {
            riskLevel = 'Severe';
            color = '#BE123C';
        }
    }
    
    const t = translations[currentLang];
    
    // Set risk label and message based on level
    let riskLabel = t?.low || 'Low Risk';
    let riskMessage = t?.lowMsg || 'Your mental well-being appears stable.';
    
    if (riskLevel === 'Moderate' || riskLevel === 'Moderately Severe') {
        riskLabel = t?.moderate || 'Moderate Risk';
        riskMessage = t?.moderateMsg || 'You might be experiencing some mild symptoms.';
    } else if (riskLevel === 'Severe') {
        riskLabel = t?.high || 'High Risk';
        riskMessage = t?.highMsg || 'Please reach out for support immediately.';
    }
    
    const assessmentName = type === 'phq9' ? 'PHQ-9' : 'GAD-7';
    
    // Save to history if user is logged in
    if (currentUser) {
        assessmentHistory.push({
            type: assessmentName,
            score: score,
            maxScore: maxScore,
            riskLevel: riskLevel,
            riskLabel: riskLabel,
            date: new Date().toISOString()
        });
        setHistory(assessmentHistory);
        saveHistory();
        if (typeof updateDashboard === 'function') updateDashboard();
    }
    
    // Store for chat context
    lastAssessment = {
        type: assessmentName,
        score: score,
        maxScore: maxScore,
        riskLevel: riskLevel,
        riskLabel: riskLabel,
        message: riskMessage,
        color: color
    };
    setLastAssessment(lastAssessment);
    
    // Calculate chart data
    const percentage = (score / maxScore) * 100;
    const dashArray = 2 * Math.PI * 70;
    const dashOffset = dashArray - (percentage / 100) * dashArray;
    
    // Build results HTML - FIXED: Changed button to use class instead of ID
    const html = `
        <div class="result-card">
            <h2 class="result-title">${assessmentName} ${t?.results || 'Results'}</h2>
            
            <div class="result-content">
                <div class="chart-container">
                    <svg viewBox="0 0 200 100" style="width:100%; height:100%;">
                        <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="#e5e5e5" stroke-width="20" stroke-linecap="round"/>
                        <path d="M 30 100 A 70 70 0 0 1 170 100" fill="none" stroke="${color}" stroke-width="20" stroke-linecap="round" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" transform="rotate(180 100 100)"/>
                    </svg>
                    <div class="score-display">
                        <span class="score-number" style="color: ${color};">${score}</span>
                        <span class="score-total">/${maxScore}</span>
                    </div>
                </div>

                <div class="result-text">
                    <h3 class="risk-level" style="color: ${color};">${riskLabel}</h3>
                    <p class="risk-message">${riskMessage}</p>
                </div>
            </div>
            
            <div style="display: flex; justify-content: center; margin-top: 2rem;">
                <button class="chat-with-ai-btn" id="chatWithAIAfterResults">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                    </svg>
                    🆘 Get Help
                </button>
            </div>
        </div>

        <div class="resources-grid">
            <div class="resource-card" style="background: #004225; color: #F5F5DC;">
                <h3>${t?.nextSteps || 'Next Steps'}</h3>
                <ul style="list-style: none; margin-top: 1rem;">
                    <li style="margin-bottom: 0.75rem;">• Talk to a trusted friend or family</li>
                    <li style="margin-bottom: 0.75rem;">• Contact MANI: 0809 111 6264</li>
                    <li style="margin-bottom: 0.75rem;">• Visit a mental health professional</li>
                </ul>
            </div>
            <div class="resource-card" style="background: white; color: #004225;">
                <h3>${t?.emergency || 'Emergency Contacts'}</h3>
                <div style="background: #fef2f2; padding: 1rem; border-radius: 0.75rem; margin-top: 1rem;">
                    <div style="color: #be123c; font-weight: 700;">SUICIDE HOTLINE</div>
                    <div style="color: #b91c1c; font-size: 1.5rem; font-weight: 700;">0809 111 6264</div>
                </div>
                <div style="background: #f0fdf4; padding: 1rem; border-radius: 0.75rem; margin-top: 1rem;">
                    <div style="color: #16a34a; font-weight: 700;">GENERAL SUPPORT</div>
                    <div style="color: #15803d; font-size: 1.5rem; font-weight: 700;">0800 800 2000</div>
                </div>
            </div>
        </div>
        
        <div style="text-align: center; margin-top: 2rem;">
            <button class="restart-assessment-btn" style="background: none; border: none; color: #004225; text-decoration: underline; cursor: pointer; font-size: 1rem;">${t?.restart || 'Take Another Assessment'}</button>
        </div>
    `;
    
    if (resultsDisplay) {
        resultsDisplay.innerHTML = html;
        resultsDisplay.classList.remove('hidden');
        
        // FIXED: Use class selector instead of ID for restart button
        const restartBtn = resultsDisplay.querySelector('.restart-assessment-btn');
        if (restartBtn) {
            restartBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('Restart button clicked'); // Debug log
                resultsDisplay.classList.add('hidden');
                if (assessmentTypeSelection) {
                    assessmentTypeSelection.classList.remove('hidden');
                }
                resetAssessment();
            });
        }
        
        // Add event listener for chat button
        const chatBtn = document.getElementById('chatWithAIAfterResults');
        if (chatBtn && typeof openChatWithContext === 'function') {
            chatBtn.addEventListener('click', (e) => {
                e.preventDefault();
                openChatWithContext();
            });
        }
    }
}

// Reset assessment function
function resetAssessment() {
    console.log('Resetting assessment');
    currentAssessment = null;
    currentQuestionIndex = 0;
    answers = [];
    score = 0;
    
    // Reset progress bars
    if (phq9Progress) phq9Progress.style.width = '0%';
    if (gad7Progress) gad7Progress.style.width = '0%';
    if (phq9Percent) phq9Percent.textContent = '0%';
    if (gad7Percent) gad7Percent.textContent = '0%';
    if (phq9Counter) phq9Counter.textContent = 'Question 1 / 9';
    if (gad7Counter) gad7Counter.textContent = 'Question 1 / 7';
    
    setAssessment(null);
    setQuestionIndex(0);
    setAnswers([]);
    setScore(0);
}

// Add event listeners to assessment cards
document.querySelectorAll('[data-assessment]').forEach(card => {
    card.addEventListener('click', (e) => {
        e.preventDefault();
        const assessment = e.currentTarget.dataset.assessment;
        console.log('Assessment card clicked:', assessment);
        startAssessment(assessment);
    });
});