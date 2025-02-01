import React, { useState } from 'react';
import axios from 'axios';
import { startRecording } from './speechRecognition';
import '../App.css';

const Home = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const token = localStorage.getItem('token');
  console.log("Token being sent:", token);

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
    } else {
      setIsRecording(true);
      startRecording((transcript) => {
        setContent((prevContent) => prevContent + ' ' + transcript);
        setIsRecording(false);
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('You must be logged in to save notes.');
      return;
    }
    try {
      await axios.post(
        'http://localhost:3001/api/notes',
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } } // Include token in headers
      );
      setTitle('');
      setContent('');
      alert('Note created successfully!');
    } catch (error) {
      console.error('Failed to create note:', error);
      alert('Error saving note!');
    }
  };

  return (
    <div className="home">
      <h2>Create a New Note</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} required />
        <button type="button" onClick={handleRecord}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </button>
        <button type="submit">Save Note</button>
      </form>
    </div>
  );
};

export default Home;