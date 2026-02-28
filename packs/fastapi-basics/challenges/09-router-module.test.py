from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_router_prefix_applied():
    response = client.get("/items/")
    assert response.status_code == 200


def test_list_items_returns_data():
    response = client.get("/items/")
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_items_have_id_and_name():
    response = client.get("/items/")
    data = response.json()
    item = data[0]
    assert "id" in item
    assert "name" in item
