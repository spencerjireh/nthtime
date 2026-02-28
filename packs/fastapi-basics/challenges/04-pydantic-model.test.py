from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_item_with_valid_body():
    response = client.post("/items", json={"name": "Widget", "price": 9.99})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Widget"
    assert data["price"] == 9.99


def test_create_item_with_invalid_body_returns_422():
    response = client.post("/items", json={"name": "Widget"})
    assert response.status_code == 422


def test_create_item_with_wrong_type_returns_422():
    response = client.post("/items", json={"name": "Widget", "price": "not_a_number"})
    assert response.status_code == 422
