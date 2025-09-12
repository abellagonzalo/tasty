import React from 'react';
import { ThemeProvider, CssBaseline, Container, Typography } from '@mui/material';
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Tasty Options Tracker
        </Typography>
        <Typography variant="body1">
          Welcome to your options trading P&L tracker!
        </Typography>
      </Container>
    </ThemeProvider>
  );
}

export default App;