import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../App.css';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNote, setSelectedNote] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
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

  const handleNoteClick = (note) => {
    setSelectedNote(note);
    setEditTitle(note.title);
    setEditContent(note.content);
    setIsModalOpen(true);
  };

  const handleAudioUpload = (e) => {
    setAudioFile(e.target.files[0]);
  };

  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
  };

  const updateNote = async () => {
    const formData = new FormData();
    formData.append('title', editTitle);
    formData.append('content', editContent);
    formData.append('audio', audioFile);
    formData.append('image', imageFile);

    try {
      const response = await axios.put(
        `http://localhost:3001/api/notes/${selectedNote._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setNotes(notes.map(note => (note._id === selectedNote._id ? response.data : note)));
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`http://localhost:3001/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setNotes(notes.filter(note => note._id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
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
        <div key={note._id} className="note" onClick={() => handleNoteClick(note)}>
          <h3>{note.title}</h3>
        </div>
      ))}

      {isModalOpen && selectedNote && (
        <div className="modal">
          <div className="modal-content">
            <h2>{selectedNote.title}</h2>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            {selectedNote.audio && <audio src={selectedNote.audio} controls />}
            {selectedNote.image && <img src={selectedNote.image} alt="Note" style={{ width: '100px' }} />}
            <input type="file" accept="audio/*" onChange={handleAudioUpload} />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <button onClick={updateNote}>Update Note</button>
            <button onClick={() => deleteNote(selectedNote._id)}>Delete Note</button>
            <button onClick={() => copyToClipboard(selectedNote.content)}>Copy to Clipboard</button>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;