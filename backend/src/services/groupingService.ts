import { Trade } from '../models/Trade';
import { TradeGroup, CreateTradeGroupDTO } from '../models/TradeGroup';

// Contract multiplier for options (standard is 100)
const CONTRACT_MULTIPLIER = 100;

export interface GroupingResult {
  groups: CreateTradeGroupDTO[];
  tradesWithGroups: Array<{ trade: Trade; groupKey: string }>;
}

/**
 * Generate a group key from dateTime and underlying symbol
 */
const generateGroupKey = (dateTime: string, underlying: string): string => {
  return `${dateTime}_${underlying}`;
};

/**
 * Generate strategy name from the date portion of a timestamp
 * Example: "2025-01-15T10:30:00.000Z" -> "strategy-2025-01-15"
 */
export const generateStrategyName = (dateTime: string): string => {
  const date = dateTime.split('T')[0];
  return `strategy-${date}`;
};

/**
 * Calculate gross proceeds for a single trade
 * Formula: abs(quantity) × tradePrice × CONTRACT_MULTIPLIER
 */
export const calculateTradeGrossProceeds = (trade: Trade): number => {
  return Math.abs(trade.quantity) * trade.tradePrice * CONTRACT_MULTIPLIER;
};

/**
 * Calculate total gross proceeds for an array of trades
 */
export const calculateGrossProceeds = (trades: Trade[]): number => {
  return trades.reduce((sum, trade) => sum + calculateTradeGrossProceeds(trade), 0);
};

/**
 * Main grouping algorithm: Groups trades by exact timestamp and underlying symbol
 *
 * @param trades - Array of trades to group
 * @returns GroupingResult containing groups and trades with their assigned group keys
 */
export const groupTrades = (trades: Trade[]): GroupingResult => {
  // Sort trades by dateTime (ascending)
  const sortedTrades = [...trades].sort((a, b) =>
    a.dateTime.localeCompare(b.dateTime)
  );

  // Group trades by (dateTime + underlying)
  const tradesByGroup = new Map<string, Trade[]>();

  for (const trade of sortedTrades) {
    const groupKey = generateGroupKey(trade.dateTime, trade.symbol);

    if (!tradesByGroup.has(groupKey)) {
      tradesByGroup.set(groupKey, []);
    }

    tradesByGroup.get(groupKey)!.push(trade);
  }

  // Create TradeGroup DTOs for each group
  const groups: CreateTradeGroupDTO[] = [];
  const tradesWithGroups: Array<{ trade: Trade; groupKey: string }> = [];

  for (const [groupKey, groupTrades] of tradesByGroup.entries()) {
    // Use the first trade's dateTime to generate strategy name
    const firstTrade = groupTrades[0];
    const strategy = generateStrategyName(firstTrade.dateTime);
    const underlying = firstTrade.symbol;
    const grossProceeds = calculateGrossProceeds(groupTrades);

    const group: CreateTradeGroupDTO = {
      strategy,
      underlying,
      grossProceeds,
    };

    groups.push(group);

    // Track which trades belong to which group
    for (const trade of groupTrades) {
      tradesWithGroups.push({ trade, groupKey });
    }
  }

  return {
    groups,
    tradesWithGroups,
  };
};
