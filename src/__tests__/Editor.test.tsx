import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Editor from '../editor/Editor';
import { ICMSCrudService } from '../helpers/ICMSCrudService';

// Mock CSS import
vi.mock('../editor/Editor.css', () => ({}));

// Mock Lexical components
vi.mock('@lexical/react/LexicalComposer', () => ({
  LexicalComposer: ({ children }: { children: React.ReactNode }) => <div data-testid="lexical-composer">{children}</div>
}));

vi.mock('@lexical/react/LexicalRichTextPlugin', () => ({
  RichTextPlugin: ({ contentEditable, placeholder }: any) => (
    <div data-testid="rich-text-plugin">
      {contentEditable}
      {placeholder}
    </div>
  )
}));

vi.mock('@lexical/react/LexicalContentEditable', () => ({
  ContentEditable: () => <div data-testid="content-editable" />
}));

vi.mock('@lexical/react/LexicalHistoryPlugin', () => ({
  HistoryPlugin: () => <div data-testid="history-plugin" />
}));

vi.mock('@lexical/react/LexicalOnChangePlugin', () => ({
  OnChangePlugin: () => <div data-testid="on-change-plugin" />
}));

vi.mock('@lexical/react/LexicalListPlugin', () => ({
  ListPlugin: () => <div data-testid="list-plugin" />
}));

vi.mock('@lexical/link', () => ({
  LinkNode: function MockLinkNode() {},
  LinkPlugin: () => <div data-testid="link-plugin" />
}));

vi.mock('@lexical/react/LexicalLinkPlugin', () => ({
  LinkPlugin: () => <div data-testid="link-plugin" />
}));

// Mock plugins
vi.mock('../editor/ToolbarPlugin', () => ({
  default: () => <div data-testid="toolbar-plugin">Toolbar</div>
}));

vi.mock('../editor/TablePlugin', () => ({
  default: () => <div data-testid="table-plugin">Table Plugin</div>
}));

vi.mock('../editor/CodeHighlightPlugin', () => ({
  default: () => <div data-testid="code-highlight-plugin">Code Highlight Plugin</div>
}));

vi.mock('../editor/SelectImageModal', () => ({
  default: () => <div data-testid="select-image-modal">Select Image Modal</div>
}));

// Mock the ImageNode
vi.mock('../editor/ImageNode', () => ({
  ImageNode: function MockImageNode() {},
  $createImageNode: () => ({})
}));

// Mock the config
vi.mock('../config', () => ({
  config: {
    MediaProxy: 'https://example.com/media/',
    PreviewURL: 'https://example.com/preview/'
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
  Box: ({ children }: any) => <div data-testid="box">{children}</div>,
  Paper: ({ children }: any) => <div data-testid="paper">{children}</div>,
  Typography: ({ children }: any) => <div data-testid="typography">{children}</div>,
  Link: ({ children }: any) => <div data-testid="link">{children}</div>,
  Avatar: () => <div data-testid="avatar">Avatar</div>
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

describe('Editor', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Editor dataService={createMockDataService()} />
    );
    
    // Just verify that it renders without error
    expect(container).toBeTruthy();
  });
});

