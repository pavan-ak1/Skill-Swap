import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function Chat({ swapRequestId, otherUser, onClose }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const messagesEndRef = useRef(null);
  const currentUserId = JSON.parse(atob(localStorage.getItem('token').split('.')[1])).id;

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

  useEffect(() => {
    // Connect to socket
    const newSocket = io('http://localhost:5000', { transports: ['websocket'] });
    setSocket(newSocket);

    // Join conversation room
    newSocket.emit('join-conversation', swapRequestId);

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Load current user's profile
    const token = localStorage.getItem('token');
    fetch('http://localhost:5000/api/profile/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setCurrentUserProfile(data);
        }
      })
      .catch(() => {});

    // Load existing messages
    fetch(`http://localhost:5000/api/messages/conversation/${swapRequestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          setError(data.error || 'Failed to load messages');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load messages');
        setLoading(false);
      });

    // Mark messages as read
    fetch(`http://localhost:5000/api/messages/read/${swapRequestId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    return () => {
      newSocket.emit('leave-conversation', swapRequestId);
      newSocket.disconnect();
    };
  }, [swapRequestId]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/messages/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          swapRequestId,
          recipientId: otherUser._id,
          content: newMessage.trim()
        })
      });
      
      const data = await res.json();
      if (data && !data.error) {
        setMessages(prev => [...prev, data]);
        setNewMessage('');
      } else {
        setError(data.error || 'Failed to send message');
      }
    } catch {
      setError('Failed to send message');
    }
  };

  const containerStyles = {
    background: 'transparent',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const messagesContainerStyles = {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
    marginBottom: '8px',
    background: colors.background,
    borderRadius: '12px',
    margin: '8px'
  };

  const errorStyles = {
    color: colors.danger,
    marginBottom: '12px',
    textAlign: 'center',
    padding: '8px 12px',
    background: `rgba(239, 68, 68, 0.1)`,
    borderRadius: '6px',
    border: `1px solid ${colors.danger}`,
    fontSize: '0.9rem'
  };

  const emptyStateStyles = {
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: '40px',
    fontSize: '1rem'
  };

  const messageContainerStyles = (isOwnMessage) => ({
    display: 'flex',
    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
    marginBottom: '12px',
    alignItems: 'flex-end',
    gap: '8px'
  });

  const photoStyles = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    background: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.primary}`,
    overflow: 'hidden',
    flexShrink: 0
  };

  const messageBubbleStyles = (isOwnMessage) => ({
    maxWidth: '70%',
    padding: '12px 16px',
    borderRadius: '16px',
    background: isOwnMessage 
      ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`
      : colors.surface,
    color: isOwnMessage ? colors.text : colors.text,
    wordBreak: 'break-word',
    position: 'relative',
    boxShadow: isOwnMessage 
      ? '0 4px 12px rgba(99, 102, 241, 0.3)'
      : '0 2px 8px rgba(0, 0, 0, 0.2)',
    border: isOwnMessage ? 'none' : `1px solid ${colors.border}`
  });

  const timeStyles = {
    fontSize: '0.75rem',
    opacity: 0.7,
    marginTop: '4px',
    textAlign: 'right',
    color: colors.textSecondary
  };

  const inputContainerStyles = {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    background: colors.surface,
    borderRadius: '12px',
    margin: '8px',
    border: `1px solid ${colors.border}`
  };

  const inputStyles = {
    flex: 1,
    padding: '12px 16px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    background: colors.background,
    color: colors.text,
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease'
  };

  const sendButtonStyles = {
    padding: '12px 20px',
    borderRadius: '8px',
    border: 'none',
    background: newMessage.trim() 
      ? `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`
      : colors.border,
    color: colors.text,
    cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
    fontWeight: '600',
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  };

  const loadingStyles = {
    padding: '40px 20px',
    textAlign: 'center',
    color: colors.textSecondary,
    fontSize: '1rem'
  };

  if (loading) return (
    <div style={loadingStyles}>
      <div style={{ fontSize: '1.5rem', marginBottom: '12px', color: colors.primary, fontWeight: '600' }}>Loading</div>
      Loading messages...
    </div>
  );

  return (
    <>
      <style>
        {`
          .message-input:focus {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
          }
          
          .send-btn:hover {
            transform: translateY(-1px) !important;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4) !important;
          }
        `}
      </style>

      <div style={containerStyles}>
        {/* Messages */}
        <div style={messagesContainerStyles}>
          {error && <div style={errorStyles}>{error}</div>}
          
          {messages.length === 0 ? (
            <div style={emptyStateStyles}>
                           <div style={{ fontSize: '1.5rem', marginBottom: '16px', color: colors.primary, fontWeight: '600' }}>No Messages</div>
             <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
               Start the conversation!
             </div>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={message._id || index}
                style={messageContainerStyles(message.sender._id === currentUserId)}
              >
                {/* Profile Picture for received messages */}
                {message.sender._id !== currentUserId && (
                  <div style={photoStyles}>
                    {otherUser.profile?.photo ? (
                      <img 
                        src={otherUser.profile.photo} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <span style={{ 
                        fontSize: '1.2rem',
                        color: colors.primary,
                        fontWeight: '600'
                      }}>U</span>
                    )}
                  </div>
                )}
                
                {/* Message Bubble */}
                <div style={messageBubbleStyles(message.sender._id === currentUserId)}>
                  <div style={{ fontSize: '0.95rem', lineHeight: '1.4' }}>
                    {message.content}
                  </div>
                  <div style={timeStyles}>
                    {new Date(message.createdAt).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit' 
                    })}
                  </div>
                </div>
                
                {/* Profile Picture for sent messages */}
                {message.sender._id === currentUserId && (
                  <div style={photoStyles}>
                    {currentUserProfile?.photo ? (
                      <img 
                        src={currentUserProfile.photo} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                      />
                    ) : (
                      <span style={{ 
                        fontSize: '1.2rem',
                        color: colors.primary,
                        fontWeight: '600'
                      }}>U</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} style={inputContainerStyles}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={inputStyles}
            className="message-input"
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={sendButtonStyles}
            className="send-btn"
          >
            Send
          </button>
        </form>
      </div>
    </>
  );
}

export default Chat; 