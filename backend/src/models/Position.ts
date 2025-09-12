export enum OptionType {
  CALL = 'CALL',
  PUT = 'PUT'
}

export enum PositionSide {
  LONG = 'LONG',
  SHORT = 'SHORT'
}

export interface Position {
  id: string;
  symbol: string;
  optionType: OptionType;
  strikePrice: number;
  expirationDate: string; // ISO date string
  positionSide: PositionSide;
  quantity: number;
  entryPrice: number;
  entryDate: string; // ISO date string
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}

export interface CreatePositionDTO {
  symbol: string;
  optionType: OptionType;
  strikePrice: number;
  expirationDate: string;
  positionSide: PositionSide;
  quantity: number;
  entryPrice: number;
  entryDate: string;
}