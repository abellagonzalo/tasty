import request from 'supertest';
import app from '../app';
import { positionService } from '../services/positionService';
import { OptionType, PositionSide, CreatePositionDTO } from '../models/Position';

describe('Position API - Edge Cases and Advanced Validation', () => {
  beforeEach(() => {
    positionService.clearPositions();
  });

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

  describe('POST /api/positions - Input Validation Edge Cases', () => {
    it('should reject request with malformed JSON', async () => {
      const response = await request(app)
        .post('/api/positions')
        .set('Content-Type', 'application/json')
        .send('{"symbol": "AAPL", "optionType": INVALID}')
        .expect(400);
    });

    it('should handle very large strike prices', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), strikePrice: 999999999.99 })
        .expect(201);

      expect(response.body.strikePrice).toBe(999999999.99);
    });

    it('should handle very small positive strike prices', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), strikePrice: 0.0001 })
        .expect(201);

      expect(response.body.strikePrice).toBe(0.0001);
    });

    it('should handle fractional strike prices with many decimals', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), strikePrice: 150.123456 })
        .expect(201);

      expect(response.body.strikePrice).toBe(150.123456);
    });

    it('should handle very large quantities', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), quantity: 1000000 })
        .expect(201);

      expect(response.body.quantity).toBe(1000000);
    });

    it('should handle fractional quantities', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), quantity: 10.5 })
        .expect(201);

      expect(response.body.quantity).toBe(10.5);
    });

    it('should reject Infinity as strike price', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), strikePrice: Infinity })
        .expect(400);
    });

    it('should reject -Infinity as strike price', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), strikePrice: -Infinity })
        .expect(400);
    });

    it('should reject NaN as quantity', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), quantity: NaN })
        .expect(400);
    });

    it('should handle symbols with special characters', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), symbol: 'BRK.B' })
        .expect(201);

      expect(response.body.symbol).toBe('BRK.B');
    });

    it('should handle symbols with hyphens', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), symbol: 'SPY-W' })
        .expect(201);

      expect(response.body.symbol).toBe('SPY-W');
    });

    it('should handle symbols with numbers', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), symbol: 'STOCK123' })
        .expect(201);

      expect(response.body.symbol).toBe('STOCK123');
    });

    it('should handle very long symbol names', async () => {
      const longSymbol = 'A'.repeat(100);
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), symbol: longSymbol })
        .expect(201);

      expect(response.body.symbol).toBe(longSymbol);
    });

    it('should reject symbols with only whitespace', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), symbol: '   ' })
        .expect(400);
    });

    it('should reject symbols with tab characters', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), symbol: '\t' })
        .expect(400);
    });

    it('should reject symbols with newline characters', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), symbol: '\n' })
        .expect(400);
    });

    it('should reject lowercase option type', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), optionType: 'call' as any })
        .expect(400);
    });

    it('should reject mixed case option type', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), optionType: 'Call' as any })
        .expect(400);
    });

    it('should reject numeric option type', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), optionType: 1 as any })
        .expect(400);
    });

    it('should reject boolean option type', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), optionType: true as any })
        .expect(400);
    });

    it('should reject array as option type', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), optionType: ['CALL'] as any })
        .expect(400);
    });

    it('should reject object as strike price', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), strikePrice: { value: 150 } as any })
        .expect(400);
    });

    it('should reject array as quantity', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), quantity: [10] as any })
        .expect(400);
    });

    it('should handle ISO 8601 dates with timezone', async () => {
      const dateWithTz = '2024-12-20T00:00:00-05:00';
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), expirationDate: dateWithTz })
        .expect(201);

      expect(response.body.expirationDate).toBe(dateWithTz);
    });

    it('should handle ISO 8601 dates with milliseconds', async () => {
      const dateWithMs = '2024-12-20T12:34:56.789Z';
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), expirationDate: dateWithMs })
        .expect(201);

      expect(response.body.expirationDate).toBe(dateWithMs);
    });

    it('should accept various valid date formats', async () => {
      // Note: JavaScript Date.parse is very lenient and accepts many formats
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), expirationDate: '12/20/2024' })
        .expect(201);
    });

    it('should handle leap year dates', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), expirationDate: '2024-02-29' })
        .expect(201);
    });

    it('should handle date validation via Date.parse', async () => {
      // Note: JavaScript Date.parse is lenient and may accept some invalid dates
      // This is a known limitation of using Date.parse for validation
      const response = await request(app)
        .post('/api/positions')
        .send({ ...createValidPositionData(), expirationDate: 'not-a-date-at-all' })
        .expect(400);
    });
  });

  describe('POST /api/positions/batch - Edge Cases', () => {
    it('should handle large batch sizes', async () => {
      const largeBatch = Array.from({ length: 100 }, (_, i) => ({
        ...createValidPositionData(),
        symbol: `SYM${i}`
      }));

      const response = await request(app)
        .post('/api/positions/batch')
        .send(largeBatch)
        .expect(201);

      expect(response.body).toHaveLength(100);
    });

    it('should handle batch with identical positions', async () => {
      const identicalBatch = Array.from({ length: 5 }, () => createValidPositionData());

      const response = await request(app)
        .post('/api/positions/batch')
        .send(identicalBatch)
        .expect(201);

      expect(response.body).toHaveLength(5);
      // All should have unique IDs
      const ids = response.body.map((p: any) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(5);
    });

    it('should reject batch with string instead of array', async () => {
      const response = await request(app)
        .post('/api/positions/batch')
        .send('not an array')
        .expect(400);

      expect(response.body.error).toBe('Request body must be an array of positions');
    });

    it('should reject batch with number instead of array', async () => {
      // Note: Supertest/superagent may not handle primitive numbers well
      // Testing with a non-array object instead
      const response = await request(app)
        .post('/api/positions/batch')
        .send({ value: 123 })
        .expect(400);

      expect(response.body.error).toBe('Request body must be an array of positions');
    });

    it('should reject batch with null', async () => {
      const response = await request(app)
        .post('/api/positions/batch')
        .send(null as any)
        .expect(400);

      expect(response.body.error).toBe('Request body must be an array of positions');
    });

    it('should reject batch containing null elements', async () => {
      const response = await request(app)
        .post('/api/positions/batch')
        .send([createValidPositionData(), null, createValidPositionData()])
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Invalid position data at index 1');
    });

    it('should reject batch containing undefined elements', async () => {
      const response = await request(app)
        .post('/api/positions/batch')
        .send([createValidPositionData(), undefined, createValidPositionData()])
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toContain('Invalid position data at index 1');
    });

    it('should reject batch with mixed valid and invalid positions', async () => {
      const response = await request(app)
        .post('/api/positions/batch')
        .send([
          createValidPositionData(),
          { ...createValidPositionData(), strikePrice: -100 },
          createValidPositionData(),
          { ...createValidPositionData(), quantity: 0 }
        ])
        .expect(400);

      expect(response.body.error).toBe('Validation failed');
      expect(response.body.details).toHaveLength(2);
    });

    it('should validate all positions before creating any', async () => {
      // Create one valid position
      await positionService.createPosition(createValidPositionData());
      const initialCount = (await positionService.getPositions()).length;

      // Try to create batch with some invalid positions
      await request(app)
        .post('/api/positions/batch')
        .send([
          { ...createValidPositionData(), symbol: 'VALID1' },
          { ...createValidPositionData(), strikePrice: -100 } // Invalid
        ])
        .expect(400);

      // Verify no positions were created from the batch
      const finalCount = (await positionService.getPositions()).length;
      expect(finalCount).toBe(initialCount);
    });
  });

  describe('GET /api/positions/:id - Edge Cases', () => {
    it('should return 404 for non-existent UUID', async () => {
      const response = await request(app)
        .get('/api/positions/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);

      expect(response.body.error).toBe('Position not found');
    });

    it('should handle malformed UUID', async () => {
      const response = await request(app)
        .get('/api/positions/not-a-uuid')
        .expect(404);

      expect(response.body.error).toBe('Position not found');
    });

    it('should handle empty ID by returning all positions', async () => {
      // Note: GET /api/positions/ maps to the getPositions route, not getPosition
      const response = await request(app)
        .get('/api/positions/ ')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should handle very long ID strings', async () => {
      const longId = 'a'.repeat(1000);
      const response = await request(app)
        .get(`/api/positions/${longId}`)
        .expect(404);
    });

    it('should handle special characters in ID', async () => {
      const response = await request(app)
        .get('/api/positions/test@#$%^&*()')
        .expect(404);
    });
  });

  describe('PUT /api/positions/:id - Edge Cases', () => {
    it('should handle updating with empty object', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send({})
        .expect(200);

      expect(response.body.symbol).toBe(created.symbol);
    });

    it('should handle updating non-existent position', async () => {
      const response = await request(app)
        .put('/api/positions/550e8400-e29b-41d4-a716-446655440000')
        .send({ quantity: 20 })
        .expect(404);
    });

    it('should allow updating to same value', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send({ quantity: created.quantity })
        .expect(200);

      expect(response.body.quantity).toBe(created.quantity);
    });

    it('should allow updating all fields', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send({
          symbol: 'NEWSTOCK',
          optionType: OptionType.PUT,
          strikePrice: 200,
          expirationDate: '2026-01-01',
          positionSide: PositionSide.SHORT,
          quantity: 50,
          entryPrice: 10.5,
          entryDate: '2025-06-01'
        })
        .expect(200);

      expect(response.body.symbol).toBe('NEWSTOCK');
      expect(response.body.optionType).toBe(OptionType.PUT);
    });

    it('should allow updating position fields', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .put(`/api/positions/${created.id}`)
        .send({ quantity: 20 })
        .expect(200);

      expect(response.body.quantity).toBe(20);
      expect(response.body.id).toBe(created.id);
    });
  });

  describe('DELETE /api/positions/:id - Edge Cases', () => {
    it('should return 404 for non-existent position', async () => {
      const response = await request(app)
        .delete('/api/positions/550e8400-e29b-41d4-a716-446655440000')
        .expect(404);
    });

    it('should handle deleting same position twice', async () => {
      const created = await positionService.createPosition(createValidPositionData());

      await request(app)
        .delete(`/api/positions/${created.id}`)
        .expect(204);

      await request(app)
        .delete(`/api/positions/${created.id}`)
        .expect(404);
    });

    it('should handle malformed UUID in delete', async () => {
      const response = await request(app)
        .delete('/api/positions/not-a-uuid')
        .expect(404);
    });
  });

  describe('Content-Type Validation', () => {
    it('should handle missing Content-Type header', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send(createValidPositionData());

      // Should still work as Express handles this gracefully
      expect([201, 400]).toContain(response.status);
    });

    it('should accept application/json content type', async () => {
      const response = await request(app)
        .post('/api/positions')
        .set('Content-Type', 'application/json')
        .send(createValidPositionData())
        .expect(201);
    });

    it('should accept application/json with charset', async () => {
      const response = await request(app)
        .post('/api/positions')
        .set('Content-Type', 'application/json; charset=utf-8')
        .send(createValidPositionData())
        .expect(201);
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle concurrent position creation', async () => {
      const promises = Array.from({ length: 10 }, (_, i) =>
        request(app)
          .post('/api/positions')
          .send({ ...createValidPositionData(), symbol: `CONC${i}` })
      );

      const responses = await Promise.all(promises);

      responses.forEach(res => {
        expect(res.status).toBe(201);
      });

      const allPositions = await positionService.getPositions();
      expect(allPositions.length).toBeGreaterThanOrEqual(10);
    });

    it('should handle concurrent updates to different positions', async () => {
      const pos1 = await positionService.createPosition(
        createValidPositionData()
      );
      const pos2 = await positionService.createPosition(
        { ...createValidPositionData(), symbol: 'MSFT' }
      );

      const promises = [
        request(app)
          .put(`/api/positions/${pos1.id}`)
          .send({ quantity: 100 }),
        request(app)
          .put(`/api/positions/${pos2.id}`)
          .send({ quantity: 200 })
      ];

      const responses = await Promise.all(promises);

      expect(responses[0].body.quantity).toBe(100);
      expect(responses[1].body.quantity).toBe(200);
    });
  });

  describe('Response Format Validation', () => {
    it('should return position with all required fields', async () => {
      const response = await request(app)
        .post('/api/positions')
        .send(createValidPositionData())
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('symbol');
      expect(response.body).toHaveProperty('optionType');
      expect(response.body).toHaveProperty('strikePrice');
      expect(response.body).toHaveProperty('expirationDate');
      expect(response.body).toHaveProperty('positionSide');
      expect(response.body).toHaveProperty('quantity');
      expect(response.body).toHaveProperty('entryPrice');
      expect(response.body).toHaveProperty('entryDate');
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return array of positions with correct structure', async () => {
      await positionService.createPosition(createValidPositionData());

      const response = await request(app)
        .get('/api/positions')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('symbol');
    });
  });

  describe('State Management', () => {
    it('should maintain data consistency across multiple operations', async () => {
      // Create
      const created = await request(app)
        .post('/api/positions')
        .send(createValidPositionData())
        .expect(201);

      // Read
      const retrieved = await request(app)
        .get(`/api/positions/${created.body.id}`)
        .expect(200);

      expect(retrieved.body).toEqual(created.body);

      // Update
      const updated = await request(app)
        .put(`/api/positions/${created.body.id}`)
        .send({ quantity: 99 })
        .expect(200);

      expect(updated.body.quantity).toBe(99);

      // Read again
      const retrievedAfterUpdate = await request(app)
        .get(`/api/positions/${created.body.id}`)
        .expect(200);

      expect(retrievedAfterUpdate.body.quantity).toBe(99);

      // Delete
      await request(app)
        .delete(`/api/positions/${created.body.id}`)
        .expect(204);

      // Verify deletion
      await request(app)
        .get(`/api/positions/${created.body.id}`)
        .expect(404);
    });
  });
});
