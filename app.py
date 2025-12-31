from flask import Flask, render_template, request, redirect, url_for
import mysql.connector
from mysql.connector import Error
import os
from dotenv import load_dotenv
import uuid
from werkzeug.utils import secure_filename

load_dotenv()

app = Flask(__name__)

# =========================
# CONFIGURATION
# =========================

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

db_config = {
    'host': os.environ.get("DB_HOST", "localhost"),
    'user': os.environ.get("DB_USER", "root"),
    'password': os.environ.get("DB_PASSWORD", ""),
    'database': os.environ.get("DB_NAME", "voter_db")
}

# =========================
# HELPER FUNCTIONS
# =========================

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def get_db_connection():
    try:
        return mysql.connector.connect(**db_config)
    except Error as e:
        print("Database connection error:", e)
        return None

# =========================
# ROUTES
# =========================

@app.route('/')
def index():
    return redirect(url_for('register'))

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        try:
            # -------- FORM DATA --------
            name = request.form.get('name')
            age = request.form.get('age')
            gender = request.form.get('gender')
            email = request.form.get('email')
            mobile = request.form.get('mobile')
            aadhaar = request.form.get('aadhaar')

            # -------- FILE UPLOAD --------
            photo = request.files.get('photo')

            if not photo or not allowed_file(photo.filename):
                return "Invalid or missing image file"

            filename = f"{uuid.uuid4()}_{secure_filename(photo.filename)}"
            photo.save(os.path.join(app.config["UPLOAD_FOLDER"], filename))

            # -------- DATABASE INSERT --------
            connection = get_db_connection()
            if not connection:
                return "Database connection failed"

            cursor = connection.cursor()

            query = """
                INSERT INTO users (name, age, gender,email, mobile, aadhaar, photo_path)
                VALUES (%s, %s, %s, %s, %s, %s, %s)
            """

            cursor.execute(query, (name, age, gender, email, mobile, aadhaar, filename))
            connection.commit()

            cursor.close()
            connection.close()

            return redirect(url_for('success'))

        except Exception as e:
            print("Error:", e)
            return "Something went wrong during registration"

    return render_template('register.html')

@app.route('/success')
def success():
    return "Registration successful!"

# =========================
# MAIN
# =========================

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)),debug=True)
