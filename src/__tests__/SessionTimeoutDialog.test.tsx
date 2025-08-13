import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import SessionTimeoutDialog from '../components/SessionTimeoutDialog';

// Mock Material-UI Dialog to avoid test issues
vi.mock('@mui/material', () => ({
  Dialog: ({ children }: { children: React.ReactNode }) => <div data-testid="mocked-dialog">{children}</div>,
  DialogTitle: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-title">{children}</div>,
  DialogContent: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-content">{children}</div>,
  DialogContentText: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-text">{children}</div>,
  DialogActions: ({ children }: { children: React.ReactNode }) => <div data-testid="dialog-actions">{children}</div>,
  Button: ({ children, onClick }: { children: React.ReactNode, onClick?: () => void }) => 
    <button data-testid={`button-${children}`} onClick={onClick}>{children}</button>,
  CircularProgress: () => <div data-testid="circular-progress" />,
  Box: ({ children, sx }: { children: React.ReactNode, sx?: any }) => <div data-testid="box">{children}</div>
}));

describe('SessionTimeoutDialog', () => {
  it('renders without crashing', () => {
    const onContinueMock = vi.fn();
    const onLogoutMock = vi.fn();
    
    const { container } = render(
      <SessionTimeoutDialog 
        open={true} 
        onContinue={onContinueMock} 
        onLogout={onLogoutMock} 
        remainingTime={60}
      />
    );
    
    // Simply test that it renders without throwing an error
    expect(container).toBeTruthy();
  });
});

