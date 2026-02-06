# Smart Contract Deployment Guide

This folder contains the Solidity smart contract for the SmartVote blockchain voting system.

## Prerequisites

1. **Ganache** - Local Ethereum blockchain
   - Download: https://trufflesuite.com/ganache/
   - Or use Ganache CLI: `npm install -g ganache`

2. **Remix IDE** - For compiling and deploying
   - Web version: https://remix.ethereum.org
   - No installation needed

## Quick Deployment (Recommended)

### Step 1: Start Ganache
```bash
# Option A: Use Ganache GUI (easiest)
# Just open the Ganache application

# Option B: Use Ganache CLI
ganache --port 7545
```

### Step 2: Deploy Using Remix IDE

1. **Open Remix**: Go to https://remix.ethereum.org

2. **Create Contract File**:
   - Click "+" to create new file
   - Name it `VotingContract.sol`
   - Copy the entire content from `contracts/VotingContract.sol`

3. **Compile**:
   - Go to "Solidity Compiler" tab (left sidebar)
   - Select compiler version: `0.8.0` or higher
   - Click "Compile VotingContract.sol"
   - Wait for green checkmark

4. **Deploy**:
   - Go to "Deploy & Run Transactions" tab
   - Environment: Select "Web3 Provider"
   - Web3 Provider Endpoint: `http://127.0.0.1:7545`
   - Click "Connect"
   - Under "Deploy" section, expand the orange "Deploy" button
   - Enter constructor parameters (candidate names):
     ```
     ["TVK","DMK","ADMK","NTK","PMK","MNM","OTA"]
     ```
   - Click "transact" to deploy
   - Wait for confirmation

5. **Copy Contract Address**:
   - After deployment, you'll see the contract under "Deployed Contracts"
   - Copy the contract address (starts with 0x...)
   - Update `backend/.env`:
     ```
     CONTRACT_ADDRESS=0xYourActualContractAddress
     ```

6. **Copy ABI** (for reference):
   - In Remix, go to "Solidity Compiler" tab
   - Scroll down to "Compilation Details"
   - Copy the ABI
   - Save it to `contracts/abi.json` (optional, for documentation)

### Step 3: Verify Deployment

Test the contract in Remix:
```solidity
// Call these functions to verify:
candidatesCount() // Should return 7
getCandidate(1)   // Should return TVK details
```

## Alternative: Deploy with Truffle (Advanced)

If you prefer Truffle:

```bash
# Install Truffle
npm install -g truffle

# Initialize Truffle project
cd contracts
truffle init

# Create migration file
# migrations/2_deploy_voting.js

# Deploy
truffle migrate --network development
```

## Contract Functions

### Public Functions

- `castVote(voterHash, candidateId)` - Cast a vote
- `getCandidate(candidateId)` - Get candidate details
- `getCandidatesCount()` - Get total candidates
- `checkHasVoted(voterHash)` - Check if voter voted
- `getResults()` - Get all voting results

### Admin Functions

- `addCandidate(name)` - Add new candidate (admin only)

## Candidates List

The contract is initialized with these candidates:

1. TVK - Tamil Valarchi Kazhagam
2. DMK - Dravida Makkal Kootani
3. ADMK - Anaithu Desa Munnetra Kazhagam
4. NTK - Nalla Thamizh Katchi
5. PMK - Pudhiya Makkal Katchi
6. MNM - Makkal Nalan Munnetram
7. OTA - None of the Above

## Security Features

✅ Double-vote prevention using voter hash
✅ Immutable vote records on blockchain
✅ Event logging for transparency
✅ Admin-only candidate management
✅ Input validation on all functions

## Troubleshooting

**Error: "Cannot connect to Ganache"**
- Make sure Ganache is running on port 7545
- Check firewall settings

**Error: "Out of gas"**
- Increase gas limit in Remix deployment settings
- Default Ganache accounts have plenty of ETH

**Error: "Invalid candidate ID"**
- Candidate IDs start from 1, not 0
- Check candidatesCount first

## Testing

After deployment, test with these commands in Remix:

```javascript
// Get candidate count
candidatesCount()

// Get first candidate
getCandidate(1)

// Cast a test vote
castVote("test_voter_hash_123", 1)

// Check if voted
checkHasVoted("test_voter_hash_123")

// Get results
getResults()
```

## Production Deployment

For production (real Ethereum network):

1. Use Infura or Alchemy for node access
2. Deploy to testnet first (Goerli, Sepolia)
3. Audit the contract code
4. Use hardware wallet for deployment
5. Verify contract on Etherscan

## Support

If you encounter issues:
1. Check Ganache is running
2. Verify Remix is connected to Ganache
3. Check browser console for errors
4. Ensure you have enough gas
