import React, { useState, useEffect } from 'react';

function NotificationToast({ notifications, onRemove }) {
  return (
    <div style={{
      position: 'fixed',
      top: 20,
      right: 20,
      zIndex: 9999,
      display: 'flex',
      flexDirection: 'column',
      gap: 10
    }}>
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            background: notification.type === 'success' ? '#4CAF50' : 
                       notification.type === 'error' ? '#f44336' : 
                       notification.type === 'warning' ? '#ff9800' : '#2196F3',
            color: '#fff',
            padding: '12px 16px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '300px',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease-out',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px'
          }}
        >
          <div style={{ flex: 1 }}>
            <div style={{ 
              fontWeight: 'bold', 
              fontSize: '14px',
              marginBottom: '4px'
            }}>
              {notification.title}
            </div>
            <div style={{ 
              fontSize: '13px',
              opacity: 0.9
            }}>
              {notification.message}
            </div>
          </div>
          <button
            onClick={() => onRemove(notification.id)}
            style={{
              background: 'none',
              border: 'none',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '18px',
              padding: '0',
              width: '20px',
              height: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>
      ))}
      
      <style>
        {`
          @keyframes slideIn {
            from {
              transform: translateX(100%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
        `}
      </style>
    </div>
  );
}

export default NotificationToast; 