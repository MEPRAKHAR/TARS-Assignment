import React, { useState, useRef } from 'react';
import axios from 'axios';
import { startRecording } from './speechRecognition';
import '../App.css';

const Home = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null); // Store the recorded audio blob
  const [imageFile, setImageFile] = useState(null);
  const token = localStorage.getItem('token');
  const fileInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);

  const handleRecord = () => {
    if (isRecording) {
      // Stop recording
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    } else {
      // Start recording
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then((stream) => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
          };
          mediaRecorderRef.current.onstop = () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
            setAudioBlob(audioBlob); // Save the recorded audio blob
            audioChunksRef.current = [];
          };
          mediaRecorderRef.current.start();
          setIsRecording(true);

          // Start transcription
          startRecording((transcript) => {
            setContent((prevContent) => prevContent + ' ' + transcript);
          });
        })
        .catch((error) => {
          console.error('Error accessing microphone:', error);
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
    if (audioBlob) {
      formData.append('audio', audioBlob, 'recording.wav'); // Append the audio blob
    }
    if (imageFile) {
      formData.append('image', imageFile); // Append the image file
    }

    try {
      await axios.post('http://localhost:3001/api/notes', formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      setTitle('');
      setContent('');
      setAudioBlob(null);
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
        
        <button type="submit">Save Note</button>
      </form>
      {audioBlob && (
        <div>
          <h3>Recorded Audio</h3>
          <audio controls src={URL.createObjectURL(audioBlob)} />
        </div>
      )}
    </div>
  );
};

export default Home;