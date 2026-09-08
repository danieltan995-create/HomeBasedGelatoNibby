export interface BusinessConfig {
  mode: 'draft' | 'live';
  name: string;
  area: string;
  currency: string | null;
  whatsappNumber: string | null;
  siteUrl: string | null;
  fulfilment: string | null;
  contactVerified: boolean;
  launchReviewed: boolean;
}

export interface Flavour {
  id: string;
  name: string;
  shortName: string;
  theme: 'lemon' | 'cocoa' | 'pistachio';
  illustration: string;
  volumeMl: number;
  volumeApproximate: boolean;
  priceMinor: number | null;
  availability: 'unconfirmed' | 'available' | 'sold-out' | 'coming-soon';
  details: string;
  allergens: string | null;
  contentReviewed: boolean;
}

export type OrderSelection = Readonly<Record<string, number>>;