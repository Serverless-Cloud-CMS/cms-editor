import * as React from 'react';
import './index.css';
import App from './App';
import { AuthProvider } from "react-oidc-context";
import {editor_config} from './editor_config';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import ReactDOM from 'react-dom/client';


const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);
const cognitoAuthConfig = {
    authority: `https://cognito-idp.${editor_config.Region}.amazonaws.com/${editor_config.AuthConfig.UserPoolId}`,
    client_id: editor_config.AuthConfig.ClientId,
    redirect_uri: editor_config.AuthConfig.RedirectUriSignIn,
    response_type: "code",
    scope: "openid",
    // Enable automatic token renewal
    automaticSilentRenew: true,
    // Check session status every 5 minutes
    monitorSession: true,
    // Refresh when 70% of the token lifetime has passed
    silentRequestTimeoutInSeconds: 10,
};

root.render(
    <React.StrictMode>
        <ThemeProvider theme={theme}>
            <AuthProvider {...cognitoAuthConfig}>
                <App />
            </AuthProvider>
        </ThemeProvider>
    </React.StrictMode>
);
