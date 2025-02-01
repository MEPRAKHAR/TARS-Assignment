import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  console.log("Token being sent:", token);

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
  
    axios.get('http://localhost:3001/api/notes', {
      headers: { Authorization: `Bearer ${token}` }, // Include token in headers
    })
      .then(response => setNotes(response.data))
      .catch(error => console.error('Error fetching notes:', error));
  }, [token, navigate]);

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` } // ✅ FIXED
      });
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div className="notes-container">
      <h2>My Notes</h2>
      {notes.map(note => (
        <div key={note._id} className="note">
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <button onClick={() => deleteNote(note._id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default NoteList;