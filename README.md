# 🗳️ SmartVote - Blockchain & AI Voting System

A secure, transparent, and tamper-proof voting system powered by Ethereum blockchain and AI-based facial recognition.

## ⚡ Quick Start

```bash
# 1. Clone and install
git clone <your-repo-url>
cd smartvote_blockchain_ai_system
npm install

# 2. Setup backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env with your MySQL password and Ganache URL

# 4. Setup database
mysql -u root -p < schema.sql

# 5. Start Ganache (port 7545)

# 6. Deploy contract
python deploy_contract.py

# 7. Run application
python app.py  # Terminal 1 (backend)
npm run dev    # Terminal 2 (frontend)
```

Visit `http://localhost:5173` to access the application.

---

## 🌟 Features

- **🔐 Biometric Authentication**: DeepFace AI with Facenet model for facial recognition (0.60 threshold)
- **⛓️ Blockchain Voting**: Immutable vote storage on Ethereum (Ganache)
- **🎯 Liveness Detection**: 3-challenge system (Blink, Turn Left, Turn Right) to prevent photo/video spoofing
- **📊 Real-time Results**: Live vote counting from blockchain smart contract
- **🔒 Privacy-First**: SHA-256 voter hashing for anonymity on blockchain
- **� Voter Search**: Search by Voter ID or Aadhaar with au to-formatting
- **📱 Responsive UI**: Modern React interface with professional styling
- **🛡️ Double-Vote Prevention**: Smart contract + database validation

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Lucide React** for icons
- **Recharts** for data visualization

### Backend
- **Flask** (Python web framework)
- **MySQL** for voter registry
- **DeepFace** for facial recognition
- **OpenCV** for image processing
- **Web3.py** for blockchain interaction

### Blockchain
- **Solidity** smart contracts
- **Ganache** local Ethereum blockchain
- **Web3.js** for frontend integration

## 📋 Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.8+
- **MySQL** 8.0+
- **Ganache** (for local blockchain)

## 🚀 Installation

### 1. Clone Repository
```bash
git clone <your-repo-url>
cd smartvote_blockchain_ai_system
```

### 2. Frontend Setup
```bash
npm install
```

### 3. Backend Setup
```bash
cd backend
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Database Setup
```bash
# Create MySQL database
mysql -u root -p < backend/schema.sql

# Or manually:
mysql -u root -p
CREATE DATABASE voter_db;
USE voter_db;
SOURCE backend/schema.sql;
```

### 5. Environment Configuration
```bash
# Copy example env file
cp backend/.env.example backend/.env

# Edit backend/.env with your credentials:
# - MySQL password
# - Ganache URL
# - Contract address (after deployment)
```

### 6. Deploy Smart Contract
```bash
# Start Ganache on port 7545 (or use Ganache GUI)

# Option 1: Using Python deployment script
cd backend
python deploy_contract.py

# Option 2: Using Node.js deployment script
cd contracts
node deploy.js

# Copy the deployed contract address to backend/.env
# CONTRACT_ADDRESS=0x...
```

## 🎮 Running the Application

### Prerequisites Check
```bash
# Verify MySQL is running
mysql -u root -p -e "SELECT 1;"

# Verify Ganache is running (should return network info)
curl http://127.0.0.1:7545

