import { state } from './state.js';
import { translateUI } from './language.js';

const routes = {};

export const router = {
    on(path, handler) { routes[path] = handler; },

    navigate(path) {
        window.location.hash = '#' + path;
    },

    init() {
        const render = () => {
            const hash = window.location.hash.slice(1) || '/';
            const page = document.getElementById('page');
            if (!page) return;

            // Auth guard
            if (!state.user && hash !== '/') {
                this.navigate('/');
                return;
            }

            const handler = routes[hash];
            if (handler) {
                handler(page);
            } else {
                page.innerHTML = '<p class="text-center">Page not found</p>';
            }

            // Update nav
            document.querySelectorAll('.nav-tab').forEach(t => {
                t.classList.toggle('active', t.dataset.route === hash);
            });

            // Translate page components
            translateUI(state.lang || 'en');
        };

        window.addEventListener('hashchange', render);
        render();
    }
};
