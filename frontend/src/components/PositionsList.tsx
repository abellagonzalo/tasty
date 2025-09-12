import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Position } from '../types/Position';
import { format } from 'date-fns';

interface PositionsListProps {
  positions: Position[];
  onDelete: (id: string) => void;
}

export const PositionsList: React.FC<PositionsListProps> = ({ positions, onDelete }) => {
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MM/dd/yyyy');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Paper elevation={3}>
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Symbol</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Strike</TableCell>
              <TableCell>Expiration</TableCell>
              <TableCell>Side</TableCell>
              <TableCell>Quantity</TableCell>
              <TableCell>Entry Price</TableCell>
              <TableCell>Entry Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography align="center">No positions found</Typography>
                </TableCell>
              </TableRow>
            ) : (
              positions.map((position) => (
                <TableRow key={position.id}>
                  <TableCell>{position.symbol}</TableCell>
                  <TableCell>{position.optionType}</TableCell>
                  <TableCell>{formatPrice(position.strikePrice)}</TableCell>
                  <TableCell>{formatDate(position.expirationDate)}</TableCell>
                  <TableCell>{position.positionSide}</TableCell>
                  <TableCell>{position.quantity}</TableCell>
                  <TableCell>{formatPrice(position.entryPrice)}</TableCell>
                  <TableCell>{formatDate(position.entryDate)}</TableCell>
                  <TableCell>
                    <IconButton
                      color="error"
                      onClick={() => onDelete(position.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};