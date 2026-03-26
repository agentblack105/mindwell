// ============================================================================
// EDUCATION MODULE - Learn More modals for mental health conditions
// ============================================================================

const CONDITION_DETAILS = {
    depression: {
        title: '🧠 Depression — A Deep Dive',
        sections: [
            {
                heading: 'What Is Depression?',
                content: 'Depression (Major Depressive Disorder) is not just "feeling sad." It is a medical condition that changes brain chemistry and affects how you feel, think, and function. In Nigeria, depression affects roughly 7% of the population — over 14 million people — yet most cases go undiagnosed because of stigma and lack of awareness.'
            },
            {
                heading: 'Common Symptoms',
                list: [
                    'Persistent sadness, emptiness, or feeling "down" for most of the day, nearly every day',
                    'Loss of interest or pleasure in activities you once enjoyed',
                    'Significant weight loss or weight gain (more than 5% of body weight in a month)',
                    'Insomnia (difficulty sleeping) or hypersomnia (sleeping too much)',
                    'Fatigue or loss of energy nearly every day',
                    'Feelings of worthlessness or excessive guilt',
                    'Difficulty thinking, concentrating, or making decisions',
                    'Recurrent thoughts of death or suicide'
                ]
            },
            {
                heading: 'The Nigerian Context',
                content: 'In many Nigerian communities, depression is often attributed to spiritual causes, witchcraft, or personal weakness. This stigma prevents many people from seeking help. The truth is that depression is a medical condition — like diabetes or hypertension — and it responds well to treatment. You are not weak for experiencing depression.'
            },
            {
                heading: 'Types of Depression',
                list: [
                    'Major Depressive Disorder — severe symptoms lasting at least 2 weeks',
                    'Persistent Depressive Disorder (Dysthymia) — milder but chronic, lasting 2+ years',
                    'Postpartum Depression — occurs after childbirth, affecting 1 in 7 Nigerian mothers',
                    'Seasonal Affective Disorder — linked to changes in seasons and daylight',
                    'Psychotic Depression — severe depression accompanied by delusions or hallucinations'
                ]
            },
            {
                heading: 'Treatment Options',
                content: 'Depression is one of the most treatable mental health conditions. Treatment typically includes:'
            },
            {
                list: [
                    'Psychotherapy (CBT, talk therapy) — proven to be highly effective',
                    'Medication (antidepressants) — prescribed by a psychiatrist',
                    'Lifestyle changes — regular exercise, proper sleep, balanced diet',
                    'Social support — connecting with trusted friends, family, or support groups',
                    'Combined approach — therapy + medication works best for moderate-severe cases'
                ]
            },
            {
                heading: 'Self-Help Strategies',
                list: [
                    'Take a screening test (PHQ-9) to understand your symptoms better',
                    'Establish a daily routine — even small tasks count',
                    'Exercise for at least 30 minutes a day (even walking helps)',
                    'Avoid alcohol and substance use',
                    'Reach out to MANI (Mentally Aware Nigeria Initiative): 0809 111 6264',
                    'Remember: recovery is possible, and asking for help is brave'
                ]
            }
        ]
    },
    anxiety: {
        title: '💭 Anxiety Disorders — Understanding Excessive Worry',
        sections: [
            {
                heading: 'What Are Anxiety Disorders?',
                content: 'Anxiety is your body\'s natural response to stress. But when anxiety becomes excessive, persistent, and interferes with daily life, it becomes a disorder. Anxiety disorders are the most common mental health conditions worldwide, affecting over 284 million people globally.'
            },
            {
                heading: 'Common Symptoms',
                list: [
                    'Excessive, uncontrollable worry about everyday things',
                    'Feeling restless, on edge, or "wound up"',
                    'Racing heart, chest tightness, or shortness of breath',
                    'Muscle tension, headaches, or stomach problems',
                    'Difficulty sleeping or staying asleep',
                    'Irritability and difficulty concentrating',
                    'Panic attacks — sudden episodes of intense fear with physical symptoms',
                    'Avoidance of situations that trigger anxiety'
                ]
            },
            {
                heading: 'Types of Anxiety Disorders',
                list: [
                    'Generalized Anxiety Disorder (GAD) — chronic, excessive worry about many things',
                    'Panic Disorder — recurring unexpected panic attacks',
                    'Social Anxiety Disorder — intense fear of social situations and judgment',
                    'Specific Phobias — intense fear of specific objects or situations',
                    'Separation Anxiety — excessive fear of being apart from attachment figures',
                    'Agoraphobia — fear of situations where escape might be difficult'
                ]
            },
            {
                heading: 'The Nigerian Context',
                content: 'In Nigeria, anxiety often manifests around financial pressure, security concerns, exam stress, and family expectations. The "hustle culture" can mask anxiety symptoms — people push through without recognizing they need help. University students are particularly vulnerable, with studies showing anxiety prevalence of 20-30% among Nigerian undergraduates.'
            },
            {
                heading: 'Coping Techniques',
                list: [
                    '4-7-8 Breathing: Breathe in for 4 seconds, hold for 7, exhale for 8',
                    '5-4-3-2-1 Grounding: Name 5 things you see, 4 you feel, 3 you hear, 2 you smell, 1 you taste',
                    'Progressive Muscle Relaxation: Tense and relax each muscle group',
                    'Limit caffeine and sugar intake',
                    'Regular physical exercise (proven to reduce anxiety by 20-25%)',
                    'Journaling — writing down worries can reduce their power',
                    'Take the GAD-7 screening to assess your anxiety level'
                ]
            },
            {
                heading: 'When to See a Professional',
                content: 'If anxiety is affecting your work, relationships, sleep, or daily functioning for more than 2 weeks, it\'s time to seek professional help. Anxiety disorders respond very well to treatment — over 60% of people experience significant improvement with proper care.'
            }
        ]
    },
    ptsd: {
        title: '🛡️ PTSD — Understanding Trauma Response',
        sections: [
            {
                heading: 'What Is PTSD?',
                content: 'Post-Traumatic Stress Disorder (PTSD) develops after experiencing or witnessing a terrifying event. Your brain\'s "fight or flight" system becomes stuck in overdrive, causing intrusive memories, avoidance behaviours, and heightened reactivity long after the danger has passed.'
            },
            {
                heading: 'Common Symptoms',
                list: [
                    'Intrusive Memories — Flashbacks (reliving the event), nightmares, severe emotional distress triggered by reminders',
                    'Avoidance — Avoiding places, people, or activities that remind you of the trauma',
                    'Negative Changes in Thinking — Hopelessness, memory problems, difficulty maintaining relationships, emotional numbness',
                    'Changes in Reactions — Being easily startled, always on guard, trouble sleeping, angry outbursts, self-destructive behaviour'
                ]
            },
            {
                heading: 'Common Causes in Nigeria',
                list: [
                    'Kidnapping, armed robbery, or other violent crime',
                    'Boko Haram/insurgency exposure — affecting millions in NE Nigeria',
                    'Road traffic accidents (Nigeria has one of the highest road fatality rates globally)',
                    'Domestic violence and abuse',
                    'Community/ethnic clashes',
                    'Childhood trauma, neglect, or sexual abuse',
                    'Loss of loved ones to violence or disaster'
                ]
            },
            {
                heading: 'The Nigerian Perspective',
                content: 'PTSD is significantly underdiagnosed in Nigeria. Studies suggest that 10-30% of people in conflict-affected regions like Borno, Yobe, and Adamawa states experience PTSD symptoms. Cultural beliefs may attribute symptoms to spiritual attacks or curses, delaying proper treatment. The truth is: PTSD is a medical condition, not a spiritual problem, and it can be treated.'
            },
            {
                heading: 'Treatment Approaches',
                list: [
                    'Trauma-Focused CBT — the gold standard for PTSD treatment',
                    'EMDR (Eye Movement Desensitization and Reprocessing)',
                    'Medication — SSRIs can help manage symptoms',
                    'Group therapy — sharing experiences with others who understand',
                    'Narrative Exposure Therapy — particularly effective in conflict settings',
                    'Supportive counselling and psychoeducation'
                ]
            },
            {
                heading: 'Self-Care Tips',
                list: [
                    'Establish safety — you are no longer in danger',
                    'Maintain a routine to create predictability',
                    'Practice grounding techniques when flashbacks occur',
                    'Avoid using alcohol or drugs to cope',
                    'Connect with survivors\' support groups',
                    'Be patient with yourself — healing from trauma takes time'
                ]
            }
        ]
    },
    bipolar: {
        title: '🌓 Bipolar Disorder — Understanding Mood Extremes',
        sections: [
            {
                heading: 'What Is Bipolar Disorder?',
                content: 'Bipolar Disorder (formerly called manic depression) involves dramatic shifts in mood, energy, and activity levels. These shifts go far beyond normal ups and downs — they can affect sleep, behaviour, judgment, and the ability to think clearly. It affects approximately 2.4% of the global population.'
            },
            {
                heading: 'Manic Episodes — The "Highs"',
                list: [
                    'Abnormally elevated, expansive, or irritable mood',
                    'Inflated self-esteem or grandiosity',
                    'Decreased need for sleep (feeling rested after 3 hours)',
                    'Rapid, pressured speech — talking more than usual',
                    'Racing thoughts — ideas come too fast to follow',
                    'Increased goal-directed activity or risky behaviour',
                    'Excessive involvement in pleasurable activities (spending sprees, risky sex, unwise investments)'
                ]
            },
            {
                heading: 'Depressive Episodes — The "Lows"',
                list: [
                    'Persistent sadness, emptiness, or hopelessness',
                    'Loss of interest in nearly all activities',
                    'Significant changes in appetite and weight',
                    'Insomnia or excessive sleeping',
                    'Fatigue, loss of energy, or feeling slowed down',
                    'Feelings of worthlessness or excessive guilt',
                    'Suicidal thoughts or attempts (this requires immediate help)'
                ]
            },
            {
                heading: 'Types of Bipolar Disorder',
                list: [
                    'Bipolar I — full manic episodes (may or may not include depressive episodes)',
                    'Bipolar II — hypomanic episodes (less severe) with major depressive episodes',
                    'Cyclothymia — chronic fluctuating moods with hypomania and mild depression',
                    'Mixed Features — experiencing mania and depression simultaneously'
                ]
            },
            {
                heading: 'The Nigerian Context',
                content: 'In Nigeria, bipolar disorder is one of the most commonly misunderstood mental health conditions. During manic episodes, individuals may be described as "spiritually possessed" or unusually blessed. During depressive episodes, they may be told to "pray harder" or accused of laziness. These misinterpretations delay treatment by an average of 5-10 years. The Federal Neuro-Psychiatric hospitals across Nigeria are equipped to diagnose and treat bipolar disorder.'
            },
            {
                heading: 'Treatment',
                list: [
                    'Mood stabilizers (e.g., lithium) — the cornerstone of treatment',
                    'Atypical antipsychotics for managing acute episodes',
                    'Antidepressants (used carefully with mood stabilizers)',
                    'Psychotherapy — CBT, psychoeducation, and family therapy',
                    'Consistent daily routine — sleep, meals, and activities at regular times',
                    'Mood tracking — keeping a daily mood journal helps identify patterns'
                ]
            },
            {
                heading: 'Living Well with Bipolar Disorder',
                content: 'Bipolar disorder is a lifelong condition, but with proper treatment, many people live full and productive lives. The key is: never stop medication without consulting your doctor, learn to recognize your personal warning signs, build a strong support network, and educate your family about the condition. Recovery is absolutely possible.'
            }
        ]
    }
};

