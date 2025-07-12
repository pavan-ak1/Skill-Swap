import React, { useState, useEffect, useRef } from 'react';

function Header({ loggedIn, onLogin, onLogout, onProfile, onInbox }) {
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (loggedIn) {
      const token = localStorage.getItem('token');
      fetch('http://localhost:5000/api/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && !data.error) setProfile(data);
        })
        .catch(() => {});
    }
  }, [loggedIn]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    if (onLogout) onLogout();
  };

  const getUsername = () => {
    const token = localStorage.getItem('token');
    if (!token) return '';
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.username || 'User';
    } catch {
      return 'User';
    }
  };

  return (
    <div className="header-bar">
      <span>Skill Swap Platform</span>
      {loggedIn ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ position: 'relative' }} ref={dropdownRef}>
            <div 
              className="profile-photo" 
              style={{ 
                cursor: 'pointer', 
                width: 48, 
                height: 48, 
                borderRadius: '50%',
                background: '#18181b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '2px solid #3ad1e8',
                position: 'relative',
                transition: 'all 0.2s ease'
              }}
              onClick={() => setShowDropdown(!showDropdown)}
              onMouseEnter={(e) => e.target.style.borderColor = '#fff'}
              onMouseLeave={(e) => e.target.style.borderColor = '#3ad1e8'}
            >
              {profile?.photo ? (
                <img 
                  src={profile.photo} 
                  alt="Profile" 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    borderRadius: '50%', 
                    objectFit: 'cover' 
                  }} 
                />
              ) : (
                <span role="img" aria-label="profile" style={{ fontSize: '1.5rem' }}>👤</span>
              )}
            </div>
            {showDropdown && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                background: '#18181b',
                border: '2px solid #3ad1e8',
                borderRadius: 8,
                padding: 8,
                marginTop: 8,
                minWidth: 150,
                zIndex: 1000,
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
              }}>
                <div style={{ 
                  padding: '8px 12px', 
                  borderBottom: '1px solid #3ad1e8',
                  fontSize: '0.9rem',
                  color: '#3ad1e8',
                  fontWeight: 'bold'
                }}>
                  {getUsername()}
                </div>
                <button 
                  onClick={() => { onProfile(); setShowDropdown(false); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Profile
                </button>
                <button 
                  onClick={() => { onInbox(); setShowDropdown(false); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Inbox
                </button>
                <button 
                  onClick={() => { handleLogout(); setShowDropdown(false); }}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '8px 12px',
                    background: 'none',
                    border: 'none',
                    color: '#ff6b6b',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#2a2a2a'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <button className="primary-btn" onClick={onLogin}>
          Login
        </button>
      )}
    </div>
  );
}

export default Header; 