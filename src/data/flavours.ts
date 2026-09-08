import type { Flavour } from '../lib/types';

// Prices use integer minor units (e.g. 1250 means 12.50 for MYR), never floating point.
// null means unknown, NOT free. Keep unverified dietary claims out of the menu.
export const flavours: Flavour[] = [
  {
    id: 'lemon-almond-nibs',
    name: 'Lemon Almond Nibs',
    shortName: 'Lemon',
    theme: 'lemon',
    illustration: '/illustrations/lemon-almond-nibs.svg',
    volumeMl: 140,
    volumeApproximate: true,
    priceMinor: null,
    availability: 'unconfirmed',
    details: 'Meet Lemon Almond Nibs, one of our first three flavours. Full ingredient and allergen details are being finalised.',
    allergens: null,
    contentReviewed: false,
  },
  {
    id: 'dark-chocolate',
    name: 'Dark Chocolate',
    shortName: 'Chocolate',
    theme: 'cocoa',
    illustration: '/illustrations/dark-chocolate.svg',
    volumeMl: 140,
    volumeApproximate: true,
    priceMinor: null,
    availability: 'unconfirmed',
    details: 'Meet Dark Chocolate, one of our first three flavours. Full ingredient and allergen details are being finalised.',
    allergens: null,
    contentReviewed: false,
  },
  {
    id: 'pistachio-my-love',
    name: 'Pistachio My Love',
    shortName: 'Pistachio',
    theme: 'pistachio',
    illustration: '/illustrations/pistachio-my-love.svg',
    volumeMl: 140,
    volumeApproximate: true,
    priceMinor: null,
    availability: 'unconfirmed',
    details: 'Meet Pistachio My Love, one of our first three flavours. Full ingredient and allergen details are being finalised.',
    allergens: null,
    contentReviewed: false,
  },
];