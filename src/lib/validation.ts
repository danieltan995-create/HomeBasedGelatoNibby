import type { BusinessConfig, Flavour } from './types';

export function isInternationalNumber(value: string | null): value is string {
  return value !== null && /^[1-9]\d{7,14}$/.test(value);
}

export function validateFlavours(menu: readonly Flavour[]): void {
  if (!menu.length) throw new Error('The menu must contain at least one flavour.');
  const ids = new Set<string>();
  for (const item of menu) {
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.id) || ids.has(item.id)) {
      throw new Error('Flavour IDs must be unique lowercase slugs.');
    }
    ids.add(item.id);
    if (!['unconfirmed', 'available', 'sold-out', 'coming-soon'].includes(item.availability)) {
      throw new Error(`Invalid availability for ${item.id}.`);
    }
    if (!item.name.trim() || !Number.isSafeInteger(item.volumeMl) || item.volumeMl <= 0) {
      throw new Error(`Invalid name or volume for ${item.id}.`);
    }
    if (item.priceMinor !== null && (!Number.isSafeInteger(item.priceMinor) || item.priceMinor < 0)) {
      throw new Error(`Invalid price for ${item.id}. Use nonnegative integer minor units or null.`);
    }
  }
}

export function validateBusinessConfig(config: BusinessConfig, menu: readonly Flavour[]): void {
  validateFlavours(menu);
  if (config.whatsappNumber !== null && !isInternationalNumber(config.whatsappNumber)) {
    throw new Error('WhatsApp number must contain 8–15 international digits.');
  }
  if (config.currency !== null && !/^[A-Z]{3}$/.test(config.currency)) {
    throw new Error('Currency must be a three-letter ISO code.');
  }
  if (config.siteUrl !== null) {
    const url = new URL(config.siteUrl);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash) {
      throw new Error('Use a public HTTPS site URL without credentials, query or fragment.');
    }
  }
  if (config.mode === 'live') {
    if (!config.launchReviewed || !config.contactVerified || !config.whatsappNumber || !config.currency || !config.siteUrl || !config.fulfilment?.trim()) {
      throw new Error('Live launch blocked: review contact, currency, site URL and fulfilment first.');
    }
    // Teasers expose no product details or ordering control. Require the usual
    // review as soon as a flavour leaves coming-soon, even if it is sold out.
    if (menu.some((item) => item.availability !== 'coming-soon' && (item.priceMinor === null || !item.contentReviewed || item.volumeApproximate || !item.allergens?.trim() || item.availability === 'unconfirmed'))) {
      throw new Error('Live launch blocked: confirm every revealed flavour’s price, volume, availability and allergen information.');
    }
  }
}