// ─── Modal functions (global) ─────────────────────────────────────────────

function openConditionModal(condition) {
    const modal = document.getElementById('conditionModal');
    const body = document.getElementById('conditionModalBody');
    if (!modal || !body) return;

    const data = CONDITION_DETAILS[condition];
    if (!data) return;

    let html = `<h2 class="condition-modal-title">${data.title}</h2>`;

    data.sections.forEach(section => {
        if (section.heading) {
            html += `<h3 class="condition-modal-heading">${section.heading}</h3>`;
        }
        if (section.content) {
            html += `<p class="condition-modal-text">${section.content}</p>`;
        }
        if (section.list) {
            html += '<ul class="condition-modal-list">';
            section.list.forEach(item => {
                html += `<li>${item}</li>`;
            });
            html += '</ul>';
        }
    });

    // Add action buttons
    html += `
        <div class="condition-modal-actions">
            <button class="condition-modal-btn primary" onclick="closeConditionModal(); window.openTab('screening');">
                📝 Take a Screening
            </button>
            <button class="condition-modal-btn" onclick="closeConditionModal(); window.openTab('resources');">
                📍 Find Resources
            </button>
            <button class="condition-modal-btn" onclick="closeConditionModal(); document.getElementById('chatButton')?.click();">
                💬 Talk to MindWell
            </button>
        </div>
    `;

    body.innerHTML = html;
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
}

function closeConditionModal() {
    const modal = document.getElementById('conditionModal');
    if (modal) {
        modal.classList.remove('open');
        document.body.style.overflow = '';
    }
}

// Close on overlay click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('condition-modal-overlay')) {
        closeConditionModal();
    }
});

// Close on Escape
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeConditionModal();
});

// Export for global access
window.openConditionModal = openConditionModal;
window.closeConditionModal = closeConditionModal;
