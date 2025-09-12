import { IBKRTrade } from '../types/ibkr';
import { CreatePositionDTO, OptionType, PositionSide } from '../types/Position';

export class PositionService {
    static convertIBKRTradeToPosition(trade: IBKRTrade): CreatePositionDTO {
        // Extract expiration date from description if not available in expiry
        const expiryDate = trade.expiry || new Date(trade.description.split(' ')[1]);
        
        return {
            symbol: trade.symbol.trim(),
            optionType: trade.putCall === 'P' ? OptionType.PUT : OptionType.CALL,
            strikePrice: trade.strike || 0,
            expirationDate: expiryDate.toISOString().split('T')[0],
            positionSide: trade.buySell === 'BUY' ? PositionSide.LONG : PositionSide.SHORT,
            quantity: Math.abs(trade.quantity),
            entryPrice: trade.tradePrice,
            entryDate: new Date(trade.dateTime).toISOString().split('T')[0]
        };
    }

    static processIBKRTrades(trades: IBKRTrade[]): CreatePositionDTO[] {
        // Filter for option trades and convert to positions
        const optionTrades = trades.filter(trade => 
            trade.putCall && // Must be an option
            trade.transactionType === 'ExchTrade' && // Must be an exchange trade
            trade.openClose === 'O' // Must be an opening trade
        );

        // Convert trades to positions
        return optionTrades.map(trade => this.convertIBKRTradeToPosition(trade));
    }

    static validatePosition(position: CreatePositionDTO): string[] {
        const errors: string[] = [];

        if (!position.symbol) {
            errors.push('Symbol is required');
        }

        if (!position.strikePrice || position.strikePrice <= 0) {
            errors.push('Strike price must be greater than 0');
        }

        if (!position.expirationDate) {
            errors.push('Expiration date is required');
        }

        if (!position.quantity || position.quantity <= 0) {
            errors.push('Quantity must be greater than 0');
        }

        if (!position.entryPrice || position.entryPrice <= 0) {
            errors.push('Entry price must be greater than 0');
        }

        if (!position.entryDate) {
            errors.push('Entry date is required');
        }

        return errors;
    }
}