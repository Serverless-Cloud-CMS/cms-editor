import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Snackbar, Alert, AlertColor } from '@mui/material';

// Define the structure of a notification
interface Notification {
  message: string;
  severity: AlertColor;
  duration?: number;
}

// Define the shape of the context
interface NotificationContextType {
  showNotification: (message: string, severity: AlertColor, duration?: number) => void;
  closeNotification: () => void;
}

// Create the context with a default value
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Create a provider component
interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notification, setNotification] = useState<Notification | null>(null);
  const [open, setOpen] = useState(false);

  const showNotification = (message: string, severity: AlertColor = 'info', duration = 3000) => {
    setNotification({ message, severity, duration });
    setOpen(true);
  };

  const closeNotification = () => {
    setOpen(false);
  };

  const handleClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpen(false);
  };

  return (
    <NotificationContext.Provider value={{ showNotification, closeNotification }}>
      {children}
      {notification && (
        <Snackbar
          open={open}
          autoHideDuration={notification.duration}
          onClose={handleClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert
            onClose={handleClose}
            severity={notification.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {notification.message}
          </Alert>
        </Snackbar>
      )}
    </NotificationContext.Provider>
  );
};

// Create a custom hook to use the notification context
export const useNotification = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};