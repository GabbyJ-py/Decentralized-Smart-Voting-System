#!/usr/bin/env python3
"""
Deploy VotingContract directly to Ganache using Web3.py
This bypasses Remix issues
"""

from web3 import Web3
import json
import os
from dotenv import load_dotenv
from solcx import compile_source, install_solc

# Load environment variables
load_dotenv()

GANACHE_URL = os.getenv("GANACHE_URL", "http://127.0.0.1:8545")

print("=" * 60)
print("🚀 DEPLOYING VOTING CONTRACT TO GANACHE")
print("=" * 60)

# Connect to Ganache
print(f"\n1️⃣ Connecting to Ganache: {GANACHE_URL}")
w3 = Web3(Web3.HTTPProvider(GANACHE_URL))

if not w3.is_connected():
    print("   ❌ Failed to connect to Ganache")
    print("   Make sure Ganache is running: ganache --port 8545")
    exit(1)

print("   ✅ Connected successfully!")

# Get account
accounts = w3.eth.accounts
if not accounts:
    print("   ❌ No accounts available")
    exit(1)

deployer = accounts[0]
print(f"   Deployer account: {deployer}")
print(f"   Balance: {w3.from_wei(w3.eth.get_balance(deployer), 'ether')} ETH")

# Read contract source
print(f"\n2️⃣ Reading contract source...")
contract_path = os.path.join(os.path.dirname(__file__), '..', 'contracts', 'VotingContract.sol')

with open(contract_path, 'r') as f:
    contract_source = f.read()

print("   ✅ Contract source loaded")

# Install solc compiler
print(f"\n3️⃣ Installing Solidity compiler...")
try:
    install_solc('0.8.0')
    print("   ✅ Compiler installed")
except:
    print("   ⚠️  Compiler already installed")

# Compile contract
print(f"\n4️⃣ Compiling contract...")
try:
    compiled_sol = compile_source(
        contract_source,
        output_values=['abi', 'bin'],
        solc_version='0.8.0'
    )
    
    # Get contract interface
    contract_id, contract_interface = compiled_sol.popitem()
    abi = contract_interface['abi']
    bytecode = contract_interface['bin']
    
    print("   ✅ Contract compiled successfully")
except Exception as e:
    print(f"   ❌ Compilation failed: {str(e)}")
    exit(1)

# Deploy contract
print(f"\n5️⃣ Deploying contract...")

# Candidate names (must match frontend)
candidates = ["TVK", "DMK", "ADMK", "NTK", "PMK", "MNM", "OTA"]
print(f"   Candidates: {candidates}")

try:
    # Create contract instance
    VotingContract = w3.eth.contract(abi=abi, bytecode=bytecode)
    
    # Build transaction
    tx_hash = VotingContract.constructor(candidates).transact({
        'from': deployer,
        'gas': 6000000
    })
    
    print(f"   Transaction hash: {tx_hash.hex()}")
    print(f"   Waiting for confirmation...")
    
    # Wait for transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    
    if tx_receipt['status'] == 1:
        contract_address = tx_receipt['contractAddress']
        print(f"\n   ✅ CONTRACT DEPLOYED SUCCESSFULLY!")
        print(f"\n   📍 Contract Address: {contract_address}")
        
        # Update .env file
        print(f"\n6️⃣ Updating .env file...")
        env_path = os.path.join(os.path.dirname(__file__), '.env')
        
        with open(env_path, 'r') as f:
            env_content = f.read()
        
        # Replace CONTRACT_ADDRESS
        if 'CONTRACT_ADDRESS=' in env_content:
            lines = env_content.split('\n')
            for i, line in enumerate(lines):
                if line.startswith('CONTRACT_ADDRESS='):
                    lines[i] = f'CONTRACT_ADDRESS={contract_address}'
            env_content = '\n'.join(lines)
        else:
            env_content += f'\nCONTRACT_ADDRESS={contract_address}\n'
        
        with open(env_path, 'w') as f:
            f.write(env_content)
        
        print(f"   ✅ .env updated with new contract address")
        
        # Verify deployment
        print(f"\n7️⃣ Verifying deployment...")
        contract = w3.eth.contract(address=contract_address, abi=abi)
        
        candidate_count = contract.functions.candidatesCount().call()
        print(f"   Total candidates: {candidate_count}")
        
        for i in range(1, candidate_count + 1):
            cand = contract.functions.candidates(i).call()
            print(f"   [{cand[0]}] {cand[1]} - Votes: {cand[2]}")
        
        print(f"\n" + "=" * 60)
        print(f"✅ DEPLOYMENT COMPLETE!")
        print(f"=" * 60)
        print(f"\n📝 Next Steps:")
        print(f"   1. Restart Flask: python app.py")
        print(f"   2. Test voting in the application")
        print(f"   3. Check Admin Dashboard for results")
        print(f"\n🎉 Your blockchain voting system is ready!")
        
    else:
        print(f"   ❌ Deployment failed - transaction reverted")
        exit(1)
        
except Exception as e:
    print(f"   ❌ Deployment error: {str(e)}")
    import traceback
    traceback.print_exc()
    exit(1)
