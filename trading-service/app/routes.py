from fastapi import APIRouter, HTTPException, Depends

from .services import (
    registerUser,
    loginUser,
    getProfile,
    buyCrypto,
    sellCrypto,
    updateBalance
)

from .schemas import (
    UserCreate,
    UserLogin,
    UserResponse,
    TokenResponse,
    TradeRequest,
    RechargeRequest
)

from .security import getCurrentUser

router = APIRouter()


@router.post(
    "/api/auth/register",
    response_model=UserResponse,
    status_code=201
)
def registerUserRoute(user: UserCreate):
    try:
        return registerUser(user)
    except ValueError as e:
        raise HTTPException(status_code=409, detail=str(e))


@router.post(
    "/api/auth/login",
    response_model=TokenResponse
)
def loginUserRoute(user: UserLogin):
    try:
        return loginUser(user)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))


@router.get("/api/portfolio")
def getPortfolio(user_id: int = Depends(getCurrentUser)):
    try:
        return getProfile(user_id)
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/api/trades/buy")
def buyCryptocurrency(
    trade: TradeRequest,
    user_id: int = Depends(getCurrentUser)
):
    try:
        return buyCrypto(user_id, trade.symbol, trade.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/api/trades/sell")
def sellCryptoCurrency(
    trade: TradeRequest,
    user_id: int = Depends(getCurrentUser)
):
    try:
        return sellCrypto(user_id, trade.symbol, trade.quantity)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except LookupError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/api/balance/recharge")
def rechargeBalance(
    recharge: RechargeRequest,
    user_id: int = Depends(getCurrentUser)
):
    try:
        return updateBalance(user_id, recharge.amount)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
