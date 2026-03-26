// ─── Dashboard Page ───────────────────────────────────────────────────────
import { state } from '../lib/state.js';
import { router } from '../lib/router.js';

export function DashboardPage(container) {
  const h = state.assessmentHistory || [];
  const total = h.length;
  const avg = total ? Math.round(h.reduce((s, a) => s + a.score, 0) / total) : 0;
  const low = h.filter(a => a.riskLevel === 'Low' || a.riskLevel === 'Minimal').length;
  const moderate = h.filter(a => ['Moderate', 'Moderately Severe'].includes(a.riskLevel)).length;
  const high = h.filter(a => a.riskLevel === 'Severe' || a.riskLevel === 'High').length;
  const lastDate = total ? new Date(h[h.length - 1].date).toLocaleDateString() : 'Never';

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  container.innerHTML = `
        <div id="dashboardSection" class="container">
            <div class="dashboard-header">
                <h2 class="section-title"><span id="welcomeBack">Welcome back,</span> <span
                        id="dashboardUsername">${state.user}</span>!</h2>
                <p class="dashboard-date" id="currentDate">${today}</p>
            </div>

            <!-- Statistics Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon">📊</div>
                    <div class="stat-content">
                        <span class="stat-label" id="totalAssessmentsLabel">Total Assessments</span>
                        <span class="stat-value" id="totalAssessments">${total}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📈</div>
                    <div class="stat-content">
                        <span class="stat-label" id="avgScoreLabel">Average Score</span>
                        <span class="stat-value" id="avgScore">${avg}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🟢</div>
                    <div class="stat-content">
                        <span class="stat-label" id="lowRiskLabel">Low Risk</span>
                        <span class="stat-value" id="lowRiskCount">${low}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🟡</div>
                    <div class="stat-content">
                        <span class="stat-label" id="moderateRiskLabel">Moderate Risk</span>
                        <span class="stat-value" id="moderateRiskCount">${moderate}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">🔴</div>
                    <div class="stat-content">
                        <span class="stat-label" id="highRiskLabel">High Risk</span>
                        <span class="stat-value" id="highRiskCount">${high}</span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon">📅</div>
                    <div class="stat-content">
                        <span class="stat-label" id="lastAssessmentLabel">Last Assessment</span>
                        <span class="stat-value" id="lastAssessmentDate">${lastDate}</span>
                    </div>
                </div>
            </div>

            <!-- Progress Chart -->
            <div class="chart-card">
                <h3 class="chart-title" id="progressTitle">Your Progress Over Time</h3>
                <div class="chart-container-large">
                    <canvas id="assessmentChart"></canvas>
                    ${total === 0 ? '<p class="no-data" style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center">Complete an assessment to see your progress here</p>' : ''}
                </div>
            </div>

            <!-- Recent Activity -->
            <div class="recent-activity-card">
                <h3 class="chart-title" id="recentTitle">Recent Assessments</h3>
                <div class="recent-list" id="recentList">
                    ${total === 0 ? '<p class="no-data" id="noAssessments">No assessments yet. Take your first assessment!</p>' :
      h.slice(-5).reverse().map(a => `
                            <div class="recent-item" style="display:flex; justify-content:space-between; padding: 1rem; border-bottom: 1px solid var(--border)">
                                <div><strong>${a.type.toUpperCase()}</strong><span class="text-muted" style="margin-left:.5rem; font-size: 0.85rem">${new Date(a.date).toLocaleDateString()}</span></div>
                                <span class="assessment-badge" style="background: ${a.riskLevel === 'Severe' ? 'var(--danger-color)' : a.riskLevel === 'Moderate' || a.riskLevel === 'Moderately Severe' ? 'var(--warning-color)' : 'var(--success-color)'}; color: white">${a.score}/${a.maxScore} — ${a.riskLabel}</span>
                            </div>
                        `).join('')}
                </div>
            </div>

            <!-- Quick Actions -->
            <div class="quick-actions">
                <button class="quick-action-btn" id="newAssessBtn">
                    <span>📝</span> <span id="newAssessmentBtn">New Assessment</span>
                </button>
                <button class="quick-action-btn" id="findHelpBtnAction">
                    <span>📍</span> <span id="findHelpBtn">Find Help</span>
                </button>
                <button class="quick-action-btn" id="learnMoreBtnAction">
                    <span>📚</span> <span id="learnMoreBtn">Learn More</span>
                </button>
            </div>
        </div>
  `;

  // ─── Draw the progress chart ────────────────────────────────────────────
  if (total > 0) {
    requestAnimationFrame(() => drawProgressChart(h));
  }

  document.getElementById('newAssessBtn')?.addEventListener('click', () => router.navigate('/screening'));
  document.getElementById('findHelpBtnAction')?.addEventListener('click', () => router.navigate('/resources'));
  document.getElementById('learnMoreBtnAction')?.addEventListener('click', () => router.navigate('/education'));
}

