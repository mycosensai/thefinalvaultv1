import type {
  AuctionItem,
  BuyerMatch,
  CrawlResponse,
  NewItemRequest,
  ProVerifyRequest,
  VerifyBuyerRequest,
  ApiResponse,
} from '../types';

const baseUrl = '/api';

async function apiFetch<T>(path: string, options: RequestInit = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });

  const data = (await response.json()) as ApiResponse<T>;

  if (!data?.success) {
    throw new Error(data?.error ?? 'API request failed');
  }

  return data.data;
}

export async function getItems(): Promise<AuctionItem[]> {
  return apiFetch<AuctionItem[]>('/items');
}

export async function createItem(request: NewItemRequest): Promise<AuctionItem> {
  return apiFetch<AuctionItem>('/items', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function crawlBuyers(): Promise<CrawlResponse> {
  return apiFetch<CrawlResponse>('/crawl', {
    method: 'POST',
  });
}

export async function requestProVerify(request: ProVerifyRequest): Promise<AuctionItem> {
  return apiFetch<AuctionItem>('/proverify', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

export async function verifyBuyerMatch(request: VerifyBuyerRequest): Promise<BuyerMatch> {
  return apiFetch<BuyerMatch>('/buyers/verify', {
    method: 'POST',
    body: JSON.stringify(request),
  });
}
