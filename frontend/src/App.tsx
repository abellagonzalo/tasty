import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  CssBaseline,
  Container,
  Typography,
  Box,
  Alert,
  Snackbar,
  Divider,
} from '@mui/material';
import { createTheme } from '@mui/material/styles';
import { PositionForm } from './components/PositionForm';
import { PositionsList } from './components/PositionsList';
import { IBKRImport } from './components/IBKRImport';
import { Position, CreatePositionDTO } from './types/Position';
import { IBKRTrade } from './types/ibkr';
import { api } from './services/api';
import { PositionService } from './services/positionService';

const theme = createTheme({
  palette: {
    mode: 'dark',
  },
});

function App() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);

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

  const handleIBKRImport = async (trades: IBKRTrade[]) => {
    try {
      setIsImporting(true);
      
      // Convert IBKR trades to positions
      const newPositions = PositionService.processIBKRTrades(trades);
      
      // Validate all positions
      const allErrors: string[] = [];
      newPositions.forEach((position, index) => {
        const validationErrors = PositionService.validatePosition(position);
        if (validationErrors.length > 0) {
          allErrors.push(`Position ${index + 1} (${position.symbol}): ${validationErrors.join(', ')}`);
        }
      });

      if (allErrors.length > 0) {
        throw new Error(`Validation errors:\n${allErrors.join('\n')}`);
      }

      // Import positions using batch creation
      if (newPositions.length > 0) {
        await api.positions.createBatch(newPositions);
        
        // Reload positions
        await loadPositions();
        
        setSuccess(`Successfully imported ${newPositions.length} positions from IBKR`);
      } else {
        setSuccess('No new positions to import from the file');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import IBKR trades');
    } finally {
      setIsImporting(false);
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
          
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom>
              Import IBKR Trades
            </Typography>
            <IBKRImport 
              onImportComplete={handleIBKRImport}
              isProcessing={isImporting}
            />
          </Box>

          <Divider sx={{ my: 4 }} />
          
          <Typography variant="h5" gutterBottom>
            Add Position Manually
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