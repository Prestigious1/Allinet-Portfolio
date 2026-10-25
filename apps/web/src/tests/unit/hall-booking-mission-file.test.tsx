import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import HallBookingCaseStudyPage, { metadata } from '@/app/(site)/projects/hall-booking/page';

describe('Hall Booking Case Study Mission File (TASK-P7-06 / SPEC-07 / F-163)', () => {
  it('defines valid metadata with descriptive title and open graph data', () => {
    expect(metadata.title).toBe(
      'Mission File: Hall & Event Booking Command Center — ALLINET'
    );
    expect(metadata.description).toMatch(/case study/i);
  });

  it('renders all required SPEC-07 section headings exactly', () => {
    const { container } = render(<HallBookingCaseStudyPage />);

    // Single <h1> check (SEO guideline)
    const h1s = screen.getAllByRole('heading', { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent('Hall & Event Booking Command Center');

    // Required SPEC-07 headings
    expect(screen.getByText('MISSION FILE • REF: MF-01')).toBeInTheDocument();
    expect(screen.getByText('BUSINESS TYPE')).toBeInTheDocument();
    expect(screen.getByText('THE PROBLEM')).toBeInTheDocument();
    expect(screen.getByText('WHAT I BUILT')).toBeInTheDocument();
    expect(screen.getByText('LIVE PROOF')).toBeInTheDocument();
    expect(screen.getByText('MEASURED / EXPECTED RESULT')).toBeInTheDocument();
    expect(screen.getByText('STACK')).toBeInTheDocument();
    expect(screen.getByText('SECURITY & DATA')).toBeInTheDocument();
    expect(screen.getByText('WHAT I WOULD ADD NEXT')).toBeInTheDocument();

    // Result kind badge check
    expect(screen.getByText('Simulated Result')).toBeInTheDocument();

    // Verify direct links to live demo
    const demoLinks = screen.getAllByRole('link', {
      name: /Launch Interactive Demo|Launch Live Demo/i,
    });
    expect(demoLinks.length).toBeGreaterThanOrEqual(1);
    expect(demoLinks[0]).toHaveAttribute('href', '/demos/hall-booking');

    // JSON-LD schema script test
    const script = container.querySelector('script[type="application/ld+json"]');
    expect(script).not.toBeNull();
    const parsed = JSON.parse(script!.textContent || '{}');
    expect(parsed['@context']).toBe('https://schema.org');
    expect(parsed['@graph']).toBeDefined();
    expect(parsed['@graph'][0]['@type']).toBe('Article');
    expect(parsed['@graph'][1]['@type']).toBe('SoftwareApplication');
  });
});
