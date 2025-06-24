import React, { useEffect, useState } from 'react';
import { config } from '../config';
import { ICMSCrudService } from "../helpers/ICMSCrudService";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, List, ListItemButton, ListItemText, CircularProgress, Box, TextField } from '@mui/material';

interface SelectImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (url: string, key: string, width?: number, height?: number) => void;
  dataService: ICMSCrudService;
}

const SelectImageModal: React.FC<SelectImageModalProps> = ({ isOpen, onClose, onSelect, dataService }) => {
  const [imageKeys, setImageKeys] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [width, setWidth] = useState<number>(300);
  const [height, setHeight] = useState<number>(200);

  // Set width/height to actual image size when an image is selected
  useEffect(() => {
    if (selectedKey) {
      const url = `${config.MediaProxy}/${selectedKey}`;
      const img = new window.Image();
      img.onload = () => {
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
      };
      img.src = url;
    }
  }, [selectedKey]);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    setError(null);

    dataService.listMedia(config.StageBucket, config.MediaPrefix)
      .then(keys => {
        setImageKeys(keys.filter(k => k.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)));
        setLoading(false);
      })
      .catch(e => {
        setError(e.message);
        setLoading(false);
      });
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select an Image</DialogTitle>
      <DialogContent>
        {loading && <Box display="flex" justifyContent="center" my={2}><CircularProgress /></Box>}
        {error && <Box color="error.main">{error}</Box>}
        <List>
          {imageKeys.map(key => (
            <ListItemButton selected={selectedKey === key} onClick={() => setSelectedKey(key)} key={key}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <img
                  src={`${config.MediaProxy}/${key}`}
                  alt={key}
                  style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 4, background: '#eee' }}
                />
                <ListItemText primary={key} />
              </Box>
            </ListItemButton>
          ))}
        </List>
        <Box display="flex" gap={2} mt={2}>
          <TextField label="Width" type="number" value={width} onChange={e => setWidth(Number(e.target.value))} size="small" />
          <TextField label="Height" type="number" value={height} onChange={e => setHeight(Number(e.target.value))} size="small" />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={() => selectedKey && onSelect(`${config.MediaProxy}/${selectedKey}`, selectedKey, width, height)} disabled={!selectedKey} variant="contained">Select</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SelectImageModal;
