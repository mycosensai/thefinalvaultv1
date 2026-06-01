import { useCallback, useEffect, useMemo, useState } from 'react';
import { FeatureCard } from './components/FeatureCard';
import { createItem, crawlBuyers, getItems, requestProVerify, verifyBuyerMatch } from './api/client';
import type { AuctionItem, BuyerMatch, NewItemRequest } from './types';

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export default function App() {
  const [items, setItems] = useState<AuctionItem[]>([]);
  const [buyerMatches, setBuyerMatches] = useState<BuyerMatch[]>([]);
  const [crawlStatus, setCrawlStatus] = useState<'idle' | 'scanning' | 'completed'>('idle');
  const [proVerifyRequests, setProVerifyRequests] = useState(0);
  const [form, setForm] = useState({ title: '', category: '', reserve: '', description: '' });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const topOpenItems = useMemo(() => items.filter((item) => item.status === 'open'), [items]);

  const loadItems = useCallback(async () => {
    try {
      const data = await getItems();
      setItems(data);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load items.');
    }
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  function handleInput(key: keyof typeof form, value: string) {
    setForm((previous) => ({ ...previous, [key]: value }));
  }

  async function submitNewItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!form.title || !form.category || !form.reserve || !form.description) {
      setErrorMessage('Please complete every form field before submitting.');
      return;
    }

    const payload: NewItemRequest = {
      title: form.title,
      category: form.category,
      reserve: Number(form.reserve),
      description: form.description,
    };

    try {
      const created = await createItem(payload);
      setItems((prev) => [created, ...prev]);
      setForm({ title: '', category: '', reserve: '', description: '' });
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to create new item.');
    }
  }

  async function handleCrawlWebForBuyers() {
    setCrawlStatus('scanning');
    setErrorMessage(null);

    try {
      const response = await crawlBuyers();
      setBuyerMatches(response.buyers);
      setCrawlStatus('completed');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to crawl buyers.');
      setCrawlStatus('idle');
    }
  }

  async function handleRequestProVerify(itemId: string) {
    try {
      const updated = await requestProVerify({ itemId });
      setItems((current) => current.map((item) => (item.id === itemId ? updated : item)));
      setProVerifyRequests((count) => count + 1);
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to request ProVerify.');
    }
  }

  async function handleToggleBuyerVerified(index: number) {
    const buyer = buyerMatches[index];
    if (!buyer) {
      return;
    }

    try {
      const updated = await verifyBuyerMatch({ name: buyer.name });
      setBuyerMatches((current) => current.map((match) => (match.name === updated.name ? updated : match)));
      setErrorMessage(null);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to verify buyer match.');
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
      <header className="mb-12 rounded-[2rem] border border-gold/20 bg-obsidian-surface p-10 shadow-neon shadow-gold/10 ring-1 ring-gold/20 backdrop-blur-xl">
        <p className="text-sm uppercase tracking-[0.3em] text-gold/80">AI Auction House</p>
        <h1 className="mt-4 text-5xl font-semibold tracking-tight text-gold sm:text-6xl">The Final Vault</h1>
        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-300">
          An intelligent auctionhouse for collectors and sellers. AI agents find buyers, verify results with human experts, and connect your inventory to premium demand.
        </p>
      </header>

      {errorMessage ? (
        <div className="mb-8 rounded-3xl border border-amber-700/40 bg-amber-900/10 p-5 text-sm text-amber-100">
          {errorMessage}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-3">
        <FeatureCard
          icon={<span>🤖</span>}
          title="Agent-driven discovery"
          description="AI crawls market sources and buyer networks, prioritizing leads with the strongest match to your item and price goals."
        />
        <FeatureCard
          icon={<span>✅</span>}
          title="ProVerify human review"
          description="Every critical result can be reviewed and certified by a real expert before bids move forward."
        />
        <FeatureCard
          icon={<span>🌍</span>}
          title="Web crawl buyer search"
          description="Automated buyer discovery runs across listings, specialist channels, and private networks for fast market connections."
        />
      </section>

      <div className="mt-12 grid gap-8 lg:grid-cols-[1.3fr_0.95fr]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-gold/20 bg-obsidian-surface p-8 shadow-neon shadow-gold/10">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-white">Live auction inventory</h2>
                <p className="mt-2 text-sm text-slate-400">
                  Manage consignments and request real verification from our professional review team.
                </p>
              </div>
              <div className="rounded-3xl bg-slate-900/50 px-4 py-2 text-sm text-gold ring-1 ring-gold/20">
                ProVerify requests: {proVerifyRequests}
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              {topOpenItems.map((item) => (
                <article key={item.id} className="rounded-3xl border border-gold/10 bg-slate-950/80 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{item.category}</p>
                      <h3 className="mt-3 text-xl font-semibold text-white">{item.title}</h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">{item.description}</p>
                    </div>
                    <div className="space-y-2 text-right">
                      <p className="text-3xl font-semibold text-gold">{formatCurrency(item.reserve)}</p>
                      <span className="inline-flex rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.24em] text-gold/90">
                        {item.status === 'open' ? 'Open' : 'Review pending'}
                      </span>
                    </div>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => void handleRequestProVerify(item.id)}
                      className="rounded-2xl bg-gold px-4 py-2 text-sm font-semibold text-obsidian transition hover:bg-amber-400"
                    >
                      Request ProVerify
                    </button>
                    <button
                      type="button"
                      className="rounded-2xl border border-gold/20 px-4 py-2 text-sm text-slate-200 transition hover:bg-slate-900"
                    >
                      View details
                    </button>
                  </div>
                </article>
              ))}
              {topOpenItems.length === 0 && (
                <p className="text-sm text-slate-400">No open auction items yet. Add a listing to begin.</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-gold/20 bg-obsidian-surface p-8 shadow-neon shadow-gold/10">
            <h2 className="text-2xl font-semibold text-white">Crawl the web for buyers</h2>
            <p className="mt-3 text-sm text-slate-400">
              Run the intelligent buyer search engine to generate curated purchase leads for your open auctions.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => void handleCrawlWebForBuyers()}
                className="rounded-2xl bg-gold px-5 py-3 text-sm font-semibold text-obsidian transition hover:bg-amber-400"
              >
                {crawlStatus === 'scanning' ? 'Scanning...' : 'Start buyer crawl'}
              </button>
              <span className="text-sm text-slate-300">
                {crawlStatus === 'completed'
                  ? 'Buyer crawl completed.'
                  : crawlStatus === 'scanning'
                  ? 'Scanning target channels…'
                  : 'Ready to launch search.'}
              </span>
            </div>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {buyerMatches.map((buyer, index) => (
                <div key={buyer.name} className="rounded-3xl border border-gold/10 bg-slate-950/80 p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-white">{buyer.name}</h3>
                      <p className="text-sm text-slate-400">{buyer.interest}</p>
                    </div>
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-xs uppercase tracking-[0.24em] text-gold/90">
                      Score {buyer.score}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => void handleToggleBuyerVerified(index)}
                    className={`mt-5 w-full rounded-2xl px-4 py-2 text-sm font-semibold transition ${
                      buyer.verified ? 'bg-slate-700 text-gold' : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                    }`}
                  >
                    {buyer.verified ? 'Verified by human expert' : 'Mark as verified'}
                  </button>
                </div>
              ))}
              {crawlStatus === 'completed' && buyerMatches.length === 0 && (
                <div className="rounded-3xl border border-gold/10 bg-slate-950/80 p-5 text-slate-400">
                  No buyer matches were found. Try updating listings or running the crawl again.
                </div>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-8">
          <section className="rounded-[2rem] border border-gold/20 bg-obsidian-surface p-8 shadow-neon shadow-gold/10">
            <h2 className="text-2xl font-semibold text-white">List a new item</h2>
            <p className="mt-3 text-sm text-slate-400">
              Add an item to the vault and let the AI source buyers while your team verifies the highest matches.
            </p>
            <form onSubmit={submitNewItem} className="mt-8 space-y-4">
              <label className="block text-sm text-slate-200">
                <span className="mb-2 block text-slate-300">Title</span>
                <input
                  value={form.title}
                  onChange={(event) => handleInput('title', event.target.value)}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-gold outline-none ring-1 ring-gold/20 transition focus:border-gold focus:ring-gold/30"
                  placeholder="Rare collectible item"
                />
              </label>

              <label className="block text-sm text-slate-200">
                <span className="mb-2 block text-slate-300">Category</span>
                <input
                  value={form.category}
                  onChange={(event) => handleInput('category', event.target.value)}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-gold outline-none ring-1 ring-gold/20 transition focus:border-gold focus:ring-gold/30"
                  placeholder="Category, e.g. Art, Fashion, Tech"
                />
              </label>

              <label className="block text-sm text-slate-200">
                <span className="mb-2 block text-slate-300">Reserve price</span>
                <input
                  type="number"
                  value={form.reserve}
                  onChange={(event) => handleInput('reserve', event.target.value)}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-gold outline-none ring-1 ring-gold/20 transition focus:border-gold focus:ring-gold/30"
                  placeholder="e.g. 2500"
                />
              </label>

              <label className="block text-sm text-slate-200">
                <span className="mb-2 block text-slate-300">Description</span>
                <textarea
                  value={form.description}
                  onChange={(event) => handleInput('description', event.target.value)}
                  rows={4}
                  className="w-full rounded-3xl border border-slate-700 bg-slate-950/70 px-4 py-3 text-sm text-gold outline-none ring-1 ring-gold/20 transition focus:border-gold focus:ring-gold/30"
                  placeholder="Describe the item and special provenance details."
                />
              </label>

              <button type="submit" className="w-full rounded-3xl bg-gold px-5 py-3 text-sm font-semibold text-obsidian transition hover:bg-amber-400">
                Submit item to vault
              </button>
            </form>
          </section>

          <section className="rounded-[2rem] border border-gold/20 bg-obsidian-surface p-8 shadow-neon shadow-gold/10">
            <h2 className="text-2xl font-semibold text-white">Why The Final Vault?</h2>
            <ul className="mt-6 space-y-4 text-sm leading-7 text-slate-300">
              <li>• Intelligent buyer sourcing with automated market scanning.</li>
              <li>• Real human verification for the most valuable leads.</li>
              <li>• Transparent auction workflows and expert review status.</li>
              <li>• One unified dashboard for sellers and agents.</li>
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}
