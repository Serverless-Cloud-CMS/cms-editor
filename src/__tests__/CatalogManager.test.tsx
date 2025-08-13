import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CatalogManager from '../components/CatalogManager';
import { ICMSCrudService } from '../helpers/ICMSCrudService';
import { CatalogEntry } from '../helpers/CatalogEntry';

// Mock the CatalogModal component
vi.mock('../components/CatalogModal', () => ({
  default: () => <div data-testid="mocked-catalog-modal">Mocked Catalog Modal</div>
}));

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
  Box: ({ children }: any) => <div data-testid="mocked-box">{children}</div>,
  Typography: ({ children }: any) => <div data-testid="mocked-typography">{children}</div>,
  Button: ({ children, onClick }: any) => 
    <div data-testid="mocked-button" onClick={onClick}>{children}</div>,
  List: ({ children }: any) => <div data-testid="mocked-list">{children}</div>,
  ListItem: ({ children }: any) => <div data-testid="mocked-list-item">{children}</div>,
  ListItemText: ({ primary, secondary }: any) => 
    <div data-testid="mocked-list-item-text">{primary} {secondary}</div>,
  ListItemSecondaryAction: ({ children }: any) => 
    <div data-testid="mocked-list-item-secondary-action">{children}</div>,
  IconButton: ({ children }: any) => <div data-testid="mocked-icon-button">{children}</div>,
  Divider: () => <div data-testid="mocked-divider">Divider</div>,
  Paper: ({ children }: any) => <div data-testid="mocked-paper">{children}</div>,
  CircularProgress: () => <div data-testid="mocked-progress" role="progressbar">Loading</div>,
  Chip: ({ label }: any) => <div data-testid="mocked-chip">{label}</div>
}));

// Sample catalog entries for testing
const mockCatalogs: CatalogEntry[] = [
  {
    catalog_id: 'catalog-1',
    catalog_title: 'Sample Catalog 1',
    catalog_description: 'This is the first sample catalog',
    catalog_image_key: 'catalog1.jpg',
    published: false,
    created_at: '2025-01-01T00:00:00.000Z'
  },
  {
    catalog_id: 'catalog-2',
    catalog_title: 'Sample Catalog 2',
    catalog_description: 'This is the second sample catalog',
    catalog_image_key: 'catalog2.jpg',
    published: true,
    created_at: '2025-01-02T00:00:00.000Z'
  }
];

// Create a mock ICMSCrudService
const createMockDataService = (): ICMSCrudService => ({
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
  sendReleaseEvent: vi.fn().mockResolvedValue(undefined),
  pollForMetaData: vi.fn().mockResolvedValue({}),
  createCatalog: vi.fn().mockResolvedValue(undefined),
  updateCatalog: vi.fn().mockResolvedValue(undefined),
  getCatalog: vi.fn().mockResolvedValue({}),
  listCatalogs: vi.fn().mockResolvedValue(mockCatalogs),
  publishCatalog: vi.fn().mockResolvedValue(undefined),
  sendCatalogPublishEvent: vi.fn().mockResolvedValue(undefined)
});

describe('CatalogManager', () => {
  it('renders without crashing', () => {
    const mockService = createMockDataService();
    
    const { container } = render(<CatalogManager dataService={mockService} />);
    
    // Just verify that it renders without error
    expect(container).toBeTruthy();
  });
});