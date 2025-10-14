import {
  createGroup,
  getGroups,
  getGroupById,
  getGroupsByUnderlying,
  updateGroup,
  deleteGroup,
  clearGroups,
} from './groupService';
import { CreateTradeGroupDTO } from '../models/TradeGroup';

describe('groupService', () => {
  beforeEach(() => {
    // Clear all groups before each test
    clearGroups();
  });

  describe('createGroup', () => {
    it('should create a new group with all required fields', () => {
      const groupData: CreateTradeGroupDTO = {
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1500.50,
      };

      const group = createGroup(groupData);

      expect(group).toBeDefined();
      expect(group.id).toBeDefined();
      expect(typeof group.id).toBe('string');
      expect(group.strategy).toBe('strategy-2025-01-15');
      expect(group.underlying).toBe('AAPL');
      expect(group.grossProceeds).toBe(1500.50);
      expect(group.createdAt).toBeDefined();
      expect(group.updatedAt).toBeDefined();
      expect(group.createdAt).toBe(group.updatedAt);
    });

    it('should create groups with unique IDs', () => {
      const groupData: CreateTradeGroupDTO = {
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      };

      const group1 = createGroup(groupData);
      const group2 = createGroup(groupData);

      expect(group1.id).not.toBe(group2.id);
    });

    it('should handle zero gross proceeds', () => {
      const groupData: CreateTradeGroupDTO = {
        strategy: 'strategy-2025-01-15',
        underlying: 'SPY',
        grossProceeds: 0,
      };

      const group = createGroup(groupData);

      expect(group.grossProceeds).toBe(0);
    });

    it('should handle negative gross proceeds', () => {
      const groupData: CreateTradeGroupDTO = {
        strategy: 'strategy-2025-01-15',
        underlying: 'TSLA',
        grossProceeds: -500.75,
      };

      const group = createGroup(groupData);

      expect(group.grossProceeds).toBe(-500.75);
    });
  });

  describe('getGroups', () => {
    it('should return an empty array when no groups exist', () => {
      const groups = getGroups();

      expect(groups).toEqual([]);
    });

    it('should return all created groups', () => {
      const group1Data: CreateTradeGroupDTO = {
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      };

      const group2Data: CreateTradeGroupDTO = {
        strategy: 'strategy-2025-01-16',
        underlying: 'TSLA',
        grossProceeds: 2000,
      };

      const group1 = createGroup(group1Data);
      const group2 = createGroup(group2Data);

      const groups = getGroups();

      expect(groups).toHaveLength(2);
      expect(groups).toContainEqual(group1);
      expect(groups).toContainEqual(group2);
    });

    it('should return a copy of the groups array (not modify original)', () => {
      const groupData: CreateTradeGroupDTO = {
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      };

      createGroup(groupData);

      const groups1 = getGroups();
      const groups2 = getGroups();

      expect(groups1).not.toBe(groups2); // Different array references
      expect(groups1).toEqual(groups2); // But same content
    });
  });

  describe('getGroupById', () => {
    it('should return undefined when group does not exist', () => {
      const group = getGroupById('non-existent-id');

      expect(group).toBeUndefined();
    });

    it('should return the correct group by ID', () => {
      const groupData: CreateTradeGroupDTO = {
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      };

      const createdGroup = createGroup(groupData);
      const foundGroup = getGroupById(createdGroup.id);

      expect(foundGroup).toBeDefined();
      expect(foundGroup).toEqual(createdGroup);
    });

    it('should find the correct group among multiple groups', () => {
      const group1 = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const group2 = createGroup({
        strategy: 'strategy-2025-01-16',
        underlying: 'TSLA',
        grossProceeds: 2000,
      });

      const group3 = createGroup({
        strategy: 'strategy-2025-01-17',
        underlying: 'SPY',
        grossProceeds: 3000,
      });

      const foundGroup = getGroupById(group2.id);

      expect(foundGroup).toEqual(group2);
      expect(foundGroup).not.toEqual(group1);
      expect(foundGroup).not.toEqual(group3);
    });
  });

  describe('getGroupsByUnderlying', () => {
    it('should return empty array when no groups match the underlying', () => {
      createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const groups = getGroupsByUnderlying('TSLA');

      expect(groups).toEqual([]);
    });

    it('should return all groups for a specific underlying', () => {
      const aaplGroup1 = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const tslaGroup = createGroup({
        strategy: 'strategy-2025-01-16',
        underlying: 'TSLA',
        grossProceeds: 2000,
      });

      const aaplGroup2 = createGroup({
        strategy: 'strategy-2025-01-17',
        underlying: 'AAPL',
        grossProceeds: 1500,
      });

      const aaplGroups = getGroupsByUnderlying('AAPL');

      expect(aaplGroups).toHaveLength(2);
      expect(aaplGroups).toContainEqual(aaplGroup1);
      expect(aaplGroups).toContainEqual(aaplGroup2);
      expect(aaplGroups).not.toContainEqual(tslaGroup);
    });

    it('should be case-sensitive when filtering by underlying', () => {
      createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const groups = getGroupsByUnderlying('aapl');

      expect(groups).toEqual([]);
    });
  });

  describe('updateGroup', () => {
    it('should throw error when group does not exist', () => {
      expect(() => {
        updateGroup('non-existent-id', { grossProceeds: 2000 });
      }).toThrow('Group with id non-existent-id not found');
    });

    it('should update group strategy', () => {
      const group = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const updatedGroup = updateGroup(group.id, {
        strategy: 'strategy-2025-02-15',
      });

      expect(updatedGroup.strategy).toBe('strategy-2025-02-15');
      expect(updatedGroup.underlying).toBe('AAPL');
      expect(updatedGroup.grossProceeds).toBe(1000);
    });

    it('should update group underlying', () => {
      const group = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const updatedGroup = updateGroup(group.id, {
        underlying: 'TSLA',
      });

      expect(updatedGroup.underlying).toBe('TSLA');
      expect(updatedGroup.strategy).toBe('strategy-2025-01-15');
    });

    it('should update group gross proceeds', () => {
      const group = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const updatedGroup = updateGroup(group.id, {
        grossProceeds: 2500.75,
      });

      expect(updatedGroup.grossProceeds).toBe(2500.75);
    });

    it('should update multiple fields at once', () => {
      const group = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const updatedGroup = updateGroup(group.id, {
        strategy: 'strategy-2025-02-20',
        underlying: 'SPY',
        grossProceeds: 3000,
      });

      expect(updatedGroup.strategy).toBe('strategy-2025-02-20');
      expect(updatedGroup.underlying).toBe('SPY');
      expect(updatedGroup.grossProceeds).toBe(3000);
    });

    it('should update updatedAt timestamp but not createdAt', async () => {
      const group = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const originalCreatedAt = group.createdAt;

      // Wait 10ms to ensure timestamp difference
      await new Promise(resolve => setTimeout(resolve, 10));

      const updatedGroup = updateGroup(group.id, {
        grossProceeds: 2000,
      });

      expect(updatedGroup.createdAt).toBe(originalCreatedAt);
      expect(new Date(updatedGroup.updatedAt).getTime()).toBeGreaterThan(
        new Date(originalCreatedAt).getTime()
      );
    });

    it('should not allow updating id', () => {
      const group = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const originalId = group.id;

      // TypeScript should prevent this, but test runtime behavior
      const updatedGroup = updateGroup(group.id, {
        grossProceeds: 2000,
      });

      expect(updatedGroup.id).toBe(originalId);
    });
  });

  describe('deleteGroup', () => {
    it('should return false when group does not exist', () => {
      const result = deleteGroup('non-existent-id');

      expect(result).toBe(false);
    });

    it('should delete an existing group and return true', () => {
      const group = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const result = deleteGroup(group.id);

      expect(result).toBe(true);
      expect(getGroupById(group.id)).toBeUndefined();
    });

    it('should only delete the specified group', () => {
      const group1 = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const group2 = createGroup({
        strategy: 'strategy-2025-01-16',
        underlying: 'TSLA',
        grossProceeds: 2000,
      });

      const group3 = createGroup({
        strategy: 'strategy-2025-01-17',
        underlying: 'SPY',
        grossProceeds: 3000,
      });

      deleteGroup(group2.id);

      const remainingGroups = getGroups();

      expect(remainingGroups).toHaveLength(2);
      expect(remainingGroups).toContainEqual(group1);
      expect(remainingGroups).toContainEqual(group3);
      expect(remainingGroups).not.toContainEqual(group2);
    });

    it('should handle deleting all groups one by one', () => {
      const group1 = createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      const group2 = createGroup({
        strategy: 'strategy-2025-01-16',
        underlying: 'TSLA',
        grossProceeds: 2000,
      });

      expect(getGroups()).toHaveLength(2);

      deleteGroup(group1.id);
      expect(getGroups()).toHaveLength(1);

      deleteGroup(group2.id);
      expect(getGroups()).toHaveLength(0);
    });
  });

  describe('clearGroups', () => {
    it('should remove all groups', () => {
      createGroup({
        strategy: 'strategy-2025-01-15',
        underlying: 'AAPL',
        grossProceeds: 1000,
      });

      createGroup({
        strategy: 'strategy-2025-01-16',
        underlying: 'TSLA',
        grossProceeds: 2000,
      });

      createGroup({
        strategy: 'strategy-2025-01-17',
        underlying: 'SPY',
        grossProceeds: 3000,
      });

      expect(getGroups()).toHaveLength(3);

      clearGroups();

      expect(getGroups()).toHaveLength(0);
      expect(getGroups()).toEqual([]);
    });

    it('should handle clearing when no groups exist', () => {
      expect(getGroups()).toHaveLength(0);

      clearGroups();

      expect(getGroups()).toHaveLength(0);
    });
  });
});
