import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

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

  useEffect(() => {
    // Fetch logged-in user's profile for offered skills
    const token = localStorage.getItem('token');
    if (!token) return;
    fetch('http://localhost:5000/api/profile/', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setMySkills(data.skillsOffered || []));
    // Fetch target user's profile for wanted skills
    fetch(`http://localhost:5000/api/profile/user/${id}`)
      .then(res => res.json())
      .then(data => setTheirSkills(data.skillsWanted || []));
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!selectedMySkill || !selectedTheirSkill) {
      setError('Please select both skills.');
      return;
    }
    const token = localStorage.getItem('token');
    if (!token) { setError('Not logged in'); return; }
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
          message
        })
      });
      const data = await res.json();
      if (data && data.success) {
        setSuccess('Swap request sent! You can now start messaging.');
        // Redirect to home after a short delay
        setTimeout(() => navigate('/'), 2000);
      } else {
        if (data.error && data.error.includes('already exists')) {
          setError('You already have a swap request with this person. You can start messaging them directly.');
          // Optionally redirect to messages or show a link
        } else {
          setError(data.error || 'Failed to submit request');
        }
      }
    } catch {
      setError('Server error');
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: 500, margin: '40px auto', borderRadius: 24, background: '#23232a', padding: 32 }}>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 28 }}>
          <label style={{ color: '#fff', fontSize: '1.2rem' }}>Choose one of your offered skills</label>
          <select className="search-input" value={selectedMySkill} onChange={e => setSelectedMySkill(e.target.value)} required>
            <option value="">Select a skill</option>
            {mySkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ color: '#fff', fontSize: '1.2rem' }}>Choose one of their wanted skills</label>
          <select className="search-input" value={selectedTheirSkill} onChange={e => setSelectedTheirSkill(e.target.value)} required>
            <option value="">Select a skill</option>
            {theirSkills.map(skill => <option key={skill} value={skill}>{skill}</option>)}
          </select>
        </div>
        <div style={{ marginBottom: 28 }}>
          <label style={{ color: '#fff', fontSize: '1.2rem' }}>Message</label>
          <textarea className="search-input" style={{ minHeight: 100, resize: 'vertical' }} value={message} onChange={e => setMessage(e.target.value)} />
        </div>
        {error && <div style={{ color: 'red', marginBottom: 12 }}>{error}</div>}
        {success && <div style={{ color: 'green', marginBottom: 12 }}>{success}</div>}
        <div style={{ textAlign: 'center' }}>
          <button className="primary-btn" type="submit" style={{ width: 120 }}>Submit</button>
        </div>
      </form>
    </div>
  );
}

export default SwapRequestForm; 