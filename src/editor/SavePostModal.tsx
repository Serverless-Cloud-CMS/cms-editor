import React, { useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

export interface SavePostModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (meta: { title: string; author: string }) => void;
}

const SavePostModal: React.FC<SavePostModalProps> = ({ open, onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState('');

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

