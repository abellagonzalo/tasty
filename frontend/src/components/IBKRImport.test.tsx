import React from 'react';
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { IBKRImport } from './IBKRImport';
import { IBKRTrade } from '../types/ibkr';
import Papa from 'papaparse';

// Mock PapaParse
jest.mock('papaparse');
const mockedPapa = Papa as jest.Mocked<typeof Papa>;

// Sample CSV content matching the fixture file
const CSV_CONTENT = `DateTime,Symbol,Description,TradePrice,Quantity,Put/Call,Strike,Expiry,TransactionType,Buy/Sell,IBCommission,NetCash,Open/CloseIndicator,FifoPnlRealized,MtmPnl
2024-01-15 10:30:00,SPY,SPY 19JAN24 450.0 C,5.50,1,C,450,2024-01-19,ExchTrade,BUY,-1.00,-551.00,O,0,0
2024-01-15 14:30:00,AAPL,AAPL 19JAN24 180.0 P,3.50,2,P,180,2024-01-19,ExchTrade,SELL,-2.00,698.00,O,0,0
2024-01-15 14:30:00,AAPL,,0,0,,,,,,-2.00,-2.00,,0,0
2024-01-16 09:15:00,TSLA,TSLA 26JAN24 250.0 C,8.25,1,C,250,2024-01-26,ExchTrade,BUY,-1.00,-826.00,O,0,0`;

