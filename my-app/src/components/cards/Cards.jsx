import React from 'react';
import './Cards.css';

const Cards = ({ networkOk }) => {
  return (
    <div className="status-bar">
      <div className={`status-card ${networkOk ? 'active' : 'inactive'}`}>
        <span className="status-icon">{networkOk ? '✅' : '⚠️'}</span>
        <span className="status-text">
          {networkOk
            ? 'Connected to Blockchain Network'
            : 'Connect MetaMask to book tickets'}
        </span>
      </div>
    </div>
  );
};

export default Cards;