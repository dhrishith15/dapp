require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const { Web3 } = require('web3');
const idGeneratorABI = require('../my-app/src/contracts/idGenerator.json');

const app = express();
app.use(cors());
app.use(express.json());

// ── Blockchain Connection ─────────────────────────────────────────────
// Using local Remix VM network (1337)
const LOCAL_NETWORK_ID = '1337';

const contractAddress = idGeneratorABI.networks[LOCAL_NETWORK_ID]?.address;

if (!contractAddress) {
  console.error('❌ Contract address not found in idGenerator.json');
  console.error('Make sure you deployed on Remix VM and updated the JSON file');
  process.exit(1);
}

// Connect using HTTP provider (local or Infura)
const web3 = new Web3(
  process.env.INFURA_KEY
    ? `https://sepolia.infura.io/v3/${process.env.INFURA_KEY}`
    : 'http://127.0.0.1:8545'
);

const contract = new web3.eth.Contract(
  idGeneratorABI.abi,
  contractAddress
);

console.log(` Contract loaded at: ${contractAddress}`);

// ── API Routes ────────────────────────────────────────────────────────

// GET /api/health — check server is running
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    network: 'Local / Remix VM',
    contract: contractAddress,
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/ticket/current', async (req, res) => {
  try {
    const currentId = await contract.methods.id().call();
    res.json({ ticketId: currentId.toString() });
  } catch (err) {
    res.json({ ticketId: '0' });
  }
});

// GET /api/ticket/total — get total tickets issued
app.get('/api/ticket/total', async (req, res) => {
  try {
    const total = await contract.methods.totalTickets().call();
    res.json({ totalTickets: total.toString() });
  } catch (err) {
    //  Return 0 gracefully if blockchain not reachable
    res.json({ totalTickets: '0' });
  }
});

// GET /api/ticket/validate/:id — validate a ticket
app.get('/api/ticket/validate/:id', async (req, res) => {
  try {
    const isValid = await contract.methods
      .validateTicket(req.params.id)
      .call();
    res.json({ ticketId: req.params.id, isValid });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/ticket/my/:address — get all tickets for an address
app.get('/api/ticket/my/:address', async (req, res) => {
  try {
    if (!web3.utils.isAddress(req.params.address)) {
      return res.status(400).json({ error: 'Invalid Ethereum address' });
    }
    const ids = await contract.methods
      .getMyTickets()
      .call({ from: req.params.address });
    res.json({
      address: req.params.address,
      tickets: ids.map((id) => id.toString()),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ── Start Server ──────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(` Backend running at http://localhost:${PORT}`);
  console.log(` Health check: http://localhost:${PORT}/api/health`);
});