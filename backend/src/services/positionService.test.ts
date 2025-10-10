import { positionService } from './positionService';
import { OptionType, PositionSide, CreatePositionDTO } from '../models/Position';

describe('PositionService', () => {
  // Clear positions before each test to ensure isolated test environment
  beforeEach(() => {
    positionService.clearPositions();
  });

  // Helper function to create a valid position DTO
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

  describe('createPosition', () => {
    it('should create a position with generated id and timestamps', async () => {
      const positionData = createValidPositionDTO();

      const result = await positionService.createPosition(positionData);

      expect(result).toMatchObject(positionData);
      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe('string');
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.createdAt).toBe(result.updatedAt);
    });

    it('should store the created position in memory', async () => {
      const positionData = createValidPositionDTO();

      const created = await positionService.createPosition(positionData);
      const positions = await positionService.getPositions();

      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual(created);
    });

    it('should create multiple positions with different ids', async () => {
      const position1 = await positionService.createPosition(createValidPositionDTO());
      const position2 = await positionService.createPosition(createValidPositionDTO());

      expect(position1.id).not.toBe(position2.id);
    });

    it('should create positions with different option types', async () => {
      const callPosition = await positionService.createPosition(
        createValidPositionDTO({ optionType: OptionType.CALL })
      );
      const putPosition = await positionService.createPosition(
        createValidPositionDTO({ optionType: OptionType.PUT })
      );

      expect(callPosition.optionType).toBe(OptionType.CALL);
      expect(putPosition.optionType).toBe(OptionType.PUT);
    });

    it('should create positions with different position sides', async () => {
      const longPosition = await positionService.createPosition(
        createValidPositionDTO({ positionSide: PositionSide.LONG })
      );
      const shortPosition = await positionService.createPosition(
        createValidPositionDTO({ positionSide: PositionSide.SHORT })
      );

      expect(longPosition.positionSide).toBe(PositionSide.LONG);
      expect(shortPosition.positionSide).toBe(PositionSide.SHORT);
    });
  });

  describe('createPositions', () => {
    it('should create multiple positions with same timestamp', async () => {
      const positionsData = [
        createValidPositionDTO({ symbol: 'AAPL' }),
        createValidPositionDTO({ symbol: 'GOOGL' }),
        createValidPositionDTO({ symbol: 'MSFT' })
      ];

      const results = await positionService.createPositions(positionsData);

      expect(results).toHaveLength(3);
      expect(results[0].createdAt).toBe(results[1].createdAt);
      expect(results[1].createdAt).toBe(results[2].createdAt);
    });

    it('should return all created positions', async () => {
      const positionsData = [
        createValidPositionDTO({ symbol: 'AAPL' }),
        createValidPositionDTO({ symbol: 'GOOGL' })
      ];

      const results = await positionService.createPositions(positionsData);

      expect(results).toHaveLength(2);
      expect(results[0].symbol).toBe('AAPL');
      expect(results[1].symbol).toBe('GOOGL');
    });

    it('should store all positions in memory', async () => {
      const positionsData = [
        createValidPositionDTO({ symbol: 'AAPL' }),
        createValidPositionDTO({ symbol: 'GOOGL' }),
        createValidPositionDTO({ symbol: 'MSFT' })
      ];

      await positionService.createPositions(positionsData);
      const positions = await positionService.getPositions();

      expect(positions).toHaveLength(3);
    });

    it('should assign unique ids to each position', async () => {
      const positionsData = [
        createValidPositionDTO({ symbol: 'AAPL' }),
        createValidPositionDTO({ symbol: 'GOOGL' }),
        createValidPositionDTO({ symbol: 'MSFT' })
      ];

      const results = await positionService.createPositions(positionsData);
      const ids = results.map(p => p.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
    });

    it('should handle empty array', async () => {
      const results = await positionService.createPositions([]);

      expect(results).toHaveLength(0);
      expect(results).toEqual([]);
    });
  });

  describe('getPositions', () => {
    it('should return all positions', async () => {
      await positionService.createPosition(createValidPositionDTO({ symbol: 'AAPL' }));
      await positionService.createPosition(createValidPositionDTO({ symbol: 'GOOGL' }));

      const positions = await positionService.getPositions();

      expect(positions).toHaveLength(2);
      expect(positions[0].symbol).toBe('AAPL');
      expect(positions[1].symbol).toBe('GOOGL');
    });

    it('should return empty array when no positions exist', async () => {
      const positions = await positionService.getPositions();

      expect(positions).toEqual([]);
      expect(positions).toHaveLength(0);
    });

    it('should return a copy of positions array', async () => {
      await positionService.createPosition(createValidPositionDTO());

      const positions1 = await positionService.getPositions();
      const positions2 = await positionService.getPositions();

      // Modifying one array should not affect the other
      expect(positions1).not.toBe(positions2);
      expect(positions1).toEqual(positions2);
    });
  });

  describe('getPosition', () => {
    it('should return a position by id', async () => {
      const created = await positionService.createPosition(createValidPositionDTO());

      const result = await positionService.getPosition(created.id);

      expect(result).toEqual(created);
    });

    it('should return null when position not found', async () => {
      const result = await positionService.getPosition('non-existent-id');

      expect(result).toBeNull();
    });

    it('should find the correct position among multiple positions', async () => {
      const position1 = await positionService.createPosition(createValidPositionDTO({ symbol: 'AAPL' }));
      const position2 = await positionService.createPosition(createValidPositionDTO({ symbol: 'GOOGL' }));
      const position3 = await positionService.createPosition(createValidPositionDTO({ symbol: 'MSFT' }));

      const result = await positionService.getPosition(position2.id);

      expect(result).toEqual(position2);
      expect(result?.symbol).toBe('GOOGL');
    });
  });

  describe('updatePosition', () => {
    it('should update a position and return updated position', async () => {
      const created = await positionService.createPosition(createValidPositionDTO({ quantity: 10 }));

      const result = await positionService.updatePosition(created.id, { quantity: 20 });

      expect(result).not.toBeNull();
      expect(result?.quantity).toBe(20);
      expect(result?.id).toBe(created.id);
    });

    it('should update the updatedAt timestamp', async () => {
      const created = await positionService.createPosition(createValidPositionDTO());

      // Wait a small amount to ensure different timestamp
      await new Promise(resolve => setTimeout(resolve, 10));

      const result = await positionService.updatePosition(created.id, { quantity: 20 });

      expect(result).not.toBeNull();
      expect(result!.updatedAt).not.toBe(created.updatedAt);
      expect(new Date(result!.updatedAt).getTime()).toBeGreaterThan(new Date(created.updatedAt).getTime());
    });

    it('should return null when position not found', async () => {
      const result = await positionService.updatePosition('non-existent-id', { quantity: 20 });

      expect(result).toBeNull();
    });

    it('should allow partial updates', async () => {
      const created = await positionService.createPosition(
        createValidPositionDTO({ symbol: 'AAPL', quantity: 10, entryPrice: 5.5 })
      );

      const result = await positionService.updatePosition(created.id, { quantity: 20 });

      expect(result).not.toBeNull();
      expect(result?.symbol).toBe('AAPL'); // Unchanged
      expect(result?.quantity).toBe(20); // Updated
      expect(result?.entryPrice).toBe(5.5); // Unchanged
    });

    it('should update multiple fields at once', async () => {
      const created = await positionService.createPosition(createValidPositionDTO());

      const result = await positionService.updatePosition(created.id, {
        quantity: 25,
        entryPrice: 6.5,
        symbol: 'GOOGL'
      });

      expect(result).not.toBeNull();
      expect(result?.quantity).toBe(25);
      expect(result?.entryPrice).toBe(6.5);
      expect(result?.symbol).toBe('GOOGL');
    });

    it('should persist the update in storage', async () => {
      const created = await positionService.createPosition(createValidPositionDTO({ quantity: 10 }));

      await positionService.updatePosition(created.id, { quantity: 20 });
      const retrieved = await positionService.getPosition(created.id);

      expect(retrieved?.quantity).toBe(20);
    });
  });

  describe('deletePosition', () => {
    it('should delete a position and return true', async () => {
      const created = await positionService.createPosition(createValidPositionDTO());

      const result = await positionService.deletePosition(created.id);

      expect(result).toBe(true);
    });

    it('should return false when position not found', async () => {
      const result = await positionService.deletePosition('non-existent-id');

      expect(result).toBe(false);
    });

    it('should actually remove the position from storage', async () => {
      const created = await positionService.createPosition(createValidPositionDTO());

      await positionService.deletePosition(created.id);
      const retrieved = await positionService.getPosition(created.id);

      expect(retrieved).toBeNull();
    });

    it('should only delete the specified position', async () => {
      const position1 = await positionService.createPosition(createValidPositionDTO({ symbol: 'AAPL' }));
      const position2 = await positionService.createPosition(createValidPositionDTO({ symbol: 'GOOGL' }));
      const position3 = await positionService.createPosition(createValidPositionDTO({ symbol: 'MSFT' }));

      await positionService.deletePosition(position2.id);

      const positions = await positionService.getPositions();
      expect(positions).toHaveLength(2);
      expect(positions.find(p => p.id === position1.id)).toBeDefined();
      expect(positions.find(p => p.id === position2.id)).toBeUndefined();
      expect(positions.find(p => p.id === position3.id)).toBeDefined();
    });

    it('should reduce positions count after deletion', async () => {
      await positionService.createPosition(createValidPositionDTO());
      await positionService.createPosition(createValidPositionDTO());

      const beforeCount = (await positionService.getPositions()).length;
      const firstPosition = (await positionService.getPositions())[0];

      await positionService.deletePosition(firstPosition.id);
      const afterCount = (await positionService.getPositions()).length;

      expect(beforeCount).toBe(2);
      expect(afterCount).toBe(1);
    });
  });

  describe('clearPositions', () => {
    it('should clear all positions', async () => {
      await positionService.createPosition(createValidPositionDTO());
      await positionService.createPosition(createValidPositionDTO());
      await positionService.createPosition(createValidPositionDTO());

      positionService.clearPositions();
      const positions = await positionService.getPositions();

      expect(positions).toHaveLength(0);
    });

    it('should allow creating positions after clearing', async () => {
      await positionService.createPosition(createValidPositionDTO());
      positionService.clearPositions();

      const newPosition = await positionService.createPosition(createValidPositionDTO());
      const positions = await positionService.getPositions();

      expect(positions).toHaveLength(1);
      expect(positions[0]).toEqual(newPosition);
    });
  });

  describe('Integration tests', () => {
    it('should handle a complete CRUD workflow', async () => {
      // Create
      const created = await positionService.createPosition(
        createValidPositionDTO({ symbol: 'AAPL', quantity: 10 })
      );
      expect(created.symbol).toBe('AAPL');

      // Read
      const retrieved = await positionService.getPosition(created.id);
      expect(retrieved).toEqual(created);

      // Update
      const updated = await positionService.updatePosition(created.id, { quantity: 20 });
      expect(updated?.quantity).toBe(20);

      // Delete
      const deleted = await positionService.deletePosition(created.id);
      expect(deleted).toBe(true);

      // Verify deletion
      const afterDelete = await positionService.getPosition(created.id);
      expect(afterDelete).toBeNull();
    });

    it('should handle multiple positions independently', async () => {
      const position1 = await positionService.createPosition(
        createValidPositionDTO({ symbol: 'AAPL', quantity: 10 })
      );
      const position2 = await positionService.createPosition(
        createValidPositionDTO({ symbol: 'GOOGL', quantity: 20 })
      );

      // Update one
      await positionService.updatePosition(position1.id, { quantity: 15 });

      // Check both
      const retrieved1 = await positionService.getPosition(position1.id);
      const retrieved2 = await positionService.getPosition(position2.id);

      expect(retrieved1?.quantity).toBe(15);
      expect(retrieved2?.quantity).toBe(20);
    });

    it('should maintain data integrity across operations', async () => {
      // Create batch
      const batch = await positionService.createPositions([
        createValidPositionDTO({ symbol: 'AAPL' }),
        createValidPositionDTO({ symbol: 'GOOGL' }),
        createValidPositionDTO({ symbol: 'MSFT' })
      ]);

      // Create single
      await positionService.createPosition(createValidPositionDTO({ symbol: 'TSLA' }));

      // Update one from batch
      await positionService.updatePosition(batch[1].id, { quantity: 99 });

      // Delete one from batch
      await positionService.deletePosition(batch[0].id);

      // Verify final state
      const allPositions = await positionService.getPositions();
      expect(allPositions).toHaveLength(3);

      const symbols = allPositions.map(p => p.symbol).sort();
      expect(symbols).toEqual(['GOOGL', 'MSFT', 'TSLA']);

      const googl = allPositions.find(p => p.symbol === 'GOOGL');
      expect(googl?.quantity).toBe(99);
    });
  });
});
