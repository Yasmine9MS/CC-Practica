import os
from dotenv import load_dotenv
import psycopg2
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

db_name = "cryptosim"
db_user = os.getenv("POSTGRES_USER")
db_pass = os.getenv("POSTGRES_PASSWORD")
db_host = os.getenv("HOST")

def connectToDB():
    try:
        connection = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_pass,
            port=5432,
            host=db_host
        )

        return connection
    except psycopg2.Error as e:
        print("Error connecting to the database:", e)
        return None