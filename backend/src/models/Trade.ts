export interface Trade {
  id: string;
  dateTime: string;              // ISO date string for exact matching
  symbol: string;                // Underlying ticker
  optionType: 'CALL' | 'PUT';
  strikePrice: number;
  expirationDate: string;        // ISO date string
  quantity: number;
  tradePrice: number;
  buySell: 'BUY' | 'SELL';
  commission: number;
  netCash: number;
  realizedPnl: number;
  groupId?: string;              // Assigned during grouping
  createdAt: string;             // ISO date string
  updatedAt: string;             // ISO date string
}

export interface CreateTradeDTO {
  dateTime: string;
  symbol: string;
  optionType: 'CALL' | 'PUT';
  strikePrice: number;
  expirationDate: string;
  quantity: number;
  tradePrice: number;
  buySell: 'BUY' | 'SELL';
  commission: number;
  netCash: number;
  realizedPnl: number;
}
