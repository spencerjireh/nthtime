from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_list_items_uses_dependency():
    response = client.get("/items")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0


def test_items_have_expected_structure():
    response = client.get("/items")
    data = response.json()
    item = data[0]
    assert "id" in item
    assert "name" in item
