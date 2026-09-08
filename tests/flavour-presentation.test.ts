import { describe, expect, it } from 'vitest';
import { flavours } from '../src/data/flavours';
import { getFlavourPresentation } from '../src/lib/flavour-presentation';
import { canSelectFlavour } from '../src/lib/order';

const pistachio = flavours.find(({ id }) => id === 'pistachio-my-love')!;

describe('coming-soon presentation', () => {
  it('keeps pistachio as an unreleased, unpriced teaser', () => {
    expect(pistachio.availability).toBe('coming-soon');
    expect(pistachio.priceMinor).toBeNull();
    expect(canSelectFlavour(pistachio)).toBe(false);
    expect(canSelectFlavour(undefined)).toBe(false);
    expect(flavours.filter(canSelectFlavour).map(({ id }) => id)).toEqual(['lemon-almond-nibs', 'dark-chocolate']);
  });

  it.each(['/', '/HomeBasedGelatoNibby', '/HomeBasedGelatoNibby/'])('uses base-safe mystery art with base %s', (base) => {
    const preview = getFlavourPresentation(pistachio, base);
    expect(preview).toMatchObject({
      comingSoon: true,
      name: 'Mystery flavour',
      shortName: 'Mystery',
      theme: 'mystery',
      illustration: `${base.replace(/\/$/, '')}/illustrations/mystery-cup.svg`,
      heroLabel: 'Mystery flavour · coming soon',
    });
    expect(preview.imageAlt).toMatch(/grey.*question mark.*coming soon/i);
    expect(JSON.stringify(preview)).not.toMatch(/pistachio/i);
  });

  it.each(['unconfirmed', 'available', 'sold-out'] as const)('restores original identity when revealed as %s', (availability) => {
    const revealed = { ...pistachio, availability };
    const preview = getFlavourPresentation(revealed);
    expect(preview).toMatchObject({
      comingSoon: false,
      name: pistachio.name,
      shortName: pistachio.shortName,
      theme: pistachio.theme,
      illustration: pistachio.illustration,
      heroLabel: pistachio.name,
    });
    expect(preview.imageAlt).toContain(pistachio.name);
    expect(canSelectFlavour(revealed)).toBe(availability !== 'sold-out');
  });
});