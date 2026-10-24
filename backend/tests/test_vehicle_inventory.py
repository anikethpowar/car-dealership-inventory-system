from decimal import Decimal

from fastapi.testclient import TestClient

from app.core.security import hash_password
from app.db.database import get_db
from app.main import app
from app.models.user import User


def get_admin_token(client: TestClient, email: str = "admin@example.com") -> str:
    """Create an admin user directly in test db and return access token."""
    db_gen = app.dependency_overrides[get_db]()
    db = next(db_gen)
    try:
        admin_user = User(
            email=email,
            password_hash=hash_password("AdminPass123!"),
            role="admin",
        )
        db.add(admin_user)
        db.commit()
    finally:
        db.close()

    response = client.post(
        "/api/auth/login",
        json={"email": email, "password": "AdminPass123!"},
    )
    assert response.status_code == 200
    return response.json()["access_token"]


def get_customer_token(client: TestClient, email: str = "customer@example.com") -> str:
    """Register and log in a regular customer, returning access token."""
    reg_res = client.post(
        "/api/auth/register",
        json={"email": email, "password": "SecurePass123!"},
    )
    assert reg_res.status_code == 201

    login_res = client.post(
        "/api/auth/login",
        json={"email": email, "password": "SecurePass123!"},
    )
    assert login_res.status_code == 200
    return login_res.json()["access_token"]


