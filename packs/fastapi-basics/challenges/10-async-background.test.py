from fastapi.testclient import TestClient
from main import app
from tasks import notifications

client = TestClient(app)


def setup_function():
    notifications.clear()


def test_list_items():
    response = client.get("/items")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == 2


def test_notify_queues_background_task():
    response = client.post(
        "/notify", json={"email": "test@example.com", "message": "Hello"}
    )
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "queued"
    assert "test@example.com" in data["message"]


def test_notification_was_sent():
    client.post("/notify", json={"email": "alice@test.com", "message": "Hi"})
    assert len(notifications) > 0
    assert notifications[-1]["email"] == "alice@test.com"


def test_stream_numbers():
    response = client.get("/stream/5")
    assert response.status_code == 200
    lines = response.text.strip().split("\n")
    assert lines == ["0", "1", "2", "3", "4"]


def test_compute_returns_result():
    response = client.get("/compute")
    assert response.status_code == 200
    assert response.json() == {"result": 42}
