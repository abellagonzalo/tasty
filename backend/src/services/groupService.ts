import { v4 as uuidv4 } from 'uuid';
import { TradeGroup, CreateTradeGroupDTO } from '../models/TradeGroup';

// In-memory storage for trade groups
let groups: TradeGroup[] = [];

/**
 * Create a new trade group
 */
export const createGroup = (groupData: CreateTradeGroupDTO): TradeGroup => {
  const now = new Date().toISOString();
  const newGroup: TradeGroup = {
    id: uuidv4(),
    strategy: groupData.strategy,
    underlying: groupData.underlying,
    grossProceeds: groupData.grossProceeds,
    createdAt: now,
    updatedAt: now,
  };

  groups.push(newGroup);
  return newGroup;
};

/**
 * Get all trade groups
 */
export const getGroups = (): TradeGroup[] => {
  return [...groups];
};

/**
 * Get a specific trade group by ID
 */
export const getGroupById = (id: string): TradeGroup | undefined => {
  return groups.find(group => group.id === id);
};

/**
 * Get trade groups by underlying symbol
 */
export const getGroupsByUnderlying = (underlying: string): TradeGroup[] => {
  return groups.filter(group => group.underlying === underlying);
};

/**
 * Update a trade group
 */
export const updateGroup = (
  id: string,
  updates: Partial<Omit<TradeGroup, 'id' | 'createdAt'>>
): TradeGroup => {
  const index = groups.findIndex(group => group.id === id);

  if (index === -1) {
    throw new Error(`Group with id ${id} not found`);
  }

  const updatedGroup: TradeGroup = {
    ...groups[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  groups[index] = updatedGroup;
  return updatedGroup;
};

/**
 * Delete a trade group
 */
export const deleteGroup = (id: string): boolean => {
  const initialLength = groups.length;
  groups = groups.filter(group => group.id !== id);
  return groups.length < initialLength;
};

/**
 * Clear all groups (useful for testing)
 */
export const clearGroups = (): void => {
  groups = [];
};
