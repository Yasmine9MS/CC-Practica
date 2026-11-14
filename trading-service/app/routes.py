from fastapi import APIRouter, HTTPException
from services import createUser, signInUser, getProfile, buyCrypto, sellCrypto, updateBalance
from .schemas import UserCreate, UserResponse

router = APIRouter()

@router.post("/api/auth/register", response_model=UserResponse, status_code=201)
def registerUser():
    try:
        return createUser()
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))

@router.post("/api/auth/login")
def loginUser():
    return signInUser()

@router.get("/api/portfolio")
def getPortfolio():
    return getProfile()


@router.post("/api/trades/buy")
def buyCryptocurrency():
    return buyCrypto()

@router.post("/api/trades/sell")
def sellCryptoCurrency():
    return sellCrypto()

@router.post("/api/balance/recharge")
def rechargeBalance():
    return updateBalance()
