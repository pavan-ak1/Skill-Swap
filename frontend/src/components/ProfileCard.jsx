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
          <span role="img" aria-label="profile">👤</span>
        )}
      </div>
      <div className="profile-info">
        <div className="profile-name">{profile.user?.username || 'Unknown'}</div>
        <div className="skills-row">
          <span style={{ color: '#3ad1e8', fontWeight: 500 }}>Skills Offered &rarr; </span>
          {profile.skillsOffered && profile.skillsOffered.length > 0 ? (
            profile.skillsOffered.map(skill => (
              <span className="skill-label" key={skill}>{skill}</span>
            ))
          ) : (
            <span style={{ color: '#888' }}>None</span>
          )}
        </div>
        <div className="skills-row">
          <span style={{ color: '#3ad1e8', fontWeight: 500 }}>Skill wanted &rarr; </span>
          {profile.skillsWanted && profile.skillsWanted.length > 0 ? (
            profile.skillsWanted.map(skill => (
              <span className="skill-label" key={skill}>{skill}</span>
            ))
          ) : (
            <span style={{ color: '#888' }}>None</span>
          )}
        </div>
        {profile.rating && <div className="rating">rating &nbsp; {profile.rating}/5</div>}
      </div>
      <div className="request-btn-area">
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