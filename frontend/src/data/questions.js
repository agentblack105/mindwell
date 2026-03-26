// ─── Questions Data ───────────────────────────────────────────────────────
export const OPTIONS = [
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

export const QUESTIONS = {
    phq9: [
        {
            id: 1,
            text: {
                en: "Little interest or pleasure in doing things?",
                pidgin: "You no get interest or happiness for things wey you dey do?",
                yoruba: "Ifẹ diẹ tabi idunnu ninu ṣiṣe awọn nkan?",
                igbo: "Enweghị mmasị ma ọ bụ ụtọ n'ime ihe?",
                hausa: "Rashin sha'awa ko jin daɗin yin abubuwa?"
            },
            options: OPTIONS
        },
        {
            id: 2,
            text: {
                en: "Feeling down, depressed, or hopeless?",
                pidgin: "You dey feel say body no sweet you or hope no dey?",
                yoruba: "Rilara irẹwẹsi, ibanujẹ, tabi ainireti?",
                igbo: "Inwe mwute, ịda mba, ma ọ bụ enweghị olileanya?",
                hausa: "Jin baƙin ciki, ɓacin rai, ko rashin bege?"
            },
            options: OPTIONS
        },
        {
            id: 3,
            text: {
                en: "Trouble falling or staying asleep, or sleeping too much?",
                pidgin: "You dey find am hard to sleep, or you dey sleep too much?",
                yoruba: "Iṣoro lati sun tabi lati sun oorun, tabi sun pupọ?",
                igbo: "Nsogbu ịrahụ ụra ma ọ bụ ihi ụra, ma ọ bụ ịrahụ ụra gabiga oke?",
                hausa: "Matsalar barci ko yawan barci?"
            },
            options: OPTIONS
        },
        {
            id: 4,
            text: {
                en: "Feeling tired or having little energy?",
                pidgin: "You dey feel tire or you no get energy?",
                yoruba: "Rilara rirẹ tabi nini agbara diẹ?",
                igbo: "Ịdị ike ọgwụgwụ ma ọ bụ inwe obere ume?",
                hausa: "Gajiya ko rashin ƙarfi?"
            },
            options: OPTIONS
        },
        {
            id: 5,
            text: {
                en: "Poor appetite or overeating?",
                pidgin: "You no get appetite to chop, or you dey chop too much?",
                yoruba: "Aini ifẹkú-ife tabi jijẹ apọju?",
                igbo: "Enweghị agụụ ma ọ bụ iribiga ihe?",
                hausa: "Rashin ci ko yawan ci?"
            },
            options: OPTIONS
        },
        {
            id: 6,
            text: {
                en: "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
                pidgin: "You dey feel bad about yourself, like you fail or you disappoint yourself or your family?",
                yoruba: "Rilara buburu nipa ara rẹ - tabi pe o jẹ alailanfani tabi ti jẹ ki ara rẹ tabi ẹbi rẹ silẹ?",
                igbo: "Inwe mmetọ banyere onwe gị - ma ọ bụ na ị bụ onye dara ada ma ọ bụ mee ka onwe gị ma ọ bụ ezinụlọ gị daa mba?",
                hausa: "Yin tunanin rashin kima - ko kai mai kasawa ne ko ka ji kunya da kanka ko iyalinka?"
            },
            options: OPTIONS
        },
        {
            id: 7,
            text: {
                en: "Trouble concentrating on things, such as reading the newspaper or watching television?",
                pidgin: "You dey find am hard to concentrate for things like reading or watching TV?",
                yoruba: "Iṣoro ni idojukọ lori awọn nkan, gẹgẹbi kika iwe iroyin tabi wiwo tẹlifisiọnu?",
                igbo: "Nsogbu itinye uche n'ihe, dịka ịgụ akwụkwọ akụkọ ma ọ bụ ikiri telivishọn?",
                hausa: "Matsalar maida hankali kan abubuwa, kamar karanta jarida ko kallon talabijin?"
            },
            options: OPTIONS
        },
        {
            id: 8,
            text: {
                en: "Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual?",
                pidgin: "You dey move or talk slow slow sotey people fit notice? Or you dey so restless say you dey move about too much?",
                yoruba: "Gbigbe tabi sisọ ni diẹdiẹ ti awọn eniyan miiran le ti ṣe akiyesi? Tabi idakeji - jijẹ aifọkanbalẹ tabi ainisinmi tobẹẹ ti o ti n lọ kiri pupọ ju igbagbogbo lọ?",
                igbo: "Ịgagharị ma ọ bụ ikwu okwu nwayọ nke na ndị ọzọ nwere ike ịchọpụta? Ma ọ bụ nke ọzọ - ịdị na-enweghị ntụpọ ma ọ bụ enweghị izu ike nke na ị na-agagharị karịa ka ọ na-adị?",
                hausa: "Motsi ko magana a hankali wanda wasu mutane zasu iya lura? Ko akasin haka - kasancewa mai tashin hankali ko rashin natsuwa har kana yawo fiye da yadda kuka saba?"
            },
            options: OPTIONS
        },
        {
            id: 9,
            text: {
                en: "Thoughts that you would be better off dead, or of hurting yourself in some way?",
                pidgin: "You dey think say e go better if you no dey alive, or you think to hurt yourself?",
                yoruba: "Awọn ero pe iwọ yoo dara julọ ti o ba ti ku, tabi ti ọrẹ ara ẹ ni ọna kan?",
                igbo: "Echiche na ọ ga-akara gị mma ịnwụ, ma ọ bụ imer onwe gị n'ụzọ ụfọdụ?",
                hausa: "Tunanin cewa zai fi kyau ka mutu, ko cutar da kanku ta wata hanya?"
            },
            options: OPTIONS
        }
    ],
    gad7: [
        {
            id: 1,
            text: {
                en: "Feeling nervous, anxious, or on edge?",
                pidgin: "You dey feel fear fear or body dey shake you?",
                yoruba: "Rilara aifọkanbalẹ, aniyan, tabi ẹdọfu?",
                igbo: "Ị na-enwe mmetụta ụjọ, nchegbu, ma ọ bụ iwe?",
                hausa: "Jin tsoro, damuwa, ko tashin hankali?"
            },
            options: OPTIONS
        },
        {
            id: 2,
            text: {
                en: "Not being able to stop or control worrying?",
                pidgin: "You no fit stop to dey worry?",
                yoruba: "Ko ni anfani lati da aibalẹ duro tabi ṣakoso rẹ?",
                igbo: "Enweghị ike ịkwụsị ma ọ bụ chịkwaa nchegbu?",
                hausa: "Rashin iya dakatarwa ko sarrafa damuwa?"
            },
            options: OPTIONS
        },
        {
            id: 3,
            text: {
                en: "Worrying too much about different things?",
                pidgin: "You dey worry too much about different things?",
                yoruba: "Ṣe aibalẹ pupọ nipa awọn oriṣiriṣi ọrọ?",
                igbo: "Na-echegbu onwe gị maka ihe dị iche iche?",
                hausa: "Yawan damuwa akan abubuwa daban-daban?"
            },
            options: OPTIONS
        },
        {
            id: 4,
            text: {
                en: "Trouble relaxing?",
                pidgin: "You dey find am hard to relax?",
                yoruba: "Iṣoro isinmi?",
                igbo: "Nsogbu izu ike?",
                hausa: "Matsalar shakatawa?"
            },
            options: OPTIONS
        },
        {
            id: 5,
            text: {
                en: "Being so restless that it's hard to sit still?",
                pidgin: "You dey so restless say e hard to sit down for one place?",
                yoruba: "Jije ainisinmi tobẹẹ ti o ṣoro lati joko?",
                igbo: "Enweghị ntụpọ nke na o siri ike ịnọdụ ala?",
                hausa: "Zama rashin natsuwa har yin zama ya yi wuya?"
            },
            options: OPTIONS
        },
        {
            id: 6,
            text: {
                en: "Becoming easily annoyed or irritable?",
                pidgin: "You dey vex quick quick?",
                yoruba: "Di ibinu ni irọrun tabi aibanujẹ?",
                igbo: "Ị na-ewe iwe ngwa ngwa ma ọ bụ na-ewe iwe?",
                hausa: "Sauƙin fushi ko haushi?"
            },
            options: OPTIONS
        },
        {
            id: 7,
            text: {
                en: "Feeling afraid as if something awful might happen?",
                pidgin: "You dey fear say something bad fit happen?",
                yoruba: "Rilara ibi bi ẹnipe nkan buruku le ṣẹlẹ?",
                igbo: "Ị na-atụ ụjọ dịka ihe ọjọọ nwere ike ime?",
                hausa: "Jin tsoro kamar wani mugun abu zai iya faruwa?"
            },
            options: OPTIONS
        }
    ]
};
