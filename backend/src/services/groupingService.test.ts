import {
  groupTrades,
  generateStrategyName,
  calculateTradeGrossProceeds,
  calculateGrossProceeds,
} from './groupingService';
import { Trade } from '../models/Trade';

// Helper function to create test trades
const createTestTrade = (overrides: Partial<Trade> = {}): Trade => {
  return {
    id: 'test-id',
    dateTime: '2025-01-15T10:30:00.000Z',
    symbol: 'AAPL',
    optionType: 'CALL',
    strikePrice: 150,
    expirationDate: '2025-02-21',
    quantity: 1,
    tradePrice: 5.5,
    buySell: 'BUY',
    commission: 0.65,
    netCash: -550.65,
    realizedPnl: 0,
    createdAt: '2025-01-15T10:30:00.000Z',
    updatedAt: '2025-01-15T10:30:00.000Z',
    ...overrides,
  };
};

describe('groupingService', () => {
  describe('generateStrategyName', () => {
    it('should generate strategy name from ISO date string', () => {
      const result = generateStrategyName('2025-01-15T10:30:00.000Z');
      expect(result).toBe('strategy-2025-01-15');
    });

    it('should handle different times on same day', () => {
      const result1 = generateStrategyName('2025-01-15T09:00:00.000Z');
      const result2 = generateStrategyName('2025-01-15T16:00:00.000Z');

      expect(result1).toBe('strategy-2025-01-15');
      expect(result2).toBe('strategy-2025-01-15');
    });

    it('should generate different names for different dates', () => {
      const result1 = generateStrategyName('2025-01-15T10:30:00.000Z');
      const result2 = generateStrategyName('2025-01-16T10:30:00.000Z');

      expect(result1).toBe('strategy-2025-01-15');
      expect(result2).toBe('strategy-2025-01-16');
    });
  });

  describe('calculateTradeGrossProceeds', () => {
    it('should calculate gross proceeds for a BUY trade', () => {
      const trade = createTestTrade({
        quantity: 2,
        tradePrice: 5.5,
        buySell: 'BUY',
      });

      const result = calculateTradeGrossProceeds(trade);

      // 2 × 5.5 × 100 = 1100
      expect(result).toBe(1100);
    });

    it('should calculate gross proceeds for a SELL trade with negative quantity', () => {
      const trade = createTestTrade({
        quantity: -3,
        tradePrice: 4.25,
        buySell: 'SELL',
      });

      const result = calculateTradeGrossProceeds(trade);

      // abs(-3) × 4.25 × 100 = 1275
      expect(result).toBe(1275);
    });

    it('should handle fractional prices', () => {
      const trade = createTestTrade({
        quantity: 1,
        tradePrice: 3.75,
      });

      const result = calculateTradeGrossProceeds(trade);

      // 1 × 3.75 × 100 = 375
      expect(result).toBe(375);
    });

    it('should handle zero quantity', () => {
      const trade = createTestTrade({
        quantity: 0,
        tradePrice: 5.5,
      });

      const result = calculateTradeGrossProceeds(trade);

      expect(result).toBe(0);
    });

    it('should handle zero price', () => {
      const trade = createTestTrade({
        quantity: 2,
        tradePrice: 0,
      });

      const result = calculateTradeGrossProceeds(trade);

      expect(result).toBe(0);
    });
  });

  describe('calculateGrossProceeds', () => {
    it('should calculate total gross proceeds for multiple trades', () => {
      const trades = [
        createTestTrade({ quantity: 2, tradePrice: 5.5 }),  // 1100
        createTestTrade({ quantity: 1, tradePrice: 3.0 }),  // 300
        createTestTrade({ quantity: -2, tradePrice: 4.5 }), // 900
      ];

      const result = calculateGrossProceeds(trades);

      // 1100 + 300 + 900 = 2300
      expect(result).toBe(2300);
    });

    it('should return 0 for empty array', () => {
      const result = calculateGrossProceeds([]);
      expect(result).toBe(0);
    });

    it('should handle single trade', () => {
      const trades = [createTestTrade({ quantity: 1, tradePrice: 5.5 })];

      const result = calculateGrossProceeds(trades);

      expect(result).toBe(550);
    });
  });

  describe('groupTrades', () => {
    it('should return empty arrays for no trades', () => {
      const result = groupTrades([]);

      expect(result.groups).toEqual([]);
      expect(result.tradesWithGroups).toEqual([]);
    });

    it('should create one group for a single trade', () => {
      const trade = createTestTrade({
        dateTime: '2025-01-15T10:30:00.000Z',
        symbol: 'AAPL',
        quantity: 1,
        tradePrice: 5.5,
      });

      const result = groupTrades([trade]);

      expect(result.groups).toHaveLength(1);
      expect(result.groups[0]).toEqual({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 550, // 1 × 5.5 × 100
      });
      expect(result.tradesWithGroups).toHaveLength(1);
      expect(result.tradesWithGroups[0].trade).toEqual(trade);
    });

    it('should group trades with same timestamp and underlying', () => {
      const timestamp = '2025-01-15T10:30:00.000Z';
      const trades = [
        createTestTrade({
          id: '1',
          dateTime: timestamp,
          symbol: 'AAPL',
          strikePrice: 150,
          quantity: 1,
          tradePrice: 5.5,
          buySell: 'BUY',
        }),
        createTestTrade({
          id: '2',
          dateTime: timestamp,
          symbol: 'AAPL',
          strikePrice: 155,
          quantity: -1,
          tradePrice: 3.0,
          buySell: 'SELL',
        }),
      ];

      const result = groupTrades(trades);

      expect(result.groups).toHaveLength(1);
      expect(result.groups[0]).toEqual({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 850, // (1 × 5.5 × 100) + (1 × 3.0 × 100)
      });
      expect(result.tradesWithGroups).toHaveLength(2);
    });

    it('should create separate groups for different timestamps', () => {
      const trades = [
        createTestTrade({
          id: '1',
          dateTime: '2025-01-15T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 5.5,
        }),
        createTestTrade({
          id: '2',
          dateTime: '2025-01-15T14:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 3.0,
        }),
      ];

      const result = groupTrades(trades);

      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].strategy).toBe('strategy-2025-01-15');
      expect(result.groups[1].strategy).toBe('strategy-2025-01-15');
      expect(result.groups[0].underlying).toBe('AAPL');
      expect(result.groups[1].underlying).toBe('AAPL');
      expect(result.groups[0].grossProceeds).toBe(550);
      expect(result.groups[1].grossProceeds).toBe(300);
    });

    it('should create separate groups for different underlyings', () => {
      const timestamp = '2025-01-15T10:30:00.000Z';
      const trades = [
        createTestTrade({
          id: '1',
          dateTime: timestamp,
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 5.5,
        }),
        createTestTrade({
          id: '2',
          dateTime: timestamp,
          symbol: 'TSLA',
          quantity: 2,
          tradePrice: 3.0,
        }),
      ];

      const result = groupTrades(trades);

      expect(result.groups).toHaveLength(2);

      const aaplGroup = result.groups.find(g => g.underlying === 'AAPL');
      const tslaGroup = result.groups.find(g => g.underlying === 'TSLA');

      expect(aaplGroup).toBeDefined();
      expect(tslaGroup).toBeDefined();
      expect(aaplGroup!.grossProceeds).toBe(550);
      expect(tslaGroup!.grossProceeds).toBe(600);
    });

    it('should handle multi-leg strategy (4 legs, same timestamp)', () => {
      const timestamp = '2025-01-15T10:30:00.000Z';
      const trades = [
        // Iron Condor: Buy lower put, Sell higher put, Sell lower call, Buy higher call
        createTestTrade({
          id: '1',
          dateTime: timestamp,
          symbol: 'SPY',
          optionType: 'PUT',
          strikePrice: 450,
          quantity: 1,
          tradePrice: 2.0,
          buySell: 'BUY',
        }),
        createTestTrade({
          id: '2',
          dateTime: timestamp,
          symbol: 'SPY',
          optionType: 'PUT',
          strikePrice: 455,
          quantity: -1,
          tradePrice: 3.5,
          buySell: 'SELL',
        }),
        createTestTrade({
          id: '3',
          dateTime: timestamp,
          symbol: 'SPY',
          optionType: 'CALL',
          strikePrice: 465,
          quantity: -1,
          tradePrice: 3.5,
          buySell: 'SELL',
        }),
        createTestTrade({
          id: '4',
          dateTime: timestamp,
          symbol: 'SPY',
          optionType: 'CALL',
          strikePrice: 470,
          quantity: 1,
          tradePrice: 2.0,
          buySell: 'BUY',
        }),
      ];

      const result = groupTrades(trades);

      expect(result.groups).toHaveLength(1);
      expect(result.groups[0]).toEqual({
        strategy: 'strategy-2025-01-15',
        underlying: 'SPY',
        grossProceeds: 1100, // (2.0 + 3.5 + 3.5 + 2.0) × 100
      });
      expect(result.tradesWithGroups).toHaveLength(4);
    });

    it('should sort trades by dateTime before grouping', () => {
      const trades = [
        createTestTrade({
          id: '3',
          dateTime: '2025-01-15T16:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 1.0,
        }),
        createTestTrade({
          id: '1',
          dateTime: '2025-01-15T09:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 2.0,
        }),
        createTestTrade({
          id: '2',
          dateTime: '2025-01-15T12:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 3.0,
        }),
      ];

      const result = groupTrades(trades);

      expect(result.groups).toHaveLength(3);
      // Groups should be created in chronological order
      expect(result.groups[0].grossProceeds).toBe(200); // 09:00 trade
      expect(result.groups[1].grossProceeds).toBe(300); // 12:00 trade
      expect(result.groups[2].grossProceeds).toBe(100); // 16:00 trade
    });

    it('should handle complex scenario with mixed timestamps and underlyings', () => {
      const trades = [
        // Group 1: AAPL at 10:30
        createTestTrade({
          id: '1',
          dateTime: '2025-01-15T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 5.5,
        }),
        createTestTrade({
          id: '2',
          dateTime: '2025-01-15T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: -1,
          tradePrice: 3.0,
        }),
        // Group 2: TSLA at 10:30
        createTestTrade({
          id: '3',
          dateTime: '2025-01-15T10:30:00.000Z',
          symbol: 'TSLA',
          quantity: 2,
          tradePrice: 4.0,
        }),
        // Group 3: AAPL at 14:00
        createTestTrade({
          id: '4',
          dateTime: '2025-01-15T14:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 6.0,
        }),
        // Group 4: AAPL at 10:30 next day
        createTestTrade({
          id: '5',
          dateTime: '2025-01-16T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 5.0,
        }),
      ];

      const result = groupTrades(trades);

      expect(result.groups).toHaveLength(4);
      expect(result.tradesWithGroups).toHaveLength(5);

      // Verify each group has correct properties
      const group1 = result.groups.find(
        g => g.underlying === 'AAPL' && g.grossProceeds === 850
      );
      const group2 = result.groups.find(
        g => g.underlying === 'TSLA' && g.grossProceeds === 800
      );
      const group3 = result.groups.find(
        g => g.underlying === 'AAPL' && g.grossProceeds === 600
      );
      const group4 = result.groups.find(
        g => g.underlying === 'AAPL' && g.grossProceeds === 500
      );

      expect(group1).toBeDefined();
      expect(group2).toBeDefined();
      expect(group3).toBeDefined();
      expect(group4).toBeDefined();
    });

    it('should assign correct groupKey to each trade', () => {
      const timestamp = '2025-01-15T10:30:00.000Z';
      const trades = [
        createTestTrade({
          id: '1',
          dateTime: timestamp,
          symbol: 'AAPL',
        }),
        createTestTrade({
          id: '2',
          dateTime: timestamp,
          symbol: 'AAPL',
        }),
      ];

      const result = groupTrades(trades);

      expect(result.tradesWithGroups).toHaveLength(2);
      expect(result.tradesWithGroups[0].groupKey).toBe(
        `${timestamp}_AAPL`
      );
      expect(result.tradesWithGroups[1].groupKey).toBe(
        `${timestamp}_AAPL`
      );
    });

    it('should handle trades with same date but different times correctly', () => {
      const trades = [
        createTestTrade({
          id: '1',
          dateTime: '2025-01-15T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 5.0,
        }),
        createTestTrade({
          id: '2',
          dateTime: '2025-01-15T10:30:01.000Z', // 1 second difference
          symbol: 'AAPL',
          quantity: 1,
          tradePrice: 5.0,
        }),
      ];

      const result = groupTrades(trades);

      // Even 1 second difference should create separate groups
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].strategy).toBe('strategy-2025-01-15');
      expect(result.groups[1].strategy).toBe('strategy-2025-01-15');
    });
  });
});
