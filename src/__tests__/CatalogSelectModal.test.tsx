import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CatalogSelectModal from '../components/CatalogSelectModal';
import { ICMSCrudService } from '../helpers/ICMSCrudService';
import { CatalogEntry } from '../helpers/CatalogEntry';

// Mock config
vi.mock('../config', () => ({
  config: {
    MediaProxy: 'https://example.com/media/'
  }
}));

// Mock Utils
vi.mock('../helpers/Utils', () => ({
  Utils: {
    cleanURL: (base: string, path: string) => `${base}${path}`
  }
}));

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  Dialog: ({ children }: any) => <div data-testid="mocked-dialog">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="mocked-dialog-title">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="mocked-dialog-content">{children}</div>,
  DialogActions: ({ children }: any) => <div data-testid="mocked-dialog-actions">{children}</div>,
  List: ({ children }: any) => <div data-testid="mocked-list">{children}</div>,
  ListItem: ({ children }: any) => <div data-testid="mocked-list-item">{children}</div>,
  ListItemButton: ({ children }: any) => <div data-testid="mocked-list-item-button">{children}</div>,
  ListItemText: ({ primary, secondary }: any) => 
    <div data-testid="mocked-list-item-text">{primary} {secondary}</div>,
  ListItemAvatar: ({ children }: any) => <div data-testid="mocked-list-item-avatar">{children}</div>,
  Avatar: () => <div data-testid="mocked-avatar">Avatar</div>,
  CircularProgress: () => <div data-testid="mocked-progress" role="progressbar">Loading</div>,
  Box: ({ children }: any) => <div data-testid="mocked-box">{children}</div>,
  Typography: ({ children }: any) => <div data-testid="mocked-typography">{children}</div>,
  Radio: () => <div data-testid="mocked-radio">Radio</div>,
  Divider: () => <div data-testid="mocked-divider">Divider</div>,
  Button: ({ children }: any) => <div data-testid="mocked-button">{children}</div>,
  Link: ({ children }: any) => <div data-testid="mocked-link">{children}</div>
}));

// Sample published catalog entries for testing
const mockCatalogs: CatalogEntry[] = [
  {
    catalog_id: 'catalog-1',
    catalog_title: 'Published Catalog 1',
    catalog_description: 'This is the first published catalog',
    catalog_image_key: 'catalog1.jpg',
    published: true,
    created_at: '2025-01-01T00:00:00.000Z'
  },
  {
    catalog_id: 'catalog-2',
    catalog_title: 'Published Catalog 2',
    catalog_description: 'This is the second published catalog',
    catalog_image_key: 'catalog2.jpg',
    published: true,
    created_at: '2025-01-02T00:00:00.000Z'
  }
];

// Create a mock ICMSCrudService
const createMockDataService = (catalogs = mockCatalogs): ICMSCrudService => ({
  create: vi.fn().mockResolvedValue(undefined),
  createHTML: vi.fn().mockResolvedValue(undefined),
  read: vi.fn().mockResolvedValue({}),
  update: vi.fn().mockResolvedValue(undefined),
  delete: vi.fn().mockResolvedValue(undefined),
  createMedia: vi.fn().mockResolvedValue(undefined),
  readMedia: vi.fn().mockResolvedValue(new Uint8Array()),
  updateMedia: vi.fn().mockResolvedValue(undefined),
  deleteMedia: vi.fn().mockResolvedValue(undefined),
  listMedia: vi.fn().mockResolvedValue([]),
  generateImageWithBedrock: vi.fn().mockResolvedValue(''),
  uploadImageBlob: vi.fn().mockResolvedValue(undefined),
  copyObject: vi.fn().mockResolvedValue(undefined),
  getMetaData: vi.fn().mockResolvedValue({}),
  sendEvent: vi.fn().mockResolvedValue(undefined),
  pollForMetaData: vi.fn().mockResolvedValue({}),
  createCatalog: vi.fn().mockResolvedValue(undefined),
  updateCatalog: vi.fn().mockResolvedValue(undefined),
  getCatalog: vi.fn().mockResolvedValue({}),
  listCatalogs: vi.fn().mockResolvedValue(catalogs),
  publishCatalog: vi.fn().mockResolvedValue(undefined),
  sendCatalogPublishEvent: vi.fn().mockResolvedValue(undefined)
});

describe('CatalogSelectModal', () => {
  it('renders without crashing', () => {
    const mockService = createMockDataService();
    const onSelectMock = vi.fn();
    
    const { container } = render(
      <CatalogSelectModal 
        open={true} 
        onClose={() => {}} 
        onSelect={onSelectMock} 
        dataService={mockService}
      />
    );
    
    // Just verify that it renders without error
    expect(container).toBeTruthy();
  });
});

