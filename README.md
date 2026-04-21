# 🎟️ DeTicket — Decentralised Ticketing System
> Built with React.js + Solidity + Hardhat + Web3.js + MetaMask

---

## 📌 Project Overview

DeTicket is a blockchain-based decentralised ticketing system where users can:
- Connect their MetaMask wallet
- Book tickets by generating a unique Ticket ID on the Ethereum blockchain
- View all their previously booked tickets
- All transactions are recorded on-chain — transparent and tamper-proof

---

## 🛠️ Tech Stack

| Layer            | Technology                       |
|------------------|-----------------------------------|
| Frontend         | React.js (Vite), CSS3             |
| Blockchain       | Solidity ^0.8.17                  |
| Local Blockchain | Hardhat (localhost:8545)          |
| Web3 Library     | Web3.js                           |
| Wallet           | MetaMask Browser Extension        |
| Backend          | Node.js + Express.js              |
| Package Manager  | npm                               |

---

## 💻 Prerequisites — Install These First

### 1. Node.js & npm
Download from: https://nodejs.org (v18 or above)
```bash
node -v     # should print v18+
npm -v      # should print 9+
2. MetaMask Browser Extension

Install from: https://metamask.io

Create a wallet
Save your Secret Recovery Phrase safely
3. Git (optional)

Download from: https://git-scm.com

📁 Project Structure

DeTicket/
├── contracts/
│ └── idGenerator.sol # Smart Contract
├── scripts/
│ └── deploy.cjs # Deployment script
├── hardhat.config.cjs # Hardhat configuration
├── server/
│ └── index.js # Express backend server
├── my-app/ # React frontend
│ ├── public/
│ │ └── index.html
│ ├── src/
│ │ ├── App.jsx
│ │ ├── App.css
│ │ ├── contracts/
│ │ │ └── idGenerator.json # ABI + deployed address
│ │ └── components/
│ │ ├── Navbar/
│ │ │ ├── Navbar.jsx
│ │ │ └── Navbar.css
│ │ ├── Mainpage/
│ │ │ ├── Mainpage.jsx
│ │ │ └── Mainpage.css
│ │ └── cards/
│ │ ├── Cards.jsx
│ │ └── Cards.css
│ └── package.json
└── package.json

⚙️ Smart Contract

File: contracts/idGenerator.sol

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract idGenerator {
    uint public id;
    address public owner;
    uint public totalTickets;

    struct Ticket {
        uint ticketId;
        address buyer;
        uint timestamp;
        bool isValid;
    }

    mapping(uint => Ticket) public tickets;
    mapping(address => uint[]) public myTickets;

    event TicketIssued(
        uint indexed ticketId,
        address indexed buyer,
        uint timestamp
    );

    constructor() {
        owner = msg.sender;
    }

    function setId(uint x) public {
        id = x * 1000 * 231 + 129;
        totalTickets++;
        tickets[id] = Ticket(id, msg.sender, block.timestamp, true);
        myTickets[msg.sender].push(id);
        emit TicketIssued(id, msg.sender, block.timestamp);
    }

    function getMyTickets() public view returns (uint[] memory) {
        return myTickets[msg.sender];
    }

    function validateTicket(uint _ticketId) public view returns (bool) {
        return tickets[_ticketId].isValid;
    }
}

Key Logic:

setId(x) → generates Ticket ID using formula: x * 1000 * 231 + 129
getMyTickets() → returns all ticket IDs for the caller's wallet
validateTicket(id) → checks if a ticket is valid
TicketIssued event is emitted on every booking
🚀 Setup & Run Instructions
Step 1 — Install Root Dependencies
# In project root (DeTicket/)
npm install
npm install --save-dev hardhat
npm install @nomicfoundation/hardhat-toolbox
Step 2 — Install Frontend Dependencies
cd my-app
npm install
npm install web3
cd .. 
Step 3 — Install Backend Dependencies
cd server
npm install express cors
cd .. 
Step 4 — Start Hardhat Local Blockchain
# In project root — keep this terminal open!
npx hardhat node

✅ You will see 20 test accounts with 10000 ETH each printed in the terminal.

Step 5 — Deploy Smart Contract
# Open a NEW terminal in project root
npx hardhat run scripts/deploy.cjs --network localhost

✅ Output will show:
Deploying contracts with account: 0xf39F...
Contract deployed to: 0x5FbDB2315678afecb367f032d93F642f64180aa3

Step 6 — Copy ABI to Frontend

After deployment, copy the generated ABI file:

# The deploy script auto-copies to my-app/src/contracts/idGenerator.json
# Verify the file exists and contains:
# { "abi": [...], "networks": { "31337": { "address": "0x5FbDB..." } } }
Step 7 — Start Backend Server
# Open a NEW terminal
cd server
node index.js

✅ Server running on: http://localhost:5000

Step 8 — Start React Frontend
# Open a NEW terminal
cd my-app
npm start

✅ App running on: http://localhost:3000

🦊 MetaMask Configuration
Add Hardhat Local Network to MetaMask:
Open MetaMask → Click network dropdown (top)
Click "Add Network" → "Add manually"
Fill in:
Field	Value
Network Name	Localhost 8545
RPC URL	http://127.0.0.1:8545

Chain ID	31337
Currency Symbol	ETH
Click Save → Switch to Localhost 8545
Import a Test Account:
From npx hardhat node terminal, copy any private key
MetaMask → Account icon → Import Account
Paste private key → Click Import
You now have 10,000 test ETH! 🎉
🎮 How to Use the App
Open http://localhost:3000
Click "Connect Wallet" in the Navbar
MetaMask popup → Click Connect → Switch to Localhost 8545
Enter any number (e.g. 42) in the input box
Click 🎟️ Book Ticket
MetaMask popup → Click Confirm
Wait 2-3 seconds for transaction to confirm
Your Ticket ID appears (formula: x × 231000 + 129)
Click 🎫 View Your Ticket to see ticket details
Click 📋 My Tickets to see all your booked tickets
🐛 Bugs Faced & How We Fixed Them
Bug 1 — MetaMask Chain ID Mismatch

Error: Unrecognized chain ID
Cause: Code was using 0x539 (1337) but Hardhat uses 0x7a69 (31337)
Fix: Updated App.jsx to use chainId: '0x7a69'

Bug 2 — Contract Not Found on Network

Error: Contract not found on network "31337"
Cause: idGenerator.json had network key "1337" not "31337"
Fix: Re-deployed contract and updated JSON with correct network ID

Bug 3 — Wrong Contract Method Name

Error: contract.methods.generateId is not a function
Cause: Solidity function is setId() but frontend called generateId()
Fix: Updated Mainpage.jsx to call contract.methods.setId(inputNum)

Bug 4 — Wrong Event Name

Error: Ticket ID not showing after booking
Cause: Code listened to IdGenerated event but contract emits TicketIssued
Fix: Updated event listener to result.events?.TicketIssued

Bug 5 — getTotalTickets Not a Function

Error: contract.methods.getTotalTickets is not a function
Cause: No such function exists — totalTickets is a public state variable
Fix: Called contract.methods.totalTickets().call() instead

Bug 6 — Slider Images Not Showing

Error: Blank white/black area where slider should be
Cause: No local image files in project
Fix: Used free Unsplash CDN image URLs directly in JSX — no downloads needed

Bug 7 — CSS Styles Not Loading

Error: Navbar, slider, cards all unstyled
Cause: Missing or empty CSS files
Fix: Rewrote all CSS files with dark theme (#0f0f1a background, #e94560 accent)

🔁 Every Time You Open the Project

You must start 3 terminals every time:

# Terminal 1 — Blockchain
npx hardhat node

# Terminal 2 — Backend
cd server && node index.js

# Terminal 3 — Frontend
cd my-app && npm start

⚠️ If you restart npx hardhat node, you MUST redeploy the contract:

npx hardhat run scripts/deploy.cjs --network localhost

Then update idGenerator.json with the new contract address.

📊 How Ticket ID is Generated

The smart contract uses this formula:
Ticket ID = (Input Number × 231 × 1000) + 129

Example:

Input: 42
Ticket ID: 42 × 231000 + 129 = 9702129

This ensures every ticket has a unique, deterministic, large ID.

🌐 Ports Used
Service	Port	URL
React Frontend	3000	http://localhost:3000

Express Backend	5000	http://localhost:5000

Hardhat Blockchain	8545	http://127.0.0.1:8545