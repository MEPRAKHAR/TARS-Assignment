import React, { useState } from 'react';
import '../App.css';

const NoteModal = ({ note, onClose, onUpdate, onDelete }) => {
  const [editTitle, setEditTitle] = useState(note.title);
  const [editContent, setEditContent] = useState(note.content);

  const handleUpdate = () => {
    onUpdate(note._id, { title: editTitle, content: editContent });
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{note.title}</h2>
        <textarea
          value={editContent}
          onChange={(e) => setEditContent(e.target.value)}
        />
        {note.audio && <audio controls src={note.audio} />}
        <div className="modal-actions">
          <button onClick={handleUpdate}>Update</button>
          <button onClick={() => onDelete(note._id)}>Delete</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default NoteModal;