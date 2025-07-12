import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Chat from './Chat';

function Inbox({ loggedIn, userId }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [chatUser, setChatUser] = useState(null); // For chat window
  const [selectedSwapRequest, setSelectedSwapRequest] = useState(null);

  useEffect(() => {
    if (!loggedIn) return;
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/swap-request/inbox', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setRequests(data);
        else setError(data.error || 'Failed to fetch requests');
      })
      .catch(() => setError('Failed to fetch requests'));
    // Real-time updates
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('join', userId);
    });
    socket.on('swap-request', (data) => {
      setRequests(prev => [data, ...prev]);
    });
    return () => socket.disconnect();
  }, [loggedIn, userId]);



  if (!loggedIn) return <div className="main-content">Please log in to view your inbox.</div>;

  return (
    <div className="main-content" style={{ maxWidth: 600, margin: '40px auto', borderRadius: 24, background: '#23232a', padding: 32 }}>
      <h2 style={{ color: '#fff', marginBottom: 24 }}>Inbox</h2>
      {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
      {requests.length === 0 ? (
        <div style={{ color: '#888' }}>No swap requests yet.</div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {requests.map((req, idx) => (
            <li key={req._id || idx} style={{ background: '#18181b', borderRadius: 12, marginBottom: 18, padding: 18 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  borderRadius: '50%',
                  background: '#23232a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 12,
                  border: '2px solid #3ad1e8',
                  overflow: 'hidden'
                }}>
                  {req.fromUser?.profile?.photo ? (
                    <img 
                      src={req.fromUser.profile.photo} 
                      alt="Profile" 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover' 
                      }} 
                    />
                  ) : (
                    <span role="img" aria-label="profile" style={{ fontSize: '1.5rem' }}>👤</span>
                  )}
                </div>
                <div>
                  <div style={{ color: '#3ad1e8', fontWeight: 600, fontSize: '1.1rem' }}>
                    {req.fromUser?.profile?.name || req.fromUser?.username || 'Unknown User'}
                  </div>
                  <div style={{ color: '#888', fontSize: '0.9rem' }}>
                    @{req.fromUser?.username}
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#888' }}>Offered Skill: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{req.offeredSkill}</span>
              </div>
              <div style={{ marginBottom: 8 }}>
                <span style={{ color: '#888' }}>Wanted Skill: </span>
                <span style={{ color: '#fff', fontWeight: 600 }}>{req.wantedSkill}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ color: '#888' }}>Message: </span>
                <span style={{ color: '#fff' }}>{req.message}</span>
              </div>
              <div style={{ color: '#888', fontSize: '0.9rem', marginBottom: 12 }}>
                {new Date(req.date).toLocaleString()}
              </div>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <button className="primary-btn" onClick={() => {
                    setChatUser(req.fromUser);
                    setSelectedSwapRequest(req);
                  }}>
                    Message
                  </button>
                </div>
                <span style={{ 
                  color: 'lightgreen',
                  fontWeight: 600,
                  padding: '4px 8px',
                  borderRadius: 4,
                  background: 'rgba(144, 238, 144, 0.1)'
                }}>
                  Accepted
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      {chatUser && selectedSwapRequest && (
        <Chat
          swapRequestId={selectedSwapRequest._id}
          otherUser={chatUser}
          onClose={() => {
            setChatUser(null);
            setSelectedSwapRequest(null);
          }}
        />
      )}
    </div>
  );
}

export default Inbox; 