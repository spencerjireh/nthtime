from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_item_by_id():
    response = client.get("/items/42")
    assert response.status_code == 200
    assert response.json()["item_id"] == 42


def test_different_ids_return_different_data():
    response = client.get("/items/7")
    assert response.json()["item_id"] == 7
