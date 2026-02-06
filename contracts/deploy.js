/**
 * Deployment script for VotingContract
 * Use with Remix IDE or Truffle/Hardhat
 */

const Web3 = require('web3');
const fs = require('fs');
const path = require('path');

// Configuration
const GANACHE_URL = 'http://127.0.0.1:7545';
const CANDIDATES = [
    "TVK",
    "DMK", 
    "ADMK",
    "NTK",
    "PMK",
    "MNM",
    "OTA"
];

async function deploy() {
    console.log('🚀 Starting VotingContract deployment...\n');
    
    // Connect to Ganache
    const web3 = new Web3(new Web3.providers.HttpProvider(GANACHE_URL));
    
    // Check connection
    const isConnected = await web3.eth.net.isListening();
    if (!isConnected) {
        console.error('❌ Cannot connect to Ganache. Make sure it\'s running on', GANACHE_URL);
        process.exit(1);
    }
    console.log('✅ Connected to Ganache');
    
    // Get accounts
    const accounts = await web3.eth.getAccounts();
    const deployer = accounts[0];
    console.log('📝 Deploying from account:', deployer);
    
    // Read compiled contract (you need to compile in Remix first)
    console.log('\n⚠️  IMPORTANT: Compile VotingContract.sol in Remix IDE first!');
    console.log('Then copy the ABI and Bytecode here.\n');
    
    // You'll need to paste the ABI and Bytecode from Remix here
    const CONTRACT_ABI = []; // Paste from Remix
    const CONTRACT_BYTECODE = '0x'; // Paste from Remix
    
    if (CONTRACT_ABI.length === 0 || CONTRACT_BYTECODE === '0x') {
        console.log('📋 Steps to deploy:');
        console.log('1. Open Remix IDE: https://remix.ethereum.org');
        console.log('2. Create new file: VotingContract.sol');
        console.log('3. Copy the contract code from contracts/VotingContract.sol');
        console.log('4. Compile with Solidity 0.8.0+');
        console.log('5. Copy ABI and Bytecode');
        console.log('6. Update this deploy.js file with ABI and Bytecode');
        console.log('7. Run: node contracts/deploy.js\n');
        return;
    }
    
    // Deploy contract
    const contract = new web3.eth.Contract(CONTRACT_ABI);
    
    console.log('📦 Deploying contract with candidates:', CANDIDATES);
    
    const deployTx = contract.deploy({
        data: CONTRACT_BYTECODE,
        arguments: [CANDIDATES]
    });
    
    const gas = await deployTx.estimateGas({ from: deployer });
    console.log('⛽ Estimated gas:', gas);
    
    const deployedContract = await deployTx.send({
        from: deployer,
        gas: gas + 100000
    });
    
    const contractAddress = deployedContract.options.address;
    
    console.log('\n✅ Contract deployed successfully!');
    console.log('📍 Contract Address:', contractAddress);
    console.log('\n📝 Update your backend/.env file:');
    console.log(`CONTRACT_ADDRESS=${contractAddress}`);
    
    // Save deployment info
    const deploymentInfo = {
        address: contractAddress,
        deployer: deployer,
        timestamp: new Date().toISOString(),
        candidates: CANDIDATES,
        network: 'Ganache Local',
        abi: CONTRACT_ABI
    };
    
    fs.writeFileSync(
        path.join(__dirname, 'deployment.json'),
        JSON.stringify(deploymentInfo, null, 2)
    );
    
    console.log('💾 Deployment info saved to contracts/deployment.json\n');
}

deploy().catch(console.error);
