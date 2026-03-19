from fastapi.testclient import TestClient
from main import app
from deps import get_db

client = TestClient(app)


def setup_function():
    db = get_db()
    db["items"].clear()
    db["users"].clear()


def test_root_returns_message():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Multi-Router API"}


def test_create_item():
    response = client.post("/items/", json={"name": "Widget", "price": 9.99})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Widget"
    assert data["price"] == 9.99
    assert "id" in data


def test_list_items():
    client.post("/items/", json={"name": "Gadget", "price": 5.0})
    response = client.get("/items/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_delete_item():
    create_resp = client.post("/items/", json={"name": "Temp", "price": 1.0})
    item_id = create_resp.json()["id"]
    delete_resp = client.delete(f"/items/{item_id}")
    assert delete_resp.status_code == 200
    assert delete_resp.json()["deleted"] is True


def test_delete_nonexistent_item():
    response = client.delete("/items/99999")
    assert response.status_code == 404


def test_create_user():
    response = client.post("/users/", json={"name": "Alice", "email": "alice@test.com"})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Alice"
    assert data["email"] == "alice@test.com"


def test_list_users():
    client.post("/users/", json={"name": "Bob", "email": "bob@test.com"})
    response = client.get("/users/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
