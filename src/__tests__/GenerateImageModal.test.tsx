import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import GenerateImageModal from '../editor/GenerateImageModal';

// Mock Material-UI completely to avoid any rendering issues
vi.mock('@mui/material', () => ({
  Dialog: ({ children }: any) => <div data-testid="mocked-dialog">{children}</div>,
  DialogTitle: ({ children }: any) => <div>{children}</div>,
  DialogContent: ({ children }: any) => <div>{children}</div>,
  DialogActions: ({ children }: any) => <div>{children}</div>,
  TextField: () => <div data-testid="mocked-textfield">TextField</div>,
  MenuItem: ({ children }: any) => <div>{children}</div>,
  Button: ({ children }: any) => <div>{children}</div>,
  CircularProgress: () => <div data-testid="mocked-progress">Loading</div>
}));

describe('GenerateImageModal', () => {
  it('renders without crashing', () => {
    const onGenerateMock = vi.fn().mockResolvedValue(undefined);
    
    const { container } = render(
      <GenerateImageModal 
        open={true} 
        onClose={() => {}} 
        onGenerate={onGenerateMock}
        loading={false}
      />
    );
    
    // Just verify that the component renders without error
    expect(container).toBeTruthy();
  });
});

