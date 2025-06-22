import React, { useState, useEffect } from 'react';
import { CircularProgress, AppBar, Drawer, MenuItem, Toolbar, IconButton, Menu } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import styled from "@mui/material/styles/styled";
import { config } from "../config";
import { useAuth } from "react-oidc-context";
import DataService from "../helpers/DataService";
import Editor from "../editor/Editor";

// Styled components
const Root = styled('div')({ flexGrow: 1 });
const Content = styled('main')({ flexGrow: 1 });
const ToolBarMix = styled('div')(({ theme }) => ({
    toolbar: theme.mixins.toolbar,
    display: 'flex',
    padding: 30,
}));

const dataSvc = new DataService();

interface AuthProps {
    auth: {
        token: string;
        user: string;
    };
}

const Auth: React.FC<AuthProps> = ({ auth: { token, user } }) => {
    // State declarations
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [postEl, setPostEl] = useState(false);
    const [mediaEl, setMediaEl] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("basic");
    const [template, setTemplate] = useState("basic");
    const [loaded, setLoaded] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [username, setUsername] = useState("");
    const [jwt, setJwt] = useState("");

    const authClient = useAuth();

    // Logout handler
    const signOutRedirect = () => {
        authClient.removeUser();
        const { ClientId, RedirectUriSignOut, AppWebDomain } = config.AuthConfig;
        const cognitoDomain = `https://${AppWebDomain}`;
        window.location.href = `${cognitoDomain}/logout?client_id=${ClientId}&logout_uri=${encodeURIComponent(RedirectUriSignOut)}`;
    };

    // Initialize service on component mount
    useEffect(() => {
        const initSvc = async () => {
            await dataSvc.init(token);
            setIsAuthenticated(true);
            setJwt(token);
            setUsername(user);
        };
        initSvc();
    }, [token, user]);

    // Event handlers
    const handleDrawerToggle = () => {
        setPostEl(false);
        setMediaEl(false);
    };

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setPostEl(false);
        setAnchorEl(null);
        setMobileOpen(false);
    };

    const handlePostList = () => {
        setPostEl(!postEl);
        setAnchorEl(null);
    };

    const handleMediaList = () => {
        setMediaEl(!mediaEl);
        setAnchorEl(null);
    };

    const handleNewPost = () => {
        setAnchorEl(null);
        setOpen(true);
    };

    const handleTemplateClose = (value: string) => {
        setSelectedValue(value);
        setOpen(false);
        bus.notify("new-template", value.toLowerCase());
    };

    const handleLogOut = () => {
        signOutRedirect();
    };

    if (!isAuthenticated) return <CircularProgress size={50} />;

    return (
        <Root>
            <AppBar position="fixed">
                <Toolbar>
                    Serverless CMS Editor
                </Toolbar>
            </AppBar>
            <Content>
                <ToolBarMix />
                <Editor dataService={dataSvc.getService()}/>
                {loaded && <CircularProgress size={50} />}
            </Content>
        </Root>
    );
};

// Data bus for event handling
class DataBus {
    listeners: Array<(event: string, obj: any) => void> = [];

    addListener(listener: (event: string, obj: any) => void) {
        this.listeners.push(listener);
    }

    removeListener(listener: (event: string, obj: any) => void) {
        this.listeners = this.listeners.filter(v => v !== listener);
    }

    notify(event: string, obj: any) {
        console.info(`Event: ${event}`);
        this.listeners.forEach(f => f(event, obj));
    }
}

const bus = new DataBus();

export default Auth;