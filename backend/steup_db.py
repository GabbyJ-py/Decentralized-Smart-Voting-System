setup_db


import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv

load_dotenv()

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"),
}

try:
    conn = mysql.connector.connect(**DB_CONFIG)
    cursor = conn.cursor()

    # Create database if not exists
    cursor.execute("CREATE DATABASE IF NOT EXISTS voter_db")
    print("Database 'voter_db' created or already exists.")

    # Use the database
    cursor.execute("USE voter_db")

    # Create table
    create_table_query = """
    CREATE TABLE IF NOT EXISTS registered_voter (
        id INT AUTO_INCREMENT PRIMARY KEY,
        voter_id VARCHAR(20) UNIQUE NOT NULL,
        name VARCHAR(100) NOT NULL,
        age INT NOT NULL,
        gender ENUM('Male','Female','Other') NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        mobile VARCHAR(15) UNIQUE NOT NULL,
        aadhaar VARCHAR(20) UNIQUE NOT NULL,
        photo_path VARCHAR(255) NOT NULL,
        has_voted BOOLEAN DEFAULT FALSE NOT NULL,
        registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_voter_id (voter_id),
        INDEX idx_aadhaar (aadhaar),
        INDEX idx_email (email),
        INDEX idx_has_voted (has_voted)
    );
    """

    cursor.execute(create_table_query)
    print("Table 'registered_voter' created or already exists.")

    conn.commit()
    cursor.close()
    conn.close()
    print("Database setup completed successfully!")

except Error as e:
    print(f"Database setup error: {e}")