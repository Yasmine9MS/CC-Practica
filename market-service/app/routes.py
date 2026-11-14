from fastapi import APIRouter
from .services import obtainCryptoCurrencies, obtainCryptoCurrency


router = APIRouter()

@router.get("/api/market/cryptocurrencies")
def getAllCryptocurrencies():
    return obtainCryptoCurrencies()

@router.get("/api/market/cryptocurrencies/{symbol}")
def getCryptocurrency(symbol: str):
    return obtainCryptoCurrency(symbol)