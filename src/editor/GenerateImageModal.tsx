import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem, CircularProgress } from '@mui/material';

interface GenerateImageModalProps {
  open: boolean;
  onClose: () => void;
  onGenerate: (prompt: string, size: string) => Promise<void>;
  loading: boolean;
}

const sizes = [
  { label: '512x512', value: '512x512' },
  { label: '768x768', value: '768x768' },
  { label: '1024x1024', value: '1024x1024' },
];

const GenerateImageModal: React.FC<GenerateImageModalProps> = ({ open, onClose, onGenerate, loading }) => {
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState(sizes[0].value);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Prompt is required.');
      return;
    }
    setError('');
    await onGenerate(prompt, size);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Generate Image with Bedrock</DialogTitle>
      <DialogContent>
        <TextField
          label="Prompt"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          fullWidth
          multiline
          minRows={2}
          margin="normal"
          disabled={loading}
          error={!!error}
          helperText={error}
        />
        <TextField
          select
          label="Image Size"
          value={size}
          onChange={e => setSize(e.target.value)}
          fullWidth
          margin="normal"
          disabled={loading}
        >
          {sizes.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
          ))}
        </TextField>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Cancel</Button>
        <Button onClick={handleGenerate} disabled={loading} variant="contained">
          {loading ? <CircularProgress size={20} /> : 'Generate'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default GenerateImageModal;

