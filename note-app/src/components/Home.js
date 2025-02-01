import React, { useState, useRef } from 'react';
import axios from 'axios';
import { startRecording } from './speechRecognition';
import '../App.css';

const Home = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const token = localStorage.getItem('token');
  const fileInputRef = useRef(null);

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

  const handleImageUpload = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) {
      alert('You must be logged in to save notes.');
      return;
    }

    const formData = new FormData();
    formData.append('title', title);
    formData.append('content', content);
    formData.append('audio', audioFile);
    formData.append('image', imageFile);

    try {
      await axios.post('http://localhost:3001/api/notes', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setTitle('');
      setContent('');
      setAudioFile(null);
      setImageFile(null);
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
        <input type="file" accept="image/*" onChange={handleImageUpload} ref={fileInputRef} />
        <button type="submit">Save Note</button>
      </form>
    </div>
  );
};

export default Home;