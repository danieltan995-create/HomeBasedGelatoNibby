import type { BusinessConfig, Flavour, OrderRequestDetails, OrderSelection } from './types';
import { calculateSubtotal, formatPrice, orderLines } from './order';
import { isInternationalNumber } from './validation';

export function validateOrderRequestDetails(details: OrderRequestDetails): string | null {
  if (!details.customerName.trim()) return 'Enter your name.';
  if (!details.preferredDate) return 'Choose a preferred date.';
  if (!details.preferredTime) return 'Choose a preferred time.';
  if (details.fulfilment === 'delivery' && !details.deliveryArea.trim()) return 'Enter your delivery area.';
  if (!['cod', 'qr_transfer'].includes(details.paymentMethod)) return 'Choose a payment method.';
  return null;
}

export function buildOrderMessage(selection: OrderSelection, menu: readonly Flavour[], config: BusinessConfig, details?: OrderRequestDetails, requestId?: string): string {
  const lines = orderLines(selection, menu);
  if (!lines.length) throw new Error('Add a cup before preparing a request.');
  if (details) {
    const detailsError = validateOrderRequestDetails(details);
    if (detailsError) throw new Error(detailsError);
  }
  const subtotal = calculateSubtotal(selection, menu, config.currency);
  const requestDetails = details ? [
    ...(requestId ? [
      `Request reference: *${requestId}*`,
      '_Please do not delete or change the Request reference. It is required for order tracking._',
    ] : []),
    ,
    `Name: ${details.customerName.trim()}`,
    `Preferred date: ${details.preferredDate}`,
    `Preferred time: ${details.preferredTime}`,
    `Fulfilment: ${details.fulfilment === 'delivery' ? `Delivery to ${details.deliveryArea.trim()}` : 'Pickup'}`,
    `Payment method: ${details.paymentMethod === 'qr_transfer' ? 'QR Transfer' : 'COD'}`,
    '',
  ] : [];
  return [
    `${config.mode === 'draft' ? '[DRAFT PREVIEW — NOT AN ORDER]\n' : ''}Hello ${config.name}! I’d like to request:`,
    '',
    ...requestDetails,
    ...lines.map(({ flavour, quantity }) => `${quantity} × *${flavour.name}*`),
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