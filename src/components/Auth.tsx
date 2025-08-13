import React, { useState, useEffect } from 'react';
import { CircularProgress, AppBar, Toolbar, Tabs, Tab, Box } from "@mui/material";
import EditIcon from '@mui/icons-material/Edit';
import CategoryIcon from '@mui/icons-material/Category';
import styled from "@mui/material/styles/styled";
import DataService from "../helpers/DataService";
import Editor from "../editor/Editor";
import CatalogManager from "./CatalogManager";

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
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeTab, setActiveTab] = useState(0);


    // Initialize service on component mount
    useEffect(() => {
        const initSvc = async () => {
            await dataSvc.init(token);
            setIsAuthenticated(true);
        };
        initSvc();
    }, [token, user]);

    if (!isAuthenticated) return <CircularProgress size={50} />;

    const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    return (
        <Root>
            <AppBar position="fixed">
                <Toolbar sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Box>Serverless CMS Editor</Box>
                    <Tabs 
                        value={activeTab} 
                        onChange={handleTabChange} 
                        textColor="inherit"
                        indicatorColor="secondary"
                    >
                        <Tab icon={<EditIcon />} label="Editor" />
                        <Tab icon={<CategoryIcon />} label="Catalogs" />
                    </Tabs>
                </Toolbar>
            </AppBar>
            <Content>
                <ToolBarMix />
                {activeTab === 0 ? (
                    <Editor dataService={dataSvc.getService()} />
                ) : (
                    <CatalogManager dataService={dataSvc.getService()} />
                )}
            </Content>
        </Root>
    );
};


export default Auth;