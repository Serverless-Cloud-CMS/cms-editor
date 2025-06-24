import React, { useState, useEffect } from 'react';
import { CircularProgress, AppBar, Toolbar, Typography, Box, Paper, Stack } from "@mui/material";
import styled from "@mui/material/styles/styled";
import { config } from "../config";
import Editor from "../editor/Editor";
import dataService from "../helpers/DataService";

// Styled components
const Root = styled('div')({ flexGrow: 1 });
const Content = styled('main')({ flexGrow: 1 });
const ToolBarMix = styled('div')(({ theme }) => ({
    toolbar: theme.mixins.toolbar,
    display: 'flex',
    padding: 30,
}));


const NonAuth: React.FC  = () => {
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
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        Serverless CMS Editor
                    </Typography>
                </Toolbar>
            </AppBar>
            <Box component="main" sx={{ flexGrow: 1, pt: 10, px: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Paper elevation={3} sx={{ width: '100%', maxWidth: 900, p: 3, mt: 2 }}>
                    <Stack spacing={2} alignItems="center">
                        {loaded && <CircularProgress size={50} />}
                    </Stack>
                </Paper>
            </Box>
        </Box>
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

export default NonAuth;