def test_admin_can_create_valid_vehicle(client: TestClient) -> None:
    token = get_admin_token(client)
    payload = {
        "make": "Toyota",
        "model": "Camry",
        "category": "Sedan",
        "price": 26500.00,
        "quantity": 5,
    }
    response = client.post(
        "/api/vehicles",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 201
    data = response.json()
    assert isinstance(data["id"], int)
    assert data["make"] == "Toyota"
    assert data["model"] == "Camry"
    assert data["category"] == "Sedan"
    assert Decimal(str(data["price"])) == Decimal("26500.00")
    assert data["quantity"] == 5
    assert "created_at" in data
    assert "updated_at" in data


def test_customer_cannot_create_vehicle(client: TestClient) -> None:
    token = get_customer_token(client)
    payload = {
        "make": "Toyota",
        "model": "Camry",
        "category": "Sedan",
        "price": 26500.00,
        "quantity": 5,
    }
    response = client.post(
        "/api/vehicles",
        json=payload,
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_public_can_list_vehicles_without_token(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    client.post(
        "/api/vehicles",
        json={
            "make": "Honda",
            "model": "Civic",
            "category": "Sedan",
            "price": 24000.00,
            "quantity": 3,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )

    response = client.get("/api/vehicles")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert data["page"] == 1
    assert data["page_size"] == 10
    assert len(data["items"]) == 1
    assert data["items"][0]["make"] == "Honda"


def test_list_filtering(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    vehicles = [
        {
            "make": "Ford",
            "model": "F-150",
            "category": "Truck",
            "price": 45000.00,
            "quantity": 4,
        },
        {
            "make": "Ford",
            "model": "Mustang",
            "category": "Coupe",
            "price": 38000.00,
            "quantity": 0,
        },
        {
            "make": "Honda",
            "model": "CR-V",
            "category": "SUV",
            "price": 32000.00,
            "quantity": 2,
        },
    ]
    for v in vehicles:
        res = client.post(
            "/api/vehicles", json=v, headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert res.status_code == 201

    # Filter by make (case-insensitive exact match)
    res_make = client.get("/api/vehicles?make=ford")
    assert res_make.status_code == 200
    assert res_make.json()["total"] == 2

    # Filter by category (case-insensitive exact match)
    res_cat = client.get("/api/vehicles?category=suv")
    assert res_cat.status_code == 200
    assert res_cat.json()["total"] == 1
    assert res_cat.json()["items"][0]["model"] == "CR-V"

    # Filter by min_price
    res_min = client.get("/api/vehicles?min_price=35000")
    assert res_min.status_code == 200
    assert res_min.json()["total"] == 2

    # Filter by max_price
    res_max = client.get("/api/vehicles?max_price=35000")
    assert res_max.status_code == 200
    assert res_max.json()["total"] == 1
    assert res_max.json()["items"][0]["model"] == "CR-V"

    # Filter by in_stock (true -> quantity > 0)
    res_stock = client.get("/api/vehicles?in_stock=true")
    assert res_stock.status_code == 200
    assert res_stock.json()["total"] == 2
    for item in res_stock.json()["items"]:
        assert item["quantity"] > 0


def test_pagination(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    for i in range(5):
        client.post(
            "/api/vehicles",
            json={
                "make": f"Make{i}",
                "model": f"Model{i}",
                "category": "Sedan",
                "price": 20000.00 + i * 1000,
                "quantity": 1,
            },
            headers={"Authorization": f"Bearer {admin_token}"},
        )

    # Page 1, page_size 2
    res_p1 = client.get("/api/vehicles?page=1&page_size=2")
    assert res_p1.status_code == 200
    data_p1 = res_p1.json()
    assert data_p1["total"] == 5
    assert data_p1["page"] == 1
    assert data_p1["page_size"] == 2
    assert len(data_p1["items"]) == 2

    # Page 2, page_size 2
    res_p2 = client.get("/api/vehicles?page=2&page_size=2")
    assert res_p2.status_code == 200
    data_p2 = res_p2.json()
    assert data_p2["total"] == 5
    assert data_p2["page"] == 2
    assert len(data_p2["items"]) == 2
    # Deterministic order: newest ID first
    assert data_p1["items"][0]["id"] > data_p2["items"][0]["id"]


def test_public_text_search(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    vehicles = [
        {
            "make": "Toyota",
            "model": "RAV4",
            "category": "SUV",
            "price": 30000.00,
            "quantity": 3,
        },
        {
            "make": "Subaru",
            "model": "Outback",
            "category": "Wagon",
            "price": 29000.00,
            "quantity": 1,
        },
        {
            "make": "BMW",
            "model": "X5",
            "category": "Luxury SUV",
            "price": 65000.00,
            "quantity": 2,
        },
    ]
    for v in vehicles:
        client.post(
            "/api/vehicles", json=v, headers={"Authorization": f"Bearer {admin_token}"}
        )

    # Search make
    res1 = client.get("/api/vehicles/search?q=toy")
    assert res1.status_code == 200
    assert res1.json()["total"] == 1
    assert res1.json()["items"][0]["make"] == "Toyota"

    # Search model (case-insensitive)
    res2 = client.get("/api/vehicles/search?q=OUTBACK")
    assert res2.status_code == 200
    assert res2.json()["total"] == 1
    assert res2.json()["items"][0]["model"] == "Outback"

    # Search category (case-insensitive substring)
    res3 = client.get("/api/vehicles/search?q=suv")
    assert res3.status_code == 200
    assert res3.json()["total"] == 2

    # Whitespace-only search query rejected with 422
    res_blank = client.get("/api/vehicles/search?q=%20%20%20")
    assert res_blank.status_code == 422


def test_get_vehicle_by_id(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Mazda",
            "model": "CX-5",
            "category": "Crossover",
            "price": 28000.00,
            "quantity": 4,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    # Existing vehicle
    res = client.get(f"/api/vehicles/{v_id}")
    assert res.status_code == 200
    assert res.json()["model"] == "CX-5"

    # Unknown vehicle -> 404
    res_unknown = client.get("/api/vehicles/999999")
    assert res_unknown.status_code == 404
    assert res_unknown.json()["detail"] == "Vehicle not found"


def test_admin_can_partially_update_vehicle(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Nissan",
            "model": "Altima",
            "category": "Sedan",
            "price": 25000.00,
            "quantity": 2,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    update_payload = {"price": 23500.00, "quantity": 6}
    update_res = client.put(
        f"/api/vehicles/{v_id}",
        json=update_payload,
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert update_res.status_code == 200
    data = update_res.json()
    assert Decimal(str(data["price"])) == Decimal("23500.00")
    assert data["quantity"] == 6
    assert data["make"] == "Nissan"

    # Missing vehicle -> 404
    res_missing = client.put(
        "/api/vehicles/999999",
        json={"price": 20000.00},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_missing.status_code == 404
    assert res_missing.json()["detail"] == "Vehicle not found"


def test_customer_cannot_update_or_delete_vehicle(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    customer_token = get_customer_token(client)

    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Kia",
            "model": "K5",
            "category": "Sedan",
            "price": 24000.00,
            "quantity": 2,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    # Customer update rejected
    put_res = client.put(
        f"/api/vehicles/{v_id}",
        json={"price": 22000.00},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert put_res.status_code == 403
    assert put_res.json()["detail"] == "Admin access required"

    # Customer delete rejected
    del_res = client.delete(
        f"/api/vehicles/{v_id}",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert del_res.status_code == 403
    assert del_res.json()["detail"] == "Admin access required"


def test_admin_can_delete_vehicle(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Jeep",
            "model": "Wrangler",
            "category": "SUV",
            "price": 36000.00,
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    # Delete vehicle
    del_res = client.delete(
        f"/api/vehicles/{v_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_res.status_code == 204
    assert del_res.content == b""

    # Verify 404 afterward
    get_res = client.get(f"/api/vehicles/{v_id}")
    assert get_res.status_code == 404
    assert get_res.json()["detail"] == "Vehicle not found"

    # Deleting missing vehicle returns 404
    del_missing = client.delete(
        f"/api/vehicles/{v_id}",
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert del_missing.status_code == 404
    assert del_missing.json()["detail"] == "Vehicle not found"


def test_authenticated_customer_can_purchase_vehicle(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    customer_token = get_customer_token(client)

    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Tesla",
            "model": "Model 3",
            "category": "Electric Sedan",
            "price": 42000.00,
            "quantity": 3,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    # Customer purchase
    purchase_res = client.post(
        f"/api/vehicles/{v_id}/purchase",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert purchase_res.status_code == 200
    assert purchase_res.json()["quantity"] == 2

    # Second purchase decreases by 1 again
    purchase_res2 = client.post(
        f"/api/vehicles/{v_id}/purchase",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert purchase_res2.status_code == 200
    assert purchase_res2.json()["quantity"] == 1


def test_purchase_without_token_is_rejected(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Audi",
            "model": "A4",
            "category": "Sedan",
            "price": 40000.00,
            "quantity": 2,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    response = client.post(f"/api/vehicles/{v_id}/purchase")
    assert response.status_code == 401


def test_purchase_out_of_stock_vehicle_is_rejected(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    customer_token = get_customer_token(client)

    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Chevrolet",
            "model": "Corvette",
            "category": "Coupe",
            "price": 70000.00,
            "quantity": 0,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    # Attempt purchase when stock is 0
    response = client.post(
        f"/api/vehicles/{v_id}/purchase",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert response.status_code == 400
    assert response.json()["detail"] == "Vehicle is out of stock"

    # Confirm quantity remains 0 and never became negative
    get_res = client.get(f"/api/vehicles/{v_id}")
    assert get_res.json()["quantity"] == 0

    # Purchase non-existent vehicle returns 404
    missing_res = client.post(
        "/api/vehicles/999999/purchase",
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert missing_res.status_code == 404
    assert missing_res.json()["detail"] == "Vehicle not found"


def test_admin_can_restock_vehicle(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Volkswagen",
            "model": "Golf",
            "category": "Hatchback",
            "price": 25000.00,
            "quantity": 2,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    restock_res = client.post(
        f"/api/vehicles/{v_id}/restock",
        json={"quantity": 5},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert restock_res.status_code == 200
    assert restock_res.json()["quantity"] == 7

    # Restock non-existent vehicle returns 404
    res_missing = client.post(
        "/api/vehicles/999999/restock",
        json={"quantity": 5},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res_missing.status_code == 404
    assert res_missing.json()["detail"] == "Vehicle not found"


def test_customer_cannot_restock_vehicle(client: TestClient) -> None:
    admin_token = get_admin_token(client)
    customer_token = get_customer_token(client)

    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "Volvo",
            "model": "XC90",
            "category": "SUV",
            "price": 55000.00,
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    response = client.post(
        f"/api/vehicles/{v_id}/restock",
        json={"quantity": 3},
        headers={"Authorization": f"Bearer {customer_token}"},
    )
    assert response.status_code == 403
    assert response.json()["detail"] == "Admin access required"


def test_invalid_vehicle_values_rejected(client: TestClient) -> None:
    admin_token = get_admin_token(client)

    # Price = 0
    res1 = client.post(
        "/api/vehicles",
        json={"make": "A", "model": "B", "category": "C", "price": 0, "quantity": 1},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res1.status_code == 422

    # Negative price
    res2 = client.post(
        "/api/vehicles",
        json={
            "make": "A",
            "model": "B",
            "category": "C",
            "price": -500.0,
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res2.status_code == 422

    # Negative quantity
    res3 = client.post(
        "/api/vehicles",
        json={
            "make": "A",
            "model": "B",
            "category": "C",
            "price": 1000.0,
            "quantity": -1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res3.status_code == 422

    # Blank text fields
    res4 = client.post(
        "/api/vehicles",
        json={
            "make": "   ",
            "model": "B",
            "category": "C",
            "price": 1000.0,
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res4.status_code == 422

    res5 = client.post(
        "/api/vehicles",
        json={
            "make": "A",
            "model": "",
            "category": "C",
            "price": 1000.0,
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res5.status_code == 422

    res6 = client.post(
        "/api/vehicles",
        json={
            "make": "A",
            "model": "B",
            "category": "  \t ",
            "price": 1000.0,
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res6.status_code == 422

    # Create valid vehicle to test update and restock validation
    create_res = client.post(
        "/api/vehicles",
        json={
            "make": "A",
            "model": "B",
            "category": "C",
            "price": 1000.0,
            "quantity": 1,
        },
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    v_id = create_res.json()["id"]

    # Empty update body rejected
    res7 = client.put(
        f"/api/vehicles/{v_id}",
        json={},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res7.status_code == 422

    # Update with blank string
    res8 = client.put(
        f"/api/vehicles/{v_id}",
        json={"make": "   "},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res8.status_code == 422

    # Restock with quantity 0
    res9 = client.post(
        f"/api/vehicles/{v_id}/restock",
        json={"quantity": 0},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res9.status_code == 422

    # Restock with negative quantity
    res10 = client.post(
        f"/api/vehicles/{v_id}/restock",
        json={"quantity": -2},
        headers={"Authorization": f"Bearer {admin_token}"},
    )
    assert res10.status_code == 422
