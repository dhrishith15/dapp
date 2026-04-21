import React, { useState, useEffect } from 'react';
import './Mainpage.css';

const slides = [
  {
    url: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1400&auto=format&fit=crop',
    label: 'Live Concerts'
  },
  {
    url: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=1400&auto=format&fit=crop',
    label: 'Music Festivals'
  },
  {
    url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?w=1400&auto=format&fit=crop',
    label: 'DJ Nights'
  },
  {
    url: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1400&auto=format&fit=crop',
    label: 'Stadium Events'
  },
  {
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1400&auto=format&fit=crop',
    label: 'Special Shows'
  },
];

const Mainpage = ({ account, web3, contract, networkOk }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [inputNum, setInputNum] = useState('');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [ticketId, setTicketId] = useState('');
  const [myTickets, setMyTickets] = useState([]);
  const [showTicket, setShowTicket] = useState(false);
  const [showMyTickets, setShowMyTickets] = useState(false);
  const [ticketCount, setTicketCount] = useState(0);

  // Auto-slide every 3 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  // Fetch total ticket count using `totalTickets` public variable
  useEffect(() => {
    const fetchCount = async () => {
      if (contract) {
        try {
          const count = await contract.methods.totalTickets().call();
          setTicketCount(count.toString());
        } catch (e) {
          console.log('totalTickets fetch error:', e.message);
        }
      }
    };
    fetchCount();
  }, [contract, ticketId]);

  const bookTicket = async () => {
    if (!contract || !account) return;
    if (!inputNum || isNaN(inputNum)) {
      alert('Please enter a valid number to generate your Ticket ID!');
      return;
    }

    setLoading(true);
    setTxHash('');
    setTicketId('');
    setShowTicket(false);
    setShowMyTickets(false);

    try {
      // ✅ Correct function: setId(uint x)
      const result = await contract.methods
        .setId(inputNum)
        .send({ from: account });

      const hash = result.transactionHash;
      setTxHash(hash);

      // ✅ Correct event: TicketIssued
      const event = result.events?.TicketIssued;
      if (event) {
        const id = event.returnValues.ticketId;
        setTicketId(id.toString());
      }

    } catch (err) {
      console.error('Booking error:', err);
      alert('Transaction failed: ' + err.message);
    }

    setLoading(false);
  };

  const fetchMyTickets = async () => {
    if (!contract || !account) return;
    try {
      const tickets = await contract.methods.getMyTickets().call({ from: account });
      setMyTickets(tickets.map((t) => t.toString()));
      setShowMyTickets(true);
      setShowTicket(false);
    } catch (err) {
      console.error('Fetch tickets error:', err.message);
      alert('Could not fetch tickets: ' + err.message);
    }
  };

  return (
    <div className="mainpage">

      {/* ── SLIDER ── */}
      <div className="slider">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${slide.url})` }}
          />
        ))}

        <div className="slider-overlay">
          <h1>🎟️ Decentralised Ticketing</h1>
          <p>Book your tickets securely on the blockchain</p>
          <div className="stats">Total Tickets Issued: {ticketCount}</div>
        </div>

        <div className="slider-dots">
          {slides.map((_, index) => (
            <span
              key={index}
              className={`dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            />
          ))}
        </div>
      </div>

      {/* ── BOOKING SECTION ── */}
      <div className="booking-section">
        {!networkOk ? (
          <div className="not-connected">
            <h2>🔌 Wallet Not Connected</h2>
            <p>Please connect MetaMask to book tickets.</p>
          </div>
        ) : (
          <div className="booking-form">
            <h2>Book a Ticket</h2>
            <p className="account-info">
              Connected: <span>{account?.slice(0, 6)}...{account?.slice(-4)}</span>
            </p>

            <input
              className="email-input"
              type="number"
              placeholder="Enter a number (e.g. 42) to generate Ticket ID"
              value={inputNum}
              onChange={(e) => setInputNum(e.target.value)}
            />

            <button
              className="book-btn"
              onClick={bookTicket}
              disabled={loading}
            >
              {loading ? '⏳ Processing...' : '🎟️ Book Ticket'}
            </button>

            {txHash && (
              <div className="tx-info">
                <strong>Transaction Hash:</strong><br />
                {txHash.slice(0, 22)}...{txHash.slice(-10)}
              </div>
            )}

            {ticketId && (
              <>
                <button
                  className="view-ticket-btn"
                  onClick={() => { setShowTicket(true); setShowMyTickets(false); }}
                >
                  🎫 View Your Ticket
                </button>
                <button className="my-tickets-btn" onClick={fetchMyTickets}>
                  📋 My Tickets
                </button>
              </>
            )}

            {!ticketId && txHash === '' && (
              <button className="my-tickets-btn" onClick={fetchMyTickets}>
                📋 My Tickets
              </button>
            )}

            {/* Single ticket popup */}
            {showTicket && ticketId && (
              <div className="ticket-popup">
                <h2>🎫 Your Ticket</h2>
                <p><strong>Input Number:</strong> {inputNum}</p>
                <p><strong>Wallet:</strong> {account?.slice(0, 6)}...{account?.slice(-4)}</p>
                <p><strong>Ticket ID:</strong> 🎫 {ticketId}</p>
                <p><strong>Network:</strong> Localhost 8545</p>
                <button className="close-btn" onClick={() => setShowTicket(false)}>
                  ✖ Close
                </button>
              </div>
            )}

            {/* My tickets list */}
            {showMyTickets && (
              <div className="tickets-list">
                <h3>Your Ticket IDs:</h3>
                {myTickets.length === 0 ? (
                  <p style={{ color: '#aaa' }}>No tickets found.</p>
                ) : (
                  myTickets.map((tid, i) => (
                    <div key={i} className="ticket-item">🎫 {tid}</div>
                  ))
                )}
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
};

export default Mainpage;