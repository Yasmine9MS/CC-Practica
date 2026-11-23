
import pytest
from fastapi import HTTPException

from app import routes
from app.schemas import (
    UserCreate,
    UserLogin,
    TradeRequest,
    RechargeRequest,
)


# REGISTRO

def test_register_user_success(monkeypatch):
    expected = {
        "userId": 1,
        "username": "testuser",
        "balance": 10000.0,
        "currency": "EUR",
    }

    monkeypatch.setattr(
        routes, "registerUser", lambda user: expected
    )

    result = routes.registerUserRoute(
        UserCreate(username="testuser", password="password123")
    )

    assert result == expected


def test_register_user_duplicate(monkeypatch):
    def raise_error(user):
        raise ValueError("Username already exists.")

    monkeypatch.setattr(routes, "registerUser", raise_error)

    with pytest.raises(HTTPException) as error:
        routes.registerUserRoute(
            UserCreate(username="testuser", password="password123")
        )

    assert error.value.status_code == 409


# LOGIN

def test_login_user_success(monkeypatch):
    expected = {
        "accessToken": "fake-token",
        "tokenType": "Bearer",
    }

    monkeypatch.setattr(
        routes, "loginUser", lambda user: expected
    )

    result = routes.loginUserRoute(
        UserLogin(username="testuser", password="password123")
    )

    assert result == expected


def test_login_user_invalid_credentials(monkeypatch):
    def raise_error(user):
        raise ValueError("Invalid username or password.")

    monkeypatch.setattr(routes, "loginUser", raise_error)

    with pytest.raises(HTTPException) as error:
        routes.loginUserRoute(
            UserLogin(username="testuser", password="wrongpassword")
        )

    assert error.value.status_code == 401


# CONSULTA DE CARTERA

def test_get_portfolio_success(monkeypatch):
    expected = {
        "balance": 9000.0,
        "currency": "EUR",
        "assets": [],
        "totalPortfolioValue": 9000.0,
    }

    monkeypatch.setattr(
        routes, "getProfile", lambda user_id: expected
    )

    result = routes.getPortfolio(user_id=1)

    assert result == expected


def test_get_portfolio_not_found(monkeypatch):
    def raise_error(user_id):
        raise LookupError("Wallet not found.")

    monkeypatch.setattr(routes, "getProfile", raise_error)

    with pytest.raises(HTTPException) as error:
        routes.getPortfolio(user_id=999)

    assert error.value.status_code == 404


# COMPRA

def test_buy_crypto_success(monkeypatch):
    expected = {
        "tradeId": 1,
        "symbol": "BTC",
        "side": "BUY",
        "quantity": 0.5,
        "price": 50000.0,
        "total": 25000.0,
        "currency": "EUR",
        "status": "COMPLETED",
    }

    monkeypatch.setattr(
        routes, "buyCrypto", lambda user_id, symbol, quantity: expected
    )

    result = routes.buyCryptocurrency(
        TradeRequest(symbol="BTC", quantity=0.5),
        user_id=1,
    )

    assert result == expected


def test_buy_crypto_insufficient_balance(monkeypatch):
    def raise_error(user_id, symbol, quantity):
        raise ValueError("Insufficient balance.")

    monkeypatch.setattr(routes, "buyCrypto", raise_error)

    with pytest.raises(HTTPException) as error:
        routes.buyCryptocurrency(
            TradeRequest(symbol="BTC", quantity=0.5),
            user_id=1,
        )

    assert error.value.status_code == 400


def test_buy_crypto_not_found(monkeypatch):
    def raise_error(user_id, symbol, quantity):
        raise LookupError("Cryptocurrency not found.")

    monkeypatch.setattr(routes, "buyCrypto", raise_error)

    with pytest.raises(HTTPException) as error:
        routes.buyCryptocurrency(
            TradeRequest(symbol="UNKNOWN", quantity=1),
            user_id=1,
        )

    assert error.value.status_code == 404


# VENTA

def test_sell_crypto_success(monkeypatch):
    expected = {
        "tradeId": 2,
        "symbol": "BTC",
        "side": "SELL",
        "quantity": 0.1,
        "price": 50000.0,
        "total": 5000.0,
        "currency": "EUR",
        "status": "COMPLETED",
    }

    monkeypatch.setattr(
        routes, "sellCrypto", lambda user_id, symbol, quantity: expected
    )

    result = routes.sellCryptoCurrency(
        TradeRequest(symbol="BTC", quantity=0.1),
        user_id=1,
    )

    assert result == expected


def test_sell_crypto_insufficient_quantity(monkeypatch):
    def raise_error(user_id, symbol, quantity):
        raise ValueError("Insufficient cryptocurrency quantity.")

    monkeypatch.setattr(routes, "sellCrypto", raise_error)

    with pytest.raises(HTTPException) as error:
        routes.sellCryptoCurrency(
            TradeRequest(symbol="BTC", quantity=10),
            user_id=1,
        )

    assert error.value.status_code == 400


def test_sell_crypto_not_found(monkeypatch):
    def raise_error(user_id, symbol, quantity):
        raise LookupError("Cryptocurrency not found.")

    monkeypatch.setattr(routes, "sellCrypto", raise_error)

    with pytest.raises(HTTPException) as error:
        routes.sellCryptoCurrency(
            TradeRequest(symbol="UNKNOWN", quantity=1),
            user_id=1,
        )

    assert error.value.status_code == 404


# RECARGA

def test_recharge_balance_success(monkeypatch):
    expected = {
        "previousBalance": 50.0,
        "rechargedAmount": 100.0,
        "newBalance": 150.0,
        "currency": "EUR",
    }

    monkeypatch.setattr(
        routes, "updateBalance", lambda user_id, amount: expected
    )

    result = routes.rechargeBalance(
        RechargeRequest(amount=100),
        user_id=1,
    )

    assert result == expected


def test_recharge_balance_invalid(monkeypatch):
    def raise_error(user_id, amount):
        raise ValueError("Balance cannot exceed 10,000 EUR.")

    monkeypatch.setattr(routes, "updateBalance", raise_error)

    with pytest.raises(HTTPException) as error:
        routes.rechargeBalance(
            RechargeRequest(amount=100),
            user_id=1,
        )

    assert error.value.status_code == 400
