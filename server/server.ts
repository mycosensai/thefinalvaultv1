import cors from 'cors';
import express, { type Request, type Response } from 'express';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import type {
  AuctionItem,
  CrawlResponse,
  NewItemRequest,
  ProVerifyRequest,
  ApiResponse,
  VerifyBuyerRequest,
} from '../src/types.ts';
import { runAgentScan, runProVerify, simulateAgentSummary } from './agents.ts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

const items: AuctionItem[] = [
  {
    id: 'vault-001',
    title: 'Heritage Luxury Sneaker Collection',
    category: 'Fashion & Collectibles',
    reserve: 3200,
    status: 'open',
    description: 'Rare release sneaker set curated by AI agents, market-ready for high interest buyers.',
  },
  {
    id: 'vault-002',
    title: 'Vintage Digital Camera Auction',
    category: 'Electronics',
    reserve: 950,
    status: 'open',
    description: 'Authenticated collector camera with provenance notes and AI-assisted buyer match insights.',
  },
];

let currentMatches = runAgentScan(items);

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ success: true, data: { status: 'ok' } });
});

app.get('/api/items', (_req: Request, res: Response) => {
  const response: ApiResponse<AuctionItem[]> = { success: true, data: items };
  res.json(response);
});

app.post('/api/items', (req: Request, res: Response) => {
  const body = req.body as NewItemRequest;

  if (!body.title || !body.category || !body.description || Number.isNaN(body.reserve) || body.reserve <= 0) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: 'Item request must include title, category, reserve price, and description.',
    };
    return res.status(400).json(response);
  }

  const newItem: AuctionItem = {
    id: `vault-${Date.now()}`,
    title: body.title.trim(),
    category: body.category.trim(),
    reserve: Number(body.reserve),
    status: 'open',
    description: body.description.trim(),
  };

  items.unshift(newItem);
  currentMatches = runAgentScan(items);
  const response: ApiResponse<AuctionItem> = { success: true, data: newItem };
  return res.status(201).json(response);
});

app.post('/api/crawl', (_req: Request, res: Response) => {
  currentMatches = runAgentScan(items);
  const response: ApiResponse<CrawlResponse> = {
    success: true,
    data: {
      status: 'completed',
      buyers: currentMatches,
    },
  };
  return res.json(response);
});

app.post('/api/proverify', (req: Request, res: Response) => {
  const body = req.body as ProVerifyRequest;
  const item = items.find((entry) => entry.id === body.itemId);

  if (!item) {
    const response: ApiResponse<null> = { success: false, data: null, error: 'Item not found.' };
    return res.status(404).json(response);
  }

  const updated = runProVerify(item);
  item.status = updated.status;
  const response: ApiResponse<AuctionItem> = { success: true, data: updated };
  return res.json(response);
});

app.post('/api/buyers/verify', (req: Request, res: Response) => {
  const body = req.body as VerifyBuyerRequest;
  const buyer = currentMatches.find((entry: typeof currentMatches[number]) => entry.name === body.name);

  if (!buyer) {
    const response: ApiResponse<null> = { success: false, data: null, error: 'Buyer match not found.' };
    return res.status(404).json(response);
  }

  buyer.verified = !buyer.verified;
  const response: ApiResponse<typeof buyer> = { success: true, data: buyer };
  return res.json(response);
});

if (process.env.NODE_ENV === 'production') {
  const distPath = join(__dirname, '../dist');
  app.use(express.static(distPath));
  app.get('*', (_req: Request, res: Response) => res.sendFile(join(distPath, 'index.html')));
}

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API server listening on http://localhost:${port}`);
});
