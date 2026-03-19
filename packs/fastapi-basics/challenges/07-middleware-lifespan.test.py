from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_root_returns_hello_world():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello World"}


def test_health_returns_ok():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_timing_header_present():
    response = client.get("/")
    assert "x-process-time" in response.headers


def test_cors_headers_on_preflight():
    response = client.options(
        "/",
        headers={
            "Origin": "http://example.com",
            "Access-Control-Request-Method": "GET",
        },
    )
    assert response.status_code == 200
    assert "access-control-allow-origin" in response.headers