// ─── Vanilla Canvas Line Chart ────────────────────────────────────────────
function drawProgressChart(history) {
  const canvas = document.getElementById('assessmentChart');
  if (!canvas) return;

  const container = canvas.parentElement;
  const dpr = window.devicePixelRatio || 1;
  const width = container.clientWidth;
  const height = container.clientHeight || 200;
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = width + 'px';
  canvas.style.height = height + 'px';

  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);

  const pad = { top: 20, right: 20, bottom: 40, left: 45 };
  const chartW = width - pad.left - pad.right;
  const chartH = height - pad.top - pad.bottom;

  // Data — take last 10 assessments
  const data = history.slice(-10);
  const scores = data.map(d => d.score);
  const maxScores = data.map(d => d.maxScore);
  // Normalise to percentage for comparison across PHQ-9 (max 27) and GAD-7 (max 21)
  const pcts = scores.map((s, i) => Math.round((s / maxScores[i]) * 100));
  const maxY = 100;
  const minY = 0;
  const yRange = maxY - minY;

  const n = pcts.length;
  const xStep = n > 1 ? chartW / (n - 1) : chartW;

  // ─── Grid lines & Y-axis labels ────────────────────────────────────────
  ctx.strokeStyle = 'rgba(0, 66, 37, 0.08)';
  ctx.lineWidth = 1;
  ctx.font = '11px Inter, sans-serif';
  ctx.fillStyle = 'rgba(0, 66, 37, 0.45)';
  ctx.textAlign = 'right';

  for (let i = 0; i <= 4; i++) {
    const yVal = (maxY / 4) * i;
    const y = pad.top + chartH - (yVal / yRange) * chartH;
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(pad.left + chartW, y);
    ctx.stroke();
    ctx.fillText(yVal + '%', pad.left - 8, y + 4);
  }

  // ─── X-axis labels ─────────────────────────────────────────────────────
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(0, 66, 37, 0.45)';
  data.forEach((d, i) => {
    const x = pad.left + (n > 1 ? i * xStep : chartW / 2);
    const label = d.type.toUpperCase();
    const dateStr = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    ctx.fillText(label, x, height - pad.bottom + 16);
    ctx.fillText(dateStr, x, height - pad.bottom + 30);
  });

  // ─── Gradient fill under line ──────────────────────────────────────────
  const gradient = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH);
  gradient.addColorStop(0, 'rgba(0, 128, 128, 0.25)');
  gradient.addColorStop(1, 'rgba(0, 128, 128, 0.02)');

  ctx.beginPath();
  data.forEach((_, i) => {
    const x = pad.left + (n > 1 ? i * xStep : chartW / 2);
    const y = pad.top + chartH - (pcts[i] / yRange) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  // Close path down to baseline
  const lastX = pad.left + (n > 1 ? (n - 1) * xStep : chartW / 2);
  const firstX = pad.left + (n > 1 ? 0 : chartW / 2);
  ctx.lineTo(lastX, pad.top + chartH);
  ctx.lineTo(firstX, pad.top + chartH);
  ctx.closePath();
  ctx.fillStyle = gradient;
  ctx.fill();

  // ─── Line ──────────────────────────────────────────────────────────────
  ctx.beginPath();
  ctx.strokeStyle = '#008080';
  ctx.lineWidth = 2.5;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  data.forEach((_, i) => {
    const x = pad.left + (n > 1 ? i * xStep : chartW / 2);
    const y = pad.top + chartH - (pcts[i] / yRange) * chartH;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // ─── Dots with colour coding ───────────────────────────────────────────
  data.forEach((d, i) => {
    const x = pad.left + (n > 1 ? i * xStep : chartW / 2);
    const y = pad.top + chartH - (pcts[i] / yRange) * chartH;
    const color = d.riskLevel === 'Severe' || d.riskLevel === 'High' ? '#ef4444'
      : ['Moderate', 'Moderately Severe'].includes(d.riskLevel) ? '#f59e0b'
        : '#10b981';

    // Outer glow
    ctx.beginPath();
    ctx.arc(x, y, 6, 0, Math.PI * 2);
    ctx.fillStyle = color + '30';
    ctx.fill();

    // Inner dot
    ctx.beginPath();
    ctx.arc(x, y, 4, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
}
