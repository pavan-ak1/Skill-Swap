import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ProfileList from './components/ProfileList';
import Pagination from './components/Pagination';
import Login from './components/Login';
import Signup from './components/Signup';
import Profile from './components/Profile';
import ProfileDetail from './components/ProfileDetail';
import SwapRequestForm from './components/SwapRequestForm';
import Inbox from './components/Inbox';
import Chat from './components/Chat';
import Messages from './components/Messages';
import FloatingMessages from './components/FloatingMessages';
import { io } from 'socket.io-client';

function getUserIdFromToken() {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.id;
  } catch {
    return null;
  }
}

function Home({ loggedIn, setLoggedIn, userId }) {
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState([]);
  useEffect(() => {
    fetch('http://localhost:5000/api/profile/all')
      .then(res => res.json())
      .then(data => setProfiles(data))
      .catch(() => setProfiles([]));
  }, []);
  const filteredProfiles = userId ? profiles.filter(p => p.user && p.user._id !== userId) : profiles;
  return (
    <div className="app-container">
      <Header
        loggedIn={loggedIn}
        onLogin={() => navigate('/login')}
        onLogout={() => setLoggedIn(false)}
        onProfile={() => navigate('/profile')}
        onInbox={() => navigate('/inbox')}
      />
      <SearchBar />
      <ProfileList profiles={filteredProfiles} loggedIn={loggedIn} userId={userId} navigate={navigate} />
      <Pagination current={1} total={1} />
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const userId = getUserIdFromToken();

  // Request notification permission on app load
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!userId) return;
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('join', userId);
    });
    socket.on('swap-request', (data) => {
      alert('New swap request received!');
      // You can replace this with a custom notification UI
    });
    socket.on('new-message', (message) => {
      // Show browser notification if permission is granted
      if (Notification.permission === 'granted') {
        new Notification('New Message', {
          body: `${message.sender.username}: ${message.content}`,
          icon: '/favicon.ico'
        });
      }
    });
    return () => socket.disconnect();
  }, [userId]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Home loggedIn={loggedIn} setLoggedIn={setLoggedIn} userId={userId} />} />
        <Route path="/login" element={
          loggedIn ? <Navigate to="/" /> : <Login setLoggedIn={setLoggedIn} />
        } />
        <Route path="/signup" element={
          loggedIn ? <Navigate to="/profile" /> : <Signup setLoggedIn={setLoggedIn} />
        } />
        <Route path="/profile" element={
          loggedIn ? <Profile /> : <Navigate to="/login" />
        } />
        <Route path="/profile/:id" element={<ProfileDetail loggedIn={loggedIn} userId={userId} />} />
        <Route path="/swap-request/:id" element={<SwapRequestForm loggedIn={loggedIn} userId={userId} />} />
        <Route path="/inbox" element={<Inbox loggedIn={loggedIn} userId={userId} />} />
      </Routes>
      
            <FloatingMessages loggedIn={loggedIn} userId={userId} />
    </>
  );
}

export default App;
