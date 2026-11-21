
from fastapi import APIRouter, HTTPException

from .services import (
    getCachedCryptoCurrencies,
    obtainCryptoCurrency
)

router = APIRouter()


@router.get("/api/market/cryptocurrencies")
def getAllCryptocurrencies():

    try:
        return getCachedCryptoCurrencies()

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Error retrieving cached market data."
        )


@router.get("/api/market/cryptocurrencies/{symbol}")
def getCryptocurrency(symbol: str):

    try:
        cryptocurrency = obtainCryptoCurrency(symbol)

        if "error" in cryptocurrency:
            raise HTTPException(
                status_code=404,
                detail=cryptocurrency["error"]
            )

        return cryptocurrency

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=502,
            detail="Error retrieving cryptocurrency data."
        )
