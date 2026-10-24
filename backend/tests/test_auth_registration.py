from fastapi.testclient import TestClient


def test_register_customer_success(client: TestClient) -> None:
    payload = {
        "email": "customer@example.com",
        "password": "SecurePass123!",
    }

    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert isinstance(data.get("id"), int)
    assert data.get("email") == "customer@example.com"
    assert data.get("role") == "customer"
    assert "password" not in data
    assert "password_hash" not in data


def test_register_duplicate_email_is_rejected(client: TestClient) -> None:
    payload = {
        "email": "customer@example.com",
        "password": "SecurePass123!",
    }

    # Register the user the first time
    client.post("/api/auth/register", json=payload)

    # Attempt to register with the same email again
    response = client.post("/api/auth/register", json=payload)

    assert response.status_code == 409
    assert response.json().get("detail") == "Email is already registered"

