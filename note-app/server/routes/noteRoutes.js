const express = require('express');
const Note = require('../models/Note');
const authMiddleware = require('../middleware/authMiddleware'); // Ensures authentication

const router = express.Router();

// Save a new note (requires authentication)
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, content } = req.body;
    const newNote = new Note({ title, content, user: req.userId });

    await newNote.save();
    res.status(201).json(newNote);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error saving note' });
  }
});

module.exports = router;
