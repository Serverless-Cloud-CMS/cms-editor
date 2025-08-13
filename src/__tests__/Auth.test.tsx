import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Auth from '../components/Auth';

// Mock dependencies
vi.mock('react-oidc-context', () => ({
  useAuth: () => ({
    isLoading: false,
    isAuthenticated: true,
    user: { profile: { name: 'Test User' } }
  })
}));

vi.mock('../helpers/DataService', () => {
  return {
    default: class MockDataService {
      init = vi.fn().mockResolvedValue(undefined);
      getService = vi.fn().mockReturnValue({});
    }
  };
});

vi.mock('../editor/Editor', () => ({
  default: () => <div data-testid="editor">Editor Component</div>
}));

vi.mock('../components/CatalogManager', () => ({
  default: () => <div data-testid="catalog-manager">Catalog Manager</div>
}));

// Mock Material-UI components
vi.mock('@mui/material', () => ({
  CircularProgress: () => <div data-testid="progress" role="progressbar">Loading</div>,
  AppBar: ({ children }: any) => <div data-testid="app-bar">{children}</div>,
  Toolbar: ({ children }: any) => <div data-testid="toolbar">{children}</div>,
  Tabs: ({ children }: any) => <div data-testid="tabs">{children}</div>,
  Tab: () => <div data-testid="tab">Tab</div>,
  Box: ({ children }: any) => <div data-testid="box">{children}</div>
}));

describe('Auth', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <Auth 
        auth={{ 
          token: 'test-token', 
          user: 'test-user' 
        }} 
      />
    );
    
    // Verify that it renders without error
    expect(container).toBeTruthy();
  });
});

