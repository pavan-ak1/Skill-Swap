import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Chat from './Chat';

function Messages({ loggedIn, userId, onClose }) {
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
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

    // Connect to socket
    const newSocket = io('http://localhost:5000', { transports: ['websocket'] });
    setSocket(newSocket);

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      console.log('New message received:', message);
      // Update conversations with new message
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv.swapRequestId === message.swapRequestId) {
            return {
              ...conv,
              lastMessage: {
                content: message.content,
                sender: message.sender.username,
                createdAt: message.createdAt
              },
              unreadCount: conv.unreadCount + (message.recipient._id === userId ? 1 : 0)
            };
          }
          return conv;
        });
        return updated;
      });

      // Update total unread count
      setUnreadCount(prev => prev + (message.recipient._id === userId ? 1 : 0));
    });

    // Load conversations
    const token = localStorage.getItem('token');
    console.log('Loading conversations...');
    fetch('http://localhost:5000/api/messages/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => {
        console.log('Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log('Conversations data:', data);
        if (Array.isArray(data)) {
          setConversations(data);
          const totalUnread = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
          setUnreadCount(totalUnread);
        } else {
          console.error('Invalid data format:', data);
          setError(data.error || 'Failed to load conversations');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('Failed to load conversations:', error);
        setError('Failed to load conversations');
        setLoading(false);
      });

    return () => {
      newSocket.disconnect();
    };
  }, [loggedIn, userId]);

  const handleConversationSelect = (conversation) => {
    console.log('Selected conversation:', conversation);
    setSelectedConversation(conversation);
    // Mark messages as read
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/messages/read/${conversation.swapRequestId}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => {
      console.log('Mark as read response:', res.status);
      if (!res.ok) {
        console.error('Failed to mark messages as read');
      }
    })
    .catch(error => {
      console.error('Error marking messages as read:', error);
    });

    // Update unread count
    setConversations(prev => 
      prev.map(conv => 
        conv.swapRequestId === conversation.swapRequestId 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    setUnreadCount(prev => prev - conversation.unreadCount);
  };

  const overlayStyles = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(4px)',
    zIndex: 1000,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: isMobile ? '16px' : '24px'
  };

  const containerStyles = {
    background: colors.surface,
    borderRadius: '20px',
    width: '100%',
    maxWidth: isMobile ? '100%' : '1000px',
    height: isMobile ? '100%' : '80%',
    display: 'flex',
    overflow: 'hidden',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    border: `1px solid ${colors.border}`
  };

  const sidebarStyles = {
    width: isMobile ? '100%' : '320px',
    borderRight: `1px solid ${colors.border}`,
    display: 'flex',
    flexDirection: 'column',
    background: colors.background
  };

  const headerStyles = {
    padding: isMobile ? '16px' : '20px',
    borderBottom: `1px solid ${colors.border}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: colors.surface
  };

  const closeButtonStyles = {
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    fontSize: '1.5rem',
    padding: '4px',
    borderRadius: '6px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px'
  };

  const conversationItemStyles = (isSelected) => ({
    padding: '16px',
    borderBottom: `1px solid ${colors.border}`,
    cursor: 'pointer',
    background: isSelected ? colors.surfaceHover : 'transparent',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    transition: 'all 0.2s ease',
    position: 'relative'
  });

  const photoContainerStyles = {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.primary}`,
    overflow: 'hidden',
    position: 'relative',
    flexShrink: 0
  };

  const unreadBadgeStyles = {
    position: 'absolute',
    top: '-4px',
    right: '-4px',
    background: colors.danger,
    color: colors.text,
    borderRadius: '50%',
    width: '20px',
    height: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.75rem',
    fontWeight: '600',
    boxShadow: '0 2px 4px rgba(239, 68, 68, 0.3)'
  };

  const chatAreaStyles = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: colors.surface
  };

  const emptyStateStyles = {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: colors.textSecondary,
    fontSize: '1rem',
    textAlign: 'center',
    padding: '40px'
  };

  if (!loggedIn) return null;

  return (
    <>
      <style>
        {`
          .conversation-item:hover {
            background: ${colors.surfaceHover} !important;
          }
          
          .close-button:hover {
            background: ${colors.surfaceHover} !important;
            color: ${colors.text} !important;
          }
        `}
      </style>

      <div style={overlayStyles} onClick={onClose}>
        <div style={containerStyles} onClick={(e) => e.stopPropagation()}>
          {/* Conversations Sidebar */}
          <div style={sidebarStyles}>
            <div style={headerStyles}>
              <h3 style={{ 
                color: colors.text, 
                margin: 0, 
                fontSize: '1.2rem',
                fontWeight: '600',
                background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Messages
              </h3>
              <button
                onClick={onClose}
                style={closeButtonStyles}
                className="close-button"
              >
                ×
              </button>
            </div>

            {loading ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: colors.textSecondary,
                fontSize: '0.95rem'
              }}>
                Loading conversations...
              </div>
            ) : error ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: colors.danger,
                fontSize: '0.95rem'
              }}>
                {error}
              </div>
            ) : conversations.length === 0 ? (
              <div style={{ 
                padding: '40px 20px', 
                textAlign: 'center', 
                color: colors.textSecondary,
                fontSize: '0.95rem',
                lineHeight: '1.5'
              }}>
                <div style={{ fontSize: '1.5rem', marginBottom: '12px', color: colors.primary, fontWeight: '600' }}>Messages</div>
                No conversations yet.<br />
                Accept a swap request to start messaging!
              </div>
            ) : (
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => handleConversationSelect(conversation)}
                    style={conversationItemStyles(selectedConversation?._id === conversation._id)}
                    className="conversation-item"
                  >
                    <div style={photoContainerStyles}>
                      {conversation.otherUser.profile?.photo ? (
                        <img
                          src={conversation.otherUser.profile.photo}
                          alt="Profile"
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : (
                        <span style={{ 
                          fontSize: '1.5rem',
                          color: colors.primary,
                          fontWeight: '600'
                        }}>U</span>
                      )}
                      {conversation.unreadCount > 0 && (
                        <div style={unreadBadgeStyles}>
                          {conversation.unreadCount > 9 ? '9+' : conversation.unreadCount}
                        </div>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        color: colors.text,
                        fontWeight: '600',
                        fontSize: '0.95rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        marginBottom: '4px'
                      }}>
                        {conversation.otherUser.profile?.name || conversation.otherUser.username}
                      </div>
                      <div style={{
                        color: colors.textSecondary,
                        fontSize: '0.85rem',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        lineHeight: '1.3'
                      }}>
                        {conversation.lastMessage ? (
                          <>
                            <span style={{ 
                              color: conversation.lastMessage.sender === conversation.otherUser.username 
                                ? colors.primary 
                                : colors.textSecondary 
                            }}>
                              {conversation.lastMessage.sender === conversation.otherUser.username ? '' : 'You: '}
                            </span>
                            {conversation.lastMessage.content}
                          </>
                        ) : (
                          'No messages yet'
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Chat Area */}
          <div style={chatAreaStyles}>
            {selectedConversation ? (
              <Chat
                swapRequestId={selectedConversation._id}
                otherUser={selectedConversation.otherUser}
                onClose={() => setSelectedConversation(null)}
              />
            ) : (
              <div style={emptyStateStyles}>
                                 <div>
                   <div style={{ fontSize: '1.5rem', marginBottom: '16px', color: colors.primary, fontWeight: '600' }}>Select Conversation</div>
                   <div style={{ fontSize: '1.1rem', marginBottom: '8px' }}>
                     Choose a conversation to start messaging
                   </div>
                 </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Messages; 