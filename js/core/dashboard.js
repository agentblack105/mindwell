// ============================================================================
// DASHBOARD FUNCTIONS - Statistics, Charts, Recent Activity
// ============================================================================

// Update dashboard with current statistics
function updateDashboard() {
    const t = translations[currentLang];
    
    // DOM Elements
    const totalEl = document.getElementById('totalAssessments');
    const avgEl = document.getElementById('avgScore');
    const lowEl = document.getElementById('lowRiskCount');
    const modEl = document.getElementById('moderateRiskCount');
    const highEl = document.getElementById('highRiskCount');
    const lastEl = document.getElementById('lastAssessmentDate');
    const recentList = document.getElementById('recentList');
    
    // No assessments yet
    if (!assessmentHistory || !assessmentHistory.length) {
        if (totalEl) totalEl.textContent = '0';
        if (avgEl) avgEl.textContent = '0';
        if (lowEl) lowEl.textContent = '0';
        if (modEl) modEl.textContent = '0';
        if (highEl) highEl.textContent = '0';
        if (lastEl) lastEl.textContent = t?.never || 'Never';
        if (recentList) recentList.innerHTML = `<p class="no-data">${t?.noAssessments || 'No assessments yet. Take your first assessment!'}</p>`;
        return;
    }
    
    // Calculate statistics
    const total = assessmentHistory.length;
    const avgScore = Math.round(assessmentHistory.reduce((sum, a) => sum + a.score, 0) / total);
    
    const lowRisk = assessmentHistory.filter(a => 
        a.riskLevel === 'Low' || a.riskLevel === 'Low Risk').length;
    const moderateRisk = assessmentHistory.filter(a => 
        a.riskLevel === 'Moderate' || a.riskLevel === 'Moderately Severe').length;
    const highRisk = assessmentHistory.filter(a => 
        a.riskLevel === 'Severe' || a.riskLevel === 'High').length;
    
    const lastItem = assessmentHistory[assessmentHistory.length - 1];
    const lastDate = lastItem ? new Date(lastItem.date).toLocaleDateString() : (t?.never || 'Never');
    
    // Update stats
    if (totalEl) totalEl.textContent = total;
    if (avgEl) avgEl.textContent = avgScore;
    if (lowEl) lowEl.textContent = lowRisk;
    if (modEl) modEl.textContent = moderateRisk;
    if (highEl) highEl.textContent = highRisk;
    if (lastEl) {
        lastEl.textContent = lastDate;
        // Fix date overflow
        lastEl.style.fontSize = '1rem';
        lastEl.style.wordBreak = 'break-word';
    }
    
    // Update recent list
    if (recentList) {
        const recentHtml = assessmentHistory.slice(-5).reverse().map(a => {
            const riskClass = (a.riskLevel || '').toLowerCase().replace(' ', '');
            return `
                <div class="recent-item">
                    <div class="recent-info">
                        <span class="recent-type">${a.type}</span>
                        <span class="recent-date">${new Date(a.date).toLocaleDateString()}</span>
                    </div>
                    <span class="recent-score ${riskClass}">${a.score}/${a.maxScore}</span>
                </div>
            `;
        }).join('');
        recentList.innerHTML = recentHtml;
    }
    
    // Update chart
    updateChart();
}

// Initialize and update Chart.js chart
function updateChart() {
    const canvas = document.getElementById('assessmentChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Prepare data for last 7 assessments
    const labels = assessmentHistory.slice(-7).map(a => new Date(a.date).toLocaleDateString());
    const scores = assessmentHistory.slice(-7).map(a => a.score);
    
    // Destroy existing chart if it exists
    if (assessmentChart) {
        assessmentChart.destroy();
    }
    
    // Create new chart
    assessmentChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Assessment Scores',
                data: scores,
                borderColor: '#008080',
                backgroundColor: 'rgba(0, 128, 128, 0.1)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: '#004225',
                pointBorderColor: '#F5F5DC',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    max: 27,
                    grid: { 
                        color: 'rgba(0, 66, 37, 0.1)' 
                    },
                    ticks: {
                        color: '#004225'
                    }
                },
                x: { 
                    grid: { display: false },
                    ticks: {
                        color: '#004225',
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: { 
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#F5F5DC',
                    titleColor: '#004225',
                    bodyColor: '#004225',
                    borderColor: '#008080',
                    borderWidth: 1
                }
            }
        }
    });
}

// Format date for display
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}