import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import '../App.css';

function Signup({ setLoggedIn }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('token', data.token);
        setLoggedIn(true);
        navigate('/profile');
      } else {
        setError(data.error || 'Signup failed');
      }
    } catch (err) {
      setError('Server error');
    }
  };

  return (
    <div className="app-container">
      <div className="header-bar">
        <span>Skill Swap Platform</span>
        <button className="primary-btn" onClick={() => navigate('/')}>Home</button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
        <form onSubmit={handleSignup} style={{ background: '#23232a', borderRadius: 16, padding: '48px 64px', minWidth: 400, boxShadow: '0 2px 16px rgba(0,0,0,0.2)' }}>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '1.2rem', marginBottom: 8 }}>Username</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%', padding: '10px 16px', borderRadius: 10, border: '2px solid #fff', background: '#18181b', color: '#fff', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '1.2rem', marginBottom: 8 }}>Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required style={{ width: '100%', padding: '10px 16px', borderRadius: 10, border: '2px solid #fff', background: '#18181b', color: '#fff', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '1.2rem', marginBottom: 8 }}>Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%', padding: '10px 16px', borderRadius: 10, border: '2px solid #fff', background: '#18181b', color: '#fff', fontSize: '1rem' }} />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: '1.2rem', marginBottom: 8 }}>Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required style={{ width: '100%', padding: '10px 16px', borderRadius: 10, border: '2px solid #fff', background: '#18181b', color: '#fff', fontSize: '1rem' }} />
          </div>
          {error && <div style={{ color: 'red', marginBottom: 16, textAlign: 'center' }}>{error}</div>}
          <div style={{ textAlign: 'center', marginBottom: 18 }}>
            <button className="primary-btn" type="submit" style={{ width: 120 }}>Sign up</button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <span style={{ color: '#fff', fontSize: '1rem' }}>Already have an account? </span>
            <Link to="/login" style={{ color: '#3ad1e8', fontSize: '1rem' }}>Login</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Signup; 