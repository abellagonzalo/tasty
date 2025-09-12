import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { PositionForm } from './components/PositionForm';
import { PositionsList } from './components/PositionsList';
import { Position, CreatePositionDTO } from './types/Position';
import { api } from './services/api';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    loadPositions();
  }, []);

  const loadPositions = async () => {
    try {
      const data = await api.positions.getAll();
      setPositions(data);
    } catch (err) {
      setError('Failed to load positions');
    }
  };

  const handleCreatePosition = async (positionData: CreatePositionDTO) => {
    try {
      await api.positions.create(positionData);
      await loadPositions();
      setSuccess('Position created successfully');
    } catch (err) {
      setError('Failed to create position');
    }
  };

  const handleDeletePosition = async (id: string) => {
    try {
      await api.positions.delete(id);
      await loadPositions();
      setSuccess('Position deleted successfully');
    } catch (err) {
      setError('Failed to delete position');
    }
  };

  const handleCloseAlert = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Options Positions
          </Typography>
          
          <PositionForm onSubmit={handleCreatePosition} />
          
          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Current Positions
            </Typography>
            <PositionsList
              positions={positions}
              onDelete={handleDeletePosition}
            />
          </Box>
        </Box>

        <Snackbar
          open={!!error}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
        >
          <Alert severity="error" onClose={handleCloseAlert}>
            {error}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!success}
          autoHideDuration={6000}
          onClose={handleCloseAlert}
        >
          <Alert severity="success" onClose={handleCloseAlert}>
            {success}
          </Alert>
        </Snackbar>
      </Container>
    </ThemeProvider>
  );
}

export default App;