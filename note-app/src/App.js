import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import NoteList from './components/NoteList';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <div className="container">
        <h1>Note-Taking App</h1>
        <Routes>
          {/* Redirect to login if not authenticated */}
          <Route path="/" element={token ? <MainDashboard /> : <Navigate to="/login" />} />
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <Register setToken={setToken} /> : <Navigate to="/" />} />
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