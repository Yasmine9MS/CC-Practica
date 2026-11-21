import os
import json
import jwt
import redis

from decimal import Decimal, InvalidOperation
from datetime import datetime, timedelta, timezone

from pwdlib import PasswordHash
from psycopg2.errors import UniqueViolation

from .database import connectToDB
from .schemas import UserCreate, UserLogin



password_hash = PasswordHash.recommended()

redis_client = redis.Redis(
    host=os.getenv("REDIS_HOST", "redis"),
    port=int(os.getenv("REDIS_PORT", 6379)),
    password=os.getenv("REDIS_PASSWORD") or None,
    db=int(os.getenv("REDIS_DB", 0)),
    decode_responses=True
)


def getCryptoPrice(symbol: str) -> Decimal:

    key = f"crypto:{symbol.upper()}"

    crypto = redis_client.get(key)

    if crypto is None:
        raise LookupError("Cryptocurrency price not found.")

    data = json.loads(crypto)

    price = Decimal(str(data["price"]))

    if price <= 0:
        raise ValueError("Invalid cryptocurrency price.")

    return price


def validateQuantity(quantity) -> Decimal:

    try:
        quantity = Decimal(str(quantity))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError("Invalid quantity.")

    if not quantity.is_finite() or quantity <= 0:
        raise ValueError("Quantity must be greater than zero.")

    return quantity


def registerUser(user: UserCreate):

    connection = connectToDB()

    if connection is None:
        raise RuntimeError("Failed to connect to the database.")

    try:
        with connection:
            with connection.cursor() as cursor:

                hashed_password = password_hash.hash(user.password)

                cursor.execute(
                    """
                    INSERT INTO users (username, password_hash)
                    VALUES (%s, %s)
                    RETURNING id
                    """,
                    (user.username, hashed_password)
                )

                user_id = cursor.fetchone()[0]

                cursor.execute(
                    """
                    INSERT INTO wallets (user_id)
                    VALUES (%s)
                    RETURNING balance
                    """,
                    (user_id,)
                )

                balance = cursor.fetchone()[0]

        return {
            "userId": user_id,
            "username": user.username,
            "balance": float(balance),
            "currency": "EUR"
        }

    except UniqueViolation as e:
        raise ValueError("Username already exists.") from e

    finally:
        connection.close()


def loginUser(user: UserLogin):

    connection = connectToDB()

    if connection is None:
        raise RuntimeError("Failed to connect to the database.")

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT id, password_hash
                FROM users
                WHERE username = %s
                """,
                (user.username,)
            )

            result = cursor.fetchone()

            if result is None:
                raise ValueError("Invalid username or password.")

            user_id = result[0]
            hashed_password = result[1]

            if not password_hash.verify(
                user.password,
                hashed_password
            ):
                raise ValueError("Invalid username or password.")

            jwt_secret = os.getenv("JWT_SECRET")

            if not jwt_secret:
                raise RuntimeError("JWT_SECRET is not configured.")

            payload = {
                "sub": str(user_id),
                "exp": datetime.now(timezone.utc) + timedelta(minutes=30)
            }

            token = jwt.encode(
                payload,
                jwt_secret,
                algorithm="HS256"
            )

            return {
                "accessToken": token,
                "tokenType": "Bearer"
            }

    finally:
        connection.close()

def getProfile(user_id: int):

    connection = connectToDB()

    if connection is None:
        raise RuntimeError("Failed to connect to the database.")

    try:
        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT balance
                FROM wallets
                WHERE user_id = %s
                """,
                (user_id,)
            )

            wallet = cursor.fetchone()

            if wallet is None:
                raise LookupError("Wallet not found.")

            balance = Decimal(str(wallet[0]))

            cursor.execute(
                """
                SELECT
                    a.symbol,
                    wa.quantity,
                    wa.average_buy_price
                FROM wallet_assets wa
                JOIN assets a ON wa.asset_id = a.id
                WHERE wa.wallet_id = %s
                AND wa.quantity > 0
                """,
                (user_id,)
            )

            rows = cursor.fetchall()

            assets = []
            total_assets_value = Decimal("0")

            for row in rows:

                symbol = row[0]
                quantity = Decimal(str(row[1]))
                average_buy_price = Decimal(str(row[2]))

                current_price = getCryptoPrice(symbol)

                current_value = quantity * current_price

                profit_loss = (
                    current_price - average_buy_price
                ) * quantity

                if average_buy_price > 0:
                    profit_loss_percentage = (
                        (current_price - average_buy_price)
                        / average_buy_price
                    ) * Decimal("100")
                else:
                    profit_loss_percentage = Decimal("0")

                total_assets_value += current_value

                assets.append({
                    "symbol": symbol,
                    "quantity": float(quantity),
                    "averageBuyPrice": float(average_buy_price),
                    "currentPrice": float(current_price),
                    "currentValue": float(current_value),
                    "profitLoss": float(profit_loss),
                    "profitLossPercentage": float(
                        profit_loss_percentage
                    )
                })

            total_portfolio_value = balance + total_assets_value

            return {
                "balance": float(balance),
                "currency": "EUR",
                "assets": assets,
                "totalPortfolioValue": float(total_portfolio_value)
            }

    finally:
        connection.close()


