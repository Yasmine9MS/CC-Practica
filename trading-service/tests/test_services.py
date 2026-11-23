from decimal import Decimal

import pytest

from app import services


# Tests de validateQuantity

def test_validate_quantity_valid():
    assert services.validateQuantity("2.5") == Decimal("2.5")


@pytest.mark.parametrize("quantity", ["0", "-1", "NaN"])
def test_validate_quantity_invalid(quantity):
    with pytest.raises(ValueError):
        services.validateQuantity(quantity)


def test_validate_quantity_non_numeric():
    with pytest.raises(ValueError):
        services.validateQuantity("abc")


# Tests de getCryptoPrice

def test_get_crypto_price_valid(monkeypatch):
    monkeypatch.setattr(
        services.redis_client,
        "get",
        lambda key: '{"price": 50000}'
    )

    assert services.getCryptoPrice("btc") == Decimal("50000")


def test_get_crypto_price_not_found(monkeypatch):
    monkeypatch.setattr(
        services.redis_client,
        "get",
        lambda key: None
    )

    with pytest.raises(LookupError):
        services.getCryptoPrice("BTC")


@pytest.mark.parametrize("price", ["0", "-10"])
def test_get_crypto_price_invalid(price, monkeypatch):
    monkeypatch.setattr(
        services.redis_client,
        "get",
        lambda key: f'{{"price": {price}}}'
    )

    with pytest.raises(ValueError):
        services.getCryptoPrice("BTC")
