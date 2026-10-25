/**
 * ALLI Concierge — In-Process Knowledge Retrieval Engine
 * TASK-P9-02 / F-067 / F-068 / F-286
 *
 * Performs keyword + relevance scoring against the Payload `knowledge-items`
 * collection. High-confidence items (score >= CONFIDENCE_THRESHOLD) are
 * injected into the ALLI system prompt; low-confidence results trigger a
 * graceful fallback directing visitors to /brief or a call.
 */

import { services } from '@/core/providers';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  /** Confidence level of the item: 'high' | 'medium' | 'low' */
  confidence: 'high' | 'medium' | 'low';
  /** Optional tags for keyword matching */
  tags?: string[];
  /** Topic category e.g. 'engineering', 'pricing', 'process', 'faq' */
  topic?: string;
}

export interface RetrievalResult {
  items: KnowledgeItem[];
  score: number;
  fallback: boolean;
  /** Preformatted context string ready to inject into a system prompt */
  contextBlock: string;
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Number of top items to inject into the system prompt */
export const TOP_K = 3;

/** Minimum aggregate relevance score to consider high-confidence (0–1 scale) */
export const CONFIDENCE_THRESHOLD = 0.25;

/** Words that indicate pricing intent — NEVER hallucinate these */
const PRICING_GUARD_TERMS = [
  'price',
  'pricing',
  'cost',
  'fee',
  'rate',
  'charge',
  'salary',
  'how much',
  'budget',
  'invoice',
  'quote',
  'estimate',
];

/** Stopwords excluded from keyword matching */
const STOPWORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'is', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'up', 'as', 'into', 'about', 'that', 'this',
  'it', 'its', 'was', 'are', 'be', 'been', 'has', 'have', 'had', 'do', 'does',
  'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'shall',
  'i', 'you', 'he', 'she', 'we', 'they', 'me', 'him', 'her', 'us', 'them',
]);

// ---------------------------------------------------------------------------
// Scoring Utilities
// ---------------------------------------------------------------------------

/**
 * Tokenizes text into lowercase keywords, stripping stopwords and punctuation.
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOPWORDS.has(t));
}

/**
 * Scores a single knowledge item against a query token set.
 * Score is normalised (0–1) based on fraction of query tokens matched.
 */
export function scoreItem(item: KnowledgeItem, queryTokens: string[]): number {
  if (queryTokens.length === 0) return 0;

  const corpus = [
    item.title,
    item.content,
    ...(item.tags ?? []),
    item.topic ?? '',
  ]
    .join(' ')
    .toLowerCase();

  const matched = queryTokens.filter((t) => corpus.includes(t));
  return matched.length / queryTokens.length;
}

/**
 * Returns true if the query is asking about pricing / rates.
 * Used to trigger a hard pricing guard rather than hallucinate.
 */
export function isPricingQuery(query: string): boolean {
  const lower = query.toLowerCase();
  return PRICING_GUARD_TERMS.some((term) => lower.includes(term));
}

// ---------------------------------------------------------------------------
// Cache (in-process, single-process edge-compatible)
// ---------------------------------------------------------------------------

interface ItemCache {
  items: KnowledgeItem[];
  fetchedAt: number;
}

let _cache: ItemCache | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Clears the in-memory cache (primarily for testing). */
export function clearRetrieverCache() {
  _cache = null;
}

// ---------------------------------------------------------------------------
// Fetching
// ---------------------------------------------------------------------------

/**
 * Fetches all knowledge items from Payload CMS, with a 5-minute in-memory
 * cache to avoid hammering the database on every concierge request.
 */
export async function fetchKnowledgeItems(): Promise<KnowledgeItem[]> {
  const now = Date.now();
  if (_cache && now - _cache.fetchedAt < CACHE_TTL_MS) {
    return _cache.items;
  }

  const result = await services.db.query<KnowledgeItem>('knowledge-items');
  const items: KnowledgeItem[] = result.data ?? [];

  _cache = { items, fetchedAt: now };
  return items;
}

// ---------------------------------------------------------------------------
// Primary Retrieval Function
// ---------------------------------------------------------------------------

/**
 * Given a user query string, retrieves the most relevant knowledge items and
 * returns a structured result containing:
 *  - `items`: top-K scored items
 *  - `score`: aggregate confidence score (0–1)
 *  - `fallback`: true when confidence is too low or no items matched
 *  - `contextBlock`: ready-to-inject prompt context string
 */
export async function retrieve(
  query: string,
  items?: KnowledgeItem[] // optional override for testing
): Promise<RetrievalResult> {
  const FALLBACK_CONTEXT =
    "I don't have verified information on that topic yet. " +
    'You can submit a detailed project brief at /brief or schedule a consultation.';

  // Pricing guard — never construct a response with hallucinated prices
  if (isPricingQuery(query)) {
    return {
      items: [],
      score: 0,
      fallback: true,
      contextBlock:
        'Pricing enquiry detected. Do NOT state any specific prices or rates. ' +
        'Direct the visitor to /brief to receive a tailored proposal.',
    };
  }

  // Fetch knowledge base
  const allItems = items ?? (await fetchKnowledgeItems());
  if (allItems.length === 0) {
    return {
      items: [],
      score: 0,
      fallback: true,
      contextBlock: FALLBACK_CONTEXT,
    };
  }

  // Score all items
  const queryTokens = tokenize(query);
  const scored = allItems
    .map((item) => ({ item, score: scoreItem(item, queryTokens) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score);

  const topItems = scored.slice(0, TOP_K).map(({ item }) => item);
  const aggregateScore =
    scored.length > 0
      ? scored.slice(0, TOP_K).reduce((sum, { score }) => sum + score, 0) /
        Math.min(TOP_K, scored.length)
      : 0;

  const fallback = aggregateScore < CONFIDENCE_THRESHOLD || topItems.length === 0;

  if (fallback) {
    return {
      items: topItems,
      score: aggregateScore,
      fallback: true,
      contextBlock: FALLBACK_CONTEXT,
    };
  }

  // Build an injectable context block
  const contextBlock = topItems
    .map(
      (item, idx) =>
        `[KNOWLEDGE ${idx + 1}] ${item.title}\n${item.content}`
    )
    .join('\n\n');

  return {
    items: topItems,
    score: aggregateScore,
    fallback: false,
    contextBlock,
  };
}
