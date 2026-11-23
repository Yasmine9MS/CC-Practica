import json

from app import services


def test_get_cached_crypto_currencies(monkeypatch):
    data = {
        "BTC": json.dumps({"symbol": "BTC", "name": "Bitcoin"}),
        "ETH": json.dumps({"symbol": "ETH", "name": "Ethereum"})
    }

    monkeypatch.setattr(
        services.redis_client,
        "keys",
        lambda pattern: ["crypto:BTC", "crypto:ETH"]
    )

    monkeypatch.setattr(
        services.redis_client,
        "get",
        lambda key: data.get(key.replace("crypto:", ""))
    )

    result = services.getCachedCryptoCurrencies()

    assert len(result["cryptocurrencies"]) == 2
    assert result["cryptocurrencies"][0]["symbol"] == "BTC"
    assert result["cryptocurrencies"][1]["symbol"] == "ETH"


def test_get_cached_crypto_currencies_sorts_symbols(monkeypatch):
    data = {
        "crypto:ETH": json.dumps({"symbol": "ETH"}),
        "crypto:BTC": json.dumps({"symbol": "BTC"})
    }

    monkeypatch.setattr(
        services.redis_client,
        "keys",
        lambda pattern: ["crypto:ETH", "crypto:BTC"]
    )

    monkeypatch.setattr(
        services.redis_client,
        "get",
        lambda key: data.get(key)
    )

    result = services.getCachedCryptoCurrencies()

    symbols = [
        crypto["symbol"]
        for crypto in result["cryptocurrencies"]
    ]

    assert symbols == ["BTC", "ETH"]


def test_obtain_crypto_currency_found(monkeypatch):
    bitcoin = {
        "symbol": "BTC",
        "name": "Bitcoin"
    }

    monkeypatch.setattr(
        services.redis_client,
        "get",
        lambda key: json.dumps(bitcoin)
    )

    result = services.obtainCryptoCurrency("btc")

    assert result == bitcoin


def test_obtain_crypto_currency_not_found(monkeypatch):
    monkeypatch.setattr(
        services.redis_client,
        "get",
        lambda key: None
    )

    result = services.obtainCryptoCurrency("UNKNOWN")

    assert "error" in result
    assert "UNKNOWN" in result["error"]