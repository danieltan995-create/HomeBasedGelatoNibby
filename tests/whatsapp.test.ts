import { describe, expect, it } from 'vitest';
import { business } from '../src/data/business';
import { flavours } from '../src/data/flavours';
import type { BusinessConfig, Flavour, OrderRequestDetails, OrderSelection } from '../src/lib/types';
import { isInternationalNumber, validateBusinessConfig } from '../src/lib/validation';
import { buildOrderMessage, buildWhatsAppUrl, canSendRequest, validateOrderRequestDetails } from '../src/lib/whatsapp';
import { buildAuditPayload, createRequestId } from '../src/lib/order-audit';

// Reserved fictional NANP number. These tests inspect strings only; no network requests.
const testNumber = '12025550100';
const lemonId = 'lemon-almond-nibs';
const chocolateId = 'dark-chocolate';
const pistachioId = 'pistachio-my-love';

const liveBusiness: BusinessConfig = {
  ...business,
  mode: 'live',
  currency: 'MYR',
  whatsappNumber: testNumber,
  siteUrl: 'https://nibby.example',
  fulfilment: 'Test fixture: pickup arrangements confirmed with the owner.',
  contactVerified: true,
  launchReviewed: true,
};

function reviewedMenu(): Flavour[] {
  return flavours.map((flavour) => ({
    ...flavour,
    priceMinor: 1250,
    volumeMl: 140,
    volumeApproximate: false,
    details: 'Reviewed product description for testing only.',
    allergens: 'Test fixture only: contains milk and nuts.',
    contentReviewed: true,
    availability: 'available',
  }));
}

const invalidNumbers = [
  null,
  '',
  ' \t\n',
  '+12025550100',
  '02025550100',
  '1 202 555 0100',
  '1-202-555-0100',
  '1.2025550100',
  '1202555abcd',
  '1234567',
  '1234567890123456',
  '１２０２５５５０１００',
  ' 12025550100',
  '12025550100 ',
  '12025550100\n',
];

describe('international number validation', () => {
  it.each(['12345678', testNumber, '123456789012345'])('accepts 8–15 international digits: %s', (number) => {
    expect(isInternationalNumber(number)).toBe(true);
  });

  it.each(invalidNumbers)('rejects missing or malformed number %j', (number) => {
    expect(isInternationalNumber(number)).toBe(false);
  });
});

describe('WhatsApp URL construction', () => {
  it('encodes Unicode, multiplication signs, emoji, reserved characters and newlines exactly once', () => {
    const message = 'Hello Nibby!\n2 × Crème brûlée 🍨 & pistachio + cocoa #1\nKeep literal %26 and %2B; 50% cacao.';
    const href = buildWhatsAppUrl(testNumber, message);
    expect(href).not.toBeNull();
    const url = new URL(href!);

    expect(url.origin).toBe('https://wa.me');
    expect(url.pathname).toBe(`/${testNumber}`);
    expect(url.username).toBe('');
    expect(url.password).toBe('');
    expect(url.hash).toBe('');
    // Parsing must perform the only decoding needed. Double-encoding would fail this.
    expect(url.searchParams.getAll('text')).toEqual([message]);
    expect([...url.searchParams.keys()]).toEqual(['text']);
  });

  it('preserves surrounding whitespace in a nonempty message', () => {
    const message = '  A request\n\n';
    const href = buildWhatsAppUrl(testNumber, message);
    expect(href).not.toBeNull();
    expect(new URL(href!).searchParams.get('text')).toBe(message);
  });

  it.each(invalidNumbers)('returns null for unusable number %j', (number) => {
    expect(buildWhatsAppUrl(number, 'One cup, please.')).toBeNull();
  });

  it.each(['', ' ', '\t\r\n', '\u00a0'])('returns null for empty message %j', (message) => {
    expect(buildWhatsAppUrl(testNumber, message)).toBeNull();
  });
});

