from typing import Literal
from pydantic import BaseModel, Field
from decimal import Decimal

class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    password: str = Field(min_length=6, max_length=100)


class UserLogin(BaseModel):
    username: str
    password: str


class UserResponse(BaseModel):
    userId: int
    username: str
    balance: float
    currency: str

class TokenResponse(BaseModel):
    accessToken: str
    tokenType: Literal["Bearer"]

class TradeRequest(BaseModel):
    symbol: str
    quantity: Decimal = Field(gt=0)


class RechargeRequest(BaseModel):
    amount: Decimal = Field(gt=0)
