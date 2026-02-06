# 🚀 Ganache Blockchain Deployment Guide

## Current Status
- ✅ Ganache is running on port 8545
- ✅ Liveness detection implemented
- ✅ Testing bypass removed from backend
- ❌ Contract needs deployment to Ganache (currently using Remix VM address)

---

## Step 1: Verify Ganache is Running

Your Ganache should show:
```
RPC Listening on 127.0.0.1:8545
Available Accounts: (0) 0x339d5Faa19fD8c755e021dD00525a6F4C150A3f9 (1000 ETH)
```

✅ **Status: CONFIRMED** (from your terminal output)

---

## Step 2: Deploy Contract Using Remix IDE

### 2.1 Open Remix IDE
Go to: https://remix.ethereum.org/

### 2.2 Create Contract File
1. In the File Explorer (left sidebar), create a new file: `VotingContract.sol`
2. Copy the entire content from `contracts/VotingContract.sol` into Remix

### 2.3 Compile Contract
1. Click the **Solidity Compiler** icon (left sidebar)
2. Select compiler version: `0.8.0` or higher
3. Click **Compile VotingContract.sol**
4. Wait for green checkmark ✅

### 2.4 Connect to Ganache
1. Click the **Deploy & Run Transactions** icon (left sidebar)
2. In the **ENVIRONMENT** dropdown, select: `External Http Provider`
3. A popup will appear asking for the endpoint
4. Enter: `http://127.0.0.1:8545`
5. Click **OK**
6. You should see "Custom (1337) network" appear

### 2.5 Deploy Contract
1. In the **CONTRACT** dropdown, select `VotingContract`
2. In the **Deploy** section, you'll see a field for constructor parameters
3. Enter the candidate names as a JSON array (must match frontend):
   ```
   ["TVK", "DMK", "ADMK", "NTK", "PMK", "MNM", "OTA"]
   ```
4. Click the orange **Deploy** button
5. Wait for deployment confirmation (should be instant on Ganache)

### 2.6 Copy Contract Address
1. After deployment, look in the **Deployed Contracts** section (bottom of left sidebar)
2. You'll see `VOTINGCONTRACT AT 0x...`
3. Click the copy icon next to the address
4. **SAVE THIS ADDRESS** - you'll need it in the next step

Example address format: `0x5FbDB2315678afecb367f032d93F642f64180aa3`

---

## Step 3: Update Backend Configuration

### 3.1 Open `.env` file
Edit `backend/.env` and update the `CONTRACT_ADDRESS`:

```env
# Replace the Remix VM address with your new Ganache address
CONTRACT_ADDRESS=0xYOUR_NEW_GANACHE_ADDRESS_HERE
```

### 3.2 Verify Ganache URL
Make sure this line is correct:
```env
GANACHE_URL=http://127.0.0.1:8545
```

---

## Step 4: Restart Flask Backend

1. Stop the Flask server (Ctrl+C in terminal)
2. Restart it:
   ```bash
   cd backend
   python app.py
   ```
3. You should see:
   ```
   Blockchain: Connected to Ganache successfully.
   ```

---

## Step 5: Test Voting

1. Go through the authentication flow
2. Cast a vote
3. You should see:
   - ✅ "Vote recorded on blockchain successfully"
   - Real transaction hash (not fake)
   - Vote count updated in Admin Dashboard

---

## Troubleshooting

### Error: "Failed to connect to Ganache"
- Verify Ganache is running: `netstat -an | findstr 8545`
- Check GANACHE_URL in `.env` is `http://127.0.0.1:8545`

### Error: "No Ganache accounts available"
- Ganache should show 10 accounts with 1000 ETH each
- Restart Ganache if needed

### Error: "Invalid contract address"
- Make sure you copied the full address from Remix (starts with 0x)
- Address should be 42 characters long (0x + 40 hex digits)

### Error: "Transaction failed"
- Check Ganache terminal for error messages
- Verify candidate ID is valid (1-4)
- Ensure voter hasn't already voted

---

## Verification Checklist

After deployment, verify:
- [ ] Ganache shows new transactions when votes are cast
- [ ] Transaction hashes are real (not fake 0x... random strings)
- [ ] Vote counts increment correctly
- [ ] Admin Dashboard shows blockchain history
- [ ] Double-voting is prevented by smart contract

---

## Next Steps After Deployment

Once deployed successfully:
1. Test authentication with liveness detection
2. Cast multiple votes from different voters
3. Verify blockchain immutability
4. Check Admin Dashboard for real-time results

---

**Need Help?** Check the Ganache terminal output for detailed error messages.
