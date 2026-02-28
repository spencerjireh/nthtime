from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_default_query_params():
    response = client.get("/items")
    assert response.status_code == 200
    data = response.json()
    assert data["skip"] == 0
    assert data["limit"] == 10


def test_custom_query_params():
    response = client.get("/items?skip=5&limit=20")
    data = response.json()
    assert data["skip"] == 5
    assert data["limit"] == 20


def test_partial_query_params():
    response = client.get("/items?skip=3")
    data = response.json()
    assert data["skip"] == 3
    assert data["limit"] == 10
