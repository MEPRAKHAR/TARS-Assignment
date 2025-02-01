const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const notes = [];
const users = [{ username: 'testuser', password: 'password123' }];

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(401).json({ message: 'Invalid credentials' });

  const token = jwt.sign({ username }, 'secret', { expiresIn: '1h' });
  res.json({ token });
});

app.get('/api/notes', (req, res) => res.json(notes));

app.post('/api/notes', (req, res) => {
  notes.push({ title: req.body.title, content: req.body.content });
  res.status(201).json({ message: 'Note saved!' });
});

app.delete('/api/notes/:id', async (req, res) => {
  const noteId = req.params.id;

  // Simulate deleting the note (replace with database logic)
  const noteIndex = notes.findIndex(note => note.id === noteId);
  if (noteIndex === -1) {
    return res.status(404).json({ message: 'Note not found' });
  }

  notes.splice(noteIndex, 1);
  res.json({ message: 'Note deleted successfully' });
});


app.listen(3001, () => console.log('Server running on port 3001'));
