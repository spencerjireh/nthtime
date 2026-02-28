from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_item_returns_response_model():
    response = client.get("/items/1")
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert "name" in data
    assert "price" in data


def test_response_matches_schema():
    response = client.get("/items/1")
    data = response.json()
    assert isinstance(data["id"], int)
    assert isinstance(data["name"], str)
    assert isinstance(data["price"], (int, float))
