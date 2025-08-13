import React, { useState, useEffect, useCallback } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  List, 
  ListItem, 
  ListItemButton,
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  CircularProgress, 
  Box, 
  Typography,
  Radio,
  Divider
} from '@mui/material';
import { ICMSCrudService } from '../helpers/ICMSCrudService';
import { CatalogEntry } from '../helpers/CatalogEntry';
import { config } from '../config';
import { Utils } from '../helpers/Utils';

export interface CatalogSelectModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (catalogId: string, catalogTitle: string) => void;
  dataService: ICMSCrudService;
}

const CatalogSelectModal: React.FC<CatalogSelectModalProps> = ({ 
  open, 
  onClose, 
  onSelect, 
  dataService 
}) => {
  const [catalogs, setCatalogs] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCatalogId, setSelectedCatalogId] = useState<string | null>(null);

  const loadCatalogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const catalogList = await dataService.listCatalogs();
      // Filter to only show published catalogs
      const publishedCatalogs = catalogList.filter(catalog => catalog.published);
      setCatalogs(publishedCatalogs);
      
      // Clear selection when modal opens
      setSelectedCatalogId(null);
    } catch (err) {
      setError(`Failed to load catalogs: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [dataService]);
  
  useEffect(() => {
    if (open) {
      loadCatalogs();
    }
  }, [open, loadCatalogs]);

  const handleSelect = () => {
    if (!selectedCatalogId) {
      setError('Please select a catalog');
      return;
    }
    
    const selectedCatalog = catalogs.find(catalog => catalog.catalog_id === selectedCatalogId);
    if (selectedCatalog) {
      onSelect(selectedCatalog.catalog_id, selectedCatalog.catalog_title);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Select a Catalog</DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ color: 'error.main', p: 2 }}>
            <Typography>{error}</Typography>
          </Box>
        ) : catalogs.length === 0 ? (
          <Box sx={{ p: 2 }}>
            <Typography>
              No published catalogs available. Please publish a catalog first.
            </Typography>
          </Box>
        ) : (
          <List sx={{ pt: 0 }}>
            {catalogs.map((catalog, index) => (
              <React.Fragment key={catalog.catalog_id}>
                {index > 0 && <Divider component="li" />}
                <ListItem>
                  <ListItemButton
                    onClick={() => setSelectedCatalogId(catalog.catalog_id)}
                    selected={selectedCatalogId === catalog.catalog_id}
                  >
                    <Radio
                      checked={selectedCatalogId === catalog.catalog_id}
                      onChange={() => setSelectedCatalogId(catalog.catalog_id)}
                    />
                    {catalog.catalog_image_key && (
                      <ListItemAvatar>
                        <Avatar 
                          src={Utils.cleanURL(config.MediaProxy, catalog.catalog_image_key)}
                          alt={catalog.catalog_title}
                          variant="rounded"
                          sx={{ width: 60, height: 60, mr: 2 }}
                        />
                      </ListItemAvatar>
                    )}
                    <ListItemText 
                      primary={catalog.catalog_title} 
                      secondary={
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{ 
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                          }}
                        >
                          {catalog.catalog_description}
                        </Typography>
                      } 
                    />
                  </ListItemButton>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSelect} 
          variant="contained" 
          disabled={!selectedCatalogId || loading}
        >
          Select
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CatalogSelectModal;