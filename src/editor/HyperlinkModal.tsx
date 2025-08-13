import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';

export interface HyperlinkModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (linkData: { url: string; text: string }) => void;
  onRemove?: () => void;
  initialUrl?: string;
  initialText?: string;
  isEditing?: boolean;
}

const HyperlinkModal: React.FC<HyperlinkModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  onRemove, 
  initialUrl = '', 
  initialText = '',
  isEditing = false
}) => {
  const [url, setUrl] = useState(initialUrl);
  const [text, setText] = useState(initialText);
  const [error, setError] = useState('');

  // Update state when props change or modal opens
  useEffect(() => {
    if (open) {
      setUrl(initialUrl);
      setText(initialText);
      setError('');
    }
  }, [open, initialUrl, initialText]);

  const handleSave = () => {
    if (!url.trim()) {
      setError('URL is required.');
      return;
    }
    
    // Basic URL validation
    try {
      // Add protocol if missing
      let urlToValidate = url;
      if (!/^https?:\/\//i.test(urlToValidate)) {
        urlToValidate = 'https://' + urlToValidate;
      }
      new URL(urlToValidate);
      
      // Use validated URL
      const finalUrl = urlToValidate;
      
      // If no text is provided, use the URL as text
      const finalText = text.trim() || finalUrl;
      
      setError('');
      onSave({ url: finalUrl, text: finalText });
      resetForm();
    } catch (e) {
      setError('Please enter a valid URL.' + (e instanceof Error ? `: ${e.message}` : ''));
      console.error('Invalid URL:', url, e);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove();
      resetForm();
    }
  };

  const resetForm = () => {
    setUrl('');
    setText('');
    setError('');
  };

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>{isEditing ? 'Edit Hyperlink' : 'Create Hyperlink'}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="URL"
          fullWidth
          value={url}
          onChange={e => setUrl(e.target.value)}
          placeholder="https://example.com"
        />
        <TextField
          margin="dense"
          label="Link Text"
          fullWidth
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Display text for the link"
          helperText="If left empty, the URL will be used as the link text"
        />
        {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        {isEditing && onRemove && (
          <Button onClick={handleRemove} color="error">
            Remove Link
          </Button>
        )}
        <Button onClick={handleSave} variant="contained">
          {isEditing ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HyperlinkModal;