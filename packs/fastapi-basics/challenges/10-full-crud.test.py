from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_create_item():
    response = client.post("/items/", json={"name": "Widget", "price": 9.99})
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Widget"
    assert data["price"] == 9.99
    assert "id" in data


def test_list_items():
    # Create an item first
    client.post("/items/", json={"name": "Gadget", "price": 5.0})
    response = client.get("/items/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_delete_item():
    # Create then delete
    create_resp = client.post("/items/", json={"name": "Temp", "price": 1.0})
    item_id = create_resp.json()["id"]
    delete_resp = client.delete(f"/items/{item_id}")
    assert delete_resp.status_code == 200
    assert delete_resp.json()["deleted"] is True


def test_delete_nonexistent_returns_404():
    response = client.delete("/items/99999")
    assert response.status_code == 404
