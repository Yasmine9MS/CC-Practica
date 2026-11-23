import json

import pytest

from app import services


def test_obtain_crypto_currencies(monkeypatch):
    expected = [
        {
            "id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "current_price": 85000,
            "last_updated": "2026-11-23T12:00:00Z"
        }
    ]

    class MockResponse:
        def raise_for_status(self):
            pass

        def json(self):
            return expected

    def mock_get(*args, **kwargs):
        assert kwargs["params"]["vs_currency"] == "eur"
        return MockResponse()

    monkeypatch.setattr(services.httpx, "get", mock_get)

    result = services.obtainCryptoCurrencies()

    assert result == expected


def test_obtain_crypto_currencies_http_error(monkeypatch):
    def mock_get(*args, **kwargs):
        raise services.httpx.HTTPError("API unavailable")

    monkeypatch.setattr(services.httpx, "get", mock_get)

    with pytest.raises(services.httpx.HTTPError):
        services.obtainCryptoCurrencies()


def test_save_crypto_currencies(monkeypatch):
    saved_data = {}

    def mock_set(key, value):
        saved_data[key] = json.loads(value)

    monkeypatch.setattr(
        services.redis_client,
        "set",
        mock_set
    )

    cryptocurrencies = [
        {
            "id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "current_price": 85000,
            "last_updated": "2026-11-23T12:00:00Z"
        }
    ]

    services.saveCryptoCurrencies(cryptocurrencies)

    assert "crypto:BTC" in saved_data
    assert saved_data["crypto:BTC"]["symbol"] == "BTC"
    assert saved_data["crypto:BTC"]["name"] == "Bitcoin"
    assert saved_data["crypto:BTC"]["price"] == 85000
    assert saved_data["crypto:BTC"]["currency"] == "EUR"


def test_update_market_data(monkeypatch):
    cryptocurrencies = [
        {"id": "bitcoin", "symbol": "btc"},
        {"id": "ethereum", "symbol": "eth"}
    ]

    monkeypatch.setattr(
        services,
        "obtainCryptoCurrencies",
        lambda: cryptocurrencies
    )

    saved = []

    monkeypatch.setattr(
        services,
        "saveCryptoCurrencies",
        lambda data: saved.extend(data)
    )

    result = services.updateMarketData()

    assert result == 2
    assert len(saved) == 2