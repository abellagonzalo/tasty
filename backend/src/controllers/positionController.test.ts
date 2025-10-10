import { Request, Response } from 'express';
import { PositionController } from './positionController';
import { positionService } from '../services/positionService';
import { OptionType, PositionSide, CreatePositionDTO } from '../models/Position';

describe('PositionController - Validation Tests', () => {
  let controller: PositionController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let sendMock: jest.Mock;

  beforeEach(() => {
    controller = new PositionController();
    positionService.clearPositions();

    jsonMock = jest.fn();
    statusMock = jest.fn().mockReturnValue({ json: jsonMock, send: jest.fn() });
    sendMock = jest.fn();

    mockResponse = {
      status: statusMock,
      json: jsonMock,
      send: sendMock
    };

    mockRequest = {
      body: {},
      params: {}
    };
  });

  const createValidPositionDTO = (): CreatePositionDTO => ({
    symbol: 'AAPL',
    optionType: OptionType.CALL,
    strikePrice: 150,
    expirationDate: '2025-12-31',
    positionSide: PositionSide.LONG,
    quantity: 10,
    entryPrice: 5.5,
    entryDate: '2025-01-01'
  });

  describe('createPosition - Validation Tests', () => {
    it('should reject undefined body', async () => {
      mockRequest.body = undefined;

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject null body', async () => {
      mockRequest.body = null;

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject empty object', async () => {
      mockRequest.body = {};

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject missing symbol', async () => {
      const data = createValidPositionDTO();
      delete (data as any).symbol;
      mockRequest.body = data;

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject empty string symbol', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: '' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject whitespace-only symbol', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: '   ' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject non-string symbol', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: 123 as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject invalid option type', async () => {
      mockRequest.body = { ...createValidPositionDTO(), optionType: 'INVALID' as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject numeric option type', async () => {
      mockRequest.body = { ...createValidPositionDTO(), optionType: 1 as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject lowercase option type', async () => {
      mockRequest.body = { ...createValidPositionDTO(), optionType: 'call' as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject negative strike price', async () => {
      mockRequest.body = { ...createValidPositionDTO(), strikePrice: -150 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject zero strike price', async () => {
      mockRequest.body = { ...createValidPositionDTO(), strikePrice: 0 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject non-numeric strike price', async () => {
      mockRequest.body = { ...createValidPositionDTO(), strikePrice: '150' as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject NaN strike price', async () => {
      mockRequest.body = { ...createValidPositionDTO(), strikePrice: NaN };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject Infinity strike price', async () => {
      mockRequest.body = { ...createValidPositionDTO(), strikePrice: Infinity };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject invalid expiration date', async () => {
      mockRequest.body = { ...createValidPositionDTO(), expirationDate: 'not-a-date' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject empty expiration date', async () => {
      mockRequest.body = { ...createValidPositionDTO(), expirationDate: '' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject numeric expiration date', async () => {
      mockRequest.body = { ...createValidPositionDTO(), expirationDate: 20251231 as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject invalid position side', async () => {
      mockRequest.body = { ...createValidPositionDTO(), positionSide: 'INVALID' as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject lowercase position side', async () => {
      mockRequest.body = { ...createValidPositionDTO(), positionSide: 'long' as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject negative quantity', async () => {
      mockRequest.body = { ...createValidPositionDTO(), quantity: -10 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject zero quantity', async () => {
      mockRequest.body = { ...createValidPositionDTO(), quantity: 0 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject non-numeric quantity', async () => {
      mockRequest.body = { ...createValidPositionDTO(), quantity: '10' as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject negative entry price', async () => {
      mockRequest.body = { ...createValidPositionDTO(), entryPrice: -5.5 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should accept zero entry price', async () => {
      mockRequest.body = { ...createValidPositionDTO(), entryPrice: 0 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should reject non-numeric entry price', async () => {
      mockRequest.body = { ...createValidPositionDTO(), entryPrice: '5.5' as any };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should reject invalid entry date', async () => {
      mockRequest.body = { ...createValidPositionDTO(), entryDate: 'invalid-date' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Invalid position data' });
    });

    it('should accept valid position data', async () => {
      mockRequest.body = createValidPositionDTO();

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalled();
    });
  });

  describe('createPositions - Batch Validation Tests', () => {
    it('should reject non-array input', async () => {
      mockRequest.body = { notAnArray: 'test' };

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Request body must be an array of positions' });
    });

    it('should reject empty array', async () => {
      mockRequest.body = [];

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'No positions provided' });
    });

    it('should reject undefined body', async () => {
      mockRequest.body = undefined;

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should reject null body', async () => {
      mockRequest.body = null;

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should reject array with invalid positions', async () => {
      mockRequest.body = [
        createValidPositionDTO(),
        { ...createValidPositionDTO(), strikePrice: -100 }, // Invalid
        createValidPositionDTO()
      ];

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Invalid position data at index 1']
      });
    });

    it('should reject array with multiple invalid positions', async () => {
      mockRequest.body = [
        createValidPositionDTO(),
        { ...createValidPositionDTO(), strikePrice: 0 }, // Invalid
        { ...createValidPositionDTO(), quantity: -5 }, // Invalid
        createValidPositionDTO()
      ];

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: [
          'Invalid position data at index 1',
          'Invalid position data at index 2'
        ]
      });
    });

    it('should accept array with all valid positions', async () => {
      mockRequest.body = [
        createValidPositionDTO(),
        { ...createValidPositionDTO(), symbol: 'MSFT' },
        { ...createValidPositionDTO(), symbol: 'GOOGL' }
      ];

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should reject if first position is invalid', async () => {
      mockRequest.body = [
        { ...createValidPositionDTO(), symbol: '' }, // Invalid
        createValidPositionDTO(),
        createValidPositionDTO()
      ];

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Invalid position data at index 0']
      });
    });

    it('should reject if last position is invalid', async () => {
      mockRequest.body = [
        createValidPositionDTO(),
        createValidPositionDTO(),
        { ...createValidPositionDTO(), quantity: 0 } // Invalid
      ];

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Invalid position data at index 2']
      });
    });

    it('should reject array with null elements', async () => {
      mockRequest.body = [
        createValidPositionDTO(),
        null,
        createValidPositionDTO()
      ];

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Invalid position data at index 1']
      });
    });

    it('should reject array with undefined elements', async () => {
      mockRequest.body = [
        createValidPositionDTO(),
        undefined,
        createValidPositionDTO()
      ];

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Validation failed',
        details: ['Invalid position data at index 1']
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle service errors gracefully', async () => {
      mockRequest.body = createValidPositionDTO();

      // Mock service to throw error
      jest.spyOn(positionService, 'createPosition').mockRejectedValueOnce(
        new Error('Service error')
      );

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Failed to create position' });
    });

    it('should handle batch service errors gracefully', async () => {
      mockRequest.body = [createValidPositionDTO()];

      // Mock service to throw error
      jest.spyOn(positionService, 'createPositions').mockRejectedValueOnce(
        new Error('Batch service error')
      );

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to create positions',
        details: 'Batch service error'
      });
    });

    it('should handle non-Error exceptions', async () => {
      mockRequest.body = [createValidPositionDTO()];

      // Mock service to throw non-Error
      jest.spyOn(positionService, 'createPositions').mockRejectedValueOnce(
        'String error'
      );

      await controller.createPositions(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({
        error: 'Failed to create positions',
        details: 'Unknown error'
      });
    });
  });

  describe('Edge Cases - Special Characters and Encoding', () => {
    it('should accept symbols with dots', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: 'BRK.B' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should accept symbols with hyphens', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: 'SPY-W' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should accept symbols with numbers', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: 'STOCK123' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should reject symbols with only whitespace', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: '   ' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should reject symbols with tabs', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: '\t' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });

    it('should reject symbols with newlines', async () => {
      mockRequest.body = { ...createValidPositionDTO(), symbol: '\n' };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(400);
    });
  });

  describe('Numeric Boundary Tests', () => {
    it('should accept fractional strike prices', async () => {
      mockRequest.body = { ...createValidPositionDTO(), strikePrice: 150.5 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should accept very large strike prices', async () => {
      mockRequest.body = { ...createValidPositionDTO(), strikePrice: 999999.99 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should accept very small positive strike prices', async () => {
      mockRequest.body = { ...createValidPositionDTO(), strikePrice: 0.01 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should accept fractional quantities', async () => {
      mockRequest.body = { ...createValidPositionDTO(), quantity: 10.5 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });

    it('should accept very small positive quantities', async () => {
      mockRequest.body = { ...createValidPositionDTO(), quantity: 0.01 };

      await controller.createPosition(
        mockRequest as Request,
        mockResponse as Response
      );

      expect(statusMock).toHaveBeenCalledWith(201);
    });
  });
});
