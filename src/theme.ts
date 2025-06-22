import { createTheme, ThemeOptions } from "@mui/material/styles";

const themeOptions: ThemeOptions = {
    typography: {
        h1: {
            fontSize: '2rem'
        },
        h2: {
            fontSize: '1.8rem'
        },
        h3: {
            fontSize: '1.5rem'
        },
        h4: {
            fontSize: '1.3rem'
        },
        h5: {
            fontSize: '1.2rem'
        },
        h6: {
            fontSize: '1rem'
        },
    }

};

const theme = createTheme(themeOptions);

export default theme;