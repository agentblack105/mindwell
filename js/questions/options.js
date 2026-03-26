// ============================================================================
// ANSWER OPTIONS (0-3 scale)
// ============================================================================

const options = [
    { 
        value: 0, 
        label: { 
            en: "Not at all", 
            pidgin: "Not at all", 
            yoruba: "Rara", 
            igbo: "Mba", 
            hausa: "A'a" 
        } 
    },
    { 
        value: 1, 
        label: { 
            en: "Several days", 
            pidgin: "Some days", 
            yoruba: "Awọn ọjọ diẹ", 
            igbo: "Ọtụtụ ụbọchị", 
            hausa: "Kwanaki da yawa" 
        } 
    },
    { 
        value: 2, 
        label: { 
            en: "More than half the days", 
            pidgin: "Plenty days", 
            yoruba: "Ju idaji lọ", 
            igbo: "Karịa ọkara", 
            hausa: "Fiye da rabin" 
        } 
    },
    { 
        value: 3, 
        label: { 
            en: "Nearly every day", 
            pidgin: "Almost everyday", 
            yoruba: "O fẹrẹ gbogbo ọjọ", 
            igbo: "Ihe fọrọ nke nta", 
            hausa: "Kusan kowace rana" 
        } 
    }
];

if (typeof window !== 'undefined') {
    window.options = options;
}