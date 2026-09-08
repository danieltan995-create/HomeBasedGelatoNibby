import type { BusinessConfig, Flavour, OrderSelection } from './types';
import { calculateSubtotal, formatPrice, orderLines, volumeLabel } from './order';
import { isInternationalNumber } from './validation';

export function buildOrderMessage(selection: OrderSelection, menu: readonly Flavour[], config: BusinessConfig): string {
  const lines = orderLines(selection, menu);
  if (!lines.length) throw new Error('Add a cup before preparing a request.');
  const subtotal = calculateSubtotal(selection, menu, config.currency);
  return [
    `${config.mode === 'draft' ? '[DRAFT PREVIEW — NOT AN ORDER]\n' : ''}Hello ${config.name}! I’d like to request:`,
    '',
    ...lines.map(({ flavour, quantity }) => `${quantity} × ${flavour.name} (${volumeLabel(flavour)}, lidded cup)`),
    '',
    subtotal === null ? 'Prices: awaiting confirmation.' : `Product subtotal: ${formatPrice(subtotal, config.currency)} (excludes any fulfilment fees).`,
    'Please confirm availability, final price and pickup/delivery arrangements in ' + config.area + '.',
    'This is a request, not a confirmed order.',
  ].join('\n');
}

export function buildWhatsAppUrl(number: string | null, message: string): string | null {
  if (!isInternationalNumber(number) || !message.trim()) return null;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function canSendRequest(config: BusinessConfig): boolean {
  if (!isInternationalNumber(config.whatsappNumber)) return false;
  return config.mode === 'draft' || (config.contactVerified && config.launchReviewed);
}