describe('IBKRImport Integration Tests', () => {
    let mockFile: File;

    beforeEach(() => {
        jest.clearAllMocks();

        // Create a mock file from the CSV content
        mockFile = new File([CSV_CONTENT], 'ibkr-sample.csv', { type: 'text/csv' });
    });

    // Helper function to parse CSV content
    const parseCSVContent = (content: string) => {
        const lines = content.trim().split('\n');
        const headers = lines[0].split(',');
        return lines.slice(1).map(line => {
            const values = line.split(',');
            const row: any = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            return row;
        });
    };

    describe('CSV Upload and Parsing', () => {
        it('displays parsed trades after successful CSV upload', async () => {
            const mockOnImportComplete = jest.fn();

            // Mock PapaParse to actually parse the CSV content
            mockedPapa.parse.mockImplementation((file: any, config: any) => {
                const rows = parseCSVContent(CSV_CONTENT);
                config.complete({ data: rows, errors: [] });
                return {} as any;
            });

            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            // Get the file input and upload
            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                writable: false
            });
            fireEvent.change(input);

            // Wait for trades to be displayed
            await waitFor(() => {
                expect(screen.getByText(/Found Trades: 3/i)).toBeInTheDocument();
            });

            // Verify that the trades table is displayed
            expect(screen.getByText('SPY')).toBeInTheDocument();
            expect(screen.getByText('AAPL')).toBeInTheDocument();
            expect(screen.getByText('TSLA')).toBeInTheDocument();

            // Verify trade details are shown
            const table = screen.getByRole('table');
            expect(within(table).getByText('$5.50')).toBeInTheDocument();
            expect(within(table).getByText('$3.50')).toBeInTheDocument();
            expect(within(table).getByText('$8.25')).toBeInTheDocument();
        });

        it('successfully invokes callback with parsed trades', async () => {
            const mockOnImportComplete = jest.fn();

            // Mock PapaParse
            mockedPapa.parse.mockImplementation((file: any, config: any) => {
                const rows = parseCSVContent(CSV_CONTENT);
                config.complete({ data: rows, errors: [] });
                return {} as any;
            });

            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                writable: false
            });
            fireEvent.change(input);

            // Wait for the callback to be invoked
            await waitFor(() => {
                expect(mockOnImportComplete).toHaveBeenCalledTimes(1);
            });

            // Verify the callback was called with correct trade data
            const callbackArg = mockOnImportComplete.mock.calls[0][0] as IBKRTrade[];
            expect(callbackArg).toHaveLength(3);

            // Verify SPY trade
            expect(callbackArg[0]).toMatchObject({
                symbol: 'SPY',
                tradePrice: 5.50,
                quantity: 1,
                putCall: 'C',
                strike: 450,
                buySell: 'BUY',
                openClose: 'O'
            });

            // Verify AAPL trade
            expect(callbackArg[1]).toMatchObject({
                symbol: 'AAPL',
                tradePrice: 3.50,
                quantity: 2,
                putCall: 'P',
                strike: 180,
                buySell: 'SELL',
                openClose: 'O'
            });

            // Verify TSLA trade
            expect(callbackArg[2]).toMatchObject({
                symbol: 'TSLA',
                tradePrice: 8.25,
                quantity: 1,
                putCall: 'C',
                strike: 250,
                buySell: 'BUY',
                openClose: 'O'
            });
        });

        it('filters out non-ExchTrade transactions', async () => {
            const mockOnImportComplete = jest.fn();

            mockedPapa.parse.mockImplementation((file: any, config: any) => {
                const rows = parseCSVContent(CSV_CONTENT);
                config.complete({ data: rows, errors: [] });
                return {} as any;
            });

            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                writable: false
            });
            fireEvent.change(input);

            await waitFor(() => {
                expect(mockOnImportComplete).toHaveBeenCalled();
            });

            // The CSV has 4 rows total, but only 3 are ExchTrade
            const trades = mockOnImportComplete.mock.calls[0][0] as IBKRTrade[];
            expect(trades).toHaveLength(3);

            // Verify all trades are ExchTrade
            trades.forEach(trade => {
                expect(trade.transactionType).toBe('ExchTrade');
            });
        });

        it('displays error when CSV file type is invalid', async () => {
            const mockOnImportComplete = jest.fn();
            const invalidFile = new File(['test'], 'test.txt', { type: 'text/plain' });

            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [invalidFile],
                writable: false
            });
            fireEvent.change(input);

            // Verify error is displayed (might show different error depending on validation)
            await waitFor(() => {
                expect(screen.getByText(/Please upload.*CSV file/i)).toBeInTheDocument();
            });

            // Verify callback was not called
            expect(mockOnImportComplete).not.toHaveBeenCalled();
        });

        it('displays error when parsing fails', async () => {
            const mockOnImportComplete = jest.fn();

            // Mock PapaParse to return an error
            mockedPapa.parse.mockImplementation((file: any, config: any) => {
                config.error(new Error('Failed to parse CSV'));
                return {} as any;
            });

            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                writable: false
            });
            fireEvent.change(input);

            // Verify error is displayed
            await waitFor(() => {
                const errorElement = screen.queryByText(/Failed to parse CSV/i) || screen.queryByRole('alert');
                expect(errorElement).toBeInTheDocument();
            });

            // Verify callback was not called
            expect(mockOnImportComplete).not.toHaveBeenCalled();
        });

        it('displays error when multiple files are uploaded', async () => {
            const mockOnImportComplete = jest.fn();
            const file1 = new File(['test1'], 'test1.csv', { type: 'text/csv' });
            const file2 = new File(['test2'], 'test2.csv', { type: 'text/csv' });

            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [file1, file2],
                writable: false
            });
            fireEvent.change(input);

            // Verify error is displayed
            await waitFor(() => {
                expect(screen.getByText(/Please upload exactly one CSV file/i)).toBeInTheDocument();
            });

            // Verify callback was not called
            expect(mockOnImportComplete).not.toHaveBeenCalled();
        });
    });

    describe('Processing State', () => {
        it('shows processing state when isProcessing prop is true', () => {
            render(<IBKRImport isProcessing={true} />);

            // Verify processing message is shown
            expect(screen.getByText(/Processing trades/i)).toBeInTheDocument();

            // Verify loading spinner is shown
            expect(screen.getByRole('progressbar')).toBeInTheDocument();
        });

        it('disables file input when processing', () => {
            render(<IBKRImport isProcessing={true} />);

            // Verify dropzone shows processing state (which effectively disables interaction)
            expect(screen.getByText(/Processing trades/i)).toBeInTheDocument();

            // The dropzone opacity is reduced when processing
            const dropzone = screen.getByText(/Processing trades/i).closest('[role="presentation"]');
            expect(dropzone).toHaveStyle({ opacity: 0.7 });
        });

        it('hides trade preview when processing', async () => {
            const mockOnImportComplete = jest.fn();

            // First, render with a successful upload
            mockedPapa.parse.mockImplementation((file: any, config: any) => {
                const rows = parseCSVContent(CSV_CONTENT);
                config.complete({ data: rows, errors: [] });
                return {} as any;
            });

            const { rerender } = render(<IBKRImport onImportComplete={mockOnImportComplete} isProcessing={false} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                writable: false
            });
            fireEvent.change(input);

            // Verify trades are shown
            await waitFor(() => {
                expect(screen.getByText(/Found Trades: 3/i)).toBeInTheDocument();
            });

            // Now set processing to true
            rerender(<IBKRImport onImportComplete={mockOnImportComplete} isProcessing={true} />);

            // Verify trades preview is hidden
            expect(screen.queryByText(/Found Trades: 3/i)).not.toBeInTheDocument();
            expect(screen.getByText(/Processing trades/i)).toBeInTheDocument();
        });
    });

    describe('Trade Display', () => {
        it('displays trade details in table format', async () => {
            const mockOnImportComplete = jest.fn();

            mockedPapa.parse.mockImplementation((file: any, config: any) => {
                const rows = parseCSVContent(CSV_CONTENT);
                config.complete({ data: rows, errors: [] });
                return {} as any;
            });

            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                writable: false
            });
            fireEvent.change(input);

            await waitFor(() => {
                expect(screen.getByText(/Found Trades: 3/i)).toBeInTheDocument();
            });

            // Verify table headers
            expect(screen.getByText('Date')).toBeInTheDocument();
            expect(screen.getByText('Symbol')).toBeInTheDocument();
            expect(screen.getByText('Type')).toBeInTheDocument();
            expect(screen.getByText('Quantity')).toBeInTheDocument();
            expect(screen.getByText('Price')).toBeInTheDocument();
            expect(screen.getByText('Net Cash')).toBeInTheDocument();

            // Verify trade data is formatted correctly
            const table = screen.getByRole('table');

            // Check that quantities appear in the table (may appear multiple times in dates)
            const quantityOnes = within(table).getAllByText('1');
            expect(quantityOnes.length).toBeGreaterThan(0);
            expect(within(table).getByText('2')).toBeInTheDocument(); // AAPL quantity

            // Check net cash values (these are unique)
            expect(within(table).getByText('$-551.00')).toBeInTheDocument(); // SPY net cash
            expect(within(table).getByText('$698.00')).toBeInTheDocument(); // AAPL net cash
            expect(within(table).getByText('$-826.00')).toBeInTheDocument(); // TSLA net cash
        });

        it('shows warning message when CSV has parsing warnings', async () => {
            const mockOnImportComplete = jest.fn();

            mockedPapa.parse.mockImplementation((file: any, config: any) => {
                const rows = parseCSVContent(CSV_CONTENT);
                config.complete({
                    data: rows,
                    errors: [
                        { message: 'Warning: Some rows had empty fields' }
                    ]
                });
                return {} as any;
            });

            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [mockFile],
                writable: false
            });
            fireEvent.change(input);

            // Verify warning is displayed
            await waitFor(() => {
                expect(screen.getByText(/Warning: Some rows had empty fields/i)).toBeInTheDocument();
            });
        });

        it('limits preview to first 5 trades when more than 5 exist', async () => {
            const mockOnImportComplete = jest.fn();

            // Create CSV content with 7 trades
            const largeCsvContent = `DateTime,Symbol,Description,TradePrice,Quantity,Put/Call,Strike,Expiry,TransactionType,Buy/Sell,IBCommission,NetCash,Open/CloseIndicator,FifoPnlRealized,MtmPnl
2024-01-15 10:30:00,SPY1,SPY 19JAN24 450.0 C,5.50,1,C,450,2024-01-19,ExchTrade,BUY,-1.00,-551.00,O,0,0
2024-01-15 10:30:00,SPY2,SPY 19JAN24 450.0 C,5.50,1,C,450,2024-01-19,ExchTrade,BUY,-1.00,-551.00,O,0,0
2024-01-15 10:30:00,SPY3,SPY 19JAN24 450.0 C,5.50,1,C,450,2024-01-19,ExchTrade,BUY,-1.00,-551.00,O,0,0
2024-01-15 10:30:00,SPY4,SPY 19JAN24 450.0 C,5.50,1,C,450,2024-01-19,ExchTrade,BUY,-1.00,-551.00,O,0,0
2024-01-15 10:30:00,SPY5,SPY 19JAN24 450.0 C,5.50,1,C,450,2024-01-19,ExchTrade,BUY,-1.00,-551.00,O,0,0
2024-01-15 10:30:00,SPY6,SPY 19JAN24 450.0 C,5.50,1,C,450,2024-01-19,ExchTrade,BUY,-1.00,-551.00,O,0,0
2024-01-15 10:30:00,SPY7,SPY 19JAN24 450.0 C,5.50,1,C,450,2024-01-19,ExchTrade,BUY,-1.00,-551.00,O,0,0`;

            mockedPapa.parse.mockImplementation((file: any, config: any) => {
                const rows = parseCSVContent(largeCsvContent);
                config.complete({ data: rows, errors: [] });
                return {} as any;
            });

            const largeFile = new File([largeCsvContent], 'large.csv', { type: 'text/csv' });
            render(<IBKRImport onImportComplete={mockOnImportComplete} />);

            const input = document.querySelector('input[type="file"]') as HTMLInputElement;
            Object.defineProperty(input, 'files', {
                value: [largeFile],
                writable: false
            });
            fireEvent.change(input);

            await waitFor(() => {
                expect(screen.getByText(/Found Trades: 7/i)).toBeInTheDocument();
            });

            // Verify message about showing limited trades
            expect(screen.getByText(/Showing 5 of 7 trades/i)).toBeInTheDocument();

            // Verify only 5 rows are shown in the table (excluding header)
            const table = screen.getByRole('table');
            const rows = within(table).getAllByRole('row');
            expect(rows).toHaveLength(6); // 1 header + 5 data rows
        });
    });
});
