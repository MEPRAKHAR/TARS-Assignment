// routes/noteroutes.js
const express = require("express");
const multer = require("multer");
const path = require("path");
const Note = require("../models/Note");
const authenticateJWT = require("../middleware/authMiddleware");

const router = express.Router();
const dotenv = require("dotenv");
dotenv.config();
// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // make sure this directory exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Create a Note with file uploads (audio and image)
router.post(
  "/",
  authenticateJWT,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
    const { title, content } = req.body;
    try {
      const newNote = new Note({
        title,
        content,
        user: req.user.userId, // using req.user from our auth middleware
        audio: req.files.audio ? req.files.audio[0].path : null,
        image: req.files.image ? req.files.image[0].path : null,
      });
      await newNote.save();
      res.status(201).json(newNote);
    } catch (error) {
      console.error("Error saving note:", error);
      res.status(500).json({ message: "Error saving note" });
    }
  }
);

// Update a Note (including possible new file uploads)
router.put(
  "/:id",
  authenticateJWT,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  async (req, res) => {
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
        { new: true }
      );

      if (!updatedNote) {
        return res.status(404).json({ message: "Note not found" });
      }

      res.json(updatedNote);
    } catch (error) {
      console.error("Error updating note:", error);
      res.status(500).json({ message: "Error updating note" });
    }
  }
);

// Update a Note's Favorite Status (only the favorite field)
router.put("/:id/favorite", authenticateJWT, async (req, res) => {
  const { favorite } = req.body;
  console.log(`Toggling favorite for note with ID: ${req.params.id}`);
  console.log("Received favorite status:", favorite);

  try {
    if (typeof favorite !== "boolean") {
      return res.status(400).json({ message: "Invalid favorite status" });
    }

    const updatedNote = await Note.findByIdAndUpdate(
      req.params.id,
      { favorite },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ message: "Note not found" });
    }

    console.log("Updated note:", updatedNote);
    res.json(updatedNote);
  } catch (error) {
    console.error("Error updating favorite status:", error);
    res.status(500).json({ message: "Error updating favorite status" });
  }
});

// Get all Notes for the authenticated user
router.get("/", authenticateJWT, async (req, res) => {
  try {
    const notes = await Note.find({ user: req.user.userId });
    res.json(notes);
  } catch (error) {
    console.error("Error fetching notes:", error);
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// Search Notes based on a query parameter (searching title and content)
router.get("/search", authenticateJWT, async (req, res) => {
  const { query } = req.query;
  try {
    const notes = await Note.find({
      user: req.user.userId,
      $or: [
        { title: { $regex: query, $options: "i" } },
        { content: { $regex: query, $options: "i" } },
      ],
    });
    res.json(notes);
  } catch (error) {
    console.error("Error searching notes:", error);
    res.status(500).json({ message: "Error searching notes" });
  }
});

// Delete a Note
router.delete("/:id", authenticateJWT, async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);
    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({ message: "Error deleting note" });
  }
});

module.exports = router;
