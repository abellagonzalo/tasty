export interface IBKRTrade {
    dateTime: Date;
    symbol: string;
    description: string;
    tradePrice: number;
    quantity: number;
    putCall?: 'P' | 'C';
    strike?: number;
    expiry?: Date;
    transactionType: string;
    buySell: 'BUY' | 'SELL';
    commission: number;
    netCash: number;
    openClose: 'O' | 'C';
    realizedPnl: number;
    mtmPnl: number;
}

export interface ImportResult {
    success: boolean;
    trades: IBKRTrade[];
    errors?: string[];
    warnings?: string[];
}

export interface IBKRCSVRow {
    DateTime: string;
    Symbol: string;
    Description: string;
    TradePrice: string;
    Quantity: string;
    'Put/Call': string;
    Strike: string;
    Expiry: string;
    TransactionType: string;
    'Buy/Sell': string;
    IBCommission: string;
    NetCash: string;
    'Open/CloseIndicator': string;
    FifoPnlRealized: string;
    MtmPnl: string;
}