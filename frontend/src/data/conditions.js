// ─── Conditions Data ──────────────────────────────────────────────────────
export const CONDITIONS = {
    depression: {
        icon: '🧠', title: 'Depression',
        brief: 'More than just sadness — a serious mood disorder affecting how you feel, think, and handle daily life.',
        sections: [
            { heading: 'What Is Depression?', content: 'Depression (Major Depressive Disorder) is a medical condition that changes brain chemistry. In Nigeria, it affects roughly 7% of the population — over 14 million people — yet most cases go undiagnosed due to stigma.' },
            { heading: 'Common Symptoms', list: ['Persistent sadness or emptiness nearly every day', 'Loss of interest in activities you once enjoyed', 'Significant weight changes (gain or loss)', 'Insomnia or sleeping too much', 'Fatigue or loss of energy', 'Feelings of worthlessness or excessive guilt', 'Difficulty concentrating or making decisions', 'Recurrent thoughts of death or suicide'] },
            { heading: 'The Nigerian Context', content: 'In many Nigerian communities, depression is often attributed to spiritual causes, witchcraft, or personal weakness. This stigma prevents many from seeking help. The truth is: depression is a medical condition — like diabetes — and it responds well to treatment. You are not weak for experiencing depression.' },
            { heading: 'Types', list: ['Major Depressive Disorder — severe symptoms lasting 2+ weeks', 'Persistent Depressive Disorder (Dysthymia) — chronic, lasting 2+ years', 'Postpartum Depression — affects 1 in 7 Nigerian mothers', 'Seasonal Affective Disorder — linked to seasonal changes'] },
            { heading: 'Treatment Options', list: ['Psychotherapy (CBT, talk therapy) — highly effective', 'Medication (antidepressants) — prescribed by psychiatrists', 'Lifestyle changes — exercise, sleep, balanced diet', 'Social support — connecting with trusted friends/family', 'MANI Support Line: 0809 111 6264'] }
        ]
    },
    anxiety: {
        icon: '💭', title: 'Anxiety Disorders',
        brief: 'When worry becomes overwhelming — excessive fear or dread that interferes with daily life.',
        sections: [
            { heading: 'What Are Anxiety Disorders?', content: 'Anxiety is natural — but when it becomes excessive, persistent, and interferes with daily life, it becomes a disorder. It\'s the most common mental health condition worldwide, affecting over 284 million people.' },
            { heading: 'Common Symptoms', list: ['Excessive, uncontrollable worry', 'Feeling restless or on edge', 'Racing heart, chest tightness, breathing difficulties', 'Muscle tension, headaches, stomach problems', 'Difficulty sleeping', 'Irritability and poor concentration', 'Panic attacks — sudden intense fear with physical symptoms'] },
            { heading: 'Types', list: ['Generalized Anxiety Disorder (GAD)', 'Panic Disorder', 'Social Anxiety Disorder', 'Specific Phobias', 'Separation Anxiety'] },
            { heading: 'Nigerian Context', content: 'In Nigeria, anxiety often manifests around financial pressure, security concerns, exam stress, and family expectations. Studies show 20-30% anxiety prevalence among Nigerian university students.' },
            { heading: 'Coping Techniques', list: ['4-7-8 Breathing: inhale 4s, hold 7s, exhale 8s', '5-4-3-2-1 Grounding: 5 things you see, 4 feel, 3 hear, 2 smell, 1 taste', 'Progressive Muscle Relaxation', 'Regular exercise (reduces anxiety by 20-25%)', 'Journaling — writing down worries reduces their power'] }
        ]
    },
    ptsd: {
        icon: '🛡️', title: 'PTSD',
        brief: 'Post-Traumatic Stress Disorder — when your brain\'s fight-or-flight stays stuck after a traumatic event.',
        sections: [
            { heading: 'What Is PTSD?', content: 'PTSD develops after experiencing or witnessing a terrifying event. Your brain\'s alarm system stays stuck in overdrive, causing flashbacks, avoidance, and heightened reactivity.' },
            { heading: 'Common Symptoms', list: ['Flashbacks — reliving the traumatic event', 'Nightmares and severe sleep disturbances', 'Avoidance of triggering places/people', 'Emotional numbness and detachment', 'Being easily startled, always on guard', 'Angry outbursts, self-destructive behavior'] },
            { heading: 'Common Causes in Nigeria', list: ['Kidnapping, armed robbery, violent crime', 'Boko Haram/insurgency exposure', 'Road traffic accidents', 'Domestic violence and abuse', 'Childhood trauma'] },
            { heading: 'Nigerian Context', content: 'PTSD is significantly underdiagnosed in Nigeria. Studies suggest 10-30% prevalence in conflict-affected regions. Cultural beliefs may attribute symptoms to spiritual attacks, delaying treatment.' },
            { heading: 'Treatment', list: ['Trauma-Focused CBT — gold standard', 'EMDR (Eye Movement Desensitization and Reprocessing)', 'Medication — SSRIs can help manage symptoms', 'Narrative Exposure Therapy', 'Group therapy and support communities'] }
        ]
    },
    bipolar: {
        icon: '🌓', title: 'Bipolar Disorder',
        brief: 'Dramatic shifts between emotional highs (mania) and lows (depression) that go far beyond normal mood swings.',
        sections: [
            { heading: 'What Is Bipolar Disorder?', content: 'Bipolar Disorder involves dramatic shifts in mood, energy, and activity levels. These go far beyond normal ups and downs — affecting sleep, behavior, judgment, and thinking. Affects about 2.4% of the global population.' },
            { heading: 'Manic Episodes ("Highs")', list: ['Abnormally elevated or irritable mood', 'Inflated self-esteem, grandiosity', 'Decreased need for sleep', 'Rapid, pressured speech', 'Racing thoughts', 'Increased risky behavior'] },
            { heading: 'Depressive Episodes ("Lows")', list: ['Persistent sadness or hopelessness', 'Loss of interest in all activities', 'Changes in appetite and weight', 'Fatigue, loss of energy', 'Suicidal thoughts'] },
            { heading: 'Nigerian Context', content: 'In Nigeria, bipolar disorder is commonly misunderstood. During mania, individuals may be described as "spiritually possessed." During depression, they\'re told to "pray harder." These misinterpretations delay treatment by 5-10 years on average.' },
            { heading: 'Treatment', list: ['Mood stabilizers (lithium) — cornerstone treatment', 'Atypical antipsychotics for acute episodes', 'Psychotherapy — CBT and family therapy', 'Consistent daily routine', 'Mood tracking and early warning sign recognition'] }
        ]
    }
};
