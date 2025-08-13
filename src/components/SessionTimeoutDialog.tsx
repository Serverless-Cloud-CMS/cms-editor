import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogContentText, 
  DialogActions, 
  Button,
  CircularProgress,
  Box
} from '@mui/material';

interface SessionTimeoutDialogProps {
  open: boolean;
  onContinue: () => void;
  onLogout: () => void;
  remainingTime?: number; // in seconds
}

/**
 * A dialog component that warns users about session timeout and allows them to continue or logout
 */
const SessionTimeoutDialog: React.FC<SessionTimeoutDialogProps> = ({
  open,
  onContinue,
  onLogout,
  remainingTime = 60, // Default 60 seconds countdown
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(remainingTime);
  
  // Reset timer when dialog opens or remainingTime changes
  useEffect(() => {
    if (open) {
      setTimeLeft(remainingTime);
    }
  }, [open, remainingTime]);
  
  // Countdown timer
  useEffect(() => {
    if (!open) return;
    
    // If timer reaches 0, automatically logout
    if (timeLeft <= 0) {
      onLogout();
      return;
    }
    
    // Set up interval to decrement time
    const interval = setInterval(() => {
      setTimeLeft(prevTime => prevTime - 1);
    }, 1000);
    
    // Clean up interval
    return () => clearInterval(interval);
  }, [timeLeft, open, onLogout]);
  
  // Calculate progress percentage for the circular progress
  const progressPercentage = (timeLeft / remainingTime) * 100;
  
  return (
    <Dialog
      open={open}
      aria-labelledby="session-timeout-dialog-title"
      aria-describedby="session-timeout-dialog-description"
    >
      <DialogTitle id="session-timeout-dialog-title">
        Session Timeout Warning
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="session-timeout-dialog-description">
          Your session is about to expire due to inactivity. You will be automatically logged out in:
        </DialogContentText>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 2 }}>
          <Box sx={{ position: 'relative', display: 'inline-flex' }}>
            <CircularProgress
              variant="determinate"
              value={progressPercentage}
              size={60}
              thickness={5}
              color="error"
            />
            <Box
              sx={{
                top: 0,
                left: 0,
                bottom: 0,
                right: 0,
                position: 'absolute',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <DialogContentText sx={{ fontSize: '1rem', fontWeight: 'bold' }}>
                {timeLeft}s
              </DialogContentText>
            </Box>
          </Box>
        </Box>
        <DialogContentText>
          Would you like to continue your session?
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onLogout} color="secondary">
          Logout
        </Button>
        <Button onClick={onContinue} color="primary" variant="contained" autoFocus>
          Continue Session
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionTimeoutDialog;