import secrets
import hashlib

def generate_session_token() -> str:
    """Generates a secure, random session token."""
    return secrets.token_urlsafe(32)

def hash_token(token: str) -> str:
    """
    Hashes a session token using SHA-256 for secure storage.
    We don't need bcrypt here because session tokens have high entropy
    and are not passwords chosen by users.
    """
    return hashlib.sha256(token.encode("utf-8")).hexdigest()
