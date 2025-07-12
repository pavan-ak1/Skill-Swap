import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';

function Chat({ swapRequestId, otherUser, onClose, hideHeader }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const currentUserId = (() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return null;
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    console.log('Chat component mounted with swapRequestId:', swapRequestId);
    // Connect to socket
    const newSocket = io('http://localhost:5000', { transports: ['websocket'] });
    setSocket(newSocket);

    // Join conversation room
    newSocket.emit('join-conversation', swapRequestId);

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      console.log('New message in chat:', message);
      setMessages(prev => [...prev, message]);
      // Auto-scroll if user is near bottom
      if (isNearBottom) {
        setTimeout(() => scrollToBottom(), 100);
      }
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
    console.log('Loading messages for swapRequestId:', swapRequestId);
    fetch(`http://localhost:5000/api/messages/conversation/${swapRequestId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        console.log('Messages response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Messages data:', data);
        if (Array.isArray(data)) {
          setMessages(data);
        } else {
          console.error('Invalid messages data:', data);
          setError(data.error || 'Failed to load messages');
        }
        setLoading(false);
        // Scroll to bottom after loading
        setTimeout(() => scrollToBottom(), 100);
      })
      .catch((error) => {
        console.error('Failed to load messages:', error);
        setError('Failed to load messages');
        setLoading(false);
      });

    // Mark messages as read
    fetch(`http://localhost:5000/api/messages/read/${swapRequestId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      console.log('Mark as read response:', res.status);
    })
    .catch(error => {
      console.error('Error marking messages as read:', error);
    });

    return () => {
      newSocket.emit('leave-conversation', swapRequestId);
      newSocket.disconnect();
    };
  }, [swapRequestId]);

  // Update scroll detection when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      handleScroll();
    }
  }, [messages]);

  // Add keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Up to scroll to top
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowUp') {
        e.preventDefault();
        scrollToTop();
      }
      // Ctrl/Cmd + Down to scroll to bottom
      if ((e.ctrlKey || e.metaKey) && e.key === 'ArrowDown') {
        e.preventDefault();
        scrollToBottom();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle scroll events
  const handleScroll = () => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
      const scrollPosition = scrollTop + clientHeight;
      const totalHeight = scrollHeight;
      const threshold = 150; // pixels from bottom - increased for better detection
      
      const nearBottom = totalHeight - scrollPosition < threshold;
      setIsNearBottom(nearBottom);
      setShowScrollButton(!nearBottom && scrollHeight > clientHeight);
    }
  };

  // Scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'end'
      });
    }
  };

  // Scroll to top function
  const scrollToTop = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    console.log('Sending message:', {
      swapRequestId,
      recipientId: otherUser._id,
      content: newMessage.trim()
    });

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
      
      console.log('Send message response status:', res.status);
      const data = await res.json();
      console.log('Send message response data:', data);
      
      if (data && !data.error) {
        setMessages(prev => [...prev, data]);
        setNewMessage('');
        // Auto-scroll after sending
        setTimeout(() => scrollToBottom(), 100);
      } else {
        console.error('Failed to send message:', data.error);
        setError(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setError('Failed to send message');
    }
  };

  if (loading) return (
    <div style={{ 
      padding: 20, 
      textAlign: 'center', 
      color: '#888',
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      Loading messages...
    </div>
  );

  return (
    <div style={{ 
      background: 'transparent', 
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      position: 'relative'
    }}>
      {/* Header with Back Button */}
      {!hideHeader && (
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid #333',
          background: '#23232a',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#3ad1e8',
              cursor: 'pointer',
              fontSize: '1.5rem',
              padding: '4px',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'rgba(58, 209, 232, 0.1)'}
            onMouseLeave={(e) => e.target.style.background = 'transparent'}
            title="Back to conversations"
          >
            ←
          </button>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            background: '#18181b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '2px solid #3ad1e8',
            overflow: 'hidden'
          }}>
            {otherUser.profile?.photo ? (
              <img
                src={otherUser.profile.photo}
                alt="Profile"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span role="img" aria-label="profile" style={{ fontSize: '1.2rem' }}>👤</span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ color: '#fff', fontWeight: 600, fontSize: '1rem' }}>
              {otherUser.profile?.name || otherUser.username}
            </div>
            <div style={{ color: '#888', fontSize: '0.8rem' }}>
              @{otherUser.username}
            </div>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="chat-messages-container"
        style={{ 
          flex: 1, 
          overflowY: 'auto', 
          overflowX: 'hidden',
          padding: '20px',
          position: 'relative',
          minHeight: 0
        }}
      >
        {error && (
          <div style={{ 
            color: '#ff6b6b', 
            marginBottom: 12, 
            textAlign: 'center',
            padding: '8px',
            background: 'rgba(255, 107, 107, 0.1)',
            borderRadius: '8px'
          }}>
            {error}
          </div>
        )}
        
        {messages.length === 0 ? (
          <div style={{ 
            color: '#888', 
            textAlign: 'center', 
            marginTop: 20,
            padding: '20px'
          }}>
            <div style={{ fontSize: '1.2rem', marginBottom: '10px' }}>💬</div>
            <div>No messages yet. Start the conversation!</div>
            
            {/* Test messages to demonstrate scrolling */}
            {Array.from({ length: 15 }, (_, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: i % 2 === 0 ? 'flex-start' : 'flex-end',
                marginBottom: 16,
                alignItems: 'flex-end',
                gap: 12
              }}>
                {i % 2 === 0 && (
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: '#23232a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #3ad1e8',
                    overflow: 'hidden',
                    flexShrink: 0,
                    marginRight: '8px'
                  }}>
                    <span role="img" aria-label="profile" style={{ fontSize: '1.3rem' }}>👤</span>
                  </div>
                )}
                
                <div style={{
                  maxWidth: '75%',
                  padding: '16px 20px',
                  borderRadius: 20,
                  background: i % 2 === 0 ? '#23232a' : '#3ad1e8',
                  color: i % 2 === 0 ? '#fff' : '#000',
                  wordBreak: 'break-word',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '1.1rem', lineHeight: '1.5', marginBottom: '8px' }}>
                    This is test message {i + 1} to demonstrate the scrolling functionality. The messages are now bigger and more readable.
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.7,
                    textAlign: 'right'
                  }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
                
                {i % 2 !== 0 && (
                  <div style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: '#23232a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #3ad1e8',
                    overflow: 'hidden',
                    flexShrink: 0,
                    marginLeft: '8px'
                  }}>
                    <span role="img" aria-label="profile" style={{ fontSize: '1.3rem' }}>👤</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          messages.map((message, index) => (
            <div 
              key={message._id || index}
                          style={{
              display: 'flex',
              justifyContent: message.sender._id === currentUserId ? 'flex-end' : 'flex-start',
              marginBottom: 16,
              alignItems: 'flex-end',
              gap: 12
            }}
            >
              {/* Profile Picture for received messages */}
              {message.sender._id !== currentUserId && (
                <div style={{
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: '#23232a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #3ad1e8',
                  overflow: 'hidden',
                  flexShrink: 0,
                  marginRight: '8px'
                }}>
                  {otherUser.profile?.photo ? (
                    <img 
                      src={otherUser.profile.photo} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span role="img" aria-label="profile" style={{ fontSize: '1.3rem' }}>👤</span>
                  )}
                </div>
              )}
              
              {/* Message Bubble */}
                              <div style={{
                  maxWidth: '75%',
                  padding: '16px 20px',
                  borderRadius: 20,
                  background: message.sender._id === currentUserId ? '#3ad1e8' : '#23232a',
                  color: message.sender._id === currentUserId ? '#000' : '#fff',
                  wordBreak: 'break-word',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                  marginBottom: '8px'
                }}>
                  <div style={{ fontSize: '1.1rem', lineHeight: '1.5', marginBottom: '8px' }}>
                    {message.content}
                  </div>
                  <div style={{ 
                    fontSize: '0.8rem', 
                    opacity: 0.7,
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
                  width: 42,
                  height: 42,
                  borderRadius: '50%',
                  background: '#23232a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #3ad1e8',
                  overflow: 'hidden',
                  flexShrink: 0,
                  marginLeft: '8px'
                }}>
                  {currentUserProfile?.photo ? (
                    <img 
                      src={currentUserProfile.photo} 
                      alt="Profile" 
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                    />
                  ) : (
                    <span role="img" aria-label="profile" style={{ fontSize: '1.3rem' }}>👤</span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} style={{ height: '1px' }} />
      </div>

      {/* Scroll Controls */}
      {showScrollButton && (
        <div style={{
          position: 'absolute',
          bottom: 140,
          right: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 100
        }}>
          <button
            onClick={scrollToTop}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#23232a',
              border: '2px solid #3ad1e8',
              color: '#3ad1e8',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 16px rgba(0,0,0,0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
            }}
            title="Scroll to top"
          >
            ↑
          </button>
          <button
            onClick={scrollToBottom}
            style={{
              width: 36,
              height: 36,
              borderRadius: '50%',
              background: '#3ad1e8',
              border: 'none',
              color: '#000',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.9rem',
              boxShadow: '0 4px 12px rgba(58, 209, 232, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.1)';
              e.target.style.boxShadow = '0 6px 16px rgba(58, 209, 232, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
              e.target.style.boxShadow = '0 4px 12px rgba(58, 209, 232, 0.3)';
            }}
            title="Scroll to bottom"
          >
            ↓
          </button>
        </div>
      )}

      {/* Message Input */}
      <div style={{ 
        padding: '16px 20px', 
        borderTop: '1px solid #333',
        background: '#18181b',
        position: 'sticky',
        bottom: 0,
        zIndex: 10
      }}>
        <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: 25,
              border: '2px solid #333',
              background: '#23232a',
              color: '#fff',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s ease',
              minHeight: '48px'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3ad1e8'}
            onBlur={(e) => e.target.style.borderColor = '#333'}
          />
          <button
            type="submit"
            disabled={!newMessage.trim()}
            style={{
              padding: '14px 24px',
              borderRadius: 25,
              border: 'none',
              background: newMessage.trim() ? '#3ad1e8' : '#333',
              color: newMessage.trim() ? '#000' : '#666',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              fontWeight: 600,
              fontSize: '1rem',
              transition: 'all 0.2s ease',
              minHeight: '48px',
              minWidth: '80px'
            }}
          >
            Send
          </button>
        </form>
      </div>

      {/* Custom scrollbar styles */}
      <style>
        {`
          .chat-messages-container::-webkit-scrollbar {
            width: 10px;
          }
          
          .chat-messages-container::-webkit-scrollbar-track {
            background: #18181b;
            border-radius: 5px;
          }
          
          .chat-messages-container::-webkit-scrollbar-thumb {
            background: #3ad1e8;
            border-radius: 5px;
            border: 2px solid #18181b;
          }
          
          .chat-messages-container::-webkit-scrollbar-thumb:hover {
            background: #2bb8cc;
          }
          
          .chat-messages-container::-webkit-scrollbar-corner {
            background: #18181b;
          }
          
          /* Firefox scrollbar */
          .chat-messages-container {
            scrollbar-width: auto;
            scrollbar-color: #3ad1e8 #18181b;
          }
        `}
      </style>
    </div>
  );
}

export default Chat; 