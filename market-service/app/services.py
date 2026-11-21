
import json
import os

import redis

from dotenv import load_dotenv

load_dotenv()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD") or None,
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)


def getCachedCryptoCurrencies():

    keys = redis_client.keys("crypto:*")

    cryptocurrencies = []

    for key in keys:

        data = redis_client.get(key)

        if data:
            cryptocurrencies.append(json.loads(data))

    cryptocurrencies.sort(
        key=lambda crypto: crypto["symbol"]
    )

    return {"cryptocurrencies": cryptocurrencies}


def obtainCryptoCurrency(symbol: str):

    data = redis_client.get(f"crypto:{symbol.upper()}")

    if data:
        return json.loads(data)

    return {
        "error": f"Cryptocurrency {symbol} not found in cache."
    }
