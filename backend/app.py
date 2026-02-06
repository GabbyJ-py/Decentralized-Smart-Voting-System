from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
import os
import uuid
import random
import string
from werkzeug.utils import secure_filename
from web3 import Web3
from deepface import DeepFace
import base64
import cv2
import numpy as np
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# =========================
# APP SETUP
# =========================

app = Flask(__name__)
CORS(app)

# Configuration from environment variables
UPLOAD_FOLDER = os.getenv("UPLOAD_FOLDER", "uploads")
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "dev-secret-key")
app.config["MAX_CONTENT_LENGTH"] = int(os.getenv("MAX_UPLOAD_SIZE", 5242880))

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

from flask import send_from_directory

@app.route("/uploads/<path:filename>")
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


# =========================
# DATABASE CONFIG
# =========================

DB_CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "user": os.getenv("DB_USER", "root"),
    "password": os.getenv("DB_PASSWORD"),
    "database": os.getenv("DB_NAME", "voter_db")
}

def get_db_connection():
    try:
        return mysql.connector.connect(**DB_CONFIG)
    except Error as e:
        print(f"Database connection error: {e}")
        raise

# =========================
# HELPER FUNCTIONS
# =========================

def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def generate_voter_id(cursor):
    while True:
        voter_id = "VOTE" + "".join(random.choices(string.digits, k=6))
        cursor.execute(
            "SELECT COUNT(*) FROM registered_voter WHERE voter_id = %s",
            (voter_id,)
        )
        (count,) = cursor.fetchone()
        if count == 0:
            return voter_id

# =========================
# HEALTH CHECK
# =========================

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})

# =========================
# REGISTER API
# =========================

@app.route("/api/register", methods=["POST"])
def register():
    try:
        # -------- FORM DATA --------
        name = request.form.get("name")
        age = request.form.get("age")
        gender = request.form.get("gender")
        email = request.form.get("email")
        mobile = request.form.get("mobile")
        aadhaar = request.form.get("aadhaar")

        photo = request.files.get("photo")

        if not photo or not allowed_file(photo.filename):
            return jsonify({"success": False, "message": "Invalid or missing photo"}), 400

        # -------- SAVE PHOTO --------
        filename = f"{uuid.uuid4()}_{secure_filename(photo.filename)}"
        photo_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        photo.save(photo_path)

        # -------- DATABASE INSERT --------
        conn = get_db_connection()
        cursor = conn.cursor()

        voter_id = generate_voter_id(cursor)

        # Normalize Aadhaar
        normalized_aadhaar = aadhaar.replace("-", "").upper()

        cursor.execute("""
            SELECT COUNT(*) FROM registered_voter
            WHERE REPLACE(UPPER(aadhaar), '-', '') = %s
        """, (normalized_aadhaar,))

        (count,) = cursor.fetchone()

        if count > 0:
            return jsonify({
                "success": False,
                "message": "Aadhaar already registered"
            }), 409


        query = """
            INSERT INTO registered_voter
            (voter_id, name, age, gender, email, mobile, aadhaar, photo_path)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """

        cursor.execute(
            query,
            (voter_id, name, age, gender, email, mobile, aadhaar, photo_path)
        )

        conn.commit()
        cursor.close()
        conn.close()

        return jsonify({
            "success": True,
            "voter_id": voter_id,
            "message": "Voter registered successfully"
        })

    except Error as e:
        return jsonify({"success": False, "error": str(e)}), 500
    
