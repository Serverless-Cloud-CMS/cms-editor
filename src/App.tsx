import React from 'react';
import { Typography, CssBaseline, Button, Paper, Box} from '@mui/material';
import { styled } from '@mui/material/styles';
import Protected from './components/Auth';
import { useAuth } from "react-oidc-context";
import theme from "./theme";
import {config} from "./config";
import NonAuth from "./components/NonAuth";

const Root = styled('div')(({ theme }) => ({
    flexGrow: 1,
}));


const App: React.FC = () => {
    const auth = useAuth();
    const signOutRedirect = () => {
        const clientId = config.AuthConfig.ClientId;
        const logoutUri = config.AuthConfig.RedirectUriSignOut;
        const cognitoDomain = `https://${config.AuthConfig.AppWebDomain}`;
        window.location.href = `${cognitoDomain}/logout?client_id=${clientId}&logout_uri=${encodeURIComponent(logoutUri)}`;
    };

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

            <Protected auth={{ token: token, user: user }} />
        );
    } else {
        return (
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
        );
    };
};

export default App;
