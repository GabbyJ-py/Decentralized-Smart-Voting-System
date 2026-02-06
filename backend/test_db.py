test_db.py

import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

print(f"DB_PASSWORD from env: {os.getenv('DB_PASSWORD')}")

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "voter_db")
}

print(f"DB_CONFIG: {DB_CONFIG}")

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    print("Database connection successful!")
    conn.close()
except Error as e:
    print(f"Database connection error: {e}")