# Verify Python packages installed
cd backend
pip list | findstr deepface
```

### Start Backend (Terminal 1)
```bash
cd backend
python app.py
# Runs on http://localhost:5000
```

### Start Frontend (Terminal 2)
```bash
npm run dev
# Runs on http://localhost:5173
```

### Start Ganache (Terminal 3)
```bash
# Open Ganache GUI or CLI
ganache-cli -p 7545
```

## 📁 Project Structure

```
smartvote_blockchain_ai_system/
├── components/              # React components
│   ├── VoterRegistration.tsx
│   ├── VoterAuthentication.tsx
│   ├── VotingPanel.tsx
│   ├── VoterSearch.tsx
│   └── AdminDashboard.tsx
├── services/
│   └── api.ts              # API service layer
├── backend/
│   ├── app.py              # Flask server
│   ├── schema.sql          # Database schema
│   ├── requirements.txt    # Python dependencies
│   └── .env.example        # Environment template
├── contracts/
│   ├── VotingContract.sol  # Smart contract
│   └── deploy.js           # Deployment script
├── types.ts                # TypeScript definitions
├── constants.tsx           # App constants
└── package.json            # Node dependencies
```

## 🔑 Key Features Explained

### Voter Registration
1. **ID Type Selection**: Choose Voter ID or Aadhaar
2. **Aadhaar Verification**: Auto-formats as XXXX-XXXX-XXXX (prevents duplicates)
3. **Form Validation**: Name (3+ chars), Age (18+), Email, Phone (10-15 digits)
4. **Biometric Photo Upload**: JPEG/PNG only, face detection required
5. **EPIC ID Generation**: Unique 10-character voter ID (e.g., VOTE123456)

### Authentication Flow
1. **ID Type Selection**: Choose Voter ID (VOTE123456) or Aadhaar (XXXX-XXXX-XXXX)
2. **Input Validation**: Auto-formatting with real-time validation
3. **Camera Initialization**: Requests camera permissions
4. **Liveness Challenges**: 
   - Challenge 1: Blink Eyes (5 seconds)
   - Challenge 2: Turn Head Left (5 seconds)
   - Challenge 3: Turn Head Right (5 seconds)
5. **Image Capture**: Captured 1 second into first challenge
6. **DeepFace Verification**: Facenet model with 0.60 cosine distance threshold
7. **Result**: Access granted/denied with confidence score

### Voting Process
1. Biometric authentication required
2. Select candidate from list
3. Vote recorded on blockchain
4. MySQL registry updated (has_voted = TRUE)
5. Double-voting prevented

### Admin Dashboard
- Real-time vote counts from blockchain
- Blockchain transaction history
- System metrics and logs

## 🔒 Security Features

- **Face Recognition**: Facenet model with 0.60 cosine distance threshold
- **Liveness Detection**: 3-challenge system
- **Voter Anonymity**: SHA-256 hashing before blockchain storage
- **Double-Vote Prevention**: Smart contract + database checks
- **Secure Storage**: Environment variables for sensitive data

## 🛠️ Configuration

### DeepFace Settings (backend/app.py)
```python
STRICT_THRESHOLD = 0.60  # Adjust for stricter/lenient matching
model_name="Facenet"     # Options: VGG-Face, Facenet, OpenFace
detector_backend="opencv" # Options: opencv, ssd, mtcnn
enforce_detection=True    # Require face detection
```

### Blockchain Settings (backend/.env)
```env
GANACHE_URL=http://127.0.0.1:7545
CONTRACT_ADDRESS=0x...
```

## 📊 Database Schema

**registered_voter** table:
- `voter_id` (VARCHAR) - Unique EPIC ID
- `name`, `age`, `gender`
- `email`, `mobile`, `aadhaar`
- `photo_path` - Biometric image
- `has_voted` (BOOLEAN) - Voting status
- `registration_date` (TIMESTAMP)

## 🎯 Smart Contract Functions

- `castVote(voterHash, candidateId)` - Record vote
- `hasVoted(voterHash)` - Check voting status
- `candidates(id)` - Get candidate info
- `getResults()` - Fetch vote counts

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check MySQL is running
mysql -u root -p -e "SELECT 1;"

# Verify .env file exists
ls backend/.env

# Check Python packages
pip list | findstr "flask deepface mysql"

# Test database connection
cd backend
python -c "import mysql.connector; print('MySQL OK')"
```

### Face recognition fails
- **Lighting**: Ensure good lighting, avoid shadows
- **Camera**: Grant browser camera permissions
- **Models**: DeepFace downloads models on first run (~100MB)
- **Threshold**: Adjust `STRICT_THRESHOLD` in `backend/app.py` (0.40-0.70)
- **Distance**: Check console logs for actual distance values

### Blockchain errors
```bash
# Check Ganache is running
curl http://127.0.0.1:7545

# Verify contract address in .env
cat backend/.env | findstr CONTRACT_ADDRESS

# Test Web3 connection
cd backend
python -c "from web3 import Web3; w3=Web3(Web3.HTTPProvider('http://127.0.0.1:7545')); print('Connected:', w3.is_connected())"
```

### Image upload issues
- **Format**: Only JPEG/PNG accepted
- **Size**: Max 5MB (configurable in `.env`)
- **Folder**: Ensure `backend/uploads/` directory exists
- **Permissions**: Check write permissions on uploads folder

### Common Errors

**"Face could not be detected"**
- Ensure face is clearly visible and well-lit
- Remove glasses, hats, or masks
- Try different lighting conditions

**"Distance exceeds threshold"**
- Lighting may be different from registration photo
- Try adjusting threshold in `backend/app.py`
- Re-register with better quality photo

**"Blockchain connection failed"**
- Start Ganache on port 7545
- Check `GANACHE_URL` in `.env`
- Verify contract is deployed

## 📝 License

This project is for educational and demonstration purposes.

## 👥 Contributors

- Gabby J & Jesithra J

## 🔗 Links

- [DeepFace Documentation](https://github.com/serengil/deepface)
- [Ganache Documentation](https://trufflesuite.com/ganache/)
- [Web3.py Documentation](https://web3py.readthedocs.io/)
- [Flask Documentation](https://flask.palletsprojects.com/)

## 🙏 Acknowledgments

- **DeepFace** by Sefik Ilkin Serengil for facial recognition
- **Ethereum/Ganache** for blockchain infrastructure
- **React** and **Flask** communities for excellent frameworks
- **OpenCV** for computer vision capabilities

---

**⚠️ Important**: This is a demonstration project. For production use, implement additional security measures, proper key management, and compliance with data protection regulations (GDPR, etc.).
