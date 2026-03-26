from app.core.questionnaires import QUESTIONNAIRES

def calculate_score(tool: str, answers: dict[str, int]) -> int:
    """
    Calculates the total score for a valid tool.
    Raises ValueError if tool or questions are invalid.
    """
    if tool not in QUESTIONNAIRES:
        raise ValueError(f"Unknown tool: {tool}")
    
    expected_keys = {q["key"] for q in QUESTIONNAIRES[tool]["questions"]}
    provided_keys = set(answers.keys())
    
    if expected_keys != provided_keys:
        missing = expected_keys - provided_keys
        invalid = provided_keys - expected_keys
        raise ValueError(f"Missing keys: {missing}, Invalid keys: {invalid}")

    total = sum(val for val in answers.values())
    return total

def get_severity_band(tool: str, score: int) -> str:
    """
    Returns the severity band based on psychiatric guidelines.
    """
    if tool == "phq9":
        if score <= 4: return "minimal"
        if score <= 9: return "mild"
        if score <= 14: return "moderate"
        if score <= 19: return "moderately severe"
        return "severe"
        
    elif tool == "gad7":
        if score <= 4: return "minimal"
        if score <= 9: return "mild"
        if score <= 14: return "moderate"
        return "severe"
    
    return "unknown"

def check_critical_flags(tool: str, answers: dict[str, int]) -> dict:
    """
    Evaluates answers for critical flags like self-harm.
    """
    flags = {}
    
    if tool == "phq9":
        # Question 9 is about self-harm. Any score > 0 triggers the flag.
        if answers.get("phq9_q9", 0) > 0:
            flags["self_harm"] = True
            flags["crisis_recommended"] = True
            
    return flags
