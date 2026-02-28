from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_get_root_returns_hello_world():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_response_is_json():
    response = client.get("/")
    assert "application/json" in response.headers["content-type"]
