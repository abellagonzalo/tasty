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
  expirationDate: string;
  positionSide: PositionSide;
  quantity: number;
  entryPrice: number;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
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