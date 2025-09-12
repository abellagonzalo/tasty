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

  async createPositions(positionsData: CreatePositionDTO[]): Promise<Position[]> {
    const now = new Date().toISOString();
    
    const newPositions = positionsData.map(positionData => ({
      id: uuidv4(),
      ...positionData,
      createdAt: now,
      updatedAt: now
    }));

    // Add all positions
    this.positions.push(...newPositions);
    
    return newPositions;
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

  // Helper method to check for duplicate positions
  private isDuplicatePosition(position: CreatePositionDTO): boolean {
    return this.positions.some(p => 
      p.symbol === position.symbol &&
      p.optionType === position.optionType &&
      p.strikePrice === position.strikePrice &&
      p.expirationDate === position.expirationDate
    );
  }
}

export const positionService = new PositionService();