import request from 'supertest';
import app from '../app';
import { positionService } from '../services/positionService';
import { OptionType, PositionSide, CreatePositionDTO } from '../models/Position';

describe('Position API Integration Tests', () => {
  // Clear positions before each test
  beforeEach(() => {
    positionService.clearPositions();
  });

  // Helper to create valid position data
  const createValidPositionData = (): CreatePositionDTO => ({
    symbol: 'AAPL',
    optionType: OptionType.CALL,
    strikePrice: 150,
    expirationDate: '2024-12-20T00:00:00.000Z',
    positionSide: PositionSide.LONG,
    quantity: 10,
    entryPrice: 5.5,
    entryDate: '2024-01-15T00:00:00.000Z'
  });

  describe('POST /api/positions', () => {
    it('should create a position with valid data', async () => {
      const positionData = createValidPositionData();

      const response = await request(app)
        .post('/api/positions')
        .send(positionData)
        .expect(201);

      expect(response.body).toMatchObject({
        symbol: 'AAPL',
        optionType: OptionType.CALL,
        strikePrice: 150,
        positionSide: PositionSide.LONG,
        quantity: 10,
        entryPrice: 5.5
      });
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should reject position with missing symbol', async () => {
      const invalidData = { ...createValidPositionData() };
      delete (invalidData as any).symbol;

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with empty symbol', async () => {
      const invalidData = { ...createValidPositionData(), symbol: '' };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with invalid option type', async () => {
      const invalidData = { ...createValidPositionData(), optionType: 'INVALID' as any };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with invalid position side', async () => {
      const invalidData = { ...createValidPositionData(), positionSide: 'INVALID' as any };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with negative strike price', async () => {
      const invalidData = { ...createValidPositionData(), strikePrice: -100 };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with zero strike price', async () => {
      const invalidData = { ...createValidPositionData(), strikePrice: 0 };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with negative quantity', async () => {
      const invalidData = { ...createValidPositionData(), quantity: -5 };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with zero quantity', async () => {
      const invalidData = { ...createValidPositionData(), quantity: 0 };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with negative entry price', async () => {
      const invalidData = { ...createValidPositionData(), entryPrice: -5 };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should accept position with zero entry price', async () => {
      const validData = { ...createValidPositionData(), entryPrice: 0 };

      const response = await request(app)
        .post('/api/positions')
        .send(validData)
        .expect(201);

      expect(response.body.entryPrice).toBe(0);
    });

    it('should reject position with invalid expiration date', async () => {
      const invalidData = { ...createValidPositionData(), expirationDate: 'invalid-date' };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should reject position with invalid entry date', async () => {
      const invalidData = { ...createValidPositionData(), entryDate: 'not-a-date' };

      const response = await request(app)
        .post('/api/positions')
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should create PUT option position', async () => {
      const putPosition = { ...createValidPositionData(), optionType: OptionType.PUT };

      const response = await request(app)
        .post('/api/positions')
        .send(putPosition)
        .expect(201);

      expect(response.body.optionType).toBe(OptionType.PUT);
    });

    it('should create SHORT position', async () => {
      const shortPosition = { ...createValidPositionData(), positionSide: PositionSide.SHORT };

      const response = await request(app)
        .post('/api/positions')
        .send(shortPosition)
        .expect(201);

      expect(response.body.positionSide).toBe(PositionSide.SHORT);
    });
  });

  describe('POST /api/positions/batch', () => {
    it('should create multiple positions with same timestamp', async () => {
      const positions = [
        createValidPositionData(),
        { ...createValidPositionData(), symbol: 'MSFT', strikePrice: 300 },
        { ...createValidPositionData(), symbol: 'GOOGL', strikePrice: 2800 }
      ];

      const response = await request(app)
        .post('/api/positions/batch')
        .send(positions)
        .expect(201);

      expect(response.body).toHaveLength(3);
      expect(response.body[0].symbol).toBe('AAPL');
      expect(response.body[1].symbol).toBe('MSFT');
      expect(response.body[2].symbol).toBe('GOOGL');

      // All should have the same createdAt timestamp
      const timestamps = response.body.map((p: any) => p.createdAt);
      expect(timestamps[0]).toBe(timestamps[1]);
      expect(timestamps[1]).toBe(timestamps[2]);
    });

    it('should reject non-array input', async () => {
      const response = await request(app)
        .post('/api/positions/batch')
        .send({ notAnArray: 'test' })
        .expect(400);

      expect(response.body.error).toBe('Request body must be an array of positions');
    });

    it('should reject empty array', async () => {
      const response = await request(app)
        .post('/api/positions/batch')
        .send([])
        .expect(400);

      expect(response.body.error).toBe('No positions provided');
    });

    it('should reject batch with invalid positions', async () => {
      const positions = [
        createValidPositionData(),
        { ...createValidPositionData(), strikePrice: -100 }, // Invalid
        createValidPositionData()
      ];

      const response = await request(app)
        .post('/api/positions/batch')
        .send(positions)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Invalid position data at index 1');
    });

    it('should reject batch when any position is invalid', async () => {
      const positions = [
        createValidPositionData(),
        { ...createValidPositionData(), quantity: 0 }, // Invalid
        { ...createValidPositionData(), symbol: '' }   // Invalid
      ];

      const response = await request(app)
        .post('/api/positions/batch')
        .send(positions)
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toHaveLength(2);
      expect(response.body.details).toContain('Invalid position data at index 1');
      expect(response.body.details).toContain('Invalid position data at index 2');
    });

    it('should create all positions when all are valid', async () => {
      const positions = [
        { ...createValidPositionData(), symbol: 'AAPL' },
        { ...createValidPositionData(), symbol: 'MSFT', optionType: OptionType.PUT },
        { ...createValidPositionData(), symbol: 'TSLA', positionSide: PositionSide.SHORT }
      ];

      const response = await request(app)
        .post('/api/positions/batch')
        .send(positions)
        .expect(201);

      expect(response.body).toHaveLength(3);

      // Verify all positions are stored
      const allPositions = await positionService.getPositions();
      expect(allPositions).toHaveLength(3);
    });
  });

  describe('GET /api/positions', () => {
    it('should return empty array when no positions exist', async () => {
      const response = await request(app)
        .get('/api/positions')
        .expect(200);

      expect(response.body).toEqual([]);
    });

    it('should return all positions', async () => {
      // Create some positions first
      await positionService.createPosition(createValidPositionData());
      await positionService.createPosition({ ...createValidPositionData(), symbol: 'MSFT' });

      const response = await request(app)
        .get('/api/positions')
        .expect(200);

      expect(response.body).toHaveLength(2);
      expect(response.body[0].symbol).toBe('AAPL');
      expect(response.body[1].symbol).toBe('MSFT');
    });

    it('should return positions with all required fields', async () => {
      await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .get('/api/positions')
        .expect(200);

      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('symbol');
      expect(response.body[0]).toHaveProperty('optionType');
      expect(response.body[0]).toHaveProperty('strikePrice');
      expect(response.body[0]).toHaveProperty('expirationDate');
      expect(response.body[0]).toHaveProperty('positionSide');
      expect(response.body[0]).toHaveProperty('quantity');
      expect(response.body[0]).toHaveProperty('entryPrice');
      expect(response.body[0]).toHaveProperty('entryDate');
      expect(response.body[0]).toHaveProperty('createdAt');
      expect(response.body[0]).toHaveProperty('updatedAt');
    });
  });

  describe('GET /api/positions/:id', () => {
    it('should return a specific position', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .get(`/api/positions/${created.id}`)
        .expect(200);

      expect(response.body.id).toBe(created.id);
      expect(response.body.symbol).toBe('AAPL');
    });

    it('should return 404 for non-existent position', async () => {
      const response = await request(app)
        .get('/api/positions/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Position not found');
    });

    it('should return correct position when multiple exist', async () => {
      const pos1 = await positionService.createPosition(createValidPositionData());
      const pos2 = await positionService.createPosition({ ...createValidPositionData(), symbol: 'MSFT' });

      const response = await request(app)
        .get(`/api/positions/${pos2.id}`)
        .expect(200);

      expect(response.body.id).toBe(pos2.id);
      expect(response.body.symbol).toBe('MSFT');
    });
  });

  describe('PUT /api/positions/:id', () => {
    it('should update a position', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const updateData = { quantity: 20, entryPrice: 6.5 };

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body.id).toBe(created.id);
      expect(response.body.quantity).toBe(20);
      expect(response.body.entryPrice).toBe(6.5);
      expect(response.body.symbol).toBe('AAPL'); // Unchanged
    });

    it('should update updatedAt timestamp', async () => {
      const created = await positionService.createPosition(createValidPositionData());
      const originalUpdatedAt = created.updatedAt;

      // Wait a tiny bit to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send({ quantity: 20 })
        .expect(200);

      expect(response.body.updatedAt).not.toBe(originalUpdatedAt);
      expect(new Date(response.body.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalUpdatedAt).getTime()
      );
    });

    it('should allow partial updates', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send({ symbol: 'TSLA' })
        .expect(200);

      expect(response.body.symbol).toBe('TSLA');
      expect(response.body.quantity).toBe(10); // Unchanged
      expect(response.body.strikePrice).toBe(150); // Unchanged
    });

    it('should return 404 for non-existent position', async () => {
      const response = await request(app)
        .put('/api/positions/non-existent-id')
        .send({ quantity: 20 })
        .expect(404);

      expect(response.body.error).toBe('Position not found');
    });

    it('should update option type', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send({ optionType: OptionType.PUT })
        .expect(200);

      expect(response.body.optionType).toBe(OptionType.PUT);
    });

    it('should update position side', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send({ positionSide: PositionSide.SHORT })
        .expect(200);

      expect(response.body.positionSide).toBe(PositionSide.SHORT);
    });
  });

  describe('DELETE /api/positions/:id', () => {
    it('should delete a position', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      await request(app)
        .delete(`/api/positions/${created.id}`)
        .expect(204);

      // Verify it's deleted
      const positions = await positionService.getPositions();
      expect(positions).toHaveLength(0);
    });

    it('should return 404 for non-existent position', async () => {
      const response = await request(app)
        .delete('/api/positions/non-existent-id')
        .expect(404);

      expect(response.body.error).toBe('Position not found');
    });

    it('should only delete the specified position', async () => {
      const pos1 = await positionService.createPosition(createValidPositionData());
      const pos2 = await positionService.createPosition({ ...createValidPositionData(), symbol: 'MSFT' });

      await request(app)
        .delete(`/api/positions/${pos1.id}`)
        .expect(204);

      const positions = await positionService.getPositions();
      expect(positions).toHaveLength(1);
      expect(positions[0].id).toBe(pos2.id);
    });

    it('should allow deleting all positions one by one', async () => {
      const pos1 = await positionService.createPosition(createValidPositionData());
      const pos2 = await positionService.createPosition({ ...createValidPositionData(), symbol: 'MSFT' });

      await request(app).delete(`/api/positions/${pos1.id}`).expect(204);
      await request(app).delete(`/api/positions/${pos2.id}`).expect(204);

      const positions = await positionService.getPositions();
      expect(positions).toHaveLength(0);
    });
  });

  describe('Health Check', () => {
    it('should return ok status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});
