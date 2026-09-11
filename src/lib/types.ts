export interface BusinessConfig {
  mode: 'draft' | 'live';
  name: string;
  area: string;
  currency: string | null;
  whatsappNumber: string | null;
  auditWebhookUrl: string | null;
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
  ingredients: readonly string[] | null;
  allergens: string | null;
  contentReviewed: boolean;
}

export type OrderSelection = Readonly<Record<string, number>>;

export type FulfilmentChoice = 'pickup' | 'delivery';
export type PaymentMethod = 'cod' | 'qr_transfer';

export interface OrderRequestDetails {
  customerName: string;
  preferredDate: string;
  preferredTime: string;
  fulfilment: FulfilmentChoice;
  deliveryArea: string;
  paymentMethod: PaymentMethod;
}

export interface OrderAuditPayload {
  requestId: string;
  createdAt: string;
  customerName: string;
  preferredDate: string;
  preferredTime: string;
  fulfilment: FulfilmentChoice;
  deliveryArea: string;
  paymentMethod: PaymentMethod;
  items: Array<{ name: string; quantity: number }>;
  subtotal: number | null;
  currency: string | null;
}