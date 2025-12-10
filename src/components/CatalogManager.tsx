import React, { useState, useEffect, useCallback } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemSecondaryAction, 
  IconButton, 
  Divider, 
  Paper, 
  CircularProgress,
  Chip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PublishIcon from '@mui/icons-material/Publish';
import AddIcon from '@mui/icons-material/Add';
import { ICMSCrudService } from '../helpers/ICMSCrudService';
import { CatalogEntry } from '../helpers/CatalogEntry';
import CatalogModal from './CatalogModal';
import { editor_config } from '../editor_config';
import { Utils } from '../helpers/Utils';
import {endpoints} from "../editor_endpoints";

interface CatalogManagerProps {
  dataService: ICMSCrudService;
}

const CatalogManager: React.FC<CatalogManagerProps> = ({ dataService }) => {
  const [catalogs, setCatalogs] = useState<CatalogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCatalog, setSelectedCatalog] = useState<CatalogEntry | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);

  const loadCatalogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const catalogList = await dataService.listCatalogs();
      setCatalogs(catalogList);
    } catch (err) {
      setError(`Failed to load catalogs: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  }, [dataService]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  const handleCreateCatalog = () => {
    setSelectedCatalog(null);
    setModalOpen(true);
  };

  const handleEditCatalog = (catalog: CatalogEntry) => {
    setSelectedCatalog(catalog);
    setModalOpen(true);
  };

  const handlePublishCatalog = async (catalog: CatalogEntry) => {
    setPublishingId(catalog.catalog_id);
    try {
      await dataService.publishCatalog(catalog, endpoints.Preview);
      // Reload catalogs to get updated published status
      await loadCatalogs();
    } catch (err) {
      setError(`Failed to publish catalog: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPublishingId(null);
    }
  };

  const handleSaveCatalog = async (catalog: CatalogEntry) => {
    setLoading(true);
    try {
      if (selectedCatalog) {
        // Update existing catalog
        catalog.published = false;
        await dataService.updateCatalog(catalog);
      } else {
        // Create new catalog
        await dataService.createCatalog(catalog);
      }
      setModalOpen(false);
      await loadCatalogs();
    } catch (err) {
      setError(`Failed to save catalog: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 800, margin: '0 auto', p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2">Catalog Management</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddIcon />} 
          onClick={handleCreateCatalog}
          disabled={loading}
        >
          Create Catalog
        </Button>
      </Box>

      {error && (
        <Paper sx={{ p: 2, mb: 2, bgcolor: 'error.light', color: 'error.contrastText' }}>
          <Typography>{error}</Typography>
        </Paper>
      )}

      <Paper sx={{ p: 2 }}>
        {loading && !modalOpen ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : catalogs.length === 0 ? (
          <Typography sx={{ p: 2, textAlign: 'center' }}>
            No catalogs found. Create your first catalog to get started.
          </Typography>
        ) : (
          <List>
            {catalogs.map((catalog, index) => (
              <React.Fragment key={catalog.catalog_id}>
                {index > 0 && <Divider />}
                <ListItem>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                    {catalog.catalog_image_key && (
                      <Box 
                        component="img" 
                        src={Utils.cleanURL(editor_config.MediaProxy, catalog.catalog_image_key)}
                        alt={catalog.catalog_title}
                        sx={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 1 }}
                      />
                    )}
                    <ListItemText 
                      primary={catalog.catalog_title} 
                      secondary={
                        <React.Fragment>
                          <Typography variant="body2" component="span" sx={{ display: 'block' }}>
                            {catalog.catalog_description.length > 100 
                              ? `${catalog.catalog_description.substring(0, 100)}...` 
                              : catalog.catalog_description}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip 
                              size="small" 
                              label={catalog.published ? 'Published' : 'Draft'} 
                              color={catalog.published ? 'success' : 'default'}
                              sx={{ mr: 1 }}
                            />
                            <Chip 
                              size="small" 
                              label={new Date(catalog.created_at).toLocaleDateString()} 
                              variant="outlined"
                            />
                          </Box>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        aria-label="edit" 
                        onClick={() => handleEditCatalog(catalog)}
                        disabled={loading}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        aria-label="publish" 
                        onClick={() => handlePublishCatalog(catalog)}
                        disabled={loading || catalog.published || publishingId === catalog.catalog_id}
                        color="primary"
                      >
                        {publishingId === catalog.catalog_id ? (
                          <CircularProgress size={24} />
                        ) : (
                          <PublishIcon />
                        )}
                      </IconButton>
                    </ListItemSecondaryAction>
                  </Box>
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>

      <CatalogModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSaveCatalog}
        initialCatalog={selectedCatalog}
        dataService={dataService}
      />
    </Box>
  );
};

export default CatalogManager;