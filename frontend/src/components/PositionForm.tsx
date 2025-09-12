import React, { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Grid,
  Paper,
  Typography,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { OptionType, PositionSide, CreatePositionDTO } from '../types/Position';

interface PositionFormProps {
  onSubmit: (position: CreatePositionDTO) => void;
}

export const PositionForm: React.FC<PositionFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<CreatePositionDTO>({
    symbol: '',
    optionType: OptionType.CALL,
    strikePrice: 0,
    expirationDate: new Date().toISOString(),
    positionSide: PositionSide.LONG,
    quantity: 1,
    entryPrice: 0,
    entryDate: new Date().toISOString(),
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: Number(value),
    }));
  };

  const handleDateChange = (name: string) => (date: Date | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        [name]: date.toISOString(),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        New Position
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Symbol"
              name="symbol"
              value={formData.symbol}
              onChange={handleChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Option Type"
              name="optionType"
              value={formData.optionType}
              onChange={handleChange}
              required
            >
              {Object.values(OptionType).map(type => (
                <MenuItem key={type} value={type}>
                  {type}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Strike Price"
              name="strikePrice"
              value={formData.strikePrice}
              onChange={handleNumberChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Expiration Date"
                value={new Date(formData.expirationDate)}
                onChange={handleDateChange('expirationDate')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              select
              label="Position Side"
              name="positionSide"
              value={formData.positionSide}
              onChange={handleChange}
              required
            >
              {Object.values(PositionSide).map(side => (
                <MenuItem key={side} value={side}>
                  {side}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Quantity"
              name="quantity"
              value={formData.quantity}
              onChange={handleNumberChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              type="number"
              label="Entry Price"
              name="entryPrice"
              value={formData.entryPrice}
              onChange={handleNumberChange}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <DatePicker
                label="Entry Date"
                value={new Date(formData.entryDate)}
                onChange={handleDateChange('entryDate')}
                slotProps={{ textField: { fullWidth: true } }}
              />
            </LocalizationProvider>
          </Grid>
          <Grid item xs={12}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
            >
              Add Position
            </Button>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};