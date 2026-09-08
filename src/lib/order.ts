import type { Flavour, OrderSelection } from './types';

export const MAX_QUANTITY = 99; // A request UI limit, not an inventory claim.

export function orderLines(selection: OrderSelection, menu: readonly Flavour[]) {
  return Object.entries(selection).map(([id, quantity]) => {
    const flavour = menu.find((item) => item.id === id);
    if (!flavour || flavour.availability === 'sold-out') throw new Error('Flavour unavailable.');
    if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
      throw new Error(`Choose a whole number from 1 to ${MAX_QUANTITY}.`);
    }
    return { flavour, quantity };
  });
}

export function setQuantity(selection: OrderSelection, menu: readonly Flavour[], id: string, quantity: number): OrderSelection {
  orderLines(selection, menu);
  const flavour = menu.find((item) => item.id === id);
  if (!flavour || flavour.availability === 'sold-out') throw new Error('Flavour unavailable.');
  if (!Number.isSafeInteger(quantity) || quantity < 0 || quantity > MAX_QUANTITY) {
    throw new Error(`Choose a whole number from 0 to ${MAX_QUANTITY}.`);
  }
  const next = { ...selection };
  if (quantity === 0) delete next[id];
  else next[id] = quantity;
  return next;
}

export function calculateSubtotal(selection: OrderSelection, menu: readonly Flavour[], currency: string | null): number | null {
  const lines = orderLines(selection, menu);
  if (!lines.length || !currency || lines.some(({ flavour }) => flavour.priceMinor === null)) return null;
  const total = lines.reduce((sum, { flavour, quantity }) => sum + flavour.priceMinor! * quantity, 0);
  if (!Number.isSafeInteger(total)) throw new Error('Order total exceeds supported amount.');
  return total;
}

export function formatPrice(minor: number | null, currency: string | null): string {
  if (minor === null || currency === null) return 'Price coming soon';
  const formatter = new Intl.NumberFormat('en-MY', { style: 'currency', currency });
  const digits = formatter.resolvedOptions().maximumFractionDigits ?? 2;
  return formatter.format(minor / 10 ** digits);
}

export function volumeLabel(flavour: Flavour): string {
  return `${flavour.volumeApproximate ? 'Approx. ' : ''}${flavour.volumeMl} ml`;
}