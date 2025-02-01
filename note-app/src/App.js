import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Home from './components/Home';
import NoteList from './components/NoteList';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    // Watch for token changes (e.g., after login)
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="container">
        <h1>Note-Taking App</h1>
        <Routes>
          <Route path="/login" element={<Login setToken={setToken} />} />
          <Route path="/" element={token ? <MainDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </Router>
  );
}

// Main Dashboard shows both Home (Create Notes) & NoteList (View Notes)
const MainDashboard = () => {
  return (
    <div>
      <Home />
      <NoteList />
    </div>
  );
};

export default App;
