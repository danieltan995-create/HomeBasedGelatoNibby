import type { Flavour } from '../lib/types';

// Prices use integer minor units (e.g. 1250 means 12.50 for MYR), never floating point.
// null means unknown, NOT free. Keep unverified dietary claims out of the menu.
const assetPath = (fileName: string) => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/illustrations/${fileName}`;

export const flavours: Flavour[] = [
  {
    id: 'lemon-almond-nibs',
    name: 'Lemon Almond Nibs',
    shortName: 'Lemon',
    theme: 'lemon',
    illustration: assetPath('lemon-almond-nibs.svg'),
    volumeMl: 140,
    volumeApproximate: true,
    priceMinor: null,
    availability: 'unconfirmed',
    details: 'Meet Lemon Almond Nibs, part of our starting lineup. Full ingredient and allergen details are being finalised.',
    allergens: null,
    contentReviewed: false,
  },
  {
    id: 'dark-chocolate',
    name: 'Dark Chocolate',
    shortName: 'Chocolate',
    theme: 'cocoa',
    illustration: assetPath('dark-chocolate.svg'),
    volumeMl: 140,
    volumeApproximate: true,
    priceMinor: null,
    availability: 'unconfirmed',
    details: 'Meet Dark Chocolate, part of our starting lineup. Full ingredient and allergen details are being finalised.',
    allergens: null,
    contentReviewed: false,
  },
  {
    id: 'pistachio-my-love',
    name: 'Pistachio My Love',
    shortName: 'Pistachio',
    theme: 'pistachio',
    illustration: assetPath('pistachio-my-love.svg'),
    volumeMl: 140,
    volumeApproximate: true,
    priceMinor: null,
    // Keep the real name and artwork here for the reveal. Coming-soon flavours
    // use a generic mystery presentation and cannot be selected for an order.
    availability: 'coming-soon',
    details: 'Not prepared or released yet. Product details will be reviewed before the reveal.',
    allergens: null,
    contentReviewed: false,
  },
];