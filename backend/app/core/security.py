from pwdlib import PasswordHash

# Initialize password hashing using the recommended configuration
password_hash_context = PasswordHash.recommended()


def hash_password(password: str) -> str:
    """Hash a plain-text password using pwdlib's recommended hasher."""
    return password_hash_context.hash(password)

