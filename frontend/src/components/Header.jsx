import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

function Header({ loggedIn, onLogin, onLogout, onProfile, onInbox }) {
  const [profile, setProfile] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

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

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const headerStyles = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? '12px 16px' : '16px 24px',
    background: colors.background,
    borderBottom: `1px solid ${colors.border}`,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    minHeight: isMobile ? '60px' : '70px',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)'
  };

  const titleStyles = {
    fontSize: isMobile ? '1.1rem' : '1.5rem',
    fontWeight: '700',
    color: colors.text,
    margin: 0,
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
  };

  const profileContainerStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? '12px' : '16px'
  };

  const profilePhotoStyles = {
    cursor: 'pointer',
    width: isMobile ? '40px' : '48px',
    height: isMobile ? '40px' : '48px',
    borderRadius: '50%',
    background: colors.surface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: `2px solid ${colors.primary}`,
    position: 'relative',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
  };

  const dropdownStyles = {
    position: 'absolute',
    top: '100%',
    right: 0,
    background: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '12px',
    padding: '8px',
    marginTop: '8px',
    minWidth: isMobile ? '140px' : '180px',
    zIndex: 1000,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    backdropFilter: 'blur(10px)',
    animation: 'dropdownSlide 0.2s ease-out'
  };

  const dropdownItemStyles = {
    width: '100%',
    textAlign: 'left',
    padding: '12px 16px',
    background: 'none',
    border: 'none',
    color: colors.text,
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    borderRadius: '8px',
    transition: 'all 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const loginButtonStyles = {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
    color: colors.text,
    border: 'none',
    padding: isMobile ? '10px 16px' : '12px 24px',
    borderRadius: '8px',
    fontSize: isMobile ? '0.9rem' : '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    textTransform: 'none'
  };

  return (
    <>
      <style>
        {`
          @keyframes dropdownSlide {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (max-width: 768px) {
            .header-title {
              font-size: 1.1rem !important;
            }
          }
          
          body {
            padding-top: ${isMobile ? '60px' : '70px'};
          }
        `}
      </style>
      
      <div style={headerStyles}>
        <h1 style={titleStyles} className="header-title">
          Skill Swap Platform
        </h1>
        
        {loggedIn ? (
          <div style={profileContainerStyles}>
            <div style={{ position: 'relative' }} ref={dropdownRef}>
              <div 
                style={profilePhotoStyles}
                onClick={() => setShowDropdown(!showDropdown)}
                onMouseEnter={(e) => {
                  e.target.style.borderColor = colors.secondary;
                  e.target.style.transform = 'scale(1.05)';
                  e.target.style.boxShadow = `0 4px 16px rgba(16, 185, 129, 0.3)`;
                }}
                onMouseLeave={(e) => {
                  e.target.style.borderColor = colors.primary;
                  e.target.style.transform = 'scale(1)';
                  e.target.style.boxShadow = `0 2px 8px rgba(99, 102, 241, 0.2)`;
                }}
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
                  <span style={{ 
                    fontSize: isMobile ? '1.2rem' : '1.5rem',
                    color: colors.textSecondary,
                    fontWeight: '600'
                  }}>
                    U
                  </span>
                )}
              </div>
              
              {showDropdown && (
                <div style={dropdownStyles}>
                  <div style={dropdownItemStyles} onClick={() => navigate('/profile')}>
                    <span style={{ marginRight: '8px' }}>Profile</span>
                  </div>
                  <div style={dropdownItemStyles} onClick={() => navigate('/inbox')}>
                    <span style={{ marginRight: '8px' }}>Inbox</span>
                  </div>
                  <div style={dropdownItemStyles} onClick={handleLogout}>
                    <span style={{ marginRight: '8px' }}>Logout</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <button 
            style={loginButtonStyles}
            onClick={onLogin}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            Login
          </button>
        )}
      </div>
    </>
  );
}

export default Header; 