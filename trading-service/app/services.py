import psycopg2
from psycopg2.errors import UniqueViolation
import os
import httpx
from .database import connectToDB, User 
import jwt
from pwdlib import PasswordHash

password_hash = PasswordHash()

def registerUser(user: User):
    connection = connectToDB()
    if connection is None:
        return {"error": "Failed to connect to the database."}
    else:
        try:
            cursor = connection.cursor()

            cursor.execute(
                "INSERT INTO users (username, password_hash) VALUES (%s, %s) RETURNING id",
                (user.username, user.password)
            )

            user_id = cursor.fetchone()[0]

            cursor.execute(
                "INSERT INTO wallets (user_id) VALUES (%s) RETURNING balance",
                (user_id,)
            )

            balance = cursor.fetchone()[0]

            return {"id": user_id, "username": user.username, "balance": balance, "currency": "EUR"}

        except UniqueViolation as e:
            raise ValueError("Username already exists.") from e
        finally:
            connection.commit()
            cursor.close()
            connection.close()
        

def loginUser(user: User):
    user = user.username
    hashed_password = password_hash(user.password)
    connection = connectToDB()
    if connection is None:
        return {"error": "Failed to connect to the database."}
    else:
        try:
            cursor = connection.cursor()

            cursor.execute("SELECT id, password_hash FROM users WHERE username = %s", (user.username,))
            result = cursor.fetchone()

            if result is None:
                raise ValueError("Invalid username or password.")
            else:
                hashed_password_from_db = result[1]
                if password_hash.verify(user.password, hashed_password_from_db):
                    user_id = result[0]
                    token = jwt.encode({"user_id": user_id}, os.environ.get("JWT_SECRET"), algorithm="HS256")
                    return {"token": token}
        except Exception as e:
            raise ValueError("Invalid username or password.") from e
        
