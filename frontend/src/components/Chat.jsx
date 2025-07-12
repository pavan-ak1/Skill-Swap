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

  if (loading) return <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>Loading messages...</div>;

  return (
    <div style={{ 
      background: 'transparent', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Messages */}

      {/* Messages */}
      <div style={{ 
        flex: 1, 
        overflowY: 'auto', 
        padding: '8px',
        marginBottom: 8
      }}>
        {error && <div style={{ color: 'red', marginBottom: 12, textAlign: 'center' }}>{error}</div>}
        
        {messages.length === 0 ? (
          <div style={{ color: '#888', textAlign: 'center', marginTop: 20 }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={message._id || index}
              style={{
                display: 'flex',
                justifyContent: message.sender._id === currentUserId ? 'flex-end' : 'flex-start',
                marginBottom: 8,
                alignItems: 'flex-end',
                gap: 8
              }}
            >
              {/* Profile Picture for received messages */}
              {message.sender._id !== currentUserId && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#23232a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #3ad1e8',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {otherUser.profile?.photo ? (
                    <img 
                      src={otherUser.profile.photo} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span role="img" aria-label="profile" style={{ fontSize: '1rem' }}>👤</span>
                  )}
                </div>
              )}
              
              {/* Message Bubble */}
              <div style={{
                maxWidth: '70%',
                padding: '8px 12px',
                borderRadius: 12,
                background: message.sender._id === currentUserId ? '#3ad1e8' : '#23232a',
                color: message.sender._id === currentUserId ? '#000' : '#fff',
                wordBreak: 'break-word',
                position: 'relative'
              }}>
                <div>{message.content}</div>
                <div style={{ 
                  fontSize: '0.7rem', 
                  opacity: 0.7, 
                  marginTop: 4,
                  textAlign: 'right'
                }}>
                  {new Date(message.createdAt).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
              
              {/* Profile Picture for sent messages */}
              {message.sender._id === currentUserId && (
                <div style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  background: '#23232a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #3ad1e8',
                  overflow: 'hidden',
                  flexShrink: 0
                }}>
                  {currentUserProfile?.photo ? (
                    <img 
                      src={currentUserProfile.photo} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span role="img" aria-label="profile" style={{ fontSize: '1rem' }}>👤</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 8, padding: '8px' }}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          style={{
            flex: 1,
            padding: '8px 12px',
            borderRadius: 8,
            border: '2px solid #333',
            background: '#18181b',
            color: '#fff',
            fontSize: '0.9rem'
          }}
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            border: 'none',
            background: newMessage.trim() ? '#3ad1e8' : '#333',
            color: newMessage.trim() ? '#000' : '#666',
            cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
            fontWeight: 600
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat; 