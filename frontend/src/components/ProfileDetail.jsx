import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function ProfileDetail({ loggedIn, userId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
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
    fetch(`http://localhost:5000/api/profile/user/${id}`)
      .then(res => res.json())
      .then(data => { setProfile(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id]);

  const isSelf = userId && profile && profile.user && (userId === profile.user._id);

  const handleRequest = () => {
    if (!loggedIn) {
      navigate('/login');
      return;
    }
    navigate(`/swap-request/${profile.user._id}`);
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

  const buttonStyles = {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
    color: colors.text,
    border: 'none',
    padding: isMobile ? '8px 12px' : '10px 16px',
    borderRadius: '8px',
    fontSize: isMobile ? '0.85rem' : '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    textTransform: 'none'
  };

  const requestButtonStyles = {
    ...buttonStyles,
    background: `linear-gradient(135deg, ${colors.secondary}, #059669)`,
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    padding: '12px 24px',
    fontSize: '1rem',
    fontWeight: '600'
  };

  const containerStyles = {
    padding: isMobile ? '20px' : '40px',
    paddingTop: isMobile ? '80px' : '110px',
    background: colors.background,
    minHeight: '100vh'
  };

  const contentStyles = {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 300px',
    gap: isMobile ? '32px' : '48px',
    alignItems: 'start'
  };

  const infoCardStyles = {
    background: colors.surface,
    borderRadius: '20px',
    padding: isMobile ? '24px' : '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: `1px solid ${colors.border}`
  };

  const photoCardStyles = {
    background: colors.surface,
    borderRadius: '20px',
    padding: isMobile ? '24px' : '32px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
    border: `1px solid ${colors.border}`,
    textAlign: 'center',
    position: isMobile ? 'static' : 'sticky',
    top: isMobile ? 'auto' : '120px'
  };

  const photoContainerStyles = {
    width: isMobile ? '140px' : '180px',
    height: isMobile ? '140px' : '180px',
    borderRadius: '50%',
    background: colors.background,
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isMobile ? '3rem' : '4rem',
    color: colors.primary,
    border: `3px solid ${colors.primary}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
  };

  const nameStyles = {
    fontSize: isMobile ? '1.8rem' : '2.2rem',
    fontWeight: '700',
    color: colors.text,
    marginBottom: '24px',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const sectionStyles = {
    marginBottom: '24px'
  };

  const sectionTitleStyles = {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: colors.text,
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const skillTagStyles = {
    display: 'inline-block',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
    color: colors.text,
    padding: '6px 12px',
    borderRadius: '16px',
    margin: '4px',
    fontSize: '0.9rem',
    fontWeight: '500',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
  };

  const emptyStateStyles = {
    color: colors.textSecondary,
    fontSize: '0.95rem',
    fontStyle: 'italic'
  };

  const ratingStyles = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: `linear-gradient(135deg, ${colors.warning}, #fbbf24)`,
    color: colors.text,
    padding: '8px 16px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    marginTop: '16px',
    boxShadow: '0 2px 8px rgba(245, 158, 11, 0.3)',
    width: 'fit-content'
  };

  if (loading) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: colors.background,
      color: colors.text
    }}>
      <div style={{ fontSize: '1.2rem' }}>Loading profile...</div>
    </div>
  );

  if (!profile) return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: colors.background,
      color: colors.text
    }}>
      <div style={{ fontSize: '1.2rem' }}>Profile not found.</div>
    </div>
  );

  return (
    <>
      <style>
        {`
          body {
            padding-top: ${isMobile ? '60px' : '70px'};
            margin: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            background: ${colors.background};
          }
        `}
      </style>

      <div style={headerStyles}>
        <h1 style={titleStyles}>Skill Swap Platform</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '8px' : '12px' }}>
          <button 
            style={buttonStyles}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            Swap Request
          </button>
          <button 
            style={buttonStyles}
            onClick={() => navigate('/')}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            Home
          </button>
        </div>
      </div>

      <div style={containerStyles}>
        <div style={contentStyles}>
          <div style={infoCardStyles}>
            {!isSelf && (
              <button 
                style={requestButtonStyles}
                onClick={handleRequest}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                Request Swap
              </button>
            )}

            <div style={nameStyles}>
              {profile.user?.username || 'Unknown User'}
            </div>

            <div style={sectionStyles}>
              <div style={sectionTitleStyles}>
                <span style={{ color: colors.secondary, fontWeight: '600' }}>Target</span>
                Skills Offered
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skillsOffered && profile.skillsOffered.length > 0 ? (
                  profile.skillsOffered.map(skill => (
                    <span key={skill} style={skillTagStyles}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={emptyStateStyles}>No skills offered</span>
                )}
              </div>
            </div>

            <div style={sectionStyles}>
              <div style={sectionTitleStyles}>
                <span style={{ color: colors.primary, fontWeight: '600' }}>Seeking</span>
                Skills Wanted
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {profile.skillsWanted && profile.skillsWanted.length > 0 ? (
                  profile.skillsWanted.map(skill => (
                    <span key={skill} style={skillTagStyles}>
                      {skill}
                    </span>
                  ))
                ) : (
                  <span style={emptyStateStyles}>No skills wanted</span>
                )}
              </div>
            </div>

            <div style={sectionStyles}>
              <div style={sectionTitleStyles}>
                <span style={{ color: colors.warning, fontWeight: '600' }}>Rating</span>
                Rating and Feedback
              </div>
              {profile.rating ? (
                <div style={ratingStyles}>
                  <span style={{ color: colors.warning }}>★</span>
                  {profile.rating}/5 Rating
                </div>
              ) : (
                <span style={emptyStateStyles}>No rating yet</span>
              )}
            </div>
          </div>

          <div style={photoCardStyles}>
            <h3 style={{ 
              marginBottom: '24px', 
              color: colors.text,
              fontSize: '1.2rem',
              fontWeight: '600'
            }}>
              Profile Photo
            </h3>

            <div style={photoContainerStyles}>
              {profile.photo ? (
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
                <span style={{ fontWeight: '600' }}>U</span>
              )}
            </div>

            {profile.location && (
              <div style={{ 
                color: colors.textSecondary, 
                fontSize: '0.95rem',
                marginTop: '12px'
              }}>
                📍 {profile.location}
              </div>
            )}

            {profile.availability && (
              <div style={{ 
                color: colors.textSecondary, 
                fontSize: '0.95rem',
                marginTop: '8px'
              }}>
                ⏰ {profile.availability}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfileDetail; 