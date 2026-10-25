import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  tokenize,
  scoreItem,
  isPricingQuery,
  retrieve,
  clearRetrieverCache,
  TOP_K,
  CONFIDENCE_THRESHOLD,
  KnowledgeItem,
} from '@/core/concierge/retriever';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const FIXTURES: KnowledgeItem[] = [
  {
    id: '1',
    title: 'Alli specialises in TypeScript and Next.js',
    content:
      'Ajibade Alli Akinkunmi is a full-stack engineer with deep expertise in TypeScript, Next.js, Node.js, and Go. He builds high-reliability operations software and product platforms.',
    confidence: 'high',
    tags: ['typescript', 'nextjs', 'node', 'go', 'full-stack'],
    topic: 'engineering',
  },
  {
    id: '2',
    title: 'Engagement process for new projects',
    content:
      'New clients begin by submitting a project brief at /brief. Alli reviews within 48 hours and schedules a discovery call to understand requirements before producing a written proposal.',
    confidence: 'high',
    tags: ['process', 'engagement', 'brief', 'proposal'],
    topic: 'process',
  },
  {
    id: '3',
    title: 'Supabase and PostgreSQL database expertise',
    content:
      'Alli uses Supabase (PostgreSQL) as the primary database for most projects, including real-time features, row-level security, and storage buckets.',
    confidence: 'high',
    tags: ['supabase', 'postgresql', 'database', 'rls'],
    topic: 'engineering',
  },
  {
    id: '4',
    title: 'AI integration projects',
    content:
      'Alli integrates AI models via the Vercel AI SDK and Google Gemini API, building retrieval-augmented generation (RAG) systems and conversational interfaces.',
    confidence: 'high',
    tags: ['ai', 'gemini', 'rag', 'llm', 'vercel ai sdk'],
    topic: 'engineering',
  },
  {
    id: '5',
    title: 'Project turnaround time',
    content:
      'Typical MVP delivery is 4–8 weeks depending on scope. Complex platforms may take 3–6 months with iterative releases.',
    confidence: 'medium',
    tags: ['timeline', 'delivery', 'mvp'],
    topic: 'process',
  },
];

// ---------------------------------------------------------------------------
// Tests: tokenize()
// ---------------------------------------------------------------------------

describe('tokenize()', () => {
  it('lowercases and removes punctuation', () => {
    const tokens = tokenize('Hello, World! TypeScript?');
    expect(tokens).toContain('hello');
    expect(tokens).toContain('world');
    expect(tokens).toContain('typescript');
  });

  it('strips stopwords', () => {
    const tokens = tokenize('the and a is in on');
    expect(tokens).toHaveLength(0);
  });

  it('handles empty string', () => {
    expect(tokenize('')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: scoreItem()
// ---------------------------------------------------------------------------

describe('scoreItem()', () => {
  it('returns 0 for empty query tokens', () => {
    expect(scoreItem(FIXTURES[0], [])).toBe(0);
  });

  it('returns 1 when all query tokens appear in item corpus', () => {
    const score = scoreItem(FIXTURES[0], ['typescript', 'nextjs']);
    expect(score).toBe(1);
  });

  it('returns 0 for completely unrelated query', () => {
    const score = scoreItem(FIXTURES[0], ['football', 'pizza']);
    expect(score).toBe(0);
  });

  it('returns partial score for partial match', () => {
    const score = scoreItem(FIXTURES[0], ['typescript', 'blockchain']);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThan(1);
  });
});

// ---------------------------------------------------------------------------
// Tests: isPricingQuery()
// ---------------------------------------------------------------------------

describe('isPricingQuery()', () => {
  it('detects direct pricing queries', () => {
    expect(isPricingQuery('What is your pricing?')).toBe(true);
    expect(isPricingQuery('How much does it cost?')).toBe(true);
    expect(isPricingQuery('What is your hourly rate?')).toBe(true);
    expect(isPricingQuery('What are your fees?')).toBe(true);
    expect(isPricingQuery('Can you give me a quote?')).toBe(true);
  });

  it('does NOT flag non-pricing queries', () => {
    expect(isPricingQuery('What technologies does Alli use?')).toBe(false);
    expect(isPricingQuery('How long does a project take?')).toBe(false);
    expect(isPricingQuery('Tell me about the engagement process')).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Tests: retrieve() — Core Retrieval Logic
// ---------------------------------------------------------------------------

describe('retrieve() (TASK-P9-02 / F-067 / F-068 / F-286)', () => {
  beforeEach(() => {
    clearRetrieverCache();
    vi.restoreAllMocks();
  });

  it('returns high-confidence items for a relevant query', async () => {
    const result = await retrieve('TypeScript Next.js expertise', FIXTURES);
    expect(result.fallback).toBe(false);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items.length).toBeLessThanOrEqual(TOP_K);
    expect(result.score).toBeGreaterThanOrEqual(CONFIDENCE_THRESHOLD);
  });

  it('returns the most relevant item first', async () => {
    const result = await retrieve('supabase postgresql database', FIXTURES);
    expect(result.fallback).toBe(false);
    expect(result.items[0].id).toBe('3');
  });

  it('returns fallback=true when query matches nothing', async () => {
    const result = await retrieve('quantum physics black holes', FIXTURES);
    expect(result.fallback).toBe(true);
    expect(result.contextBlock).toContain('/brief');
  });

  it('PRICING GUARD: returns fallback for pricing queries without hallucinating', async () => {
    const result = await retrieve('How much do you charge per hour?', FIXTURES);
    expect(result.fallback).toBe(true);
    expect(result.items).toHaveLength(0);
    expect(result.contextBlock).toContain('/brief');
    expect(result.contextBlock).not.toMatch(/\$[\d,]+/);
    expect(result.contextBlock).not.toMatch(/\d+\/hr/i);
  });

  it('contextBlock contains titled knowledge entries when not fallback', async () => {
    const result = await retrieve('ai integration gemini rag', FIXTURES);
    expect(result.fallback).toBe(false);
    expect(result.contextBlock).toContain('[KNOWLEDGE 1]');
  });

  it('returns fallback for empty knowledge base', async () => {
    const result = await retrieve('TypeScript', []);
    expect(result.fallback).toBe(true);
  });

  it('limits results to TOP_K items', async () => {
    const result = await retrieve('engineering typescript supabase ai process', FIXTURES);
    expect(result.items.length).toBeLessThanOrEqual(TOP_K);
  });
});
