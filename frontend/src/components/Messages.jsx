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
    fetch('http://localhost:5000/api/messages/conversations', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setConversations(data);
          const totalUnread = data.reduce((sum, conv) => sum + conv.unreadCount, 0);
          setUnreadCount(totalUnread);
        } else {
          setError(data.error || 'Failed to load conversations');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load conversations');
        setLoading(false);
      });

    return () => {
      newSocket.disconnect();
    };
  }, [loggedIn, userId]);

  const handleConversationSelect = (conversation) => {
    setSelectedConversation(conversation);
    // Mark messages as read
    const token = localStorage.getItem('token');
    fetch(`http://localhost:5000/api/messages/read/${conversation._id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Update unread count
    setConversations(prev => 
      prev.map(conv => 
        conv._id === conversation._id 
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
    setUnreadCount(prev => prev - conversation.unreadCount);
  };

  if (!loggedIn) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      zIndex: 1000,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{
        background: '#18181b',
        borderRadius: 12,
        width: '90%',
        maxWidth: 800,
        height: '80%',
        display: 'flex',
        overflow: 'hidden'
      }}>
        {/* Conversations Sidebar */}
        <div style={{
          width: 300,
          borderRight: '1px solid #333',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{
            padding: 16,
            borderBottom: '1px solid #333',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <h3 style={{ color: '#fff', margin: 0 }}>Messages</h3>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: '1.2rem'
              }}
            >
              ×
            </button>
          </div>

          {loading ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
              Loading conversations...
            </div>
          ) : error ? (
            <div style={{ padding: 20, textAlign: 'center', color: 'red' }}>
              {error}
            </div>
          ) : conversations.length === 0 ? (
            <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
              No conversations yet. Accept a swap request to start messaging!
            </div>
          ) : (
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => handleConversationSelect(conversation)}
                  style={{
                    padding: 12,
                    borderBottom: '1px solid #333',
                    cursor: 'pointer',
                    background: selectedConversation?._id === conversation._id ? '#23232a' : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12
                  }}
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
              ))}
            </div>
          )}
        </div>

        {/* Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {selectedConversation ? (
            <Chat
              swapRequestId={selectedConversation._id}
              otherUser={selectedConversation.otherUser}
              onClose={() => setSelectedConversation(null)}
            />
          ) : (
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#888'
            }}>
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Messages; 