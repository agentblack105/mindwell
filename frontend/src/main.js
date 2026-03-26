// ─── Main Entry Point ─────────────────────────────────────────────────────
import './styles/main.css';
import { router } from './lib/router.js';
import { state } from './lib/state.js';
import { renderHeader, initHeader } from './components/Header.js';
import { renderChat, initChat } from './components/Chat.js';

// Pages — lazy loaded
import { AuthPage } from './pages/Auth.js';
import { DashboardPage } from './pages/Dashboard.js';
import { ScreeningPage } from './pages/Screening.js';
import { EducationPage } from './pages/Education.js';
import { ResourcesPage } from './pages/Resources.js';

function mount() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="bg-pattern"></div>
    ${renderHeader()}
    <div id="nav-slot"></div>
    <main id="page" class="main-content"></main>
    ${renderChat()}
  `;

  initHeader();
  initChat();

  // Register routes
  router.on('/', AuthPage);
  router.on('/dashboard', DashboardPage);
  router.on('/screening', ScreeningPage);
  router.on('/education', EducationPage);
  router.on('/resources', ResourcesPage);

  router.init();
}

document.addEventListener('DOMContentLoaded', mount);
