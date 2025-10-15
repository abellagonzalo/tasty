import { Position } from '../models/Position';
import { TradeGroup, CreateTradeGroupDTO } from '../models/TradeGroup';

// Contract multiplier for options (standard is 100)
const CONTRACT_MULTIPLIER = 100;

export interface GroupingResult {
  groups: CreateTradeGroupDTO[];
  positionsWithGroups: Array<{ position: Position; groupKey: string }>;
}

/**
 * Generate a group key from entryDate and underlying symbol
 */
const generateGroupKey = (entryDate: string, underlying: string): string => {
  return `${entryDate}_${underlying}`;
};

/**
 * Generate strategy name from the date portion of an entryDate timestamp
 * Example: "2025-01-15T10:30:00.000Z" -> "strategy-2025-01-15"
 */
export const generateStrategyName = (entryDate: string): string => {
  const date = entryDate.split('T')[0];
  return `strategy-${date}`;
};

/**
 * Calculate gross proceeds for a single position
 * Formula: abs(quantity) × entryPrice × CONTRACT_MULTIPLIER
 */
export const calculatePositionGrossProceeds = (position: Position): number => {
  return Math.abs(position.quantity) * position.entryPrice * CONTRACT_MULTIPLIER;
};

/**
 * Calculate total gross proceeds for an array of positions
 */
export const calculateGrossProceeds = (positions: Position[]): number => {
  return positions.reduce((sum, position) => sum + calculatePositionGrossProceeds(position), 0);
};

/**
 * Main grouping algorithm: Groups positions by exact timestamp and underlying symbol
 *
 * @param positions - Array of positions to group
 * @returns GroupingResult containing groups and positions with their assigned group keys
 */
export const groupPositions = (positions: Position[]): GroupingResult => {
  // Sort positions by entryDate (ascending)
  const sortedPositions = [...positions].sort((a, b) =>
    a.entryDate.localeCompare(b.entryDate)
  );

  // Group positions by (entryDate + underlying)
  const positionsByGroup = new Map<string, Position[]>();

  for (const position of sortedPositions) {
    const groupKey = generateGroupKey(position.entryDate, position.symbol);

    if (!positionsByGroup.has(groupKey)) {
      positionsByGroup.set(groupKey, []);
    }

    positionsByGroup.get(groupKey)!.push(position);
  }

  // Create TradeGroup DTOs for each group
  const groups: CreateTradeGroupDTO[] = [];
  const positionsWithGroups: Array<{ position: Position; groupKey: string }> = [];

  for (const [groupKey, groupPositions] of positionsByGroup.entries()) {
    // Use the first position's entryDate to generate strategy name
    const firstPosition = groupPositions[0];
    const strategy = generateStrategyName(firstPosition.entryDate);
    const underlying = firstPosition.symbol;
    const grossProceeds = calculateGrossProceeds(groupPositions);

    const group: CreateTradeGroupDTO = {
      strategy,
      underlying,
      grossProceeds,
    };

    groups.push(group);

    // Track which positions belong to which group
    for (const position of groupPositions) {
      positionsWithGroups.push({ position, groupKey });
    }
  }

  return {
    groups,
    positionsWithGroups,
  };
};
