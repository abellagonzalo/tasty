export interface TradeGroup {
  id: string;
  strategy: string;           // "strategy-<date of first trade>"
  underlying: string;          // Ticker symbol
  grossProceeds: number;       // Sum of (price × multiplier × contracts)
  createdAt: string;           // ISO date
  updatedAt: string;           // ISO date
}

export interface CreateTradeGroupDTO {
  strategy: string;
  underlying: string;
  grossProceeds: number;
}
