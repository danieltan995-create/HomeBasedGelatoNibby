import type { Flavour, OrderAuditPayload, OrderRequestDetails, OrderSelection } from './types';
import { calculateSubtotal, orderLines } from './order';

export function createRequestId(now = new Date(), random = Math.random()): string {
  const date = now.toISOString().slice(0, 10).replaceAll('-', '');
  const suffix = Math.floor(random * 36 ** 4).toString(36).toUpperCase().padStart(4, '0');
  return `NIB-${date}-${suffix}`;
}

export function buildAuditPayload(
  requestId: string,
  selection: OrderSelection,
  menu: readonly Flavour[],
  details: OrderRequestDetails,
  currency: string | null,
): OrderAuditPayload {
  const lines = orderLines(selection, menu);
  return {
    requestId,
    createdAt: new Date().toISOString(),
    customerName: details.customerName.trim(),
    preferredDate: details.preferredDate,
    preferredTime: details.preferredTime,
    fulfilment: details.fulfilment,
    deliveryArea: details.fulfilment === 'delivery' ? details.deliveryArea.trim() : '',
    paymentMethod: details.paymentMethod,
    items: lines.map(({ flavour, quantity }) => ({ name: flavour.name, quantity })),
    subtotal: calculateSubtotal(selection, menu, currency),
    currency,
  };
}

export async function sendAudit(payload: OrderAuditPayload, endpoint: string | null): Promise<boolean> {
  if (!endpoint) return false;
  const body = JSON.stringify(payload);
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
      body,
    });
    return response.type === 'opaque' || response.ok;
  } catch {
    if (typeof navigator.sendBeacon === 'function') {
      return navigator.sendBeacon(endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
    }
    return false;
  }
}