import pytest
from fastapi import HTTPException

from app import routes


def test_get_all_cryptocurrencies(monkeypatch):
    expected = {
        "cryptocurrencies": [
            {"symbol": "BTC", "name": "Bitcoin"}
        ]
    }

    monkeypatch.setattr(
        routes,
        "getCachedCryptoCurrencies",
        lambda: expected
    )

    result = routes.getAllCryptocurrencies()

    assert result == expected


def test_get_all_cryptocurrencies_error(monkeypatch):
    def raise_error():
        raise Exception("Redis unavailable")

    monkeypatch.setattr(
        routes,
        "getCachedCryptoCurrencies",
        raise_error
    )

    with pytest.raises(HTTPException) as error:
        routes.getAllCryptocurrencies()

    assert error.value.status_code == 502


def test_get_cryptocurrency_found(monkeypatch):
    expected = {
        "symbol": "BTC",
        "name": "Bitcoin"
    }

    monkeypatch.setattr(
        routes,
        "obtainCryptoCurrency",
        lambda symbol: expected
    )

    result = routes.getCryptocurrency("BTC")

    assert result == expected


def test_get_cryptocurrency_not_found(monkeypatch):
    monkeypatch.setattr(
        routes,
        "obtainCryptoCurrency",
        lambda symbol: {
            "error": "Cryptocurrency UNKNOWN not found in cache."
        }
    )

    with pytest.raises(HTTPException) as error:
        routes.getCryptocurrency("UNKNOWN")

    assert error.value.status_code == 404


def test_get_cryptocurrency_service_error(monkeypatch):
    def raise_error(symbol):
        raise Exception("Redis unavailable")

    monkeypatch.setattr(
        routes,
        "obtainCryptoCurrency",
        raise_error
    )

    with pytest.raises(HTTPException) as error:
        routes.getCryptocurrency("BTC")

    assert error.value.status_code == 502