def buyCrypto(user_id: int, symbol: str, quantity):

    quantity = validateQuantity(quantity)
    symbol = symbol.upper()

    price = getCryptoPrice(symbol)
    total = quantity * price

    connection = connectToDB()

    if connection is None:
        raise RuntimeError("Failed to connect to the database.")

    try:
        with connection:
            with connection.cursor() as cursor:
                syncAssets(cursor)

                cursor.execute(
                    """
                    SELECT balance
                    FROM wallets
                    WHERE user_id = %s
                    FOR UPDATE
                    """,
                    (user_id,)
                )

                wallet = cursor.fetchone()

                if wallet is None:
                    raise LookupError("Wallet not found.")

                balance = Decimal(str(wallet[0]))

                if balance < total:
                    raise ValueError("Insufficient balance.")

                cursor.execute(
                    """
                    SELECT id
                    FROM assets
                    WHERE symbol = %s
                    """,
                    (symbol,)
                )

                asset = cursor.fetchone()

                if asset is None:
                    raise LookupError("Cryptocurrency not found.")

                asset_id = asset[0]

                cursor.execute(
                    """
                    SELECT quantity, average_buy_price
                    FROM wallet_assets
                    WHERE wallet_id = %s AND asset_id = %s
                    FOR UPDATE
                    """,
                    (user_id, asset_id)
                )

                position = cursor.fetchone()

                if position is None:

                    new_quantity = quantity
                    new_average_price = price

                    cursor.execute(
                        """
                        INSERT INTO wallet_assets
                        (wallet_id, asset_id, quantity, average_buy_price)
                        VALUES (%s, %s, %s, %s)
                        """,
                        (
                            user_id,
                            asset_id,
                            new_quantity,
                            new_average_price
                        )
                    )

                else:

                    old_quantity = Decimal(str(position[0]))
                    old_average_price = Decimal(str(position[1]))

                    new_quantity = old_quantity + quantity

                    new_average_price = (
                        (old_quantity * old_average_price)
                        + (quantity * price)
                    ) / new_quantity

                    cursor.execute(
                        """
                        UPDATE wallet_assets
                        SET quantity = %s,
                            average_buy_price = %s
                        WHERE wallet_id = %s AND asset_id = %s
                        """,
                        (
                            new_quantity,
                            new_average_price,
                            user_id,
                            asset_id
                        )
                    )

                new_balance = balance - total

                cursor.execute(
                    """
                    UPDATE wallets
                    SET balance = %s
                    WHERE user_id = %s
                    """,
                    (new_balance, user_id)
                )

                cursor.execute(
                    """
                    INSERT INTO trades
                    (wallet_id, asset_id, side, quantity, price, total)
                    VALUES (%s, %s, 'BUY', %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        user_id,
                        asset_id,
                        quantity,
                        price,
                        total
                    )
                )

                trade_id = cursor.fetchone()[0]

        return {
            "tradeId": trade_id,
            "symbol": symbol,
            "side": "BUY",
            "quantity": float(quantity),
            "price": float(price),
            "total": float(total),
            "currency": "EUR",
            "status": "COMPLETED"
        }

    finally:
        connection.close()


def sellCrypto(user_id: int, symbol: str, quantity):

    quantity = validateQuantity(quantity)
    symbol = symbol.upper()

    price = getCryptoPrice(symbol)
    total = quantity * price

    connection = connectToDB()

    if connection is None:
        raise RuntimeError("Failed to connect to the database.")

    try:
        with connection:
            with connection.cursor() as cursor:
                syncAssets(cursor)

                cursor.execute(
                    """
                    SELECT balance
                    FROM wallets
                    WHERE user_id = %s
                    FOR UPDATE
                    """,
                    (user_id,)
                )

                wallet = cursor.fetchone()

                if wallet is None:
                    raise LookupError("Wallet not found.")

                balance = Decimal(str(wallet[0]))

                cursor.execute(
                    """
                    SELECT id
                    FROM assets
                    WHERE symbol = %s
                    """,
                    (symbol,)
                )

                asset = cursor.fetchone()

                if asset is None:
                    raise LookupError("Cryptocurrency not found.")

                asset_id = asset[0]

                cursor.execute(
                    """
                    SELECT quantity, average_buy_price
                    FROM wallet_assets
                    WHERE wallet_id = %s AND asset_id = %s
                    FOR UPDATE
                    """,
                    (user_id, asset_id)
                )

                position = cursor.fetchone()

                if position is None:
                    raise ValueError(
                        "You do not own this cryptocurrency."
                    )

                current_quantity = Decimal(str(position[0]))
                average_buy_price = Decimal(str(position[1]))

                if current_quantity < quantity:
                    raise ValueError(
                        "Insufficient cryptocurrency quantity."
                    )

                realized_profit_loss = (
                    price - average_buy_price
                ) * quantity

                new_quantity = current_quantity - quantity
                new_balance = balance + total

                cursor.execute(
                    """
                    UPDATE wallet_assets
                    SET quantity = %s
                    WHERE wallet_id = %s AND asset_id = %s
                    """,
                    (
                        new_quantity,
                        user_id,
                        asset_id
                    )
                )

                cursor.execute(
                    """
                    UPDATE wallets
                    SET balance = %s
                    WHERE user_id = %s
                    """,
                    (new_balance, user_id)
                )

                cursor.execute(
                    """
                    INSERT INTO trades
                    (wallet_id, asset_id, side, quantity, price,
                     total, realized_profit_loss)
                    VALUES (%s, %s, 'SELL', %s, %s, %s, %s)
                    RETURNING id
                    """,
                    (
                        user_id,
                        asset_id,
                        quantity,
                        price,
                        total,
                        realized_profit_loss
                    )
                )

                trade_id = cursor.fetchone()[0]

        return {
            "tradeId": trade_id,
            "symbol": symbol,
            "side": "SELL",
            "quantity": float(quantity),
            "price": float(price),
            "total": float(total),
            "currency": "EUR",
            "status": "COMPLETED"
        }

    finally:
        connection.close()



def syncAssets(cursor):

    for key in redis_client.scan_iter(match="crypto:*"):

        crypto = redis_client.get(key)

        if crypto is None:
            continue

        data = json.loads(crypto)

        coingecko_id = data.get("coingeckoId")
        symbol = data.get("symbol")
        name = data.get("name")

        if not coingecko_id or not symbol or not name:
            continue

        cursor.execute(
            """
            INSERT INTO assets (name, symbol, coingecko_id)
            VALUES (%s, %s, %s)
            ON CONFLICT (coingecko_id)
            DO UPDATE SET
                name = EXCLUDED.name,
                symbol = EXCLUDED.symbol
            """,
            (name, symbol.upper(), coingecko_id)
        )


def updateBalance(user_id: int, amount):

    try:
        amount = Decimal(str(amount))
    except (InvalidOperation, TypeError, ValueError):
        raise ValueError("Invalid recharge amount.")

    if not amount.is_finite() or amount <= 0:
        raise ValueError("Recharge amount must be positive.")

    connection = connectToDB()

    if connection is None:
        raise RuntimeError("Failed to connect to the database.")

    try:
        with connection:
            with connection.cursor() as cursor:

                cursor.execute(
                    """
                    SELECT balance
                    FROM wallets
                    WHERE user_id = %s
                    FOR UPDATE
                    """,
                    (user_id,)
                )

                wallet = cursor.fetchone()

                if wallet is None:
                    raise LookupError("Wallet not found.")

                previous_balance = Decimal(str(wallet[0]))

                if previous_balance >= Decimal("100"):
                    raise ValueError(
                        "Recharge is only allowed when balance "
                        "is below 100 EUR."
                    )

                new_balance = previous_balance + amount

                if new_balance > Decimal("10000"):
                    raise ValueError(
                        "Balance cannot exceed 10,000 EUR."
                    )

                cursor.execute(
                    """
                    UPDATE wallets
                    SET balance = %s
                    WHERE user_id = %s
                    """,
                    (new_balance, user_id)
                )

        return {
            "previousBalance": float(previous_balance),
            "rechargedAmount": float(amount),
            "newBalance": float(new_balance),
            "currency": "EUR"
        }

    finally:
        connection.close()



