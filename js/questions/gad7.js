// ============================================================================
// GAD-7 QUESTIONS (Anxiety Screening)
// ============================================================================

const gad7Questions = [
    {
        id: 1,
        text: {
            en: "Feeling nervous, anxious, or on edge?",
            pidgin: "You dey feel fear fear or body dey shake you?",
            yoruba: "Rilara aifọkanbalẹ, aniyan, tabi ẹdọfu?",
            igbo: "Ị na-enwe mmetụta ụjọ, nchegbu, ma ọ bụ iwe?",
            hausa: "Jin tsoro, damuwa, ko tashin hankali?"
        }
    },
    {
        id: 2,
        text: {
            en: "Not being able to stop or control worrying?",
            pidgin: "You no fit stop to dey worry?",
            yoruba: "Ko ni anfani lati da aibalẹ duro tabi ṣakoso rẹ?",
            igbo: "Enweghị ike ịkwụsị ma ọ bụ chịkwaa nchegbu?",
            hausa: "Rashin iya dakatarwa ko sarrafa damuwa?"
        }
    },
    {
        id: 3,
        text: {
            en: "Worrying too much about different things?",
            pidgin: "You dey worry too much about different things?",
            yoruba: "Ṣe aibalẹ pupọ nipa awọn oriṣiriṣi ọrọ?",
            igbo: "Na-echegbu onwe gị maka ihe dị iche iche?",
            hausa: "Yawan damuwa akan abubuwa daban-daban?"
        }
    },
    {
        id: 4,
        text: {
            en: "Trouble relaxing?",
            pidgin: "You dey find am hard to relax?",
            yoruba: "Iṣoro isinmi?",
            igbo: "Nsogbu izu ike?",
            hausa: "Matsalar shakatawa?"
        }
    },
    {
        id: 5,
        text: {
            en: "Being so restless that it's hard to sit still?",
            pidgin: "You dey so restless say e hard to sit down for one place?",
            yoruba: "Jije ainisinmi tobẹẹ ti o ṣoro lati joko?",
            igbo: "Enweghị ntụpọ nke na o siri ike ịnọdụ ala?",
            hausa: "Zama rashin natsuwa har yin zama ya yi wuya?"
        }
    },
    {
        id: 6,
        text: {
            en: "Becoming easily annoyed or irritable?",
            pidgin: "You dey vex quick quick?",
            yoruba: "Di ibinu ni irọrun tabi aibanujẹ?",
            igbo: "Ị na-ewe iwe ngwa ngwa ma ọ bụ na-ewe iwe?",
            hausa: "Sauƙin fushi ko haushi?"
        }
    },
    {
        id: 7,
        text: {
            en: "Feeling afraid as if something awful might happen?",
            pidgin: "You dey fear say something bad fit happen?",
            yoruba: "Rilara ibi bi ẹnipe nkan buruku le ṣẹlẹ?",
            igbo: "Ị na-atụ ụjọ dịka ihe ọjọọ nwere ike ime?",
            hausa: "Jin tsoro kamar wani mugun abu zai iya faruwa?"
        }
    }
];

if (typeof window !== 'undefined') {
    window.gad7Questions = gad7Questions;
}