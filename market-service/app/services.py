import os
import httpx
from dotenv import load_dotenv

load_dotenv()

headers = {
    "x-cg-demo-api-key": os.getenv("COIN_GECKO_API_KEY")
}

def obtainCryptoCurrencies():
    parameters = {
        "vs_currency": "eur",
        "order": "market_cap_desc",
        "per_page": 100,
        "page": 1
    }

    response = httpx.get("https://api.coingecko.com/api/v3/coins/markets?", params=parameters, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": "Failed to fetch cryptocurrencies from CoinGecko API."}

def obtainCryptoCurrency(symbol: str):
    parameters = {
        "vs_currency": "eur",
        "symbols": symbol.lower()
    }

    response = httpx.get("https://api.coingecko.com/api/v3/coins/markets?", params=parameters, headers=headers)

    if response.status_code == 200:
        return response.json()
    else:
        return {"error": f"Failed to retrieve {symbol} cryptocurrency from CoinGecko API."}