import { withApiMiddleware, RATE_LIMIT_POLICIES } from '@/core/api/middleware';
import { services } from '@/core/providers';
import { NextResponse } from 'next/server';
import { convertToModelMessages, ModelMessage } from 'ai';
import { z } from 'zod';

export const runtime = 'edge';

// ---------------------------------------------------------------------------
// Configuration & Limits (TASK-P9-01 / SPEC-04 / D-04)
// ---------------------------------------------------------------------------

export const SESSION_MESSAGE_CAP = 10;
export const DAILY_REQUEST_BUDGET = 500;
export const MAX_MESSAGE_LENGTH = 1000;

// In-memory session message counter (per session ID)
const sessionMessageCounts = new Map<string, number>();

// In-memory daily request tracker
let dailyCounter = {
  date: new Date().toISOString().slice(0, 10),
  count: 0,
};

/** For testing purposes */
export function resetConciergeBudgets() {
  sessionMessageCounts.clear();
  dailyCounter = {
    date: new Date().toISOString().slice(0, 10),
    count: 0,
  };
}

export function getSessionMessageCount(sessionId: string): number {
  return sessionMessageCounts.get(sessionId) ?? 0;
}

// ---------------------------------------------------------------------------
// Input Validation & Sanitization Schema
// ---------------------------------------------------------------------------

const messageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(MAX_MESSAGE_LENGTH, `Message exceeds maximum length of ${MAX_MESSAGE_LENGTH} characters`),
  parts: z.array(z.any()).optional(),
});

const conciergeRequestSchema = z.object({
  messages: z.array(messageSchema).min(1, 'Messages array must contain at least one message'),
  sessionId: z.string().optional(),
});

/**
 * Sanitizes input text: trims whitespace, strips null characters and control codes.
 */
export function sanitizeInput(input: string): string {
  return input
    .replace(/\0/g, '') // remove null bytes
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // strip control chars
    .trim();
}

/**
 * Checks for prompt injection indicators.
 */
export function isPromptInjection(text: string): boolean {
  const lower = text.toLowerCase();
  const injectionPatterns = [
    /ignore (all )?(previous|prior) (instructions|prompts|rules)/i,
    /reveal (your|the) (system prompt|instructions|secret)/i,
    /you are now in (developer|dan|jailbreak) mode/i,
    /override (system|security) directives/i,
  ];
  return injectionPatterns.some((pattern) => pattern.test(lower));
}

// ---------------------------------------------------------------------------
// System Prompt for ALLI Concierge
// ---------------------------------------------------------------------------

const ALLI_CONCIERGE_SYSTEM_PROMPT = `
You are ALLI, the verified AI Concierge for Ajibade Alli Akinkunmi's engineering portfolio and operations consultancy (alli.net.ng).

CRITICAL DIRECTIVES:
1. Answer ONLY based on verified facts about Alli: full-stack systems engineering, TypeScript/Next.js/Node/Go/Python expertise, high-reliability operations software, and product architecture.
2. If asked about availability, pricing, or customized project inquiries, guide the user to launch a project brief at /brief or schedule a consultation.
3. Be professional, concise, articulate, and engineering-grounded. Avoid fluff or exaggerated marketing claims.
4. If asked something outside verified portfolio facts, politely state: "I don't have verified information on that yet. You can build a project brief at /brief or contact Alli directly."
`.trim();

// ---------------------------------------------------------------------------
// Route Handler
// ---------------------------------------------------------------------------

export const POST = withApiMiddleware(
  {
    rateLimitKey: 'api:concierge',
    rateLimitConfig: RATE_LIMIT_POLICIES.concierge,
  },
  async (req: Request) => {
    // 1. Daily Token / Request Budget Check
    const today = new Date().toISOString().slice(0, 10);
    if (dailyCounter.date !== today) {
      dailyCounter = { date: today, count: 0 };
    }
    if (dailyCounter.count >= DAILY_REQUEST_BUDGET) {
      return NextResponse.json(
        {
          error: 'Daily concierge query budget reached. Please try again tomorrow or contact Alli directly at /contact.',
          code: 'DAILY_BUDGET_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // 2. Body Parsing & Schema Validation
    let rawJson: unknown;
    try {
      rawJson = await req.json();
    } catch {
      return NextResponse.json({ error: 'Malformed JSON payload' }, { status: 400 });
    }

    const parseResult = conciergeRequestSchema.safeParse(rawJson);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.flatten(),
        },
        { status: 400 }
      );
    }

    const { messages, sessionId = 'default-session' } = parseResult.data;

    // 3. Session Message Cap Enforcement (10 user messages / session)
    const currentSessionCount = sessionMessageCounts.get(sessionId) ?? 0;
    if (currentSessionCount >= SESSION_MESSAGE_CAP) {
      return NextResponse.json(
        {
          error: `Session message limit reached (maximum ${SESSION_MESSAGE_CAP} messages per session). Please start a new session or book a consultation at /brief.`,
          code: 'SESSION_CAP_EXCEEDED',
        },
        { status: 429 }
      );
    }

    // 4. Input Sanitization & Prompt Injection Protection
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    if (lastUserMessage) {
      const sanitized = sanitizeInput(lastUserMessage.content);
      if (sanitized.length === 0) {
        return NextResponse.json({ error: 'User message cannot be empty' }, { status: 400 });
      }

      if (isPromptInjection(sanitized)) {
        return NextResponse.json(
          {
            error: 'Security directive: prompt injection patterns are not permitted.',
            code: 'PROMPT_INJECTION_REJECTED',
          },
          { status: 400 }
        );
      }
      lastUserMessage.content = sanitized;
    }

    // Increment counters upon valid request
    sessionMessageCounts.set(sessionId, currentSessionCount + 1);
    dailyCounter.count += 1;

    // Log conversation session to analytics
    services.analytics.trackEvent('concierge_query', {
      sessionId,
      sessionTurn: currentSessionCount + 1,
      messageLength: lastUserMessage?.content.length ?? 0,
      timestamp: new Date().toISOString(),
    });

    // 5. Convert Messages to ModelMessage[] format for streaming
    const normalizedMessages = messages.map((m) => ({
      ...m,
      parts: m.parts || [{ type: 'text', text: m.content }],
    }));

    let modelMessages: ModelMessage[];
    try {
      modelMessages = (await convertToModelMessages(normalizedMessages)) as ModelMessage[];
    } catch {
      modelMessages = messages.map((m) => ({
        role: m.role as any,
        content: m.content,
      }));
    }

    // 6. Generate Streaming Response via AI Provider
    try {
      const streamResponse = await services.ai.streamChatResponse(
        modelMessages,
        ALLI_CONCIERGE_SYSTEM_PROMPT,
        {},
        { sessionId }
      );

      // Return streaming response with appropriate streaming headers
      return streamResponse;
    } catch (err: any) {
      console.error('[ConciergeRoute] Streaming error:', err?.message || err);
      return NextResponse.json(
        { error: 'Failed to generate AI response. Please try again shortly.' },
        { status: 500 }
      );
    }
  }
);
