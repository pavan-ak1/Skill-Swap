import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function ProfileDetail({ loggedIn, userId }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="main-content">Loading...</div>;
  if (!profile) return <div className="main-content">Profile not found.</div>;

  return (
    <div className="app-container">
      <div className="header-bar" style={{ alignItems: 'center' }}>
        <span>Skill Swap Platform</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button className="primary-btn">Swap request</button>
          <button className="primary-btn" onClick={() => navigate('/')}>Home</button>
          <div className="profile-photo" style={{ margin: 0, width: 48, height: 48, fontSize: '1.5rem' }}>
            <span role="img" aria-label="profile">👤</span>
          </div>
        </div>
      </div>
      <div className="main-content" style={{ display: 'flex', gap: 48, minHeight: 400 }}>
        <div style={{ flex: 1 }}>
          {!isSelf && (
            <button className="primary-btn" style={{ marginBottom: 24 }} onClick={handleRequest}>Request</button>
          )}
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: 24 }}>{profile.user?.username || 'Unknown'}</div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Skills Offered</div>
            {profile.skillsOffered && profile.skillsOffered.length > 0 ? (
              profile.skillsOffered.map(skill => (
                <span className="skill-label" key={skill}>{skill}</span>
              ))
            ) : (
              <span style={{ color: '#888' }}>None</span>
            )}
          </div>
          <div style={{ marginBottom: 24 }}>
            <div style={{ fontWeight: 600, fontSize: '1.1rem' }}>Skills wanted</div>
            {profile.skillsWanted && profile.skillsWanted.length > 0 ? (
              profile.skillsWanted.map(skill => (
                <span className="skill-label" key={skill}>{skill}</span>
              ))
            ) : (
              <span style={{ color: '#888' }}>None</span>
            )}
          </div>
          <div style={{ marginTop: 32, fontWeight: 600, fontSize: '1.1rem' }}>Rating and Feedback</div>
          {profile.rating ? (
            <div className="rating">{profile.rating}/5</div>
          ) : (
            <div style={{ color: '#888' }}>No rating yet</div>
          )}
        </div>
        <div style={{ minWidth: 220, textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ width: 180, height: 180, borderRadius: '50%', background: '#18181b', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#3ad1e8', border: '2px solid #fff', position: 'relative' }}>
              {profile.photo ? (
                <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
              ) : (
                <span role="img" aria-label="profile">👤</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfileDetail; 