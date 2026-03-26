// ─── Nav Component ────────────────────────────────────────────────────────
import { router } from '../lib/router.js';

export function renderNav() {
  return `
    <div class="nav-tabs" id="navTabs">
        <button class="nav-tab" data-route="/dashboard" id="tabDashboard">Dashboard</button>
        <button class="nav-tab" data-route="/screening" id="tabScreening">Screening</button>
        <button class="nav-tab" data-route="/resources" id="tabResources">Resources</button>
        <button class="nav-tab" data-route="/education" id="tabEducation">Learn</button>
    </div>
  `;
}

export function mountNav() {
  const slot = document.getElementById('nav-slot');
  if (slot) {
    slot.innerHTML = renderNav();
    slot.querySelectorAll('.nav-tab').forEach(btn => {
      btn.addEventListener('click', () => router.navigate(btn.dataset.route));
    });
  }
}
