import type { AuctionItem, BuyerMatch } from '../types';

export type AgentRole = 'BuyerScout' | 'ProVerifier' | 'Matchmaker';

export interface AgentJob {
  id: string;
  role: AgentRole;
  item: AuctionItem;
  status: 'queued' | 'running' | 'completed';
  result?: BuyerMatch[];
}

export function buildAgentJob(item: AuctionItem, role: AgentRole): AgentJob {
  return {
    id: `agent-${item.id}-${role.toLowerCase()}`,
    role,
    item,
    status: 'queued',
  };
}

export function simulateAuctionAgent(item: AuctionItem): Promise<BuyerMatch[]> {
  return new Promise((resolve) => {
    const buyers: BuyerMatch[] = [
      {
        name: 'Avery Lee',
        interest: `${item.category} resale network`,
        score: 94,
        verified: false,
      },
      {
        name: 'Nora Patel',
        interest: 'Collectors and private buyers',
        score: 91,
        verified: false,
      },
    ];
    window.setTimeout(() => resolve(buyers), 900);
  });
}

export function summarizeAgentWorkflow(item: AuctionItem): string {
  return `Agent workflow for ${item.title}: buyer discovery, price matching, and human ProVerify review.`;
}
