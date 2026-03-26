// ============================================================================
// COMBINED TRANSLATIONS - ALL 5 LANGUAGES
// ============================================================================

const translations = {
    en: enTranslations,
    pidgin: pidginTranslations,
    yoruba: yorubaTranslations,
    igbo: igboTranslations,
    hausa: hausaTranslations
};

// Make translations available globally
if (typeof window !== 'undefined') {
    window.translations = translations;
}