import React, { useState, useEffect } from 'react';
import './App.css';
import Mainpage from './components/Mainpage/Mainpage';
import Navbar from './components/Navbar/Navbar';
import Cards from './components/cards/Cards';
import Web3 from 'web3';
import idGeneratorABI from './contracts/idGenerator.json';

function App() {
  const [account, setAccount] = useState('');
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [networkOk, setNetworkOk] = useState(false);
  const [networkName, setNetworkName] = useState('');

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert('MetaMask not found! Please install it.');
      return;
    }
    try {
      // Step 1: Request accounts
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      // Step 2: Try switching to 0x7a69 (31337) — your existing Localhost 8545
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x7a69' }],  // 31337 in hex
        });
      } catch (switchErr) {
        if (switchErr.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0x7a69',
                chainName: 'Localhost 8545',
                rpcUrls: ['http://127.0.0.1:8545'],
                nativeCurrency: {
                  name: 'ETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
              }],
            });
            await window.ethereum.request({
              method: 'wallet_switchEthereumChain',
              params: [{ chainId: '0x7a69' }],
            });
          } catch (addErr) {
            console.error('Could not add network:', addErr.message);
            alert(
              'Please add network manually in MetaMask:\n' +
              'RPC: http://127.0.0.1:8545\n' +
              'Chain ID: 31337\n' +
              'Symbol: ETH'
            );
            return;
          }
        } else {
          throw switchErr;
        }
      }

      // Step 3: Connect Web3 + Contract
      const w3 = new Web3(window.ethereum);
      const networkId = await w3.eth.net.getId();
      const networkIdStr = networkId.toString();
      console.log('✅ Connected to network ID:', networkIdStr);
      console.log('Available networks in JSON:', Object.keys(idGeneratorABI.networks));

      const deployedNetwork = idGeneratorABI.networks[networkIdStr];
      if (!deployedNetwork) {
        alert(
          `Contract not found on network "${networkIdStr}".\n` +
          `Available: ${Object.keys(idGeneratorABI.networks).join(', ')}\n\n` +
          `Run: npx hardhat run scripts/deploy.cjs --network localhost`
        );
        return;
      }

      const contractInstance = new w3.eth.Contract(
        idGeneratorABI.abi,
        deployedNetwork.address
      );

      setAccount(accounts[0]);
      setWeb3(w3);
      setContract(contractInstance);
      setNetworkOk(true);
      setNetworkName('Localhost 8545');
      console.log('✅ Contract connected at:', deployedNetwork.address);

    } catch (err) {
      console.error('Wallet connection error:', err);
      alert('Connection failed: ' + err.message);
    }
  };

  useEffect(() => {
    if (window.ethereum?.selectedAddress) {
      connectWallet();
    }
    window.ethereum?.on('accountsChanged', connectWallet);
    window.ethereum?.on('chainChanged', () => window.location.reload());
    return () => {
      window.ethereum?.removeListener('accountsChanged', connectWallet);
    };
  }, []);

  return (
    <div className="App">
      <Navbar
        account={account}
        networkOk={networkOk}
        networkName={networkName}
        onConnect={connectWallet}
      />
      <Cards networkOk={networkOk} />
      <Mainpage
        account={account}
        web3={web3}
        contract={contract}
        networkOk={networkOk}
      />
    </div>
  );
}

export default App;