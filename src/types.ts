export type AuctionItemStatus = 'open' | 'proverify' | 'sold';

export interface AuctionItem {
  id: string;
  title: string;
  category: string;
  reserve: number;
  status: AuctionItemStatus;
  description: string;
}

export interface BuyerMatch {
  name: string;
  interest: string;
  score: number;
  verified: boolean;
}

export interface NewItemRequest {
  title: string;
  category: string;
  reserve: number;
  description: string;
}

export interface ProVerifyRequest {
  itemId: string;
}

export interface VerifyBuyerRequest {
  name: string;
}

export interface CrawlResponse {
  status: 'completed';
  buyers: BuyerMatch[];
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}
