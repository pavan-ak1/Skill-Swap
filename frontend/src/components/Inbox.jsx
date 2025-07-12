import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Chat from './Chat';

function Inbox({ loggedIn, userId }) {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const [chatUser, setChatUser] = useState(null); // For chat window
  const [selectedSwapRequest, setSelectedSwapRequest] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  // Color palette based on color theory for dark theme
  const colors = {
    primary: '#6366f1', // Indigo - primary brand color
    primaryHover: '#4f46e5', // Darker indigo for hover states
    secondary: '#10b981', // Emerald - secondary accent
    background: '#0f172a', // Slate 900 - main background
    surface: '#1e293b', // Slate 800 - surface elements
    surfaceHover: '#334155', // Slate 700 - hover states
    border: '#475569', // Slate 600 - borders
    text: '#f8fafc', // Slate 50 - primary text
    textSecondary: '#cbd5e1', // Slate 300 - secondary text
    danger: '#ef4444', // Red 500 - danger/error states
    dangerHover: '#dc2626', // Red 600 - danger hover
    success: '#22c55e', // Green 500 - success states
    warning: '#f59e0b' // Amber 500 - warning states
  };

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const containerStyles = {
    maxWidth: isMobile ? '100%' : '800px',
    margin: isMobile ? '20px 16px' : '40px auto',
    borderRadius: '20px',
    background: colors.surface,
    padding: isMobile ? '24px' : '32px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    border: `1px solid ${colors.border}`
  };

  const titleStyles = {
    color: colors.text,
    marginBottom: '24px',
    fontSize: isMobile ? '1.5rem' : '1.8rem',
    fontWeight: '600',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textAlign: 'center'
  };

  const errorStyles = {
    color: colors.danger,
    marginBottom: '16px',
    padding: '12px 16px',
    background: `rgba(239, 68, 68, 0.1)`,
    borderRadius: '8px',
    border: `1px solid ${colors.danger}`,
    fontSize: '0.95rem'
  };

  const emptyStateStyles = {
    color: colors.textSecondary,
    textAlign: 'center',
    padding: '40px 20px',
    fontSize: '1rem'
  };

  const requestItemStyles = {
    background: colors.background,
    borderRadius: '16px',
    marginBottom: '20px',
    padding: isMobile ? '20px' : '24px',
    border: `1px solid ${colors.border}`,
    transition: 'all 0.2s ease',
    position: 'relative',
    overflow: 'hidden'
  };

  const photoContainerStyles = {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    background: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px',
    border: `2px solid ${colors.primary}`,
    overflow: 'hidden',
    flexShrink: 0
  };

  const messageButtonStyles = {
    padding: '10px 20px',
    borderRadius: '8px',
    border: 'none',
    background: colors.primary,
    color: colors.text,
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px'
  };

  const acceptedBadgeStyles = {
    color: colors.success,
    fontWeight: '600',
    padding: '6px 12px',
    borderRadius: '6px',
    background: `rgba(34, 197, 94, 0.1)`,
    border: `1px solid ${colors.success}`,
    fontSize: '0.85rem'
  };

  if (!loggedIn) return (
    <div style={{
      maxWidth: '600px',
      margin: '40px auto',
      padding: '40px 20px',
      textAlign: 'center',
      color: colors.textSecondary,
      fontSize: '1.1rem'
    }}>
      Please log in to view your inbox.
    </div>
  );

  // If a chat is open, show only the Chat component (not the list)
  if (chatUser && selectedSwapRequest) {
    return (
      <div className="main-content" style={{ maxWidth: 600, margin: '40px auto', borderRadius: 24, background: '#23232a', padding: 0 }}>
        <Chat
          swapRequestId={selectedSwapRequest._id}
          otherUser={chatUser}
          onClose={() => {
            setChatUser(null);
            setSelectedSwapRequest(null);
          }}
        />
      </div>
    );
  }

  // Otherwise, show the conversation list
  return (
    <>
      <style>
        {`
          .request-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
            border-color: ${colors.primary};
          }
          
          .message-btn:hover {
            background: ${colors.primaryHover} !important;
            transform: translateY(-1px);
          }
        `}
      </style>

      <div style={containerStyles}>
        <h2 style={titleStyles}>Inbox</h2>
        
        {error && <div style={errorStyles}>{error}</div>}
        
        {requests.length === 0 ? (
          <div style={emptyStateStyles}>
                         <div style={{ fontSize: '1.5rem', marginBottom: '16px', color: colors.primary, fontWeight: '600' }}>Inbox</div>
            <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
              No swap requests yet
            </div>
            <div style={{ fontSize: '0.9rem' }}>
              When someone sends you a swap request, it will appear here
            </div>
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {requests.map((req, idx) => (
              <li key={req._id || idx} style={requestItemStyles} className="request-item">
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                  <div style={photoContainerStyles}>
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
                        <span style={{ 
                          fontSize: '1.8rem',
                          color: colors.primary,
                          fontWeight: '600'
                        }}>U</span>
                      )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ 
                      color: colors.primary, 
                      fontWeight: '600', 
                      fontSize: '1.1rem',
                      marginBottom: '4px'
                    }}>
                      {req.fromUser?.profile?.name || req.fromUser?.username || 'Unknown User'}
                    </div>
                    <div style={{ 
                      color: colors.textSecondary, 
                      fontSize: '0.9rem' 
                    }}>
                      @{req.fromUser?.username}
                    </div>
                  </div>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: colors.textSecondary }}>Offered Skill: </span>
                  <span style={{ 
                    color: colors.text, 
                    fontWeight: '600',
                    background: `rgba(99, 102, 241, 0.1)`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>{req.offeredSkill}</span>
                </div>
                
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ color: colors.textSecondary }}>Wanted Skill: </span>
                  <span style={{ 
                    color: colors.text, 
                    fontWeight: '600',
                    background: `rgba(16, 185, 129, 0.1)`,
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '0.9rem'
                  }}>{req.wantedSkill}</span>
                </div>
                
                <div style={{ marginBottom: '16px' }}>
                  <span style={{ color: colors.textSecondary }}>Message: </span>
                  <span style={{ 
                    color: colors.text,
                    fontSize: '0.95rem',
                    lineHeight: '1.4'
                  }}>{req.message}</span>
                </div>
                
                <div style={{ 
                  color: colors.textSecondary, 
                  fontSize: '0.85rem', 
                  marginBottom: '16px',
                  fontStyle: 'italic'
                }}>
                  {new Date(req.date).toLocaleString()}
                </div>
                
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  flexWrap: isMobile ? 'wrap' : 'nowrap',
                  gap: '12px'
                }}>
                                     <button 
                     className="message-btn"
                     style={messageButtonStyles} 
                     onClick={() => {
                       setChatUser(req.fromUser);
                       setSelectedSwapRequest(req);
                     }}
                   >
                     Message
                   </button>
                                     <span style={acceptedBadgeStyles}>
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
    </>
  );
}

export default Inbox; 