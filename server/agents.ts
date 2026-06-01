import type { AuctionItem, BuyerMatch } from '../src/types.ts';

export const agentRoles = ['BuyerScout', 'ProVerifier', 'Matchmaker'] as const;
export type AgentRole = (typeof agentRoles)[number];

export function createBuyerMatches(item: AuctionItem): BuyerMatch[] {
  return [
    {
      name: 'Avery Lee',
      interest: `${item.category} resale network`,
      score: Math.max(85, 96 - Math.round(Math.random() * 12)),
      verified: false,
    },
    {
      name: 'Nora Patel',
      interest: 'Collector demand channel',
      score: Math.max(80, 92 - Math.round(Math.random() * 10)),
      verified: false,
    },
  ];
}

export function runAgentScan(items: AuctionItem[]): BuyerMatch[] {
  return items.flatMap((item) => createBuyerMatches(item));
}

export function runProVerify(item: AuctionItem): AuctionItem {
  return { ...item, status: 'proverify' };
}

export function simulateAgentSummary(item: AuctionItem): string {
  return `Auto-agent evaluation for ${item.title} completed. Buyer match strength is based on category and reserve price.`;
}
