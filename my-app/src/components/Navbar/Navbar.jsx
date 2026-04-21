import React from 'react';
import './Navbar.css';

const Navbar = ({ account, networkOk, onConnect }) => {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        🎟️ <span>DeTicket</span>
      </div>
      <div className="navbar-center">
        <span className={`network-badge ${networkOk ? 'ok' : 'warn'}`}>
          {networkOk ? '🟢 Blockchain Connected' : '🔴 Not Connected'}
        </span>
      </div>
      <div className="navbar-right">
        {account ? (
          <span className="wallet-address">
            👛 {account.slice(0, 6)}...{account.slice(-4)}
          </span>
        ) : (
          <button className="connect-btn" onClick={onConnect}>
            Connect Wallet
          </button>
        )}
      </div>
    </nav>
  );
};

export default Navbar;