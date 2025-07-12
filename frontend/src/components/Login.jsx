import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function Login({ setLoggedIn }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isMobile, setIsMobile] = useState(false);
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

  // Responsive breakpoint detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setLoggedIn(true);
        navigate('/');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
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

  const homeButtonStyles = {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
    color: colors.text,
    border: 'none',
    padding: isMobile ? '8px 16px' : '10px 20px',
    borderRadius: '8px',
    fontSize: isMobile ? '0.9rem' : '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    textTransform: 'none'
  };

  const containerStyles = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    padding: isMobile ? '20px' : '40px',
    paddingTop: isMobile ? '80px' : '110px',
    background: colors.background
  };

  const formStyles = {
    background: colors.surface,
    borderRadius: '20px',
    padding: isMobile ? '32px 24px' : '48px 64px',
    minWidth: isMobile ? '100%' : '400px',
    maxWidth: '500px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
    border: `1px solid ${colors.border}`,
    position: 'relative',
    overflow: 'hidden'
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
    fontWeight: '500'
  };

  const submitButtonStyles = {
    background: `linear-gradient(135deg, ${colors.primary}, ${colors.primaryHover})`,
    color: colors.text,
    border: 'none',
    padding: '14px 32px',
    borderRadius: '12px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
    width: '100%',
    marginTop: '8px'
  };

  const linkStyles = {
    color: colors.primary,
    textDecoration: 'none',
    fontSize: '0.95rem',
    fontWeight: '500',
    transition: 'color 0.2s ease'
  };

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
           
           input:focus {
             outline: none;
             border-color: ${colors.primary} !important;
             box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
           }
           
           .form-section {
             margin-bottom: 24px;
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
           
           .form-footer {
             text-align: center;
             margin-top: 24px;
             padding-top: 24px;
             border-top: 1px solid ${colors.border};
           }
           
           .form-footer a:hover {
             color: ${colors.secondary} !important;
           }
           
           .form-accent {
             position: absolute;
             top: 0;
             left: 0;
             right: 0;
             height: 4px;
             background: linear-gradient(90deg, ${colors.primary}, ${colors.secondary});
           }
         `}
       </style>

      <div style={headerStyles}>
        <h1 style={titleStyles}>Skill Swap Platform</h1>
        <button 
          style={homeButtonStyles}
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

             <div style={containerStyles}>
         <form onSubmit={handleLogin} style={formStyles}>
           <div className="form-accent"></div>
           <h2 style={{ 
             textAlign: 'center', 
             marginBottom: '32px', 
             color: colors.text,
             fontSize: isMobile ? '1.5rem' : '2rem',
             fontWeight: '700',
             background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
             backgroundClip: 'text',
             WebkitBackgroundClip: 'text',
             WebkitTextFillColor: 'transparent'
           }}>
             Welcome Back
           </h2>

          <div className="form-section">
            <label style={labelStyles}>Email</label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={inputStyles}
              placeholder="Enter your email"
            />
          </div>

          <div className="form-section">
            <label style={labelStyles}>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={inputStyles}
              placeholder="Enter your password"
            />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
          <div style={{ textAlign: 'center', marginBottom: 10 }}>
            <a href="#" style={{ color: '#3ad1e8', textDecoration: 'none', fontSize: '1rem' }}>Forgot email/password</a>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#fff', fontSize: '1rem' }}>Don't have an account? </span>
            <Link to="/signup" style={{ color: '#3ad1e8', fontSize: '1rem' }}>Sign up</Link>
          </div>

          <button 
            type="submit" 
            style={submitButtonStyles}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            }}
          >
            Sign In
          </button>

          <div className="form-footer">
            <span style={{ color: colors.textSecondary, fontSize: '0.95rem' }}>
              Don't have an account?{' '}
            </span>
            <Link to="/signup" style={linkStyles}>
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </>
  );
}

export default Login; 