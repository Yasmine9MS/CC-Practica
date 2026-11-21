
import json
import logging
import os

import httpx
import redis

from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD") or None,
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)

COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/markets"

headers = {
    "x-cg-demo-api-key": os.getenv("COIN_GECKO_API_KEY", "")
}


def obtainCryptoCurrencies():
    parameters = {
        "vs_currency": "eur",
        "order": "market_cap_desc",
        "per_page": 100,
        "page": 1
    }

    response = httpx.get(
        COINGECKO_URL,
        params=parameters,
        headers=headers,
        timeout=20
    )

    response.raise_for_status()

    return response.json()


def saveCryptoCurrencies(cryptocurrencies):

    for crypto in cryptocurrencies:

        symbol = crypto["symbol"].upper()

        data = {
            "coingeckoId": crypto["id"],
            "symbol": symbol,
            "name": crypto["name"],
            "price": crypto["current_price"],
            "currency": "EUR",
            "lastUpdated": crypto["last_updated"]
        }

        key = f"crypto:{symbol}"

        redis_client.set(key, json.dumps(data))


def updateMarketData():

    cryptocurrencies = obtainCryptoCurrencies()

    saveCryptoCurrencies(cryptocurrencies)

    logger.info(
        "Market data updated successfully: %s cryptocurrencies",
        len(cryptocurrencies)
    )

    return len(cryptocurrencies)
