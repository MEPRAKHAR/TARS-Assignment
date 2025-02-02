import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import NoteList from './components/NoteList';
import './App.css';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to control sidebar visibility

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
  };

  useEffect(() => {
    const handleStorageChange = () => setToken(localStorage.getItem('token'));
    window.addEventListener('storage', handleStorageChange);

    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <Router>
      <AppContent
        token={token}
        setToken={setToken}
        handleLogout={handleLogout}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
    </Router>
  );
}

const AppContent = ({ token, setToken, handleLogout, isSidebarOpen, setIsSidebarOpen }) => {
  const navigate = useNavigate();

  return (
    <div className="app-container">
      {token && (
        <>
          <button className="sidebar-toggle" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
          {isSidebarOpen && (
            <div className="sidebar">
              <button onClick={() => navigate('/')}>Home</button>
              <button onClick={handleLogout}>Logout</button>
            </div>
          )}
        </>
      )}
      <div className="content">
        <h1>Note-Taking App</h1>
        <Routes>
          <Route path="/" element={token ? <MainDashboard /> : <Navigate to="/login" />} />
          <Route path="/login" element={!token ? <Login setToken={setToken} /> : <Navigate to="/" />} />
          <Route path="/register" element={!token ? <Register setToken={setToken} /> : <Navigate to="/" />} />
          <Route path="/favorites" element={token ? <NoteList showFavorites={true} /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  );
};

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