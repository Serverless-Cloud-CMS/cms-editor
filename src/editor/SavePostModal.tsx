import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

export interface SavePostModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (meta: { title: string; author: string }) => void;
  initialTitle?: string;
  initialAuthor?: string;
}

const SavePostModal: React.FC<SavePostModalProps> = ({ open, onClose, onSave, initialTitle = '', initialAuthor = '' }) => {
  const [title, setTitle] = useState(initialTitle);
  const [author, setAuthor] = useState(initialAuthor);
  const [error, setError] = useState('');

  // Update state when props change or modal opens
  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
      setAuthor(initialAuthor);
      setError('');
    }
  }, [open, initialTitle, initialAuthor]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!author.trim()) {
      setError('Author is required.');
      return;
    }
    setError('');
    onSave({ title: title.trim(), author: author.trim() });
    setTitle('');
    setAuthor('');
  };

  const handleClose = () => {
    setTitle('');
    setAuthor('');
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Save Post</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Title"
          fullWidth
          value={title}
          onChange={e => setTitle(e.target.value)}
        />
        <TextField
          margin="dense"
          label="Author"
          fullWidth
          value={author}
          onChange={e => setAuthor(e.target.value)}
        />
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">Save</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SavePostModal;
