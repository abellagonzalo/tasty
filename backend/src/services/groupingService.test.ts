import {
  groupPositions,
  generateStrategyName,
  calculatePositionGrossProceeds,
  calculateGrossProceeds,
} from './groupingService';
import { Position, OptionType, PositionSide } from '../models/Position';

// Helper function to create test positions
const createTestPosition = (overrides: Partial<Position> = {}): Position => {
  return {
    id: 'test-id',
    entryDate: '2025-01-15T10:30:00.000Z',
    symbol: 'AAPL',
    optionType: OptionType.CALL,
    strikePrice: 150,
    expirationDate: '2025-02-21',
    quantity: 1,
    entryPrice: 5.5,
    positionSide: PositionSide.LONG,
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

  describe('calculatePositionGrossProceeds', () => {
    it('should calculate gross proceeds for a LONG position', () => {
      const position = createTestPosition({
        quantity: 2,
        entryPrice: 5.5,
        positionSide: PositionSide.LONG,
      });

      const result = calculatePositionGrossProceeds(position);

      // 2 × 5.5 × 100 = 1100
      expect(result).toBe(1100);
    });

    it('should calculate gross proceeds for a SHORT position with negative quantity', () => {
      const position = createTestPosition({
        quantity: -3,
        entryPrice: 4.25,
        positionSide: PositionSide.SHORT,
      });

      const result = calculatePositionGrossProceeds(position);

      // abs(-3) × 4.25 × 100 = 1275
      expect(result).toBe(1275);
    });

    it('should handle fractional prices', () => {
      const position = createTestPosition({
        quantity: 1,
        entryPrice: 3.75,
      });

      const result = calculatePositionGrossProceeds(position);

      // 1 × 3.75 × 100 = 375
      expect(result).toBe(375);
    });

    it('should handle zero quantity', () => {
      const position = createTestPosition({
        quantity: 0,
        entryPrice: 5.5,
      });

      const result = calculatePositionGrossProceeds(position);

      expect(result).toBe(0);
    });

    it('should handle zero price', () => {
      const position = createTestPosition({
        quantity: 2,
        entryPrice: 0,
      });

      const result = calculatePositionGrossProceeds(position);

      expect(result).toBe(0);
    });
  });

  describe('calculateGrossProceeds', () => {
    it('should calculate total gross proceeds for multiple positions', () => {
      const positions = [
        createTestPosition({ quantity: 2, entryPrice: 5.5 }),  // 1100
        createTestPosition({ quantity: 1, entryPrice: 3.0 }),  // 300
        createTestPosition({ quantity: -2, entryPrice: 4.5 }), // 900
      ];

      const result = calculateGrossProceeds(positions);

      // 1100 + 300 + 900 = 2300
      expect(result).toBe(2300);
    });

    it('should return 0 for empty array', () => {
      const result = calculateGrossProceeds([]);
      expect(result).toBe(0);
    });

    it('should handle single position', () => {
      const positions = [createTestPosition({ quantity: 1, entryPrice: 5.5 })];

      const result = calculateGrossProceeds(positions);

      expect(result).toBe(550);
    });
  });

  describe('groupPositions', () => {
    it('should return empty arrays for no positions', () => {
      const result = groupPositions([]);

      expect(result.groups).toEqual([]);
      expect(result.positionsWithGroups).toEqual([]);
    });

    it('should create one group for a single position', () => {
      const position = createTestPosition({
        entryDate: '2025-01-15T10:30:00.000Z',
        symbol: 'AAPL',
        quantity: 1,
        entryPrice: 5.5,
      });

      const result = groupPositions([position]);

      expect(result.groups).toHaveLength(1);
      expect(result.groups[0]).toEqual({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 550, // 1 × 5.5 × 100
      });
      expect(result.positionsWithGroups).toHaveLength(1);
      expect(result.positionsWithGroups[0].position).toEqual(position);
    });

    it('should group positions with same timestamp and underlying', () => {
      const timestamp = '2025-01-15T10:30:00.000Z';
      const positions = [
        createTestPosition({
          id: '1',
          entryDate: timestamp,
          symbol: 'AAPL',
          strikePrice: 150,
          quantity: 1,
          entryPrice: 5.5,
          positionSide: PositionSide.LONG,
        }),
        createTestPosition({
          id: '2',
          entryDate: timestamp,
          symbol: 'AAPL',
          strikePrice: 155,
          quantity: -1,
          entryPrice: 3.0,
          positionSide: PositionSide.SHORT,
        }),
      ];

      const result = groupPositions(positions);

      expect(result.groups).toHaveLength(1);
      expect(result.groups[0]).toEqual({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 850, // (1 × 5.5 × 100) + (1 × 3.0 × 100)
      });
      expect(result.positionsWithGroups).toHaveLength(2);
    });

    it('should create separate groups for different timestamps', () => {
      const positions = [
        createTestPosition({
          id: '1',
          entryDate: '2025-01-15T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 5.5,
        }),
        createTestPosition({
          id: '2',
          entryDate: '2025-01-15T14:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 3.0,
        }),
      ];

      const result = groupPositions(positions);

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
      const positions = [
        createTestPosition({
          id: '1',
          entryDate: timestamp,
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 5.5,
        }),
        createTestPosition({
          id: '2',
          entryDate: timestamp,
          symbol: 'TSLA',
          quantity: 2,
          entryPrice: 3.0,
        }),
      ];

      const result = groupPositions(positions);

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
      const positions = [
        // Iron Condor: Buy lower put, Sell higher put, Sell lower call, Buy higher call
        createTestPosition({
          id: '1',
          entryDate: timestamp,
          symbol: 'SPY',
          optionType: OptionType.PUT,
          strikePrice: 450,
          quantity: 1,
          entryPrice: 2.0,
          positionSide: PositionSide.LONG,
        }),
        createTestPosition({
          id: '2',
          entryDate: timestamp,
          symbol: 'SPY',
          optionType: OptionType.PUT,
          strikePrice: 455,
          quantity: -1,
          entryPrice: 3.5,
          positionSide: PositionSide.SHORT,
        }),
        createTestPosition({
          id: '3',
          entryDate: timestamp,
          symbol: 'SPY',
          optionType: OptionType.CALL,
          strikePrice: 465,
          quantity: -1,
          entryPrice: 3.5,
          positionSide: PositionSide.SHORT,
        }),
        createTestPosition({
          id: '4',
          entryDate: timestamp,
          symbol: 'SPY',
          optionType: OptionType.CALL,
          strikePrice: 470,
          quantity: 1,
          entryPrice: 2.0,
          positionSide: PositionSide.LONG,
        }),
      ];

      const result = groupPositions(positions);

      expect(result.groups).toHaveLength(1);
      expect(result.groups[0]).toEqual({
        strategy: 'strategy-2025-01-15',
        underlying: 'SPY',
        grossProceeds: 1100, // (2.0 + 3.5 + 3.5 + 2.0) × 100
      });
      expect(result.positionsWithGroups).toHaveLength(4);
    });

    it('should sort positions by entryDate before grouping', () => {
      const positions = [
        createTestPosition({
          id: '3',
          entryDate: '2025-01-15T16:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 1.0,
        }),
        createTestPosition({
          id: '1',
          entryDate: '2025-01-15T09:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 2.0,
        }),
        createTestPosition({
          id: '2',
          entryDate: '2025-01-15T12:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 3.0,
        }),
      ];

      const result = groupPositions(positions);

      expect(result.groups).toHaveLength(3);
      // Groups should be created in chronological order
      expect(result.groups[0].grossProceeds).toBe(200); // 09:00 position
      expect(result.groups[1].grossProceeds).toBe(300); // 12:00 position
      expect(result.groups[2].grossProceeds).toBe(100); // 16:00 position
    });

    it('should handle complex scenario with mixed timestamps and underlyings', () => {
      const positions = [
        // Group 1: AAPL at 10:30
        createTestPosition({
          id: '1',
          entryDate: '2025-01-15T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 5.5,
        }),
        createTestPosition({
          id: '2',
          entryDate: '2025-01-15T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: -1,
          entryPrice: 3.0,
        }),
        // Group 2: TSLA at 10:30
        createTestPosition({
          id: '3',
          entryDate: '2025-01-15T10:30:00.000Z',
          symbol: 'TSLA',
          quantity: 2,
          entryPrice: 4.0,
        }),
        // Group 3: AAPL at 14:00
        createTestPosition({
          id: '4',
          entryDate: '2025-01-15T14:00:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 6.0,
        }),
        // Group 4: AAPL at 10:30 next day
        createTestPosition({
          id: '5',
          entryDate: '2025-01-16T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 5.0,
        }),
      ];

      const result = groupPositions(positions);

      expect(result.groups).toHaveLength(4);
      expect(result.positionsWithGroups).toHaveLength(5);

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

    it('should assign correct groupKey to each position', () => {
      const timestamp = '2025-01-15T10:30:00.000Z';
      const positions = [
        createTestPosition({
          id: '1',
          entryDate: timestamp,
          symbol: 'AAPL',
        }),
        createTestPosition({
          id: '2',
          entryDate: timestamp,
          symbol: 'AAPL',
        }),
      ];

      const result = groupPositions(positions);

      expect(result.positionsWithGroups).toHaveLength(2);
      expect(result.positionsWithGroups[0].groupKey).toBe(
        `${timestamp}_AAPL`
      );
      expect(result.positionsWithGroups[1].groupKey).toBe(
        `${timestamp}_AAPL`
      );
    });

    it('should handle positions with same date but different times correctly', () => {
      const positions = [
        createTestPosition({
          id: '1',
          entryDate: '2025-01-15T10:30:00.000Z',
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 5.0,
        }),
        createTestPosition({
          id: '2',
          entryDate: '2025-01-15T10:30:01.000Z', // 1 second difference
          symbol: 'AAPL',
          quantity: 1,
          entryPrice: 5.0,
        }),
      ];

      const result = groupPositions(positions);

      // Even 1 second difference should create separate groups
      expect(result.groups).toHaveLength(2);
      expect(result.groups[0].strategy).toBe('strategy-2025-01-15');
      expect(result.groups[1].strategy).toBe('strategy-2025-01-15');
    });
  });
});
