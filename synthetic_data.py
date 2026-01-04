import pandas as pd
from faker import Faker
import random
import os

df = pd.read_csv('lfw_allnames.csv')
df = df.drop(columns=['images'], axis=1)

fake = Faker("en_IN")
df = df.head(5000)

def masked_aadhaar():
    return f"XXXX-XXXX-{random.randint(1000, 9999)}"

df["age"] = [random.randint(18, 80) for _ in range(len(df))]
df["gender"] = [random.choice(["Male", "Female", "Other"]) for _ in range(len(df))]
df["email"] = [fake.email() for _ in range(len(df))]
df["mobile"] = [fake.msisdn()[:10] for _ in range(len(df))]
df["aadhaar"] = [masked_aadhaar() for _ in range(len(df))]


photo_dir = "uploads/lfw-deepfunneled"  # folder containing all person folders
# Normalize name for matching
def normalize(name):
    return name.strip().lower()

# Create a mapping: normalized folder name -> folder path
folder_map = {}
for folder in os.listdir(photo_dir):
    folder_path = os.path.join(photo_dir, folder)
    if os.path.isdir(folder_path):
        folder_map[normalize(folder)] = folder_path

# Map photo folder to each voter
photo_paths = []

for name in df["name"]:
    key = normalize(name)
    if key in folder_map:
        photo_paths.append(folder_map[key])
    else:
        photo_paths.append("NOT_FOUND")

# Add column to CSV
df["photo_path"] = photo_paths

print(df.head(10))


import mysql.connector

# Connect to MySQL database
conn = mysql.connector.connect(
    host='localhost',
    user='root',
    password='jithusibi21',
    database='voter_db'
)
cursor = conn.cursor()

# Insert dataframe rows into users table
for idx, row in df.iterrows():
    query = "INSERT INTO users (name, age, gender, email, mobile, aadhaar, photo_path) VALUES (%s, %s, %s, %s, %s, %s, %s)"
    cursor.execute(query, (row['name'], row['age'], row['gender'], row['email'], row['mobile'], row['aadhaar'], row['photo_path']))

conn.commit()
cursor.close()
conn.close()

print("✅ Data appended to database successfully")

