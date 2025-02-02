const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer'); // For file uploads
const path = require('path');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
const User = require('./models/User');
const Note = require('./models/Note');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded files

// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Middleware to authenticate JWT
const authenticateJWT = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1];
  if (!token) return res.status(401).send('Access Denied');

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).send('Invalid Token');
    req.user = user;
    next();
  });
};

// Create a new note (POST)
app.post('/api/notes', authenticateJWT, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  const { title, content } = req.body;
  try {
    const newNote = new Note({
      title,
      content,
      userId: req.user.userId,
      audio: req.files.audio ? req.files.audio[0].path : null, // Save the audio file path
      image: req.files.image ? req.files.image[0].path : null, // Save the image file path
    });
    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    res.status(500).json({ message: 'Error saving note' });
  }
});


// Update a Note (PUT)
app.put('/api/notes/:id', authenticateJWT, upload.fields([{ name: 'audio', maxCount: 1 }, { name: 'image', maxCount: 1 }]), async (req, res) => {
  const { title, content } = req.body;
  const noteId = req.params.id;

  try {
    const updatedNote = await Note.findByIdAndUpdate(
      noteId,
      {
        title,
        content,
        audio: req.files.audio ? req.files.audio[0].path : null,
        image: req.files.image ? req.files.image[0].path : null,
      },
      { new: true } // Return the updated note
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating note:', error);
    res.status(500).json({ message: 'Error updating note' });
  }
});

// Update a Note's Favorite Status (Only the favorite field)
app.put('/api/notes/:id/favorite', authenticateJWT, async (req, res) => {
  const { favorite } = req.body;
  console.log(`Toggling favorite for note with ID: ${req.params.id}`);
  console.log('Received favorite status:', favorite);

  try {
    if (typeof favorite !== 'boolean') {
      return res.status(400).json({ message: 'Invalid favorite status' });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { favorite },
      { new: true } // Return the updated note
    );

    if (!updatedNote) {
      return res.status(404).json({ message: 'Note not found' });
    }

    console.log('Updated note:', updatedNote);
    res.json(updatedNote);
  } catch (error) {
    console.error('Error updating favorite status:', error);
    res.status(500).json({ message: 'Error updating favorite status' });
  }
});


// User Registration Route
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ username, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
});

// User Login Route
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user in the database
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare the provided password with the hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Login successful
    res.status(200).json({ token, message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ message: 'Error logging in' });
  }
});

// Get all Notes (GET)
app.get('/api/notes', authenticateJWT, async (req, res) => {
  try {
    const notes = await Note.find({ userId: req.user.userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Search Notes (GET)
app.get('/api/notes/search', authenticateJWT, async (req, res) => {
  const { query } = req.query;
  try {
    const notes = await Note.find({
      userId: req.user.userId,
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ],
    });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error searching notes' });
  }
});

// Delete a Note (DELETE)
app.delete('/api/notes/:id', authenticateJWT, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
