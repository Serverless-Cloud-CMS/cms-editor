import React, { useState, useEffect } from 'react';
import { Typography, CssBaseline, Button, Paper, Box, Snackbar, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import Protected from './components/Auth';
import { useAuth } from "react-oidc-context";
import theme from "./theme";
import {config} from "./config";
import { authService } from './helpers/AuthService';
import SessionTimeoutDialog from './components/SessionTimeoutDialog';
import { NotificationProvider } from './context/NotificationContext';

const Root = styled('div')(() => ({
    flexGrow: 1,
}));


const App: React.FC = () => {
    const auth = useAuth();
    const [showTimeoutDialog, setShowTimeoutDialog] = useState(false);
    const [showTokenRefreshAlert, setShowTokenRefreshAlert] = useState(false);
    
    // Function to handle session timeout warning
    const handleSessionTimeoutWarning = () => {
        setShowTimeoutDialog(true);
    };
    
    // Function to continue session
    const handleContinueSession = () => {
        setShowTimeoutDialog(false);
        // Update the last activity timestamp
        authService.updateActivity();
    };
    
    // Enhanced logout function with cleanup
    const signOutRedirect = () => {
        // Clean up auth service
        authService.cleanup();
        
        // Clear securely stored tokens
        authService.clearSecureTokens();
        
        // Remove OIDC user
        auth.removeUser();
        
        // Redirect to Cognito logout
        const clientId = config.AuthConfig.ClientId;
        const logoutUri = config.AuthConfig.RedirectUriSignOut;
        const cognitoDomain = `https://${config.AuthConfig.AppWebDomain}`;
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };
    
    // Initialize auth service when user is authenticated
    useEffect(() => {
        if (auth.isAuthenticated && auth.user) {
            // Initialize auth service with the current user
            authService.initialize(
                auth.user,
                handleSessionTimeoutWarning,
                signOutRedirect
            );
            
            // Store tokens securely
            if (auth.user.id_token) {
                authService.securelyStoreToken('id_token', auth.user.id_token);
            }
            if (auth.user.access_token) {
                authService.securelyStoreToken('access_token', auth.user.access_token);
            }
            
            // Show token refresh notification when token is refreshed
            const handleTokenRefreshed = () => {
                setShowTokenRefreshAlert(true);
                setTimeout(() => setShowTokenRefreshAlert(false), 3000);
            };
            
            // Listen for token refresh events
            const tokenRefreshEvent = 'tokenRefreshed';
            window.addEventListener(tokenRefreshEvent, handleTokenRefreshed);
            
            return () => {
                // Clean up event listener
                window.removeEventListener(tokenRefreshEvent, handleTokenRefreshed);
                // Clean up auth service
                authService.cleanup();
            };
        }
    }, [auth.isAuthenticated, auth.user, signOutRedirect]);

    if (auth.isLoading) {
        return <div>Loading...</div>;
    }

    if (auth.error) {
        return <div>Encountering error... {auth.error.message}</div>;
    }

    if (auth.isAuthenticated) {
        const token = auth.user?.id_token ? auth.user?.id_token : "";
        const user = auth.user?.profile.email ? auth.user?.profile.email : "";
        return (
            <NotificationProvider>
                <>
                    <Protected auth={{ token: token, user: user }} />
                    
                    {/* Session Timeout Dialog */}
                    <SessionTimeoutDialog
                        open={showTimeoutDialog}
                        onContinue={handleContinueSession}
                        onLogout={signOutRedirect}
                        remainingTime={60} // 60 seconds countdown
                    />
                    
                    {/* Token Refresh Alert */}
                    <Snackbar 
                        open={showTokenRefreshAlert} 
                        autoHideDuration={3000} 
                        onClose={() => setShowTokenRefreshAlert(false)}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                    >
                        <Alert severity="info" variant="filled">
                            Your session has been refreshed
                        </Alert>
                    </Snackbar>
                </>
            </NotificationProvider>
        );
    } else {
        return (
            <NotificationProvider>
                <Root>
                    <CssBaseline />
                    <Paper sx={{
                        padding: theme.spacing(2),
                        textAlign: 'center',
                        color: theme.palette.text.secondary,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minHeight: '100vh'
                    }}>
                        <Typography variant={"h6"}>Please Login</Typography>
                        <Box sx={{ padding: theme.spacing(2), display: 'flex', flexDirection: 'row' }}>
                            <Button variant="contained" color="primary" onClick={() => auth.signinRedirect()} sx={{ margin:1 }}>Sign in</Button>
                            <Button variant="outlined" color="secondary" onClick={() => signOutRedirect()} sx={{ margin: 1 }}>Sign out</Button>
                        </Box>
                    </Paper>
                </Root>
            </NotificationProvider>
        );
    };
};

export default App;
