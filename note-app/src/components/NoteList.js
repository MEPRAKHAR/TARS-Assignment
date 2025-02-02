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
  const [showFavorites, setShowFavorites] = useState(false);

  const filteredNotes = showFavorites ? notes.filter(note => note.favorite) : notes;

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://localhost:3001/api/notes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(response => {
        const sortedNotes = response.data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        setNotes(sortedNotes);
      })
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
      const note = notes.find(note => note._id === id);
      if (!note) {
        console.error('Note not found');
        return;
      }
  
      const updatedFavoriteStatus = !note.favorite;
  
      console.log('Toggling favorite for note:', note.title);
      console.log('New favorite status:', updatedFavoriteStatus);
  
      // Send the PUT request to toggle favorite
      const response = await axios.put(
        `http://localhost:3001/api/notes/${id}/favorite`,
        { favorite: updatedFavoriteStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      console.log('Updated note response:', response.data);
  
      // Update the notes state with the updated favorite status
      setNotes(notes.map(note => (note._id === id ? response.data : note)));
    } catch (error) {
      console.error('Error toggling favorite:', error.response?.data || error.message);
      alert('An error occurred while toggling favorite.');
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
    if (audioFile) {
      formData.append('audio', audioFile);
    }
    if (imageFile) {
      formData.append('image', imageFile);
    }
  
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
  
      // Update the notes state with the updated note
      setNotes(notes.map(note => (note._id === selectedNote._id ? response.data : note)));
      setIsModalOpen(false); // Close the modal
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note. Please try again.');
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
      <button onClick={() => setShowFavorites(!showFavorites)}>
        {showFavorites ? 'Show All Notes' : 'Show Favorites'}
      </button>
      <input
        type="text"
        placeholder="Search notes..."
        value={searchQuery}
        onChange={(e) => handleSearch(e.target.value)}
      />
      {filteredNotes.map(note => (
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
            {selectedNote.audio && ( <audio controls src=
            {`http://localhost:3001/${selectedNote.audio}`} />
                                                          )}
            {selectedNote.image && <img src={selectedNote.image} alt="Note" style={{ width: '100px' }} />}
            <input type="file" accept="audio/*" onChange={handleAudioUpload} />
            <input type="file" accept="image/*" onChange={handleImageUpload} />
            <button onClick={updateNote}>Update Note</button>
            <button onClick={() => deleteNote(selectedNote._id)}>Delete Note</button>
            <button onClick={() => copyToClipboard(selectedNote.content)}>Copy to Clipboard</button>
            <button onClick={(e) => { e.stopPropagation(); toggleFavorite(selectedNote._id); }}>
              {selectedNote.favorite ? 'Unfavorite' : 'Favorite'}
            </button>
            <button onClick={() => setIsModalOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;
