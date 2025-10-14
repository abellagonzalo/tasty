import { IBKRTrade, IBKRCSVRow, ImportResult } from '../types/ibkr';
import Papa from 'papaparse';

export class IBKRService {
    static parseCSV(file: File): Promise<ImportResult> {
        return new Promise((resolve, reject) => {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                transformHeader: (header: string, index: number) => {
                    // Keep the header as-is
                    return header;
                },
                beforeFirstChunk: (chunk: string) => {
                    // Split into lines and filter out additional headers and cash transaction sections
                    const lines = chunk.split('\n');
                    const filteredLines: string[] = [];
                    let isFirstHeader = true;

                    for (const line of lines) {
                        // Skip header rows after the first one
                        if (line.startsWith('"HEADER",')) {
                            if (isFirstHeader) {
                                filteredLines.push(line);
                                isFirstHeader = false;
                            }
                            // Skip subsequent headers
                            continue;
                        }

                        // Skip cash transaction rows (CTRN)
                        if (line.startsWith('"DATA","CTRN"')) {
                            continue;
                        }

                        // Keep all other rows (including TRNT trade data)
                        filteredLines.push(line);
                    }

                    return filteredLines.join('\n');
                },
                complete: (results) => {
                    try {
                        const trades = this.processRows(results.data as IBKRCSVRow[]);
                        resolve({
                            success: true,
                            trades,
                            warnings: results.errors.length > 0 ? results.errors.map(e => e.message) : undefined
                        });
                    } catch (error) {
                        reject({
                            success: false,
                            trades: [],
                            errors: [error instanceof Error ? error.message : 'Unknown error during processing']
                        });
                    }
                },
                error: (error) => {
                    reject({
                        success: false,
                        trades: [],
                        errors: [error.message]
                    });
                }
            });
        });
    }

    private static processRows(rows: IBKRCSVRow[]): IBKRTrade[] {
        return rows
            .filter(row => row.TransactionType === 'ExchTrade')
            .map(row => ({
                dateTime: new Date(row.DateTime),
                symbol: row.Symbol.trim(),
                description: row.Description,
                tradePrice: parseFloat(row.TradePrice),
                quantity: parseInt(row.Quantity),
                putCall: row['Put/Call'] as 'P' | 'C' | undefined,
                strike: row.Strike ? parseFloat(row.Strike) : undefined,
                expiry: row.Expiry ? new Date(row.Expiry) : undefined,
                transactionType: row.TransactionType,
                buySell: row['Buy/Sell'] as 'BUY' | 'SELL',
                commission: Math.abs(parseFloat(row.IBCommission)),
                netCash: parseFloat(row.NetCash),
                openClose: row['Open/CloseIndicator'] as 'O' | 'C',
                realizedPnl: parseFloat(row.FifoPnlRealized || '0'),
                mtmPnl: parseFloat(row.MtmPnl || '0')
            }));
    }

    static validateTrade(trade: IBKRTrade): string[] {
        const errors: string[] = [];
        
        if (isNaN(trade.tradePrice) || trade.tradePrice <= 0) {
            errors.push(`Invalid trade price for ${trade.symbol}`);
        }
        
        if (isNaN(trade.quantity) || trade.quantity === 0) {
            errors.push(`Invalid quantity for ${trade.symbol}`);
        }
        
        if (trade.strike && (isNaN(trade.strike) || trade.strike <= 0)) {
            errors.push(`Invalid strike price for ${trade.symbol}`);
        }
        
        if (trade.expiry && isNaN(trade.expiry.getTime())) {
            errors.push(`Invalid expiry date for ${trade.symbol}`);
        }

        return errors;
    }
}