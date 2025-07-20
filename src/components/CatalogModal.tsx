import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Box, 
  Typography,
  IconButton
} from '@mui/material';
import AddPhotoAlternateIcon from '@mui/icons-material/AddPhotoAlternate';
import { ICMSCrudService } from '../helpers/ICMSCrudService';
import { CatalogEntry } from '../helpers/CatalogEntry';
import SelectImageModal from '../editor/SelectImageModal';
import { config } from '../config';
import { Utils } from '../helpers/Utils';

export interface CatalogModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (catalog: CatalogEntry) => void;
  initialCatalog?: CatalogEntry | null;
  dataService: ICMSCrudService;
}

const CatalogModal: React.FC<CatalogModalProps> = ({ 
  open, 
  onClose, 
  onSave, 
  initialCatalog = null,
  dataService 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageKey, setImageKey] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  // Update state when props change or modal opens
  useEffect(() => {
    if (open) {
      if (initialCatalog) {
        setTitle(initialCatalog.catalog_title);
        setDescription(initialCatalog.catalog_description);
        setImageKey(initialCatalog.catalog_image_key);
        if (initialCatalog.catalog_image_key) {
          setImageUrl(Utils.cleanURL(config.MediaProxy, initialCatalog.catalog_image_key));
        } else {
          setImageUrl('');
        }
      } else {
        setTitle('');
        setDescription('');
        setImageKey('');
        setImageUrl('');
      }
      setError('');
    }
  }, [open, initialCatalog]);

  const handleSave = () => {
    if (!title.trim()) {
      setError('Title is required.');
      return;
    }
    if (!description.trim()) {
      setError('Description is required.');
      return;
    }
    if (!imageKey) {
      setError('Catalog image is required.');
      return;
    }

    const catalog: CatalogEntry = {
      catalog_id: initialCatalog?.catalog_id || '',
      catalog_title: title.trim(),
      catalog_description: description.trim(),
      catalog_image_key: imageKey,
      published: initialCatalog?.published || false,
      created_at: initialCatalog?.created_at || new Date().toISOString()
    };

    setError('');
    onSave(catalog);
  };

  const handleImageSelect = (url: string, key: string) => {
    setImageUrl(url);
    setImageKey(key);
    setIsImageModalOpen(false);
  };

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>{initialCatalog ? 'Edit Catalog' : 'Create Catalog'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={title}
            onChange={e => setTitle(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            sx={{ mb: 3 }}
          />
          
          <Typography variant="subtitle1" gutterBottom>Catalog Image</Typography>
          <Box 
            sx={{ 
              border: '1px dashed #ccc', 
              borderRadius: 1, 
              p: 2, 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 200,
              position: 'relative',
              mb: 2
            }}
          >
            {imageUrl ? (
              <>
                <Box 
                  component="img" 
                  src={imageUrl}
                  alt="Catalog image"
                  sx={{ 
                    maxWidth: '100%', 
                    maxHeight: 300,
                    objectFit: 'contain'
                  }}
                />
                <IconButton 
                  sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    bgcolor: 'rgba(255,255,255,0.7)' 
                  }}
                  onClick={() => setIsImageModalOpen(true)}
                >
                  <AddPhotoAlternateIcon />
                </IconButton>
              </>
            ) : (
              <Button 
                startIcon={<AddPhotoAlternateIcon />}
                onClick={() => setIsImageModalOpen(true)}
              >
                Select Image
              </Button>
            )}
          </Box>
          
          {error && <Box sx={{ color: 'error.main', mt: 2 }}>{error}</Box>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      <SelectImageModal 
        isOpen={isImageModalOpen}
        onClose={() => setIsImageModalOpen(false)}
        onSelect={handleImageSelect}
        dataService={dataService}
      />
    </>
  );
};

export default CatalogModal;