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
        setSuccess('Profile saved successfully!');
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
        setSuccess('Photo uploaded successfully!');
        setEditPhoto(false);
      } else {
        setError(data.error || 'Failed to upload photo');
      }
    } catch {
      setError('Server error');
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

  const saveButtonStyles = {
    ...buttonStyles,
    background: `linear-gradient(135deg, ${colors.success}, #16a34a)`,
    boxShadow: '0 4px 12px rgba(34, 197, 94, 0.3)'
  };

  const discardButtonStyles = {
    ...buttonStyles,
    background: `linear-gradient(135deg, ${colors.danger}, ${colors.dangerHover})`,
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
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

  const formCardStyles = {
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

  const inputStyles = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '12px',
    border: `2px solid ${colors.border}`,
    background: colors.background,
    color: colors.text,
    fontSize: '1rem',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  };

  const labelStyles = {
    display: 'block',
    fontSize: '1rem',
    marginBottom: '8px',
    color: colors.text,
    fontWeight: '600'
  };

  const skillTagStyles = {
    display: 'inline-block',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
    color: colors.text,
    padding: '6px 12px',
    borderRadius: '20px',
    margin: '4px',
    fontSize: '0.9rem',
    fontWeight: '500',
    boxShadow: '0 2px 8px rgba(99, 102, 241, 0.2)'
  };

  const removeButtonStyles = {
    background: 'none',
    border: 'none',
    color: colors.text,
    cursor: 'pointer',
    marginLeft: '8px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    transition: 'color 0.2s ease'
  };

  const photoContainerStyles = {
    width: isMobile ? '120px' : '140px',
    height: isMobile ? '120px' : '140px',
    borderRadius: '50%',
    background: colors.background,
    margin: '0 auto 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: isMobile ? '2.5rem' : '3rem',
    color: colors.primary,
    border: `3px solid ${colors.primary}`,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 8px 24px rgba(99, 102, 241, 0.3)'
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
          
          input:focus, select:focus {
            outline: none;
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
          }
          
          .form-section {
            margin-bottom: 24px;
          }
          
          .skills-section {
            margin-bottom: 32px;
          }
          
          .error-message {
            background: rgba(239, 68, 68, 0.1);
            border: 1px solid ${colors.danger};
            color: ${colors.danger};
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            text-align: center;
            font-size: 0.9rem;
          }
          
          .success-message {
            background: rgba(34, 197, 94, 0.1);
            border: 1px solid ${colors.success};
            color: ${colors.success};
            padding: 12px 16px;
            border-radius: 8px;
            margin-bottom: 16px;
            text-align: center;
            font-size: 0.9rem;
          }
          
          .header-actions {
            display: flex;
            align-items: center;
            gap: ${isMobile ? '8px' : '12px'};
            flex-wrap: wrap;
          }
          
          .photo-actions {
            display: flex;
            gap: 8px;
            justify-content: center;
            margin-bottom: 16px;
          }
          
          .photo-actions button {
            background: none;
            border: none;
            color: ${colors.primary};
            cursor: pointer;
            font-size: 0.9rem;
            padding: 4px 8px;
            border-radius: 4px;
            transition: background-color 0.2s ease;
          }
          
          .photo-actions button:hover {
            background: rgba(99, 102, 241, 0.1);
          }
          
          .file-input-container {
            margin-top: 12px;
          }
          
          .file-input-container input[type="file"] {
            display: none;
          }
          
          .file-input-label {
            display: inline-block;
            background: ${colors.primary};
            color: ${colors.text};
            padding: 8px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 0.9rem;
            transition: all 0.2s ease;
          }
          
          .file-input-label:hover {
            background: ${colors.primaryHover};
          }
        `}
      </style>

      <div style={headerStyles}>
        <h1 style={titleStyles}>Skill Swap Platform</h1>
        <div className="header-actions">
          <button 
            style={saveButtonStyles}
            onClick={handleSave}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
            }}
          >
            Save
          </button>
          <button 
            style={discardButtonStyles}
            onClick={() => window.location.reload()}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(239, 68, 68, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
            }}
          >
            Discard
          </button>
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
            onClick={() => window.location.href = '/'}
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
          <div style={formCardStyles}>
            <h2 style={{ 
              marginBottom: '32px', 
              color: colors.text,
              fontSize: isMobile ? '1.5rem' : '2rem',
              fontWeight: '700',
              background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>
              Profile Settings
            </h2>

            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">{success}</div>}

            <div className="form-section">
              <label style={labelStyles}>Name</label>
              <input 
                value={profile.name} 
                onChange={e => handleChange('name', e.target.value)} 
                style={inputStyles}
                placeholder="Enter your full name"
              />
            </div>

            <div className="form-section">
              <label style={labelStyles}>Location</label>
              <input 
                value={profile.location} 
                onChange={e => handleChange('location', e.target.value)} 
                style={inputStyles}
                placeholder="Enter your location"
              />
            </div>

            <div className="skills-section">
              <label style={labelStyles}>Skills Offered</label>
              <div style={{ marginBottom: '12px' }}>
                {profile.skillsOffered.map(skill => (
                  <span key={skill} style={skillTagStyles}>
                    {skill}
                    <button 
                      style={removeButtonStyles}
                      onClick={() => handleSkillRemove('skillsOffered', skill)}
                      onMouseEnter={(e) => e.target.style.color = colors.danger}
                      onMouseLeave={(e) => e.target.style.color = colors.text}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={newSkillOffered}
                onChange={e => setNewSkillOffered(e.target.value)}
                onKeyDown={e => { 
                  if (e.key === 'Enter') { 
                    handleSkillAdd('skillsOffered', newSkillOffered); 
                    setNewSkillOffered(''); 
                  } 
                }}
                placeholder="Type a skill and press Enter"
                style={inputStyles}
              />
            </div>

            <div className="skills-section">
              <label style={labelStyles}>Skills Wanted</label>
              <div style={{ marginBottom: '12px' }}>
                {profile.skillsWanted.map(skill => (
                  <span key={skill} style={skillTagStyles}>
                    {skill}
                    <button 
                      style={removeButtonStyles}
                      onClick={() => handleSkillRemove('skillsWanted', skill)}
                      onMouseEnter={(e) => e.target.style.color = colors.danger}
                      onMouseLeave={(e) => e.target.style.color = colors.text}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                value={newSkillWanted}
                onChange={e => setNewSkillWanted(e.target.value)}
                onKeyDown={e => { 
                  if (e.key === 'Enter') { 
                    handleSkillAdd('skillsWanted', newSkillWanted); 
                    setNewSkillWanted(''); 
                  } 
                }}
                placeholder="Type a skill and press Enter"
                style={inputStyles}
              />
            </div>

            <div className="form-section">
              <label style={labelStyles}>Availability</label>
              <input 
                value={profile.availability} 
                onChange={e => handleChange('availability', e.target.value)} 
                style={inputStyles}
                placeholder="e.g., Weekdays 6-9 PM, Weekends"
              />
            </div>

            <div className="form-section">
              <label style={labelStyles}>Profile Visibility</label>
              <select 
                value={profile.public ? 'public' : 'private'} 
                onChange={e => handleChange('public', e.target.value === 'public')} 
                style={inputStyles}
              >
                <option value="public">Public - Anyone can see my profile</option>
                <option value="private">Private - Only I can see my profile</option>
              </select>
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

            <div className="photo-actions">
              <button onClick={() => setEditPhoto(true)}>Add/Edit</button>
              <button 
                onClick={() => setProfile({ ...profile, photo: '' })}
                style={{ color: colors.danger }}
              >
                Remove
              </button>
            </div>

            {editPhoto && (
              <div className="file-input-container">
                <label className="file-input-label">
                  Choose Photo
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handlePhotoUpload} 
                    style={{ display: 'none' }}
                  />
                </label>
                <button 
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    color: colors.textSecondary, 
                    cursor: 'pointer', 
                    marginLeft: '8px',
                    fontSize: '0.9rem'
                  }} 
                  onClick={() => setEditPhoto(false)}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default Profile; 