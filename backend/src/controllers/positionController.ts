import { Request, Response } from 'express';
import { positionService } from '../services/positionService';
import { CreatePositionDTO, OptionType, PositionSide } from '../models/Position';

export class PositionController {
  async createPosition(req: Request, res: Response) {
    try {
      const positionData: CreatePositionDTO = req.body;
      
      // Basic validation
      if (!this.validatePositionData(positionData)) {
        return res.status(400).json({ error: 'Invalid position data' });
      }

      const position = await positionService.createPosition(positionData);
      res.status(201).json(position);
    } catch (error) {
      res.status(500).json({ error: 'Failed to create position' });
    }
  }

  async getPositions(req: Request, res: Response) {
    try {
      const positions = await positionService.getPositions();
      res.json(positions);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch positions' });
    }
  }

  async getPosition(req: Request, res: Response) {
    try {
      const position = await positionService.getPosition(req.params.id);
      if (!position) {
        return res.status(404).json({ error: 'Position not found' });
      }
      res.json(position);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch position' });
    }
  }

  async updatePosition(req: Request, res: Response) {
    try {
      const position = await positionService.updatePosition(req.params.id, req.body);
      if (!position) {
        return res.status(404).json({ error: 'Position not found' });
      }
      res.json(position);
    } catch (error) {
      res.status(500).json({ error: 'Failed to update position' });
    }
  }

  async deletePosition(req: Request, res: Response) {
    try {
      const success = await positionService.deletePosition(req.params.id);
      if (!success) {
        return res.status(404).json({ error: 'Position not found' });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete position' });
    }
  }

  private validatePositionData(data: CreatePositionDTO): boolean {
    return (
      typeof data.symbol === 'string' &&
      data.symbol.length > 0 &&
      Object.values(OptionType).includes(data.optionType) &&
      typeof data.strikePrice === 'number' &&
      data.strikePrice > 0 &&
      !isNaN(Date.parse(data.expirationDate)) &&
      Object.values(PositionSide).includes(data.positionSide) &&
      typeof data.quantity === 'number' &&
      data.quantity > 0 &&
      typeof data.entryPrice === 'number' &&
      data.entryPrice >= 0 &&
      !isNaN(Date.parse(data.entryDate))
    );
  }
}