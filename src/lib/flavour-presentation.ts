import type { Flavour } from './types';

// Shared by static HTML and the browser spotlight: never reveal an upcoming
// flavour's name or original artwork through visible copy, image alt or controls.
// This is a visual teaser, not secrecy for the source data in a public static site.
export function getFlavourPresentation(flavour: Flavour, base = import.meta.env.BASE_URL) {
  const comingSoon = flavour.availability === 'coming-soon';
  const name = comingSoon ? 'Mystery flavour' : flavour.name;
  return {
    comingSoon,
    name,
    shortName: comingSoon ? 'Mystery' : flavour.shortName,
    theme: comingSoon ? 'mystery' as const : flavour.theme,
    illustration: comingSoon
      ? `${base.replace(/\/$/, '')}/illustrations/mystery-cup.svg`
      : flavour.illustration,
    imageAlt: comingSoon
      ? 'Mystery flavour: grey illustrated cup with a question mark. Coming soon, not yet available.'
      : `Illustrated ${name} lidded cup; concept packaging, not a product photo`,
    heroLabel: comingSoon ? `${name} · coming soon` : name,
  };
}