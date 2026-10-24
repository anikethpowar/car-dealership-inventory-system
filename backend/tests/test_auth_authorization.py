from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.db.database import get_db
from app.main import app
from app.models.user import User


def test_me_requires_authentication(client: TestClient) -> None:
    response = client.get("/api/auth/me")
    assert response.status_code == 401


def test_me_rejects_invalid_bearer_token(client: TestClient) -> None:
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": "Bearer invalid-token"},
    )
    assert response.status_code == 401
    assert bool(response.json().get("detail"))


def test_me_returns_current_authenticated_customer(client: TestClient) -> None:
    register_payload = {
        "email": "customer@example.com",
        "password": "SecurePass123!",
    }
    register_response = client.post("/api/auth/register", json=register_payload)
    assert register_response.status_code == 201

    login_response = client.post("/api/auth/login", json=register_payload)
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]

    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data.get("id"), int)
    assert data.get("email") == "customer@example.com"
    assert data.get("role") == "customer"
    assert "password" not in data
    assert "password_hash" not in data


def test_admin_route_rejects_customer(client: TestClient) -> None:
    register_payload = {
        "email": "customer@example.com",
        "password": "SecurePass123!",
    }
    register_response = client.post("/api/auth/register", json=register_payload)
    assert register_response.status_code == 201

    login_response = client.post("/api/auth/login", json=register_payload)
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]

    response = client.get(
        "/api/admin/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 403
    assert response.json().get("detail") == "Admin access required"


def test_admin_route_allows_admin(client: TestClient) -> None:
    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)
    try:
        admin_user = User(
            email="admin@example.com",
            password_hash=hash_password("AdminPass123!"),
            role="admin",
        )
        db.add(admin_user)
        db.commit()
    finally:
        db.close()

    login_response = client.post(
        "/api/auth/login",
        json={"email": "admin@example.com", "password": "AdminPass123!"},
    )
    assert login_response.status_code == 200
    access_token = login_response.json()["access_token"]

    response = client.get(
        "/api/admin/me",
        headers={"Authorization": f"Bearer {access_token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data.get("email") == "admin@example.com"
    assert data.get("role") == "admin"
    assert "password" not in data
    assert "password_hash" not in data
