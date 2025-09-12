import { Position, CreatePositionDTO } from '../models/Position';
import { v4 as uuidv4 } from 'uuid';

class PositionService {
  private positions: Position[] = [];

  async createPosition(positionData: CreatePositionDTO): Promise<Position> {
    const now = new Date().toISOString();
    
    const position: Position = {
      id: uuidv4(),
      ...positionData,
      createdAt: now,
      updatedAt: now
    };

    this.positions.push(position);
    return position;
  }

  async getPositions(): Promise<Position[]> {
    return [...this.positions];
  }

  async getPosition(id: string): Promise<Position | null> {
    const position = this.positions.find(p => p.id === id);
    return position || null;
  }

  async updatePosition(id: string, positionData: Partial<CreatePositionDTO>): Promise<Position | null> {
    const index = this.positions.findIndex(p => p.id === id);
    if (index === -1) return null;

    const updatedPosition: Position = {
      ...this.positions[index],
      ...positionData,
      updatedAt: new Date().toISOString()
    };

    this.positions[index] = updatedPosition;
    return updatedPosition;
  }

  async deletePosition(id: string): Promise<boolean> {
    const index = this.positions.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.positions.splice(index, 1);
    return true;
  }
}

export const positionService = new PositionService();