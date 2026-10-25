/**
 * ALLI Concierge — Deterministic Qualification State Machine
 * TASK-P9-03 / F-065 / F-066
 *
 * Classifies visitor intent from conversation history and transitions through
 * discovery → qualified → converting states, attaching structured action
 * buttons when high-intent signals are detected.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Intent =
  | 'hire'
  | 'quote'
  | 'technical_question'
  | 'demo_help'
  | 'general_enquiry'
  | 'unknown';

export type MachineState = 'discovery' | 'engaged' | 'qualified' | 'converting';

export interface ActionButton {
  label: string;
  href: string;
  variant: 'primary' | 'secondary' | 'whatsapp';
}

export interface StateMachineOutput {
  /** Detected primary intent of the visitor */
  intent: Intent;
  /** Current qualification state */
  state: MachineState;
  /** Structured action buttons to present alongside model output */
  actions: ActionButton[];
  /** Whether the visitor is considered high-intent */
  highIntent: boolean;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ---------------------------------------------------------------------------
// Intent Signal Maps
// ---------------------------------------------------------------------------

/** Keywords → intent classification */
const INTENT_SIGNALS: Record<Intent, string[]> = {
  hire: [
    'hire', 'work with you', 'work together', 'available', 'availability',
    'take on', 'engagement', 'contract', 'freelance', 'contractor',
    'looking for', 'need a developer', 'need an engineer',
  ],
  quote: [
    'quote', 'proposal', 'estimate', 'project cost', 'how much', 'pricing',
    'build for me', 'create for me', 'develop for me', 'project brief',
  ],
  technical_question: [
    'how does', 'how do you', 'what is', 'explain', 'architecture',
    'technology', 'stack', 'framework', 'typescript', 'next.js', 'nextjs',
    'supabase', 'api', 'database', 'backend', 'frontend', 'cloud', 'aws',
    'vercel', 'golang', 'python', 'ai', 'machine learning', 'llm',
  ],
  demo_help: [
    'demo', 'demo app', 'hall booking', 'laundry', 'how to use', 'show me',
    'walkthrough', 'tutorial', 'example', 'feature', 'module',
  ],
  general_enquiry: [
    'who are you', 'about you', 'background', 'experience', 'portfolio',
    'projects', 'case study', 'testimonial', 'past work', 'clients',
  ],
  unknown: [],
};

/** Intents considered high-intent for conversion */
const HIGH_INTENT_SET = new Set<Intent>(['hire', 'quote']);

// ---------------------------------------------------------------------------
// Action Button Presets
// ---------------------------------------------------------------------------

const ACTION_BRIEF: ActionButton = {
  label: 'Generate Project Brief',
  href: '/brief',
  variant: 'primary',
};

const ACTION_BOOK_CALL: ActionButton = {
  label: 'Book 15-min Call',
  href: 'https://cal.com/alli/15min',
  variant: 'secondary',
};

const ACTION_WHATSAPP: ActionButton = {
  label: 'Message on WhatsApp',
  href: 'https://wa.me/2348000000000?text=Hi+Alli%2C+I+found+your+portfolio+and+would+like+to+chat.',
  variant: 'whatsapp',
};

const ACTION_VIEW_DEMOS: ActionButton = {
  label: 'Explore Live Demos',
  href: '/demos',
  variant: 'secondary',
};

// ---------------------------------------------------------------------------
// Scoring
// ---------------------------------------------------------------------------

/**
 * Scores a block of text for each intent category.
 * Returns the intent with the highest signal count.
 */
export function classifyIntent(text: string): Intent {
  const lower = text.toLowerCase();

  let best: Intent = 'unknown';
  let bestScore = 0;

  for (const [intent, signals] of Object.entries(INTENT_SIGNALS) as [Intent, string[]][]) {
    if (intent === 'unknown') continue;
    const score = signals.filter((signal) => lower.includes(signal)).length;
    if (score > bestScore) {
      bestScore = score;
      best = intent;
    }
  }

  return best;
}

/**
 * Aggregates intent across the last N user messages to avoid single-message
 * false positives.
 */
export function aggregateIntent(messages: Message[], lookback = 3): Intent {
  const userMessages = messages
    .filter((m) => m.role === 'user')
    .slice(-lookback)
    .map((m) => m.content)
    .join(' ');

  return classifyIntent(userMessages);
}

// ---------------------------------------------------------------------------
// State Transitions
// ---------------------------------------------------------------------------

/**
 * Determines the machine state given the intent and message count.
 */
export function transitionState(
  intent: Intent,
  userMessageCount: number
): MachineState {
  if (HIGH_INTENT_SET.has(intent)) {
    return userMessageCount >= 2 ? 'converting' : 'qualified';
  }

  if (intent === 'technical_question' || intent === 'demo_help') {
    return userMessageCount >= 2 ? 'engaged' : 'discovery';
  }

  return userMessageCount >= 1 ? 'discovery' : 'discovery';
}

// ---------------------------------------------------------------------------
// Action Selection
// ---------------------------------------------------------------------------

/**
 * Builds the list of action buttons appropriate for the current state.
 */
export function selectActions(
  intent: Intent,
  state: MachineState
): ActionButton[] {
  if (state === 'converting') {
    return [ACTION_BRIEF, ACTION_BOOK_CALL, ACTION_WHATSAPP];
  }

  if (state === 'qualified') {
    if (intent === 'hire') return [ACTION_BOOK_CALL, ACTION_WHATSAPP, ACTION_BRIEF];
    if (intent === 'quote') return [ACTION_BRIEF, ACTION_BOOK_CALL];
    return [ACTION_BRIEF, ACTION_BOOK_CALL];
  }

  if (state === 'engaged') {
    if (intent === 'demo_help') return [ACTION_VIEW_DEMOS, ACTION_BRIEF];
    return [ACTION_BOOK_CALL, ACTION_BRIEF];
  }

  // discovery
  return [];
}

// ---------------------------------------------------------------------------
// Primary Exported Function
// ---------------------------------------------------------------------------

/**
 * Given the full conversation message history, runs the qualification state
 * machine and returns the intent, state, action buttons, and highIntent flag.
 *
 * This is designed to be called after each user turn.
 */
export function qualify(messages: Message[]): StateMachineOutput {
  const userMessages = messages.filter((m) => m.role === 'user');
  const intent = aggregateIntent(messages);
  const state = transitionState(intent, userMessages.length);
  const actions = selectActions(intent, state);
  const highIntent = HIGH_INTENT_SET.has(intent);

  return { intent, state, actions, highIntent };
}
