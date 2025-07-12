import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

function SwapRequestForm({ loggedIn, userId }) {
  const { id } = useParams(); // id = target user id
  const navigate = useNavigate();
  const [mySkills, setMySkills] = useState([]);
  const [theirSkills, setTheirSkills] = useState([]);
  const [selectedMySkill, setSelectedMySkill] = useState('');
  const [selectedTheirSkill, setSelectedTheirSkill] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [loading, setLoading] = useState(true);

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
    // Fetch logged-in user's profile for offered skills
    const token = localStorage.getItem('token');
    if (!token) return;
    
    Promise.all([
      fetch('http://localhost:5000/api/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`http://localhost:5000/api/profile/user/${id}`)
    ])
      .then(responses => Promise.all(responses.map(res => res.json())))
      .then(([myProfile, theirProfile]) => {
        setMySkills(myProfile.skillsOffered || []);
        setTheirSkills(theirProfile.skillsWanted || []);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load user profiles');
        setLoading(false);
      });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setSuccess('');
    
    if (!selectedMySkill || !selectedTheirSkill) {
      setError('Please select both skills to proceed.');
      return;
    }
    
    if (!message.trim()) {
      setError('Please include a message with your request.');
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) { 
      setError('You must be logged in to send a swap request.'); 
      return; 
    }
    
    try {
      const res = await fetch('http://localhost:5000/api/swap-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          toUser: id,
          offeredSkill: selectedMySkill,
          wantedSkill: selectedTheirSkill,
          message: message.trim()
        })
      });
      
      const data = await res.json();
      if (data && data.success) {
        setSuccess('Swap request sent successfully! You can now start messaging.');
        // Redirect to home after a short delay
        setTimeout(() => navigate('/'), 3000);
      } else {
        if (data.error && data.error.includes('already exists')) {
          setError('You already have a swap request with this person. You can start messaging them directly.');
        } else {
          setError(data.error || 'Failed to submit request. Please try again.');
        }
      }
    } catch {
      setError('Network error. Please check your connection and try again.');
    }
  };

  const containerStyles = {
    maxWidth: isMobile ? '100%' : '600px',
    margin: isMobile ? '20px 16px' : '40px auto',
    borderRadius: '20px',
    background: colors.surface,
    padding: isMobile ? '24px' : '32px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
    border: `1px solid ${colors.border}`
  };

  const titleStyles = {
    color: colors.text,
    marginBottom: '32px',
    fontSize: isMobile ? '1.5rem' : '1.8rem',
    fontWeight: '600',
    textAlign: 'center',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
    backgroundClip: 'text',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const formGroupStyles = {
    marginBottom: '28px'
  };

  const labelStyles = {
    color: colors.text,
    fontSize: '1rem',
    fontWeight: '600',
    marginBottom: '12px',
    display: 'block',
    lineHeight: '1.4'
  };

  const selectStyles = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    background: colors.background,
    color: colors.text,
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    cursor: 'pointer'
  };

  const textareaStyles = {
    width: '100%',
    padding: '14px 16px',
    borderRadius: '8px',
    border: `1px solid ${colors.border}`,
    background: colors.background,
    color: colors.text,
    fontSize: '0.95rem',
    outline: 'none',
    transition: 'all 0.2s ease',
    resize: 'vertical',
    minHeight: '120px',
    fontFamily: 'inherit',
    lineHeight: '1.5'
  };

  const errorStyles = {
    color: colors.danger,
    marginBottom: '16px',
    padding: '12px 16px',
    background: `rgba(239, 68, 68, 0.1)`,
    borderRadius: '8px',
    border: `1px solid ${colors.danger}`,
    fontSize: '0.9rem',
    lineHeight: '1.4'
  };

  const successStyles = {
    color: colors.success,
    marginBottom: '16px',
    padding: '12px 16px',
    background: `rgba(34, 197, 94, 0.1)`,
    borderRadius: '8px',
    border: `1px solid ${colors.success}`,
    fontSize: '0.9rem',
    lineHeight: '1.4'
  };

  const submitButtonStyles = {
    width: isMobile ? '100%' : '200px',
    padding: '14px 24px',
    borderRadius: '8px',
    border: 'none',
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
    color: colors.text,
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
  };

  const loadingStyles = {
    textAlign: 'center',
    padding: '40px 20px',
    color: colors.textSecondary,
    fontSize: '1rem'
  };

  if (!loggedIn) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '40px auto',
        padding: '40px 20px',
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: '1.1rem'
      }}>
        Please log in to send a swap request.
      </div>
    );
  }

  if (loading) {
    return (
      <div style={containerStyles}>
        <div style={loadingStyles}>
          <div style={{ fontSize: '1.5rem', marginBottom: '12px', color: colors.primary, fontWeight: '600' }}>
            Loading
          </div>
          Loading user profiles...
        </div>
      </div>
    );
  }

  return (
    <>
      <style>
        {`
          .form-select:focus {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
          }
          
          .form-textarea:focus {
            border-color: ${colors.primary} !important;
            box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2) !important;
          }
          
          .submit-btn:hover {
            transform: translateY(-2px) !important;
            box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4) !important;
          }
        `}
      </style>

      <div style={containerStyles}>
        <h2 style={titleStyles}>Send Swap Request</h2>
        
        <form onSubmit={handleSubmit}>
          <div style={formGroupStyles}>
            <label style={labelStyles}>
              Choose one of your offered skills
            </label>
            <select 
              className="form-select"
              style={selectStyles} 
              value={selectedMySkill} 
              onChange={e => setSelectedMySkill(e.target.value)} 
              required
            >
              <option value="">Select a skill to offer</option>
              {mySkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
          
          <div style={formGroupStyles}>
            <label style={labelStyles}>
              Choose one of their wanted skills
            </label>
            <select 
              className="form-select"
              style={selectStyles} 
              value={selectedTheirSkill} 
              onChange={e => setSelectedTheirSkill(e.target.value)} 
              required
            >
              <option value="">Select a skill they want</option>
              {theirSkills.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
          
          <div style={formGroupStyles}>
            <label style={labelStyles}>
              Message
            </label>
            <textarea 
              className="form-textarea"
              style={textareaStyles} 
              value={message} 
              onChange={e => setMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you'd like to swap skills..."
            />
          </div>
          
          {error && <div style={errorStyles}>{error}</div>}
          {success && <div style={successStyles}>{success}</div>}
          
          <div style={{ textAlign: 'center', marginTop: '32px' }}>
            <button 
              className="submit-btn"
              type="submit" 
              style={submitButtonStyles}
            >
              Send Request
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

export default SwapRequestForm; 