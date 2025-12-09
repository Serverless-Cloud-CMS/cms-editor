import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import CatalogModal from '../components/CatalogModal';
import { ICMSCrudService } from '../helpers/ICMSCrudService';
import { CatalogEntry } from '../helpers/CatalogEntry';

// Mock SelectImageModal component
vi.mock('../editor/SelectImageModal', () => ({
  default: () => <div data-testid="mocked-select-image-modal">SelectImageModal</div>
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
  Dialog: ({ children }: any) => <div data-testid="mocked-dialog">{children}</div>,
  DialogTitle: ({ children }: any) => <div data-testid="mocked-dialog-title">{children}</div>,
  DialogContent: ({ children }: any) => <div data-testid="mocked-dialog-content">{children}</div>,
  DialogActions: ({ children }: any) => <div data-testid="mocked-dialog-actions">{children}</div>,
  TextField: ({ label, value }: any) => <div data-testid={`mocked-textfield-${label}`}>{label}: {value}</div>,
  Typography: ({ children }: any) => <div data-testid="mocked-typography">{children}</div>,
  Box: ({ children }: any) => <div data-testid="mocked-box">{children}</div>,
  Button: ({ children }: any) => <div data-testid={`mocked-button-${children}`}>{children}</div>,
  IconButton: ({ children }: any) => <div data-testid="mocked-icon-button">{children}</div>
}));

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
  sendEvent: vi.fn().mockResolvedValue(undefined),
  pollForMetaData: vi.fn().mockResolvedValue({}),
  createCatalog: vi.fn().mockResolvedValue(undefined),
  updateCatalog: vi.fn().mockResolvedValue(undefined),
  getCatalog: vi.fn().mockResolvedValue({}),
  listCatalogs: vi.fn().mockResolvedValue([]),
  publishCatalog: vi.fn().mockResolvedValue(undefined),
  sendCatalogPublishEvent: vi.fn().mockResolvedValue(undefined)
});

// Sample catalog entry for testing
const sampleCatalog: CatalogEntry = {
  catalog_id: 'test-catalog',
  catalog_title: 'Test Catalog',
  catalog_description: 'This is a test catalog',
  catalog_image_key: 'test-image.jpg',
  published: false,
  created_at: '2025-01-01T00:00:00.000Z'
};

describe('CatalogModal', () => {
  it('renders without crashing', () => {
    const onSaveMock = vi.fn();
    const onCloseMock = vi.fn();
    
    const { container } = render(
      <CatalogModal 
        open={true} 
        onClose={onCloseMock} 
        onSave={onSaveMock}
        dataService={createMockDataService()}
      />
    );
    
    // Just verify that it renders without error
    expect(container).toBeTruthy();
  });
});