describe('order request messages', () => {
  it('preserves every selected quantity without adding packaging details', () => {
    const selection: OrderSelection = Object.freeze({ [lemonId]: 1, [chocolateId]: 99 });
    const message = buildOrderMessage(selection, flavours, business);
    const lines = message.split('\n');
    const productLines = lines.filter((line) => /^\d+ × /.test(line));

    expect(message).toContain(business.name);
    expect(message).toContain(business.area);
    expect(message).toMatch(/draft preview/i);
    expect(message).toMatch(/not an order/i);
    expect(productLines).toHaveLength(2);
    for (const flavour of flavours.filter(({ id }) => id in selection)) {
      const matching = productLines.filter((line) => line === `${selection[flavour.id]} × *${flavour.name}*`);
      expect(matching).toHaveLength(1);
    }
    expect(message).toMatch(/prices.*awaiting confirmation/i);
    expect(message).not.toMatch(/product subtotal/i);
    expect(message).toMatch(/confirm availability, final price/i);
    expect(message).toMatch(/pickup\/delivery/i);
    expect(message).toMatch(/request, not a confirmed order/i);
    expect(selection).toEqual({ [lemonId]: 1, [chocolateId]: 99 });
    expect(message).not.toMatch(/pistachio|mystery/i);
  });

  it('omits unselected flavours', () => {
    const message = buildOrderMessage({ [chocolateId]: 2 }, flavours, business);
    expect(message).toContain('2 × *Dark Chocolate*');
    expect(message).not.toContain('Lemon Almond Nibs');
    expect(message).not.toContain('Pistachio My Love');
  });

  it('uses the configured names and area without losing special characters in the URL', () => {
    const menu = reviewedMenu().map((flavour) => ({ ...flavour, name: `${flavour.name} — Crème 🍨 & + #1` }));
    const config: BusinessConfig = { ...business, name: 'Nibby & Friends 🍦', area: 'Melaka + nearby #1' };
    const selection: OrderSelection = { [lemonId]: 2, [chocolateId]: 3, [pistachioId]: 99 };
    const message = buildOrderMessage(selection, menu, config);
    const href = buildWhatsAppUrl(testNumber, message);
    expect(href).not.toBeNull();
    expect(new URL(href!).searchParams.get('text')).toBe(message);
    expect(message).toContain(config.name);
    expect(message).toContain(config.area);
    for (const flavour of menu) {
      expect(message).toContain(`${selection[flavour.id]} × *${flavour.name}*`);
    }
  });

  it('includes the live product subtotal, excludes fulfilment fees and still requires confirmation', () => {
    const menu = reviewedMenu();
    expect(() => validateBusinessConfig(liveBusiness, menu)).not.toThrow();
    const message = buildOrderMessage({ [lemonId]: 2, [chocolateId]: 1 }, menu, liveBusiness);
    const amount = new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(37.5);

    expect(message).toMatch(/product subtotal/i);
    expect(message).toContain(amount);
    expect(message).toMatch(/excludes.*fulfilment fees/i);
    expect(message).toMatch(/confirm availability, final price/i);
    expect(message).toMatch(/request, not a confirmed order/i);
    expect(message).not.toMatch(/draft preview|approx\.?|140\s*ml|lidded cup/i);
  });

  it('includes customer and fulfilment details without confirming the order', () => {
    const details: OrderRequestDetails = {
      customerName: ' Aina ',
      preferredDate: '2026-09-12',
      preferredTime: '15:30',
      fulfilment: 'delivery',
      deliveryArea: 'Ayer Keroh',
      paymentMethod: 'qr_transfer',
    };
    const message = buildOrderMessage({ [lemonId]: 2 }, flavours, business, details);

    expect(message).toContain('Name: Aina');
    expect(message).toContain('Preferred date: 2026-09-12');
    expect(message).toContain('Preferred time: 15:30');
    expect(message).toContain('Fulfilment: Delivery to Ayer Keroh');
    expect(message).toContain('Payment method: QR Transfer');
    expect(message).toMatch(/request, not a confirmed order/i);
    expect(message).not.toMatch(/140\s*ml|lidded cup/i);
  });

  it('protects the request reference used for tracking', () => {
    const message = buildOrderMessage({ [lemonId]: 1 }, flavours, business, {
      customerName: 'Aina',
      preferredDate: '2026-09-12',
      preferredTime: '15:30',
      fulfilment: 'pickup',
      deliveryArea: '',
      paymentMethod: 'cod',
    }, 'NIB-20260908-AB12');

    expect(message).toContain('Request reference: *NIB-20260908-AB12*');
    expect(message).toMatch(/do not delete or change the Request reference/i);
    expect(message).toMatch(/required for order tracking/i);
  });

  it.each([
    [{ customerName: '', preferredDate: '2026-09-12', preferredTime: '15:30', fulfilment: 'pickup', deliveryArea: '', paymentMethod: 'cod' }, 'name'],
    [{ customerName: 'Aina', preferredDate: '', preferredTime: '15:30', fulfilment: 'pickup', deliveryArea: '', paymentMethod: 'cod' }, 'date'],
    [{ customerName: 'Aina', preferredDate: '2026-09-12', preferredTime: '', fulfilment: 'pickup', deliveryArea: '', paymentMethod: 'cod' }, 'time'],
    [{ customerName: 'Aina', preferredDate: '2026-09-12', preferredTime: '15:30', fulfilment: 'delivery', deliveryArea: '', paymentMethod: 'cod' }, 'delivery area'],
  ] as const)('requires %s', (details, field) => {
    expect(validateOrderRequestDetails(details)).toMatch(new RegExp(field, 'i'));
  });

  it('does not publish a partial subtotal for a mixture of known and unknown prices', () => {
    const menu = reviewedMenu().map((flavour) => ({ ...flavour, priceMinor: flavour.id === lemonId ? null : 1250 }));
    const message = buildOrderMessage({ [lemonId]: 1, [chocolateId]: 2 }, menu, { ...business, currency: 'MYR' });
    expect(message).toMatch(/prices.*awaiting confirmation/i);
    expect(message).not.toMatch(/product subtotal/i);
  });

  it('keeps prices pending when currency is unknown, even with known prices', () => {
    const message = buildOrderMessage({ [lemonId]: 1 }, reviewedMenu(), business);
    expect(message).toMatch(/prices.*awaiting confirmation/i);
    expect(message).not.toMatch(/product subtotal/i);
  });

  it('includes an explicitly configured zero subtotal rather than pending prices', () => {
    const menu = reviewedMenu().map((flavour) => ({ ...flavour, priceMinor: 0 }));
    const message = buildOrderMessage({ [lemonId]: 2 }, menu, liveBusiness);
    expect(message).toMatch(/product subtotal/i);
    expect(message).toContain(new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR' }).format(0));
    expect(message).not.toMatch(/prices.*awaiting confirmation/i);
  });

  it.each(['draft', 'live'] as const)('throws for an empty %s order', (mode) => {
    expect(() => buildOrderMessage({}, reviewedMenu(), { ...liveBusiness, mode })).toThrow();
  });

  it.each([0, -1, 1.5, NaN, Infinity, 100])('rejects malformed line quantity %s instead of omitting it', (quantity) => {
    expect(() => buildOrderMessage({ [lemonId]: quantity, [chocolateId]: 1 }, flavours, business)).toThrow();
  });

  it('rejects unknown and sold-out items instead of producing an incomplete request', () => {
    expect(() => buildOrderMessage({ 'not-on-menu': 1 }, flavours, business)).toThrow();
    const menu = reviewedMenu().map((flavour) => ({ ...flavour, availability: 'sold-out' as const }));
    expect(() => buildOrderMessage({ [lemonId]: 1 }, menu, liveBusiness)).toThrow();
  });

  it.each(['draft', 'live'] as const)('blocks coming-soon flavours in a forged %s selection', (mode) => {
    const forgedSelections: OrderSelection[] = [{ [pistachioId]: 1 }, { [lemonId]: 1, [pistachioId]: 1 }];
    for (const selection of forgedSelections) {
      expect(() => buildOrderMessage(selection, flavours, { ...liveBusiness, mode })).toThrow(/unavailable/i);
    }
  });
});

describe('request sending gate', () => {
  it('allows a configured draft to send a test request', () => {
    expect(canSendRequest(business)).toBe(true);
  });

  it('cannot send a draft without a WhatsApp number', () => {
    expect(canSendRequest({ ...business, whatsappNumber: null })).toBe(false);
  });

  it('allows a draft test request with a valid contact', () => {
    expect(canSendRequest({ ...liveBusiness, mode: 'draft' })).toBe(true);
  });

  it('allows a live, verified and fully reviewed fixture', () => {
    expect(() => validateBusinessConfig(liveBusiness, reviewedMenu())).not.toThrow();
    expect(canSendRequest(liveBusiness)).toBe(true);
  });

  it.each(['contactVerified', 'launchReviewed'] as const)('blocks a live request without %s', (flag) => {
    expect(canSendRequest({ ...liveBusiness, [flag]: false })).toBe(false);
  });

  it.each(invalidNumbers)('blocks a live request with invalid contact %j', (whatsappNumber) => {
    expect(canSendRequest({ ...liveBusiness, whatsappNumber })).toBe(false);
  });
});

describe('Google Sheets audit payloads', () => {
  const details: OrderRequestDetails = {
    customerName: 'Aina',
    preferredDate: '2026-09-12',
    preferredTime: '15:30',
    fulfilment: 'delivery',
    deliveryArea: 'Ayer Keroh',
    paymentMethod: 'qr_transfer',
  };

  it('creates a readable request reference', () => {
    expect(createRequestId(new Date('2026-09-08T10:00:00Z'), 0)).toBe('NIB-20260908-0000');
    expect(createRequestId(new Date('2026-09-08T10:00:00Z'), 0.99999)).toMatch(/^NIB-20260908-[A-Z0-9]{4}$/);
  });

  it('builds an audit payload from the same order selection', () => {
    const payload = buildAuditPayload('NIB-20260908-AB12', { [lemonId]: 2 }, flavours, details, null);
    expect(payload).toMatchObject({
      requestId: 'NIB-20260908-AB12',
      customerName: 'Aina',
      fulfilment: 'delivery',
      deliveryArea: 'Ayer Keroh',
      paymentMethod: 'qr_transfer',
      subtotal: null,
      currency: null,
    });
    expect(payload.items).toEqual([{ name: 'Lemon Almond Nibs', quantity: 2 }]);
    expect(payload.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });
});