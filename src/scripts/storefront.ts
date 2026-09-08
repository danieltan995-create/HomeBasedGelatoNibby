import { business } from '../data/business';
import { flavours } from '../data/flavours';
import type { OrderSelection } from '../lib/types';
import { calculateSubtotal, formatPrice, MAX_QUANTITY, orderLines, setQuantity, volumeLabel } from '../lib/order';
import { buildOrderMessage, buildWhatsAppUrl, canSendRequest } from '../lib/whatsapp';

function required<T extends Element>(selector: string): T {
  const node = document.querySelector<T>(selector);
  if (!node) throw new Error(`Missing storefront element: ${selector}`);
  return node;
}

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string) {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function initStorefront() {
  const dialog = required<HTMLDialogElement>('#order-dialog');
  const lineContainer = required<HTMLElement>('[data-order-lines]');
  const messageField = required<HTMLTextAreaElement>('#order-message');
  const toast = required<HTMLElement>('[data-toast]');
  const status = required<HTMLElement>('[data-drawer-status]');
  const sendLink = required<HTMLAnchorElement>('[data-whatsapp]');
  const disabledSend = required<HTMLButtonElement>('[data-send-disabled]');
  let selection: OrderSelection = {};
  let opener: HTMLElement | null = null;
  let toastTimer: ReturnType<typeof setTimeout>;

  const announce = (text: string) => {
    toast.textContent = text;
    toast.dataset.visible = '';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { delete toast.dataset.visible; }, 3200);
  };

  function render() {
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement.dataset.focusKey : undefined;
    const lines = orderLines(selection, flavours);
    const count = lines.reduce((sum, line) => sum + line.quantity, 0);
    document.querySelectorAll('[data-count]').forEach((node) => { node.textContent = String(count); });
    document.body.classList.toggle('has-cups', count > 0);
    required<HTMLElement>('[data-mobile-bag]').hidden = count === 0;
    required<HTMLElement>('[data-empty-order]').hidden = count > 0;
    required<HTMLElement>('[data-order-summary]').hidden = count === 0;
    document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((button) => {
      const id = button.dataset.add!;
      button.disabled = flavours.find((item) => item.id === id)?.availability === 'sold-out' || (selection[id] ?? 0) >= MAX_QUANTITY;
    });

    const fragment = document.createDocumentFragment();
    for (const { flavour, quantity } of lines) {
      const row = element('div', 'order-line');
      row.dataset.line = flavour.id;
      const image = element('img', '');
      image.src = flavour.illustration;
      image.alt = ''; // The adjacent heading identifies the flavour.
      image.width = 75;
      image.height = 75;
      const info = element('div', 'line-info');
      const controls = element('div', 'line-controls');
      const decrease = element('button', 'quantity-button', '−');
      decrease.setAttribute('aria-label', `Decrease ${flavour.name}`);
      decrease.dataset.focusKey = `${flavour.id}-minus`;
      decrease.addEventListener('click', () => changeQuantity(flavour.id, quantity - 1));
      const input = element('input', 'quantity-input');
      input.type = 'number';
      input.min = '0';
      input.max = String(MAX_QUANTITY);
      input.step = '1';
      input.inputMode = 'numeric';
      input.value = String(quantity);
      input.setAttribute('aria-label', `Quantity for ${flavour.name}`);
      input.dataset.focusKey = `${flavour.id}-quantity`;
      input.addEventListener('change', () => changeQuantity(flavour.id, input.value === '' ? NaN : input.valueAsNumber));
      const increase = element('button', 'quantity-button', '+');
      increase.setAttribute('aria-label', `Increase ${flavour.name}`);
      increase.dataset.focusKey = `${flavour.id}-plus`;
      increase.disabled = quantity >= MAX_QUANTITY;
      increase.addEventListener('click', () => changeQuantity(flavour.id, quantity + 1));
      const remove = element('button', 'remove-line', 'Remove');
      remove.setAttribute('aria-label', `Remove ${flavour.name}`);
      remove.dataset.focusKey = `${flavour.id}-remove`;
      remove.addEventListener('click', () => changeQuantity(flavour.id, 0));
      controls.append(decrease, input, increase, remove);
      info.append(element('h3', '', flavour.name), element('p', '', `${volumeLabel(flavour)} · ${formatPrice(flavour.priceMinor, business.currency)}`), controls);
      row.append(image, info);
      fragment.append(row);
    }
    lineContainer.replaceChildren(fragment);
    const subtotal = calculateSubtotal(selection, flavours, business.currency);
    required<HTMLElement>('[data-subtotal]').textContent = subtotal === null ? 'To be confirmed' : formatPrice(subtotal, business.currency);
    messageField.value = count ? buildOrderMessage(selection, flavours, business) : '';
    const url = count && canSendRequest(business) ? buildWhatsAppUrl(business.whatsappNumber, messageField.value) : null;
    sendLink.hidden = !url;
    disabledSend.hidden = !!url;
    if (url) sendLink.href = url;
    else sendLink.removeAttribute('href');
    if (focused && dialog.open) {
      const next = dialog.querySelector<HTMLElement>(`[data-focus-key="${CSS.escape(focused)}"]`);
      if (next && !(next instanceof HTMLButtonElement && next.disabled)) next.focus();
      else (dialog.querySelector<HTMLInputElement>('.quantity-input') ?? required<HTMLButtonElement>('[data-close-order]')).focus();
    }
  }

  function changeQuantity(id: string, quantity: number) {
    try {
      selection = setQuantity(selection, flavours, id, quantity);
      render();
      const name = flavours.find((item) => item.id === id)!.name;
      status.textContent = quantity ? `${name}: ${quantity} ${quantity === 1 ? 'cup' : 'cups'}.` : `${name} removed.`;
    } catch (error) {
      render();
      status.textContent = error instanceof Error ? error.message : 'Please check your quantity.';
    }
  }

  document.querySelectorAll<HTMLButtonElement>('[data-open-order]').forEach((button) => {
    button.addEventListener('click', () => {
      opener = button;
      status.textContent = '';
      render();
      if (!dialog.open) dialog.showModal();
      document.body.classList.add('dialog-open');
    });
  });
  document.querySelectorAll<HTMLButtonElement>('[data-close-order]').forEach((button) => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('close', () => {
    document.body.classList.remove('dialog-open');
    const target = opener && opener.getClientRects().length ? opener : document.querySelector<HTMLElement>('.bag-button');
    target?.focus({ preventScroll: true });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-add]').forEach((button) => {
    button.addEventListener('click', () => {
      const id = button.dataset.add!;
      try {
        selection = setQuantity(selection, flavours, id, (selection[id] ?? 0) + 1);
        render();
        announce(`${flavours.find((item) => item.id === id)!.name} added to your cups.`);
      } catch (error) {
        announce(error instanceof Error ? error.message : 'Could not add this flavour.');
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('[data-spotlight]').forEach((button) => {
    button.addEventListener('click', () => {
      const flavour = flavours.find((item) => item.id === button.dataset.spotlight);
      if (!flavour) return;
      const image = required<HTMLImageElement>('[data-hero-image]');
      image.src = flavour.illustration;
      image.alt = `Concept illustration of a ${flavour.name} lidded cup`;
      required<HTMLElement>('[data-hero-name]').textContent = flavour.name;
      required<HTMLElement>('[data-hero-theme]').dataset.heroTheme = flavour.theme;
      document.querySelectorAll('[data-spotlight]').forEach((node) => node.setAttribute('aria-pressed', String(node === button)));
      document.querySelectorAll<HTMLElement>('[data-card]').forEach((node) => {
        if (node.dataset.card === flavour.id) node.dataset.featured = '';
        else delete node.dataset.featured;
      });
    });
  });

  required<HTMLButtonElement>('[data-clear]').addEventListener('click', () => {
    selection = {};
    render();
    status.textContent = 'Your selection has been cleared.';
    required<HTMLButtonElement>('[data-close-order]').focus();
  });
  required<HTMLButtonElement>('[data-copy]').addEventListener('click', async () => {
    if (!messageField.value) return;
    try {
      await navigator.clipboard.writeText(messageField.value);
      status.textContent = business.mode === 'draft' ? 'Draft message copied. Nothing has been sent.' : 'Message copied. Nothing has been sent.';
    } catch {
      required<HTMLDetailsElement>('.message-details').open = true;
      messageField.focus();
      messageField.select();
      status.textContent = 'Clipboard unavailable. The message is selected; copy it using your device’s copy command.';
    }
  });

  render();
  document.querySelectorAll<HTMLElement>('[data-enhance]').forEach((node) => { node.hidden = false; });
}

initStorefront();