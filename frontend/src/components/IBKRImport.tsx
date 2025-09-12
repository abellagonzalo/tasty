import React, { useCallback, useState } from 'react';
import { 
    Box, 
    Button, 
    Paper, 
    Typography, 
    Alert, 
    CircularProgress,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import { IBKRService } from '../services/ibkrService';
import { IBKRTrade, ImportResult } from '../types/ibkr';

interface IBKRImportProps {
    onImportComplete?: (trades: IBKRTrade[]) => void;
}

export const IBKRImport: React.FC<IBKRImportProps> = ({ onImportComplete }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    const [result, setResult] = useState<ImportResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length !== 1) {
            setError('Please upload exactly one CSV file');
            return;
        }

        const file = acceptedFiles[0];
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            setError('Please upload a CSV file');
            return;
        }

        setIsProcessing(true);
        setError(null);
        setResult(null);

        try {
            const importResult = await IBKRService.parseCSV(file);
            setResult(importResult);
            if (importResult.success && onImportComplete) {
                onImportComplete(importResult.trades);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error processing file');
        } finally {
            setIsProcessing(false);
        }
    }, [onImportComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        maxFiles: 1
    });

    return (
        <Box sx={{ width: '100%', mb: 3 }}>
            <Paper
                {...getRootProps()}
                sx={{
                    p: 3,
                    border: '2px dashed',
                    borderColor: isDragActive ? 'primary.main' : 'grey.300',
                    borderRadius: 2,
                    backgroundColor: isDragActive ? 'action.hover' : 'background.paper',
                    cursor: 'pointer',
                    mb: 2
                }}
            >
                <input {...getInputProps()} />
                <Box sx={{ textAlign: 'center' }}>
                    {isProcessing ? (
                        <CircularProgress size={24} sx={{ mb: 1 }} />
                    ) : (
                        <Typography variant="body1">
                            {isDragActive
                                ? 'Drop the IBKR Activity Flex Query CSV file here'
                                : 'Drag and drop your IBKR Activity Flex Query CSV file here, or click to select'}
                        </Typography>
                    )}
                </Box>
            </Paper>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {result?.warnings && result.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    {result.warnings.map((warning, index) => (
                        <div key={index}>{warning}</div>
                    ))}
                </Alert>
            )}

            {result?.success && result.trades.length > 0 && (
                <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                        Imported Trades: {result.trades.length}
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>Date</TableCell>
                                    <TableCell>Symbol</TableCell>
                                    <TableCell>Type</TableCell>
                                    <TableCell align="right">Quantity</TableCell>
                                    <TableCell align="right">Price</TableCell>
                                    <TableCell align="right">Net Cash</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {result.trades.slice(0, 5).map((trade, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{trade.dateTime.toLocaleDateString()}</TableCell>
                                        <TableCell>{trade.symbol}</TableCell>
                                        <TableCell>{trade.putCall || 'STOCK'}</TableCell>
                                        <TableCell align="right">{trade.quantity}</TableCell>
                                        <TableCell align="right">${trade.tradePrice.toFixed(2)}</TableCell>
                                        <TableCell align="right">${trade.netCash.toFixed(2)}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {result.trades.length > 5 && (
                            <Box sx={{ p: 1, textAlign: 'center' }}>
                                <Typography variant="body2" color="text.secondary">
                                    Showing 5 of {result.trades.length} trades
                                </Typography>
                            </Box>
                        )}
                    </TableContainer>
                </Box>
            )}
        </Box>
    );
};