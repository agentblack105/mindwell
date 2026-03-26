// ─── Backend API Service ──────────────────────────────────────────────────
const BASE = 'http://localhost:8000/api/v1';
import { state } from './state.js';

async function request(path, opts = {}) {
    const headers = { 'Content-Type': 'application/json', ...opts.headers };
    if (state.sessionToken) headers['X-Session-Token'] = state.sessionToken;
    const res = await fetch(`${BASE}${path}`, { ...opts, headers });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return res.json();
}

export const api = {
    // Session
    async createSession(lang = 'en') {
        const data = await request('/sessions', {
            method: 'POST', body: JSON.stringify({ language: lang })
        });
        state.set('sessionToken', data.session_token);
        await request('/sessions/consent', {
            method: 'POST', body: JSON.stringify({ policy_version: '1.0' })
        });
        return data;
    },

    // Assessments
    async submitAssessment(tool, answers) {
        return request(`/assessments/${tool}`, {
            method: 'POST', body: JSON.stringify({ answers })
        });
    },

    // Risk prediction
    async predictRisk(assessmentId) {
        return request(`/risk/predict/${assessmentId}`);
    },

    // Chat
    async startChat() {
        return request('/chats/start', { method: 'POST' });
    },

    async sendMessage(chatId, content, lang) {
        return request(`/chats/${chatId}/message`, {
            method: 'POST',
            body: JSON.stringify({ role: 'user', content, language: lang })
        });
    }
};
