import React from 'react';

function ProfileCard({ profile, loggedIn, userId, navigate }) {
  const isSelf = userId && profile.user && (userId === profile.user._id);
  const handleRequest = () => {
    if (!loggedIn) {
      if (navigate) navigate('/login');
      return;
    }
    if (navigate) navigate(`/profile/${profile.user?._id || profile.user}`);
  };

  return (
    <div className="profile-card">
      <div className="profile-photo">
        {profile.photo ? (
          <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
        ) : (
                          <span style={{ fontWeight: '600' }}>U</span>
        )}
      </div>
      <div className="profile-info">
        <div className="profile-name" style={{ 
          textAlign: 'center', 
          marginBottom: '8px',
          color: '#f8fafc',
          fontSize: '1.1rem',
          fontWeight: '600'
        }}>
          {profile.user?.username || 'Unknown'}
        </div>
        <div className="skills-row" style={{ marginBottom: '8px' }}>
          <span style={{ 
            color: '#10b981', 
            fontWeight: '600', 
            display: 'block', 
            marginBottom: '4px',
            fontSize: '0.9rem'
          }}>Skills Offered:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
            {profile.skillsOffered && profile.skillsOffered.length > 0 ? (
              profile.skillsOffered.map(skill => (
                <span className="skill-label" key={skill}>{skill}</span>
              ))
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>None</span>
            )}
          </div>
        </div>
        <div className="skills-row" style={{ marginBottom: '8px' }}>
          <span style={{ 
            color: '#6366f1', 
            fontWeight: '600', 
            display: 'block', 
            marginBottom: '4px',
            fontSize: '0.9rem'
          }}>Skills Wanted:</span>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', justifyContent: 'center' }}>
            {profile.skillsWanted && profile.skillsWanted.length > 0 ? (
              profile.skillsWanted.map(skill => (
                <span className="skill-label" key={skill}>{skill}</span>
              ))
            ) : (
              <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>None</span>
            )}
          </div>
        </div>
        {profile.rating && (
          <div className="rating" style={{ 
            textAlign: 'center', 
            marginTop: '8px',
            color: '#f59e0b',
            fontWeight: '600',
            fontSize: '0.9rem'
          }}>
                          Rating: {profile.rating}/5
          </div>
        )}
      </div>
      <div className="request-btn-area" style={{ textAlign: 'center', marginTop: '12px' }}>
        {loggedIn && !isSelf && (
          <button className="primary-btn" onClick={handleRequest}>
            Request
          </button>
        )}
      </div>
    </div>
  );
}

export default ProfileCard; 