import React, { useState, useEffect } from 'react';
import '../App.css';

const initialProfile = {
  name: '',
  location: '',
  skillsOffered: [],
  skillsWanted: [],
  availability: '',
  public: true,
  photo: '',
};

function Profile() {
  const [profile, setProfile] = useState(initialProfile);
  const [editPhoto, setEditPhoto] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return setLoading(false);
    fetch('http://localhost:5000/api/profile/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) setProfile({ ...initialProfile, ...data });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleChange = (field, value) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSkillRemove = (field, skill) => {
    setProfile({
      ...profile,
      [field]: profile[field].filter(s => s !== skill),
    });
  };

  const handleSkillAdd = (field, value) => {
    if (value && !profile[field].includes(value)) {
      setProfile({ ...profile, [field]: [...profile[field], value] });
    }
  };

  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');

  const handleSave = async () => {
    setError(''); setSuccess('');
    const token = localStorage.getItem('token');
    if (!token) { setError('Not logged in'); return; }
    try {
      const res = await fetch('http://localhost:5000/api/profile/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      const data = await res.json();
      if (data && !data.error) {
        setProfile({ ...profile, ...data });
        setSuccess('Profile saved!');
      } else {
        setError(data.error || 'Failed to save profile');
      }
    } catch {
      setError('Server error');
    }
  };

  const handlePhotoUpload = async (e) => {
    setError(''); setSuccess('');
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://localhost:5000/api/profile/photo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data && !data.error) {
        setProfile({ ...profile, photo: data.photo });
        setSuccess('Photo uploaded!');
        setEditPhoto(false);
      } else {
        setError(data.error || 'Failed to upload photo');
      }
    } catch {
      setError('Server error');
    }
  };

  if (loading) return <div className="main-content">Loading...</div>;

  return (
    <div className="app-container">
      <div className="header-bar" style={{ alignItems: 'center' }}>
        <span>Skill Swap Platform</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <button style={{ color: 'green', background: 'none', border: 'none', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer' }} onClick={handleSave}>Save</button>
          <button style={{ color: 'red', background: 'none', border: 'none', fontWeight: 600, fontSize: '1.1rem', cursor: 'pointer' }} onClick={() => window.location.reload()}>Discard</button>
          <button className="primary-btn">Swap request</button>
          <button className="primary-btn" onClick={() => window.location.href = '/'}>Home</button>
          <div className="profile-photo" style={{ margin: 0, width: 48, height: 48, fontSize: '1.5rem' }}>
            <span role="img" aria-label="profile">👤</span>
          </div>
        </div>
      </div>
      <div className="main-content" style={{ display: 'flex', gap: 48, minHeight: 400 }}>
        <div style={{ flex: 1 }}>
          {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
          {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '1.2rem' }}>Name</label><br />
            <input value={profile.name} onChange={e => handleChange('name', e.target.value)} style={{ width: '70%', padding: '8px 12px', borderRadius: 8, border: '2px solid #fff', background: '#18181b', color: '#fff', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '1.2rem' }}>Location</label><br />
            <input value={profile.location} onChange={e => handleChange('location', e.target.value)} style={{ width: '70%', padding: '8px 12px', borderRadius: 8, border: '2px solid #fff', background: '#18181b', color: '#fff', fontSize: '1rem' }} />
          </div>
          <div style={{ display: 'flex', gap: 24, marginBottom: 24 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '1.2rem' }}>Skills Offered</label><br />
              {profile.skillsOffered.map(skill => (
                <span className="skill-label" key={skill} style={{ marginRight: 8 }}>
                  {skill} <span style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleSkillRemove('skillsOffered', skill)}>×</span>
                </span>
              ))}
              <input
                value={newSkillOffered}
                onChange={e => setNewSkillOffered(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { handleSkillAdd('skillsOffered', newSkillOffered); setNewSkillOffered(''); } }}
                placeholder="Add skill"
                style={{ marginTop: 8, padding: '4px 10px', borderRadius: 8, border: '1px solid #3ad1e8', background: '#18181b', color: '#fff', fontSize: '1rem' }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '1.2rem' }}>Skills wanted</label><br />
              {profile.skillsWanted.map(skill => (
                <span className="skill-label" key={skill} style={{ marginRight: 8 }}>
                  {skill} <span style={{ cursor: 'pointer', color: 'red' }} onClick={() => handleSkillRemove('skillsWanted', skill)}>×</span>
                </span>
              ))}
              <input
                value={newSkillWanted}
                onChange={e => setNewSkillWanted(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { handleSkillAdd('skillsWanted', newSkillWanted); setNewSkillWanted(''); } }}
                placeholder="Add skill"
                style={{ marginTop: 8, padding: '4px 10px', borderRadius: 8, border: '1px solid #3ad1e8', background: '#18181b', color: '#fff', fontSize: '1rem' }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '1.2rem' }}>Availability</label><br />
            <input value={profile.availability} onChange={e => handleChange('availability', e.target.value)} style={{ width: '70%', padding: '8px 12px', borderRadius: 8, border: '2px solid #fff', background: '#18181b', color: '#fff', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: '1.2rem' }}>Profile</label><br />
            <select value={profile.public ? 'public' : 'private'} onChange={e => handleChange('public', e.target.value === 'public')} style={{ width: '40%', padding: '8px 12px', borderRadius: 8, border: '2px solid #fff', background: '#18181b', color: '#fff', fontSize: '1rem' }}>
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>
        <div style={{ minWidth: 220, textAlign: 'center' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ width: 140, height: 140, borderRadius: '50%', background: '#18181b', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#3ad1e8', border: '2px solid #fff', position: 'relative' }}>
              <span role="img" aria-label="profile">👤</span>
              {profile.photo && (
                <img src={profile.photo} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
              )}
            </div>
            <div style={{ marginTop: 12 }}>
              <button style={{ color: '#3ad1e8', background: 'none', border: 'none', cursor: 'pointer', marginRight: 8 }} onClick={() => setEditPhoto(true)}>Add/Edit</button>
              <button style={{ color: 'red', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setProfile({ ...profile, photo: '' })}>Remove</button>
            </div>
            {editPhoto && (
              <div style={{ marginTop: 8 }}>
                <input type="file" accept="image/*" onChange={handlePhotoUpload} />
                <button style={{ marginLeft: 8 }} onClick={() => setEditPhoto(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile; 