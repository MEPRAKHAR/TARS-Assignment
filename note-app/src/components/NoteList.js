/*import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../App.css';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (!token) return;
    axios.get('http://localhost:3001/api/notes', { headers: { Authorization: `Bearer ${token}` } })
      .then(response => setNotes(response.data))
      .catch(() => alert('Error fetching notes'));
  }, [token]);

  return (
    <div className="notes">
      <h2>Your Notes</h2>
      <ul>
        {notes.map((note, index) => (
          <li key={index}><strong>{note.title}</strong>: {note.content}</li>
        ))}
      </ul>
    </div>
  );
};

export default NoteList;*/
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
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

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  return (
    <div>
      <h2>My Notes</h2>
      {notes.map(note => (
        <div key={note.id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <button onClick={() => deleteNote(note.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default NoteList;
