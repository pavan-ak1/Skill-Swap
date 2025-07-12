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
import NotificationToast from './components/NotificationToast';
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
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;
  useEffect(() => {
    fetch('http://localhost:5000/api/profile/all')
      .then(res => res.json())
      .then(data => setProfiles(data))
      .catch(() => setProfiles([]));
  }, []);
  const filteredProfiles = userId ? profiles.filter(p => p.user && p.user._id !== userId) : profiles;
  const totalPages = Math.ceil(filteredProfiles.length / pageSize) || 1;
  const pagedProfiles = filteredProfiles.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };
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
      <ProfileList profiles={pagedProfiles} loggedIn={loggedIn} userId={userId} navigate={navigate} />
      <Pagination current={currentPage} total={totalPages} onPageChange={handlePageChange} />
    </div>
  );
}

function App() {
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem('token'));
  const userId = getUserIdFromToken();
  const [notifications, setNotifications] = useState([]);

  // Request notification permission on app load
  useEffect(() => {
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const addNotification = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    const notification = { id, title, message, type };
    setNotifications(prev => [...prev, notification]);
    
    // Auto-remove notification after 5 seconds
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (!userId) return;
    const socket = io('http://localhost:5000', { transports: ['websocket'] });
    socket.on('connect', () => {
      socket.emit('join', userId);
    });
    socket.on('swap-request', (data) => {
      addNotification(
        'New Swap Request!', 
        `You have received a new swap request from ${data.sender?.username || 'someone'}`, 
        'success'
      );
    });
    socket.on('new-message', (message) => {
      addNotification(
        'New Message', 
        `${message.sender.username}: ${message.content}`, 
        'info'
      );
      
      // Also show browser notification if permission is granted
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
      <NotificationToast 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </>
  );
}

export default App;
