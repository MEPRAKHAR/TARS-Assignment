import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:3001/api/notes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => setNotes(response.data))
      .catch(error => console.error('Error fetching notes:', error));
  }, [token, navigate]);

  const handleSearch = async (query) => {
    setSearchQuery(query);
    try {
      const response = await axios.get(`http://localhost:3001/api/notes/search?query=${query}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(response.data);
    } catch (error) {
      console.error('Error searching notes:', error);
    }
  };

  const toggleFavorite = async (id) => {
    try {
      const response = await axios.patch(`http://localhost:3001/api/notes/${id}/favorite`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.map(note => (note._id === id ? response.data : note)));
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  return (
    <div className="notes-container">
      <h2>My Notes</h2>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {notes.map(note => (
        <div key={note._id} className="note">
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          {note.audio && <audio src={note.audio} controls />}
          {note.image && <img src={note.image} alt="Note" style={{ width: '100px' }} />}
          <button onClick={() => toggleFavorite(note._id)}>
            {note.favorite ? 'Unfavorite' : 'Favorite'}
          </button>
          <button onClick={() => copyToClipboard(note.content)}>Copy</button>
        </div>
      ))}
    </div>
  );
};

export default NoteList;