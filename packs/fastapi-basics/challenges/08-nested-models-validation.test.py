from fastapi.testclient import TestClient
from main import app, users

client = TestClient(app)


def setup_function():
    users.clear()


VALID_USER = {
    "name": "Alice",
    "email": "alice@example.com",
    "age": 30,
    "address": {
        "street": "123 Main St",
        "city": "Springfield",
        "zip_code": "12345",
    },
}


def test_create_user():
    response = client.post("/users", json=VALID_USER)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice"
    assert data["email"] == "alice@example.com"
    assert data["city"] == "Springfield"
    assert "id" in data


def test_list_users():
    client.post("/users", json=VALID_USER)
    response = client.get("/users")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_invalid_zip_returns_422():
    bad_user = {**VALID_USER, "address": {**VALID_USER["address"], "zip_code": "abc"}}
    response = client.post("/users", json=bad_user)
    assert response.status_code == 422


def test_invalid_age_returns_422():
    bad_user = {**VALID_USER, "age": -5}
    response = client.post("/users", json=bad_user)
    assert response.status_code == 422


def test_invalid_email_returns_422():
    bad_user = {**VALID_USER, "email": "not-an-email"}
    response = client.post("/users", json=bad_user)
    assert response.status_code == 422


def test_missing_nested_field_returns_422():
    bad_user = {**VALID_USER, "address": {"street": "123 Main St", "city": "Springfield"}}
    response = client.post("/users", json=bad_user)
    assert response.status_code == 422
