import React, { useState, useEffect } from 'react';
import { CircularProgress, AppBar, Drawer, MenuItem, Toolbar, IconButton, Menu } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import styled from "@mui/material/styles/styled";
import { config } from "../config";
import Editor from "../editor/Editor";

// Styled components
const Root = styled('div')({ flexGrow: 1 });
const Content = styled('main')({ flexGrow: 1 });
const ToolBarMix = styled('div')(({ theme }) => ({
    toolbar: theme.mixins.toolbar,
    display: 'flex',
    padding: 30,
}));


const Auth: React.FC  = () => {
    // State declarations
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [postEl, setPostEl] = useState(false);
    const [mediaEl, setMediaEl] = useState(false);
    const [open, setOpen] = useState(false);
    const [selectedValue, setSelectedValue] = useState("basic");
    const [template, setTemplate] = useState("basic");
    const [loaded, setLoaded] = useState(false);


    return (
        <Root>
            <AppBar position="fixed">
                <Toolbar>
                    Serverless CMS Editor
                </Toolbar>
            </AppBar>
            <Content>
                <ToolBarMix />
               <Editor />
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