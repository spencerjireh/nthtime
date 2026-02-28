from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_user():
    response = client.post("/users", json={"name": "Alice", "email": "alice@test.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice"
    assert data["email"] == "alice@test.com"
    assert "id" in data


def test_create_user_has_id():
    response = client.post("/users", json={"name": "Bob", "email": "bob@test.com"})
    data = response.json()
    assert isinstance(data["id"], int)
