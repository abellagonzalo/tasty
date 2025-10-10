import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import axios from 'axios';
import { OptionType, PositionSide, CreatePositionDTO } from '../../types/Position';
import path from 'path';

const { string, regex } = MatchersV3;

// ISO 8601 timestamp regex pattern
const iso8601Pattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/;

describe('Position API Pact Tests', () => {
  const provider = new PactV3({
    consumer: 'TastyFrontend',
    provider: 'TastyBackend',
    dir: path.resolve(process.cwd(), 'pact', 'pacts'),
    logLevel: 'warn',
  });

  const mockPosition: CreatePositionDTO = {
    symbol: 'AAPL',
    optionType: OptionType.CALL,
    strikePrice: 150,
    expirationDate: '2024-12-20T00:00:00.000Z',
    positionSide: PositionSide.LONG,
    quantity: 10,
    entryPrice: 5.25,
    entryDate: '2024-01-15T00:00:00.000Z',
  };

  describe('POST /api/positions - Create single position', () => {
    it('creates a position successfully', () => {
      return provider
        .given('no positions exist')
        .uponReceiving('a request to create a single position')
        .withRequest({
          method: 'POST',
          path: '/api/positions',
          headers: {
            'Content-Type': 'application/json',
          },
          body: mockPosition,
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            id: string('test-id-123'),
            ...mockPosition,
            createdAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
            updatedAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
          },
        })
        .executeTest(async (mockserver) => {
          const response = await axios.post(
            `${mockserver.url}/api/positions`,
            mockPosition,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          expect(response.data).toHaveProperty('id');
          expect(response.data.symbol).toBe('AAPL');
          expect(response.data.optionType).toBe(OptionType.CALL);
          expect(response.data.strikePrice).toBe(150);
          expect(response.data.quantity).toBe(10);
          expect(response.data.entryPrice).toBe(5.25);
          expect(response.data).toHaveProperty('createdAt');
          expect(response.data).toHaveProperty('updatedAt');
        });
    });
  });

  describe('POST /api/positions/batch - Create multiple positions', () => {
    it('creates multiple positions successfully', () => {
      const mockPositions: CreatePositionDTO[] = [
        mockPosition,
        {
          ...mockPosition,
          symbol: 'TSLA',
          strikePrice: 200,
        },
      ];

      return provider
        .given('no positions exist')
        .uponReceiving('a request to create multiple positions')
        .withRequest({
          method: 'POST',
          path: '/api/positions/batch',
          headers: {
            'Content-Type': 'application/json',
          },
          body: mockPositions,
        })
        .willRespondWith({
          status: 201,
          headers: {
            'Content-Type': 'application/json',
          },
          body: [
            {
              id: string('test-id-1'),
              ...mockPositions[0],
              createdAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
              updatedAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
            },
            {
              id: string('test-id-2'),
              ...mockPositions[1],
              createdAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
              updatedAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
            },
          ],
        })
        .executeTest(async (mockserver) => {
          const response = await axios.post(
            `${mockserver.url}/api/positions/batch`,
            mockPositions,
            {
              headers: { 'Content-Type': 'application/json' },
            }
          );

          expect(Array.isArray(response.data)).toBe(true);
          expect(response.data).toHaveLength(2);
          expect(response.data[0]).toHaveProperty('id');
          expect(response.data[0].symbol).toBe('AAPL');
          expect(response.data[1].symbol).toBe('TSLA');
        });
    });
  });

  describe('GET /api/positions - Get all positions', () => {
    it('retrieves all positions successfully', () => {
      return provider
        .given('positions exist')
        .uponReceiving('a request to get all positions')
        .withRequest({
          method: 'GET',
          path: '/api/positions',
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: [
            {
              id: string('test-id-1'),
              ...mockPosition,
              createdAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
              updatedAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
            },
          ],
        })
        .executeTest(async (mockserver) => {
          const response = await axios.get(`${mockserver.url}/api/positions`);

          expect(Array.isArray(response.data)).toBe(true);
          expect(response.data).toHaveLength(1);
          expect(response.data[0]).toHaveProperty('id');
          expect(response.data[0].symbol).toBe('AAPL');
        });
    });
  });

  describe('GET /api/positions/:id - Get position by ID', () => {
    it('retrieves a position by ID successfully', () => {
      const testId = 'test-id-123';

      return provider
        .given('a position with ID test-id-123 exists')
        .uponReceiving('a request to get a position by ID')
        .withRequest({
          method: 'GET',
          path: `/api/positions/${testId}`,
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            id: testId,
            ...mockPosition,
            createdAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
            updatedAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
          },
        })
        .executeTest(async (mockserver) => {
          const response = await axios.get(
            `${mockserver.url}/api/positions/${testId}`
          );

          expect(response.data.id).toBe(testId);
          expect(response.data.symbol).toBe('AAPL');
          expect(response.data.strikePrice).toBe(150);
        });
    });
  });

  describe('PUT /api/positions/:id - Update position', () => {
    it('updates a position successfully', () => {
      const testId = 'test-id-123';
      const updateData = {
        quantity: 20,
        entryPrice: 6.0,
      };

      return provider
        .given('a position with ID test-id-123 exists')
        .uponReceiving('a request to update a position')
        .withRequest({
          method: 'PUT',
          path: `/api/positions/${testId}`,
          headers: {
            'Content-Type': 'application/json',
          },
          body: updateData,
        })
        .willRespondWith({
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            id: testId,
            ...mockPosition,
            quantity: updateData.quantity,
            entryPrice: updateData.entryPrice,
            createdAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
            updatedAt: regex(iso8601Pattern, '2024-01-15T00:00:00.000Z'),
          },
        })
        .executeTest(async (mockserver) => {
          const response = await axios.put(
            `${mockserver.url}/api/positions/${testId}`,
            updateData,
            { headers: { 'Content-Type': 'application/json' } }
          );

          expect(response.data.id).toBe(testId);
          expect(response.data.quantity).toBe(20);
          expect(response.data.entryPrice).toBe(6.0);
        });
    });
  });

  describe('DELETE /api/positions/:id - Delete position', () => {
    it('deletes a position successfully', () => {
      const testId = 'test-id-123';

      return provider
        .given('a position with ID test-id-123 exists')
        .uponReceiving('a request to delete a position')
        .withRequest({
          method: 'DELETE',
          path: `/api/positions/${testId}`,
        })
        .willRespondWith({
          status: 204,
        })
        .executeTest(async (mockserver) => {
          const response = await axios.delete(
            `${mockserver.url}/api/positions/${testId}`
          );

          expect(response.status).toBe(204);
        });
    });
  });

  describe('Error scenarios', () => {
    it('returns 404 for non-existent position', () => {
      const nonExistentId = 'non-existent-id';

      return provider
        .given('no positions exist')
        .uponReceiving('a request to get a non-existent position')
        .withRequest({
          method: 'GET',
          path: `/api/positions/${nonExistentId}`,
        })
        .willRespondWith({
          status: 404,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            error: string('Position not found'),
          },
        })
        .executeTest(async (mockserver) => {
          try {
            await axios.get(`${mockserver.url}/api/positions/${nonExistentId}`);
            fail('Should have thrown an error');
          } catch (error: any) {
            expect(error.response.status).toBe(404);
            expect(error.response.data.error).toBe('Position not found');
          }
        });
    });

    it('returns 400 for invalid position data', () => {
      const invalidPosition = {
        symbol: 'AAPL',
        // Missing required fields
      };

      return provider
        .given('no positions exist')
        .uponReceiving('a request with invalid position data')
        .withRequest({
          method: 'POST',
          path: '/api/positions',
          headers: {
            'Content-Type': 'application/json',
          },
          body: invalidPosition,
        })
        .willRespondWith({
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          },
          body: {
            error: string('Validation error'),
          },
        })
        .executeTest(async (mockserver) => {
          try {
            await axios.post(`${mockserver.url}/api/positions`, invalidPosition, {
              headers: { 'Content-Type': 'application/json' },
            });
            fail('Should have thrown an error');
          } catch (error: any) {
            expect(error.response.status).toBe(400);
            expect(error.response.data.error).toBe('Validation error');
          }
        });
    });
  });
});
