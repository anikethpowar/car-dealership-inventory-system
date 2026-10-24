from fastapi.testclient import TestClient


def test_login_with_valid_credentials_returns_access_token(client: TestClient) -> None:
    register_payload = {
        "email": "customer@example.com",
        "password": "SecurePass123!",
    }
    register_response = client.post("/api/auth/register", json=register_payload)
    assert register_response.status_code == 201

    login_payload = {
        "email": "customer@example.com",
        "password": "SecurePass123!",
    }
    response = client.post("/api/auth/login", json=login_payload)

    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("access_token"), str)
    assert len(data.get("access_token")) > 0
    assert data.get("token_type") == "bearer"
    assert "password" not in data
    assert "password_hash" not in data


def test_login_with_invalid_password_is_rejected(client: TestClient) -> None:
    register_payload = {
        "email": "customer@example.com",
        "password": "SecurePass123!",
    }
    register_response = client.post("/api/auth/register", json=register_payload)
    assert register_response.status_code == 201

    login_payload = {
        "email": "customer@example.com",
        "password": "WrongPass123!",
    }
    response = client.post("/api/auth/login", json=login_payload)

    assert response.status_code == 401
    assert response.json().get("detail") == "Incorrect email or password"


def test_login_with_unknown_email_is_rejected(client: TestClient) -> None:
    login_payload = {
        "email": "unknown@example.com",
        "password": "SecurePass123!",
    }
    response = client.post("/api/auth/login", json=login_payload)

    assert response.status_code == 401
    assert response.json().get("detail") == "Incorrect email or password"

