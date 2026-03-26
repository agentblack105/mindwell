import pytest
from app.services.scoring_service import calculate_score, get_severity_band, check_critical_flags

def test_phq9_scoring():
    answers = {
        "phq9_q1": 1, "phq9_q2": 1, "phq9_q3": 0, "phq9_q4": 0,
        "phq9_q5": 0, "phq9_q6": 0, "phq9_q7": 0, "phq9_q8": 0,
        "phq9_q9": 0
    }
    score = calculate_score("phq9", answers)
    assert score == 2
    assert get_severity_band("phq9", score) == "minimal"
    
    answers["phq9_q9"] = 3
    score = calculate_score("phq9", answers)
    assert score == 5
    assert get_severity_band("phq9", score) == "mild"
    
    flags = check_critical_flags("phq9", answers)
    assert flags.get("self_harm") is True
    assert flags.get("crisis_recommended") is True

def test_invalid_tool_scoring():
    with pytest.raises(ValueError):
        calculate_score("invalid_tool", {})

def test_missing_questions_scoring():
    answers = {"phq9_q1": 1}
    with pytest.raises(ValueError):
        calculate_score("phq9", answers)

def test_gad7_scoring():
    answers = {
        "gad7_q1": 3, "gad7_q2": 3, "gad7_q3": 3, "gad7_q4": 3,
        "gad7_q5": 3, "gad7_q6": 3, "gad7_q7": 3
    }
    score = calculate_score("gad7", answers)
    assert score == 21
    assert get_severity_band("gad7", score) == "severe"