@app.route("/api/find-voter", methods=["GET"])
def find_voter():
    query = request.args.get("query")

    if not query:
        return jsonify({"success": False, "message": "No ID provided"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    normalized = query.replace("-", "").upper()

    cursor.execute("""
        SELECT voter_id, name, aadhaar, email, photo_path, has_voted
        FROM registered_voter
        WHERE voter_id = %s
        OR REPLACE(UPPER(aadhaar), '-', '') = %s
    """, (query, normalized))


    voter = cursor.fetchone()
    cursor.close()
    conn.close()

    if not voter:
        return jsonify({
            "success": False,
            "message": "Identity not found in national registry"
        })

    return jsonify({
        "success": True,
        "voter": {
            "voterId": voter["voter_id"],
            "name": voter["name"],
            "aadhaar": voter["aadhaar"],
            "email": voter["email"],
            "hasVoted": bool(voter["has_voted"]),
            "faceEmbedding": f"http://127.0.0.1:5000/{voter['photo_path']}"
        }
    })

@app.route("/api/authenticate", methods=["POST"])
def authenticate():
    data = request.json
    voter_id = data.get("voterId")
    live_image_base64 = data.get("image")

    if not voter_id or not live_image_base64:
        return jsonify({
            "success": False,
            "message": "Invalid authentication request"
        }), 400

    # Get registered photo path from DB
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT photo_path FROM registered_voter WHERE voter_id = %s",
        (voter_id,)
    )
    voter = cursor.fetchone()
    cursor.close()
    conn.close()

    if not voter:
        return jsonify({
            "success": False,
            "message": "Voter not found"
        }), 404

    registered_image_path = voter["photo_path"]

    # Decode live image
    try:
        header, encoded = live_image_base64.split(",", 1)
        image_bytes = base64.b64decode(encoded)
        np_img = np.frombuffer(image_bytes, np.uint8)
        live_img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

        temp_live_path = f"temp_{uuid.uuid4()}.jpg"
        cv2.imwrite(temp_live_path, live_img)

        print(f"[DEBUG] Registered image: {registered_image_path}")
        print(f"[DEBUG] Live image saved to: {temp_live_path}")

        # STRICT Face verification using Facenet
        # enforce_detection=True ensures a face is actually detected
        result = DeepFace.verify(
            img1_path=registered_image_path,
            img2_path=temp_live_path,
            model_name="Facenet",
            detector_backend="opencv",
            enforce_detection=True,  # STRICT: Must detect face or fail
            distance_metric="cosine"
        )

        print(f"[DEBUG] DeepFace result: {result}")
        print(f"[DEBUG] Distance: {result['distance']}")
        print(f"[DEBUG] Verified: {result['verified']}")

        os.remove(temp_live_path)

        # STRICT threshold for production security
        # Lower threshold = stricter matching (0.60 for Facenet)
        STRICT_THRESHOLD = 0.60
        
        face_verified = result["verified"] and result["distance"] < STRICT_THRESHOLD

        print(f"[DEBUG] Face verified: {face_verified} (STRICT threshold: {STRICT_THRESHOLD}, distance: {result['distance']:.4f})")

        if face_verified:
            message = "Authentication successful"
        else:
            if result["distance"] >= STRICT_THRESHOLD:
                message = f"Face mismatch detected. Distance: {result['distance']:.4f} exceeds security threshold {STRICT_THRESHOLD}"
            else:
                message = "Face verification failed. Please try again with better lighting."

        return jsonify({
            "success": face_verified,
            "confidence": round(1 - result["distance"], 4) if result["distance"] < 1 else 0.10,
            "distance": result["distance"],
            "threshold": STRICT_THRESHOLD,
            "message": message
        })

    except Exception as e:
        print(f"[ERROR] Authentication failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": str(e)
        }), 500


# =========================
# BLOCKCHAIN INTEGRATION
# =========================

GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:7545")
CONTRACT_ADDRESS = os.getenv("CONTRACT_ADDRESS", "0xYourDeployedContractAddressHere") 

