import { positionService } from './positionService';
import { OptionType, PositionSide, CreatePositionDTO } from '../models/Position';

describe('PositionService - Edge Cases and Validation', () => {
  beforeEach(() => {
    positionService.clearPositions();
  });

  const createValidPositionDTO = (overrides?: Partial<CreatePositionDTO>): CreatePositionDTO => ({
    symbol: 'AAPL',
    optionType: OptionType.CALL,
    strikePrice: 150,
    expirationDate: '2025-12-31',
    positionSide: PositionSide.LONG,
    quantity: 10,
    entryPrice: 5.5,
    entryDate: '2025-01-01',
    ...overrides
  });

  describe('Boundary Value Tests', () => {
    it('should handle very large strike prices', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ strikePrice: 999999.99 })
      );

      expect(position.strikePrice).toBe(999999.99);
    });

    it('should handle fractional strike prices', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ strikePrice: 150.5 })
      );

      expect(position.strikePrice).toBe(150.5);
    });

    it('should handle very small positive strike prices', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ strikePrice: 0.01 })
      );

      expect(position.strikePrice).toBe(0.01);
    });

    it('should handle very large quantities', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ quantity: 1000000 })
      );

      expect(position.quantity).toBe(1000000);
    });

    it('should handle fractional quantities', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ quantity: 10.5 })
      );

      expect(position.quantity).toBe(10.5);
    });

    it('should handle very large entry prices', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ entryPrice: 999999.99 })
      );

      expect(position.entryPrice).toBe(999999.99);
    });

    it('should handle fractional entry prices with many decimals', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ entryPrice: 5.123456789 })
      );

      expect(position.entryPrice).toBe(5.123456789);
    });

    it('should handle zero entry price (valid edge case)', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ entryPrice: 0 })
      );

      expect(position.entryPrice).toBe(0);
    });

    it('should handle very long symbol names', async () => {
      const longSymbol = 'A'.repeat(100);
      const position = await positionService.createPosition(
        createValidPositionDTO({ symbol: longSymbol })
      );

      expect(position.symbol).toBe(longSymbol);
    });

    it('should handle symbols with special characters', async () => {
      const specialSymbol = 'BRK.B';
      const position = await positionService.createPosition(
        createValidPositionDTO({ symbol: specialSymbol })
      );

      expect(position.symbol).toBe(specialSymbol);
    });

    it('should handle symbols with hyphens', async () => {
      const hyphenatedSymbol = 'BRK-B';
      const position = await positionService.createPosition(
        createValidPositionDTO({ symbol: hyphenatedSymbol })
      );

      expect(position.symbol).toBe(hyphenatedSymbol);
    });

    it('should handle symbols with numbers', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ symbol: 'STOCK123' })
      );

      expect(position.symbol).toBe('STOCK123');
    });
  });

  describe('Date Edge Cases', () => {
    it('should handle dates far in the future', async () => {
      const futureDate = '2099-12-31';
      const position = await positionService.createPosition(
        createValidPositionDTO({ expirationDate: futureDate })
      );

      expect(position.expirationDate).toBe(futureDate);
    });

    it('should handle dates in the past', async () => {
      const pastDate = '2020-01-01';
      const position = await positionService.createPosition(
        createValidPositionDTO({ entryDate: pastDate })
      );

      expect(position.entryDate).toBe(pastDate);
    });

    it('should handle ISO 8601 date format with time', async () => {
      const isoDate = '2025-12-31T23:59:59.999Z';
      const position = await positionService.createPosition(
        createValidPositionDTO({ expirationDate: isoDate })
      );

      expect(position.expirationDate).toBe(isoDate);
    });

    it('should handle date-only format', async () => {
      const dateOnly = '2025-06-15';
      const position = await positionService.createPosition(
        createValidPositionDTO({ expirationDate: dateOnly })
      );

      expect(position.expirationDate).toBe(dateOnly);
    });

    it('should handle leap year dates', async () => {
      const leapDate = '2024-02-29';
      const position = await positionService.createPosition(
        createValidPositionDTO({ expirationDate: leapDate })
      );

      expect(position.expirationDate).toBe(leapDate);
    });

    it('should handle year 2000 dates', async () => {
      const y2kDate = '2000-01-01';
      const position = await positionService.createPosition(
        createValidPositionDTO({ entryDate: y2kDate })
      );

      expect(position.entryDate).toBe(y2kDate);
    });
  });

  describe('Batch Operations Edge Cases', () => {
    it('should handle batch with single position', async () => {
      const positions = await positionService.createPositions([
        createValidPositionDTO()
      ]);

      expect(positions).toHaveLength(1);
    });

    it('should handle very large batches', async () => {
      const largeBatch = Array.from({ length: 1000 }, (_, i) =>
        createValidPositionDTO({ symbol: `SYM${i}` })
      );

      const positions = await positionService.createPositions(largeBatch);

      expect(positions).toHaveLength(1000);
      expect(positions[0].symbol).toBe('SYM0');
      expect(positions[999].symbol).toBe('SYM999');
    });

    it('should handle batch with identical data', async () => {
      const identicalBatch = Array.from({ length: 5 }, () =>
        createValidPositionDTO()
      );

      const positions = await positionService.createPositions(identicalBatch);

      expect(positions).toHaveLength(5);
      // All should have unique IDs even with identical data
      const ids = positions.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should maintain position order in batch creation', async () => {
      const batch = [
        createValidPositionDTO({ symbol: 'FIRST' }),
        createValidPositionDTO({ symbol: 'SECOND' }),
        createValidPositionDTO({ symbol: 'THIRD' })
      ];

      const positions = await positionService.createPositions(batch);

      expect(positions[0].symbol).toBe('FIRST');
      expect(positions[1].symbol).toBe('SECOND');
      expect(positions[2].symbol).toBe('THIRD');
    });
  });

  describe('Data Isolation and Mutation Tests', () => {
    it('should return a new array instance from getPositions', async () => {
      await positionService.createPosition(createValidPositionDTO());

      const array1 = await positionService.getPositions();
      const array2 = await positionService.getPositions();

      expect(array1).not.toBe(array2);
      expect(array1).toEqual(array2);
    });

    it('should maintain consistent data across multiple retrievals', async () => {
      const created = await positionService.createPosition(createValidPositionDTO());

      const retrieved1 = await positionService.getPosition(created.id);
      const retrieved2 = await positionService.getPosition(created.id);

      expect(retrieved1).toEqual(retrieved2);
      expect(retrieved1?.symbol).toBe('AAPL');
      expect(retrieved2?.symbol).toBe('AAPL');
    });
  });

  describe('Concurrent Operations Simulation', () => {
    it('should handle rapid sequential creates', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        positionService.createPosition(createValidPositionDTO({ symbol: `SYM${i}` }))
      );

      const positions = await Promise.all(promises);

      expect(positions).toHaveLength(10);
      const ids = positions.map(p => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10);
    });

    it('should handle mixed concurrent operations', async () => {
      // Create initial positions
      const pos1 = await positionService.createPosition(createValidPositionDTO({ symbol: 'POS1' }));
      const pos2 = await positionService.createPosition(createValidPositionDTO({ symbol: 'POS2' }));

      // Perform concurrent operations
      const operations = [
        positionService.createPosition(createValidPositionDTO({ symbol: 'POS3' })),
        positionService.updatePosition(pos1.id, { quantity: 99 }),
        positionService.getPosition(pos2.id),
        positionService.getPositions()
      ];

      const results = await Promise.all(operations);

      expect(results[0]).toHaveProperty('symbol', 'POS3'); // New position
      expect(results[1]).toHaveProperty('quantity', 99); // Updated position
      expect(results[2]).toHaveProperty('id', pos2.id); // Retrieved position
      expect(results[3]).toHaveLength(3); // All positions
    });
  });

  describe('Update Edge Cases', () => {
    it('should allow updating to the same value', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ quantity: 10 })
      );

      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await positionService.updatePosition(position.id, { quantity: 10 });

      expect(updated?.quantity).toBe(10);
      expect(updated?.updatedAt).not.toBe(position.updatedAt);
    });

    it('should handle empty update object', async () => {
      const position = await positionService.createPosition(createValidPositionDTO());
      const originalUpdatedAt = position.updatedAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await positionService.updatePosition(position.id, {});

      expect(updated).not.toBeNull();
      expect(updated?.symbol).toBe(position.symbol);
      expect(updated?.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('should handle updating all fields at once', async () => {
      const position = await positionService.createPosition(createValidPositionDTO());

      const updated = await positionService.updatePosition(position.id, {
        symbol: 'NEWSTOCK',
        optionType: OptionType.PUT,
        strikePrice: 200,
        expirationDate: '2026-01-01',
        positionSide: PositionSide.SHORT,
        quantity: 50,
        entryPrice: 10.5,
        entryDate: '2025-06-01'
      });

      expect(updated?.symbol).toBe('NEWSTOCK');
      expect(updated?.optionType).toBe(OptionType.PUT);
      expect(updated?.strikePrice).toBe(200);
      expect(updated?.expirationDate).toBe('2026-01-01');
      expect(updated?.positionSide).toBe(PositionSide.SHORT);
      expect(updated?.quantity).toBe(50);
      expect(updated?.entryPrice).toBe(10.5);
      expect(updated?.entryDate).toBe('2025-06-01');
    });
  });

  describe('Delete Edge Cases', () => {
    it('should handle deleting the same position twice', async () => {
      const position = await positionService.createPosition(createValidPositionDTO());

      const firstDelete = await positionService.deletePosition(position.id);
      const secondDelete = await positionService.deletePosition(position.id);

      expect(firstDelete).toBe(true);
      expect(secondDelete).toBe(false);
    });

    it('should handle deleting with malformed ID', async () => {
      const result = await positionService.deletePosition('not-a-valid-uuid');

      expect(result).toBe(false);
    });

    it('should handle deleting with empty string ID', async () => {
      const result = await positionService.deletePosition('');

      expect(result).toBe(false);
    });
  });

  describe('Retrieval Edge Cases', () => {
    it('should handle getPosition with malformed ID', async () => {
      const result = await positionService.getPosition('not-a-valid-uuid');

      expect(result).toBeNull();
    });

    it('should handle getPosition with empty string ID', async () => {
      const result = await positionService.getPosition('');

      expect(result).toBeNull();
    });

    it('should return positions in order of creation', async () => {
      const pos1 = await positionService.createPosition(createValidPositionDTO({ symbol: 'FIRST' }));
      const pos2 = await positionService.createPosition(createValidPositionDTO({ symbol: 'SECOND' }));
      const pos3 = await positionService.createPosition(createValidPositionDTO({ symbol: 'THIRD' }));

      const positions = await positionService.getPositions();

      expect(positions[0].id).toBe(pos1.id);
      expect(positions[1].id).toBe(pos2.id);
      expect(positions[2].id).toBe(pos3.id);
    });
  });

  describe('Special Numeric Values', () => {
    it('should handle maximum safe integer for quantity', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ quantity: Number.MAX_SAFE_INTEGER })
      );

      expect(position.quantity).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle very small decimal values', async () => {
      const position = await positionService.createPosition(
        createValidPositionDTO({ entryPrice: 0.0001 })
      );

      expect(position.entryPrice).toBe(0.0001);
    });

    it('should handle scientific notation values', async () => {
      const scientificValue = 1.5e2; // 150
      const position = await positionService.createPosition(
        createValidPositionDTO({ strikePrice: scientificValue })
      );

      expect(position.strikePrice).toBe(150);
    });
  });

  describe('Memory Management', () => {
    it('should maintain consistent state after clear and recreate', async () => {
      // Create positions
      await positionService.createPosition(createValidPositionDTO({ symbol: 'FIRST' }));
      await positionService.createPosition(createValidPositionDTO({ symbol: 'SECOND' }));

      // Clear
      positionService.clearPositions();
      let positions = await positionService.getPositions();
      expect(positions).toHaveLength(0);

      // Recreate
      await positionService.createPosition(createValidPositionDTO({ symbol: 'THIRD' }));
      positions = await positionService.getPositions();

      expect(positions).toHaveLength(1);
      expect(positions[0].symbol).toBe('THIRD');
    });

    it('should handle multiple clear operations', async () => {
      await positionService.createPosition(createValidPositionDTO());

      positionService.clearPositions();
      positionService.clearPositions();
      positionService.clearPositions();

      const positions = await positionService.getPositions();
      expect(positions).toHaveLength(0);
    });
  });

  describe('Option Type and Position Side Combinations', () => {
    const combinations = [
      { optionType: OptionType.CALL, positionSide: PositionSide.LONG },
      { optionType: OptionType.CALL, positionSide: PositionSide.SHORT },
      { optionType: OptionType.PUT, positionSide: PositionSide.LONG },
      { optionType: OptionType.PUT, positionSide: PositionSide.SHORT }
    ];

    combinations.forEach(({ optionType, positionSide }) => {
      it(`should handle ${optionType} ${positionSide} combination`, async () => {
        const position = await positionService.createPosition(
          createValidPositionDTO({ optionType, positionSide })
        );

        expect(position.optionType).toBe(optionType);
        expect(position.positionSide).toBe(positionSide);
      });
    });
  });

  describe('Timestamp Consistency', () => {
    it('should maintain createdAt timestamp after update', async () => {
      const position = await positionService.createPosition(createValidPositionDTO());
      const originalCreatedAt = position.createdAt;

      await new Promise(resolve => setTimeout(resolve, 10));

      const updated = await positionService.updatePosition(position.id, { quantity: 99 });

      expect(updated?.createdAt).toBe(originalCreatedAt);
    });

    it('should generate timestamps in ISO format', async () => {
      const position = await positionService.createPosition(createValidPositionDTO());

      expect(position.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(position.updatedAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should have valid parseable timestamps', async () => {
      const position = await positionService.createPosition(createValidPositionDTO());

      const createdDate = new Date(position.createdAt);
      const updatedDate = new Date(position.updatedAt);

      expect(createdDate.getTime()).not.toBeNaN();
      expect(updatedDate.getTime()).not.toBeNaN();
    });
  });
});
