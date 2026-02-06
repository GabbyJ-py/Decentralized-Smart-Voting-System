#!/usr/bin/env python3
"""
Quick test script to verify Ganache connection
Run this before deploying the contract
"""

from web3 import Web3
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:8545")

print("=" * 60)
print("🔗 GANACHE CONNECTION TEST")
print("=" * 60)

# Test connection
print(f"\n1️⃣ Testing connection to: {GANACHE_URL}")
try:
    w3 = Web3(Web3.HTTPProvider(GANACHE_URL))
    
    if w3.is_connected():
        print("   ✅ Connected successfully!")
        
        # Get network info
        print(f"\n2️⃣ Network Information:")
        print(f"   Chain ID: {w3.eth.chain_id}")
        print(f"   Latest Block: {w3.eth.block_number}")
        
        # Get accounts
        print(f"\n3️⃣ Available Accounts:")
        accounts = w3.eth.accounts
        print(f"   Total Accounts: {len(accounts)}")
        
        if accounts:
            print(f"\n   First 3 accounts:")
            for i, account in enumerate(accounts[:3]):
                balance = w3.eth.get_balance(account)
                balance_eth = w3.from_wei(balance, 'ether')
                print(f"   [{i}] {account}")
                print(f"       Balance: {balance_eth} ETH")
        
        print(f"\n4️⃣ Ready for Contract Deployment:")
        print(f"   ✅ Ganache is running")
        print(f"   ✅ Accounts are available")
        print(f"   ✅ Network is accessible")
        
        print(f"\n📝 Next Steps:")
        print(f"   1. Deploy VotingContract.sol using Remix IDE")
        print(f"   2. Copy the deployed contract address")
        print(f"   3. Update CONTRACT_ADDRESS in backend/.env")
        print(f"   4. Restart Flask server")
        
    else:
        print("   ❌ Connection failed!")
        print(f"\n🔧 Troubleshooting:")
        print(f"   - Verify Ganache is running: ganache --port 8545")
        print(f"   - Check if port 8545 is in use: netstat -an | findstr 8545")
        print(f"   - Verify GANACHE_URL in .env: {GANACHE_URL}")
        
except Exception as e:
    print(f"   ❌ Error: {str(e)}")
    print(f"\n🔧 Troubleshooting:")
    print(f"   - Make sure Ganache is running")
    print(f"   - Check the GANACHE_URL in .env file")
    print(f"   - Verify no firewall is blocking port 8545")

print("\n" + "=" * 60)