CONTRACT_ABI = json.loads('''
[
	{
		"inputs": [{"internalType": "string[]", "name": "_candidateNames", "type": "string[]"}],
		"stateMutability": "nonpayable", "type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{"indexed": true, "internalType": "string", "name": "voterHash", "type": "string"},
			{"indexed": true, "internalType": "uint256", "name": "candidateId", "type": "uint256"},
			{"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
		],
		"name": "VoteCast", "type": "event"
	},
	{
		"inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
		"name": "candidates",
		"outputs": [
			{"internalType": "uint256", "name": "id", "type": "uint256"},
			{"internalType": "string", "name": "name", "type": "string"},
			{"internalType": "uint256", "name": "voteCount", "type": "uint256"}
		],
		"stateMutability": "view", "type": "function"
	},
	{
		"inputs": [],
		"name": "candidatesCount",
		"outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
		"stateMutability": "view", "type": "function"
	},
	{
		"inputs": [
			{"internalType": "string", "name": "_voterHash", "type": "string"},
			{"internalType": "uint256", "name": "_candidateId", "type": "uint256"}
		],
		"name": "castVote", "outputs": [], "stateMutability": "nonpayable", "type": "function"
	},
	{
		"inputs": [{"internalType": "string", "name": "", "type": "string"}],
		"name": "hasVoted",
		"outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
		"stateMutability": "view", "type": "function"
	}
]
''')

try:
    w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
    if w3.is_connected():
        voting_contract = w3.eth.contract(address=CONTRACT_ADDRESS, abi=CONTRACT_ABI)
        print("Blockchain: Connected to Ganache successfully.")
    else:
        print("Blockchain: Failed to connect to Ganache.")
except Exception as e:
    print(f"Blockchain: Init error: {e}")

@app.route("/api/vote", methods=["POST"])
def vote():
    data = request.json
    email = data.get('email')
    candidate_id = int(data.get('candidateId'))
    voter_hash = data.get('voterHash')

    try:
        # Check blockchain connection
        if not w3.is_connected():
            return jsonify({
                "success": False, 
                "message": "Blockchain connection failed. Ensure Ganache is running on port 8545."
            }), 503

        # Get admin account from Ganache
        accounts = w3.eth.accounts
        if not accounts:
            return jsonify({
                "success": False,
                "message": "No Ganache accounts available."
            }), 503

        admin_account = accounts[0]

        # Cast vote on blockchain
        tx_hash = voting_contract.functions.castVote(
            voter_hash,
            candidate_id
        ).transact({
            'from': admin_account,
            'gas': 3000000
        })

        # Wait for transaction receipt
        receipt = w3.eth.wait_for_transaction_receipt(tx_hash)

        if receipt['status'] == 1:
            # Update MySQL Local Registry
            conn = get_db_connection()
            cursor = conn.cursor()
            cursor.execute("UPDATE registered_voter SET has_voted = TRUE WHERE email = %s", (email,))
            conn.commit()
            cursor.close()
            conn.close()

            return jsonify({
                "success": True,
                "message": "Vote recorded on blockchain successfully.",
                "tx_hash": receipt['transactionHash'].hex()
            })
        else:
            return jsonify({
                "success": False,
                "message": "Blockchain transaction failed."
            }), 500

    except Exception as e:
        print(f"[ERROR] Vote casting failed: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({
            "success": False,
            "message": f"Vote Error: {str(e)}"
        }), 500

@app.route("/api/results", methods=["GET"])
def get_results():
    try:
        results = []
        count = voting_contract.functions.candidatesCount().call()
        for i in range(1, count + 1):
            cand = voting_contract.functions.candidates(i).call()
            results.append({"id": cand[0], "name": cand[1], "votes": cand[2]})
        return jsonify(results)
    except Exception as e:
        return jsonify([])

@app.route("/api/history", methods=["GET"])
def get_history():
    try:
        # Get the VoteCast events from the contract
        events = voting_contract.events.VoteCast.get_logs(fromBlock=0)
        history = []
        for event in events:
            history.append({
                "voterHash": event.args.voterHash,
                "candidateId": event.args.candidateId,
                "timestamp": event.args.timestamp * 1000 # Convert to JS timestamp
            })
        return jsonify(history)
    except Exception as e:
        return jsonify([])

# =========================
# MAIN
# =========================

if __name__ == "__main__":
    port = int(os.getenv("FLASK_PORT", 5000))
    debug = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    app.run(port=port, debug=debug)