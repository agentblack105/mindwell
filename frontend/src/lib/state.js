// ─── Global State ─────────────────────────────────────────────────────────
const _listeners = [];

export const state = {
    user: null,
    lang: localStorage.getItem('mindwell-lang') || 'en',
    sessionToken: null,
    assessmentHistory: [],
    lastAssessment: null,

    set(key, val) {
        this[key] = val;
        _listeners.forEach(fn => fn(key, val));
    },

    onchange(fn) { _listeners.push(fn); },

    /** Load assessment history for a specific user from localStorage */
    loadUserData(username) {
        const key = `mw-${username}-history`;
        this.assessmentHistory = JSON.parse(localStorage.getItem(key) || '[]');
        this.lastAssessment = this.assessmentHistory.length
            ? this.assessmentHistory[this.assessmentHistory.length - 1]
            : null;
    },

    /** Clear in-memory user data (on logout) without deleting stored data */
    clearUserData() {
        this.assessmentHistory = [];
        this.lastAssessment = null;
    },

    /** Persist current user's assessment history to localStorage */
    saveHistory() {
        if (!this.user) return;
        const key = `mw-${this.user}-history`;
        localStorage.setItem(key, JSON.stringify(this.assessmentHistory));
    }
};
