import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import Chat from './Chat';

function FloatingMessages({ loggedIn, userId }) {
  const [showMessages, setShowMessages] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!loggedIn) return;

    // Connect to socket
    const newSocket = io('http://localhost:5000', { transports: ['websocket'] });
    setSocket(newSocket);

    // Listen for new messages
    newSocket.on('new-message', (message) => {
      // Update conversations with new message
      setConversations(prev => {
        const updated = prev.map(conv => {
          if (conv._id === message.swapRequestId) {
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

      // Show browser notification
      if (Notification.permission === 'granted' && !showMessages) {
        new Notification('New Message', {
          body: `${message.sender.username}: ${message.content}`,
          icon: '/favicon.ico',
          tag: 'new-message'
        });
      }
    });

    // Load conversations
    loadConversations();

    return () => {
      newSocket.disconnect();
    };
  }, [loggedIn, userId]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/swap-request/conversations', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        setConversations(data);
        const totalUnread = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
        setUnreadCount(totalUnread);
      }
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const handleToggleMessages = () => {
    setShowMessages(!showMessages);
    if (!showMessages) {
      // Mark all messages as read when opening
      markAllAsRead();
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem('token');
    try {
      await Promise.all(
        conversations.map(conv => {
          if (conv.unreadCount > 0) {
            return fetch(`http://localhost:5000/api/messages/read/${conv._id}`, {
              method: 'PATCH',
              headers: { 'Authorization': `Bearer ${token}` }
            });
          }
          return Promise.resolve();
        })
      );
      setUnreadCount(0);
      setConversations(prev => 
        prev.map(conv => ({ ...conv, unreadCount: 0 }))
      );
    } catch (error) {
      console.error('Failed to mark messages as read:', error);
    }
  };

  const handleConversationClick = (conversation) => {
    setSelectedConversation(conversation);
    // Mark this conversation as read
    const token = localStorage.getItem('token');
    if (conversation.unreadCount > 0) {
      fetch(`http://localhost:5000/api/messages/read/${conversation._id}`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setConversations(prev => 
        prev.map(conv => 
          conv._id === conversation._id 
            ? { ...conv, unreadCount: 0 }
            : conv
        )
      );
      setUnreadCount(prev => prev - conversation.unreadCount);
    }
  };

  const handleCloseChat = () => {
    setSelectedConversation(null);
  };

  if (!loggedIn) return null;

  return (
    <>
      {/* Floating Messages Icon */}
      <div style={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        zIndex: 1000,
        cursor: 'pointer'
      }}>
        <div
          onClick={handleToggleMessages}
          style={{
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: '#3ad1e8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(58, 209, 232, 0.3)',
            transition: 'all 0.3s ease',
            position: 'relative',
            border: '3px solid #fff'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.1)';
            e.target.style.boxShadow = '0 6px 20px rgba(58, 209, 232, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 4px 12px rgba(58, 209, 232, 0.3)';
          }}
        >
          <span role="img" aria-label="messages" style={{ fontSize: '1.5rem' }}>💬</span>
          
          {/* Notification Badge */}
          {unreadCount > 0 && (
            <div style={{
              position: 'absolute',
              top: -5,
              right: -5,
              background: '#ff6b6b',
              color: '#fff',
              borderRadius: '50%',
              minWidth: 24,
              height: 24,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              border: '2px solid #fff',
              animation: 'pulse 2s infinite'
            }}>
              {unreadCount > 99 ? '99+' : unreadCount}
            </div>
          )}
        </div>

        {/* Tooltip */}
        <div style={{
          position: 'absolute',
          bottom: '100%',
          right: 0,
          background: '#18181b',
          color: '#fff',
          padding: '8px 12px',
          borderRadius: 8,
          fontSize: '0.8rem',
          marginBottom: 8,
          whiteSpace: 'nowrap',
          opacity: 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}
        onMouseEnter={(e) => e.target.style.opacity = 1}
        onMouseLeave={(e) => e.target.style.opacity = 0}
        >
          Messages {unreadCount > 0 && `(${unreadCount} new)`}
        </div>
      </div>

      {/* Messages Modal */}
      {showMessages && (
        <div style={{
          position: 'fixed',
          bottom: 90,
          right: 20,
          width: 350,
          height: 500,
          background: '#18181b',
          borderRadius: 12,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '2px solid #3ad1e8'
        }}>
          {/* Header */}
          <div style={{
            padding: 16,
            background: '#23232a',
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ color: '#fff', margin: 0, fontSize: '1.1rem' }}>
              Messages {unreadCount > 0 && `(${unreadCount})`}
            </h3>
            <button
              onClick={() => setShowMessages(false)}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '1.2rem',
                padding: 4
              }}
            >
              ×
            </button>
          </div>

          {/* Content Area */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              // Show Chat
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                {/* Chat Header */}
                <div style={{
                  padding: 12,
                  borderBottom: '1px solid #333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12
                }}>
                  <button
                    onClick={() => setSelectedConversation(null)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#888',
                      cursor: 'pointer',
                      fontSize: '1.2rem',
                      padding: 4
                    }}
                  >
                    ←
                  </button>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: '#23232a',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid #3ad1e8',
                    overflow: 'hidden'
                  }}>
                    {selectedConversation.otherUser.profile?.photo ? (
                      <img
                        src={selectedConversation.otherUser.profile.photo}
                        alt="Profile"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <span role="img" aria-label="profile" style={{ fontSize: '1rem' }}>👤</span>
                    )}
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 600, fontSize: '0.9rem' }}>
                      {selectedConversation.otherUser.profile?.name || selectedConversation.otherUser.username}
                    </div>
                    <div style={{ color: '#888', fontSize: '0.8rem' }}>
                      @{selectedConversation.otherUser.username}
                    </div>
                  </div>
                </div>
                
                {/* Chat Component */}
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Chat
                    swapRequestId={selectedConversation._id}
                    otherUser={selectedConversation.otherUser}
                    onClose={handleCloseChat}
                  />
                </div>
              </div>
            ) : (
              // Show Conversations List
              <div style={{ flex: 1, overflowY: 'auto' }}>
                {conversations.length === 0 ? (
                  <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                    No conversations yet. Accept a swap request to start messaging!
                  </div>
                ) : (
                  conversations.map((conversation) => (
                    <div
                      key={conversation._id}
                      onClick={() => handleConversationClick(conversation)}
                      style={{
                        padding: 12,
                        borderBottom: '1px solid #333',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        transition: 'background-color 0.2s ease'
                      }}
                      onMouseEnter={(e) => e.target.style.background = '#23232a'}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: '#23232a',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '2px solid #3ad1e8',
                        overflow: 'hidden',
                        position: 'relative'
                      }}>
                        {conversation.otherUser.profile?.photo ? (
                          <img
                            src={conversation.otherUser.profile.photo}
                            alt="Profile"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                          />
                        ) : (
                          <span role="img" aria-label="profile" style={{ fontSize: '1.2rem' }}>👤</span>
                        )}
                        {conversation.unreadCount > 0 && (
                          <div style={{
                            position: 'absolute',
                            top: -2,
                            right: -2,
                            background: '#ff6b6b',
                            color: '#fff',
                            borderRadius: '50%',
                            width: 18,
                            height: 18,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.7rem',
                            fontWeight: 'bold'
                          }}>
                            {conversation.unreadCount}
                          </div>
                        )}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          color: '#fff',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {conversation.otherUser.profile?.name || conversation.otherUser.username}
                        </div>
                        <div style={{
                          color: '#888',
                          fontSize: '0.8rem',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          {conversation.lastMessage ? (
                            <>
                              <span style={{ color: conversation.lastMessage.sender === conversation.otherUser.username ? '#3ad1e8' : '#888' }}>
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
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSS for pulse animation */}
      <style>
        {`
          @keyframes pulse {
            0% { transform: scale(1); }
            50% { transform: scale(1.1); }
            100% { transform: scale(1); }
          }
        `}
      </style>
    </>
  );
}

export default FloatingMessages; 