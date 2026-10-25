import { describe, it, expect } from 'vitest';
import {
  classifyIntent,
  aggregateIntent,
  transitionState,
  selectActions,
  qualify,
  type Message,
} from '@/core/concierge/state-machine';

// ---------------------------------------------------------------------------
// Tests: classifyIntent()
// ---------------------------------------------------------------------------

describe('classifyIntent() (TASK-P9-03 / F-065 / F-066)', () => {
  it('classifies hire intent', () => {
    expect(classifyIntent('I want to hire you for a project')).toBe('hire');
    expect(classifyIntent('Are you available for contract work?')).toBe('hire');
  });

  it('classifies quote intent', () => {
    expect(classifyIntent('Can you give me a proposal for a new platform?')).toBe('quote');
    expect(classifyIntent('How much would a project brief cost?')).toBe('quote');
  });

  it('classifies technical_question intent', () => {
    expect(classifyIntent('What is your TypeScript architecture like?')).toBe('technical_question');
    expect(classifyIntent('How do you handle Supabase RLS?')).toBe('technical_question');
  });

  it('classifies demo_help intent', () => {
    expect(classifyIntent('Can you show me how the hall booking demo works?')).toBe('demo_help');
    expect(classifyIntent('Walk me through the laundry module')).toBe('demo_help');
  });

  it('classifies general_enquiry intent', () => {
    expect(classifyIntent('Tell me about your background and portfolio')).toBe('general_enquiry');
    expect(classifyIntent('What past projects have you worked on?')).toBe('general_enquiry');
  });

  it('returns unknown for unrecognised text', () => {
    expect(classifyIntent('xyzzy frobozz blargh')).toBe('unknown');
  });
});

// ---------------------------------------------------------------------------
// Tests: aggregateIntent()
// ---------------------------------------------------------------------------

describe('aggregateIntent()', () => {
  it('aggregates across last user messages', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello, who are you?' },
      { role: 'assistant', content: 'I am ALLI, Alli\'s concierge.' },
      { role: 'user', content: 'I would like to hire you for a project.' },
    ];
    const intent = aggregateIntent(messages);
    expect(intent).toBe('hire');
  });

  it('ignores assistant messages in scoring', () => {
    const messages: Message[] = [
      { role: 'assistant', content: 'I can provide a quote for your project.' },
      { role: 'user', content: 'Show me the hall booking demo walkthrough.' },
    ];
    const intent = aggregateIntent(messages);
    expect(intent).toBe('demo_help');
  });
});

// ---------------------------------------------------------------------------
// Tests: transitionState()
// ---------------------------------------------------------------------------

describe('transitionState()', () => {
  it('transitions to converting for high-intent at 2+ messages', () => {
    expect(transitionState('hire', 2)).toBe('converting');
    expect(transitionState('quote', 3)).toBe('converting');
  });

  it('transitions to qualified for high-intent at 1 message', () => {
    expect(transitionState('hire', 1)).toBe('qualified');
    expect(transitionState('quote', 0)).toBe('qualified');
  });

  it('transitions to engaged for technical questions at 2+ messages', () => {
    expect(transitionState('technical_question', 2)).toBe('engaged');
    expect(transitionState('demo_help', 3)).toBe('engaged');
  });

  it('stays in discovery for low-intent early messages', () => {
    expect(transitionState('general_enquiry', 1)).toBe('discovery');
    expect(transitionState('unknown', 0)).toBe('discovery');
  });
});

// ---------------------------------------------------------------------------
// Tests: selectActions()
// ---------------------------------------------------------------------------

describe('selectActions()', () => {
  it('returns all three conversion buttons in converting state', () => {
    const actions = selectActions('hire', 'converting');
    const labels = actions.map((a) => a.label);
    expect(labels).toContain('Generate Project Brief');
    expect(labels).toContain('Book 15-min Call');
    expect(labels).toContain('Message on WhatsApp');
  });

  it('returns brief + call for quote intent in qualified state', () => {
    const actions = selectActions('quote', 'qualified');
    const labels = actions.map((a) => a.label);
    expect(labels).toContain('Generate Project Brief');
    expect(labels).toContain('Book 15-min Call');
  });

  it('returns demo link for demo_help in engaged state', () => {
    const actions = selectActions('demo_help', 'engaged');
    const labels = actions.map((a) => a.label);
    expect(labels).toContain('Explore Live Demos');
  });

  it('returns empty array in discovery state', () => {
    expect(selectActions('unknown', 'discovery')).toHaveLength(0);
    expect(selectActions('general_enquiry', 'discovery')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Tests: qualify() — Full Pipeline
// ---------------------------------------------------------------------------

describe('qualify() — full qualification pipeline', () => {
  it('detects high-intent hire and returns highIntent=true', () => {
    const messages: Message[] = [
      { role: 'user', content: 'I would like to hire you for a contract.' },
      { role: 'assistant', content: 'Great! Let me learn more about your needs.' },
      { role: 'user', content: 'I need an engineer available to work with my team.' },
    ];
    const result = qualify(messages);
    expect(result.intent).toBe('hire');
    expect(result.highIntent).toBe(true);
    expect(result.state).toBe('converting');
    expect(result.actions.length).toBeGreaterThan(0);
  });

  it('returns highIntent=false for technical question', () => {
    const messages: Message[] = [
      { role: 'user', content: 'How does Next.js server rendering work?' },
    ];
    const result = qualify(messages);
    expect(result.highIntent).toBe(false);
  });

  it('returns empty actions in discovery state', () => {
    const messages: Message[] = [
      { role: 'user', content: 'Hello, who are you?' },
    ];
    const result = qualify(messages);
    expect(result.state).toBe('discovery');
    expect(result.actions).toHaveLength(0);
  });

  it('action buttons have valid hrefs', () => {
    const messages: Message[] = [
      { role: 'user', content: 'I need a quote for a web platform.' },
      { role: 'assistant', content: 'Sure!' },
      { role: 'user', content: 'Can you build me a proposal?' },
    ];
    const result = qualify(messages);
    result.actions.forEach((action) => {
      expect(action.href).toBeTruthy();
      expect(action.label).toBeTruthy();
      expect(['primary', 'secondary', 'whatsapp']).toContain(action.variant);
    });
  });
});
