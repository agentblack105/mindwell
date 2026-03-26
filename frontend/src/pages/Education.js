// ─── Education Page ───────────────────────────────────────────────────────
import { router } from '../lib/router.js';
import { CONDITIONS } from '../data/conditions.js';

export function EducationPage(container) {
  container.innerHTML = `
        <div id="educationSection" class="container">
            <div class="education-section">
                <h2 class="section-title" id="educationTitle">Understanding Mental Health</h2>

                <div class="condition-grid">
                    ${Object.entries(CONDITIONS).map(([key, c]) => `
                        <div class="condition-card" data-condition="${key}">
                            <div class="condition-name">${c.icon} ${c.title}</div>
                            <div class="condition-desc">${c.brief}</div>
                            <div class="learn-more">Learn more →</div>
                        </div>
                    `).join('')}
                </div>

                <!-- When to Seek Help -->
                <div class="help-section">
                    <h3 id="seekHelpTitle">When to Seek Help</h3>
                    <p id="seekHelpDesc">If you've experienced any of these symptoms for more than two weeks, consider
                        speaking with a mental health professional:</p>
                    <ul class="symptoms-list">
                        <li>• Persistent sadness, emptiness, or hopelessness</li>
                        <li>• Loss of interest in activities you once enjoyed</li>
                        <li>• Significant changes in sleep or appetite</li>
                        <li>• Difficulty concentrating or making decisions</li>
                        <li>• Withdrawal from friends and family</li>
                        <li>• Thoughts of self-harm or suicide</li>
                    </ul>
                </div>
            </div>

            <!-- CONDITION DETAIL MODAL -->
            <div class="condition-modal-overlay" id="conditionModal" style="display: none">
                <div class="condition-modal">
                    <button class="condition-modal-close" id="conditionModalClose">✕</button>
                    <div class="condition-modal-body" id="conditionModalBody"></div>
                </div>
            </div>
        </div>
    `;

  // Card clicks
  container.querySelectorAll('.condition-card').forEach(card => {
    card.addEventListener('click', () => openModal(card.dataset.condition));
  });

  document.getElementById('conditionModalClose')?.addEventListener('click', closeModal);
  document.getElementById('conditionModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'conditionModal') closeModal();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function openModal(key) {
  const c = CONDITIONS[key];
  if (!c) return;
  const modal = document.getElementById('conditionModal');
  const body = document.getElementById('conditionModalBody');

  let html = `<h2>${c.icon} ${c.title}</h2>`;
  c.sections.forEach(s => {
    if (s.heading) html += `<h3>${s.heading}</h3>`;
    if (s.content) html += `<p>${s.content}</p>`;
    if (s.list) html += `<ul>${s.list.map(i => `<li>${i}</li>`).join('')}</ul>`;
  });
  html += `
        <div style="display: flex; gap: 1rem; margin-top: 2rem">
            <button class="auth-btn" style="padding: 10px 20px" onclick="document.getElementById('conditionModal').style.display='none';document.body.style.overflow='';window.location.hash='#/screening'">📝 Take a Screening</button>
            <button class="auth-btn" style="padding: 10px 20px; background: transparent; border: 2px solid var(--primary-color); color: var(--text-color)" onclick="document.getElementById('conditionModal').style.display='none';document.body.style.overflow='';window.location.hash='#/resources'">📍 Find Resources</button>
        </div>
    `;

  body.innerHTML = html;
  modal.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('conditionModal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = '';
  }
}
