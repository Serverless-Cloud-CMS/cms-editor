import * as React from 'react';
import './index.css';
import App from './App';
import { AuthProvider } from "react-oidc-context";
import {config} from './config';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import ReactDOM from 'react-dom/client';


const rootElement = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(rootElement);
const cognitoAuthConfig = {
    authority: `https://cognito-idp.${config.Region}.amazonaws.com/${config.AuthConfig.UserPoolId}`,
    client_id: config.AuthConfig.ClientId,
    redirect_uri: config.AuthConfig.RedirectUriSignIn,
    response_type: "code",
    scope: "openid",
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
