# Static definition of PHQ-9 and GAD-7 questionnaires

QUESTIONNAIRES = {
    "phq9": {
        "name": "Patient Health Questionnaire (PHQ-9)",
        "description": "A 9-question instrument given to patients in a primary care setting to screen for the presence and severity of depression.",
        "options": [
            {"value": 0, "text": "Not at all"},
            {"value": 1, "text": "Several days"},
            {"value": 2, "text": "More than half the days"},
            {"value": 3, "text": "Nearly every day"}
        ],
        "questions": [
            {"key": "phq9_q1", "text": "Little interest or pleasure in doing things"},
            {"key": "phq9_q2", "text": "Feeling down, depressed, or hopeless"},
            {"key": "phq9_q3", "text": "Trouble falling or staying asleep, or sleeping too much"},
            {"key": "phq9_q4", "text": "Feeling tired or having little energy"},
            {"key": "phq9_q5", "text": "Poor appetite or overeating"},
            {"key": "phq9_q6", "text": "Feeling bad about yourself - or that you are a failure or have let yourself or your family down"},
            {"key": "phq9_q7", "text": "Trouble concentrating on things, such as reading the newspaper or watching television"},
            {"key": "phq9_q8", "text": "Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual"},
            {"key": "phq9_q9", "text": "Thoughts that you would be better off dead, or of hurting yourself in some way"}
        ]
    },
    "gad7": {
        "name": "Generalized Anxiety Disorder 7 (GAD-7)",
        "description": "A 7-item questionnaire used to measure the severity of generalized anxiety disorder.",
        "options": [
            {"value": 0, "text": "Not at all"},
            {"value": 1, "text": "Several days"},
            {"value": 2, "text": "More than half the days"},
            {"value": 3, "text": "Nearly every day"}
        ],
        "questions": [
            {"key": "gad7_q1", "text": "Feeling nervous, anxious or on edge"},
            {"key": "gad7_q2", "text": "Not being able to stop or control worrying"},
            {"key": "gad7_q3", "text": "Worrying too much about different things"},
            {"key": "gad7_q4", "text": "Trouble relaxing"},
            {"key": "gad7_q5", "text": "Being so restless that it is hard to sit still"},
            {"key": "gad7_q6", "text": "Becoming easily annoyed or irritable"},
            {"key": "gad7_q7", "text": "Feeling afraid as if something awful might happen"}
        ]
    }
}
