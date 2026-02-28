from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_existing_item():
    response = client.get("/items/1")
    assert response.status_code == 200
    data = response.json()
    assert data["item_id"] == 1


def test_get_nonexistent_item_returns_404():
    response = client.get("/items/999")
    assert response.status_code == 404


def test_404_response_has_detail():
    response = client.get("/items/999")
    data = response.json()
    assert "detail" in data
