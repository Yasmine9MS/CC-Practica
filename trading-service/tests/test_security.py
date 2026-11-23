
from datetime import datetime, timedelta, timezone

import jwt
import pytest
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app import security


def test_create_access_token(monkeypatch):
    monkeypatch.setattr(
        security, "JWT_SECRET", "test-secret-key-for-unit-tests-32chars"
    )

    token = security.createAccessToken(1)

    payload = jwt.decode(
        token,
        "test-secret-key-for-unit-tests-32chars",
        algorithms=["HS256"],
    )

    assert payload["sub"] == "1"
    assert "exp" in payload


def test_create_access_token_without_secret(monkeypatch):
    monkeypatch.setattr(security, "JWT_SECRET", None)

    with pytest.raises(RuntimeError):
        security.createAccessToken(1)


def test_get_current_user_valid_token(monkeypatch):
    monkeypatch.setattr(
        security, "JWT_SECRET", "test-secret-key-for-unit-tests-32chars"
    )

    token = security.createAccessToken(5)

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )

    result = security.getCurrentUser(credentials)

    assert result == 5


def test_get_current_user_invalid_token(monkeypatch):
    monkeypatch.setattr(
        security, "JWT_SECRET", "test-secret-key-for-unit-tests-32chars"
    )

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="invalid-token",
    )

    with pytest.raises(HTTPException) as error:
        security.getCurrentUser(credentials)

    assert error.value.status_code == 401


def test_get_current_user_expired_token(monkeypatch):
    monkeypatch.setattr(
        security, "JWT_SECRET", "test-secret-key-for-unit-tests-32chars"
    )

    payload = {
        "sub": "5",
        "exp": datetime.now(timezone.utc) - timedelta(minutes=1),
    }

    token = jwt.encode(
        payload,
        "test-secret-key-for-unit-tests-32chars",
        algorithm="HS256",
    )

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials=token,
    )

    with pytest.raises(HTTPException) as error:
        security.getCurrentUser(credentials)

    assert error.value.status_code == 401


def test_get_current_user_without_secret(monkeypatch):
    monkeypatch.setattr(security, "JWT_SECRET", None)

    credentials = HTTPAuthorizationCredentials(
        scheme="Bearer",
        credentials="some-token",
    )

    with pytest.raises(RuntimeError):
        security.getCurrentUser(credentials)
