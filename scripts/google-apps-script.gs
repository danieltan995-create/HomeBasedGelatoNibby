const SHEET_NAME = 'Orders';
const HEADERS = [
  'Request ID',
  'Created at',
  'Customer name',
  'Preferred date',
  'Preferred time',
  'Fulfilment',
  'Delivery area',
  'Items',
  'Subtotal',
  'Currency',
  'Payment method',
  'Order Status',
  'Owner notes',
];
const ORDER_STATUSES = ['PENDING', 'PAID', 'COMPLETED', 'CANCELLED'];

function doPost(event) {
  try {
    const sheet = getOrdersSheet();
    ensureHeaders(sheet);
    if (!event || !event.postData || typeof event.postData.contents !== 'string') {
      throw new Error('Missing POST body');
    }
    const payload = JSON.parse(event.postData.contents);
    validatePayload(payload);
    const lastRow = sheet.getLastRow();
    const existing = lastRow > 1
      ? sheet.getRange(2, 1, lastRow - 1, 1).getValues().flat()
      : [];
    if (existing.includes(payload.requestId)) return json({ accepted: true, duplicate: true, requestId: payload.requestId });

    const row = [
      payload.requestId,
      new Date(),
      payload.customerName,
      payload.preferredDate,
      payload.preferredTime,
      payload.fulfilment,
      payload.deliveryArea,
      payload.items.map((item) => `${item.quantity} x ${item.name}`).join('; '),
      payload.subtotal === null ? '' : payload.subtotal,
      payload.currency || '',
      payload.paymentMethod,
      'PENDING',
      '',
    ];
    const orderRow = sheet.getLastRow() + 1;
    sheet.getRange(orderRow, 1, 1, row.length).setValues([row]);
    applyOrderStatusValidation(sheet, orderRow, 1);
    SpreadsheetApp.flush();
    const result = { accepted: true, duplicate: false, requestId: payload.requestId, sheet: sheet.getName(), row: orderRow };
    console.log(JSON.stringify(result));
    return json(result);
  } catch (error) {
    const result = { accepted: false, error: String(error.message || error), stack: error.stack || '' };
    console.error(JSON.stringify(result));
    return json(result);
  }
}

function doGet() {
  try {
    const sheet = getOrdersSheet();
    const result = {
      ok: true,
      service: 'nibby-order-audit',
      spreadsheetId: sheet.getParent().getId(),
      spreadsheetName: sheet.getParent().getName(),
      sheet: sheet.getName(),
      lastRow: sheet.getLastRow(),
      maxColumns: sheet.getMaxColumns(),
    };
    console.log(JSON.stringify(result));
    return json(result);
  } catch (error) {
    const result = { ok: false, error: String(error.message || error), stack: error.stack || '' };
    console.error(JSON.stringify(result));
    return json(result);
  }
}

function testAppendOrder() {
  const payload = {
    requestId: `NIB-TEST-${Utilities.getUuid().slice(0, 4).toUpperCase()}`,
    customerName: 'Apps Script test',
    preferredDate: '2026-09-08',
    preferredTime: '12:00',
    fulfilment: 'pickup',
    deliveryArea: '',
    items: [{ name: 'Test order', quantity: 1 }],
    subtotal: null,
    currency: '',
    paymentMethod: 'cod',
  };
  const sheet = getOrdersSheet();
  ensureHeaders(sheet);
  const row = [payload.requestId, new Date(), payload.customerName, payload.preferredDate, payload.preferredTime, payload.fulfilment, payload.deliveryArea, '1 x Test order', '', '', payload.paymentMethod, 'PENDING', ''];
  const rowNumber = sheet.getLastRow() + 1;
  sheet.getRange(rowNumber, 1, 1, row.length).setValues([row]);
  applyOrderStatusValidation(sheet, rowNumber, 1);
  SpreadsheetApp.flush();
  console.log(JSON.stringify({ ok: true, row: rowNumber, spreadsheetId: sheet.getParent().getId(), sheet: sheet.getName() }));
}

function setupOrdersSheet() {
  const sheet = getOrdersSheet();
  ensureHeaders(sheet);
  return json({ ok: true, sheet: SHEET_NAME, headers: HEADERS });
}

function getOrdersSheet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet) throw new Error('Missing Orders sheet');
  return sheet;
}

function ensureHeaders(sheet) {
  if (sheet.getMaxColumns() < HEADERS.length) {
    sheet.insertColumnsAfter(sheet.getMaxColumns(), HEADERS.length - sheet.getMaxColumns());
  }
  const lastRow = sheet.getLastRow();
  const previousHeaders = lastRow > 0 && sheet.getMaxColumns() >= HEADERS.length
    ? sheet.getRange(1, 1, 1, HEADERS.length).getValues()[0]
    : [];
  const hadEventColumn = previousHeaders[10] === 'Event';
  if (lastRow === 0) {
    sheet.appendRow(HEADERS);
  } else {
    sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
  }
  if (hadEventColumn && lastRow > 1) {
    sheet.getRange(2, 11, lastRow - 1, 1).setValues(
      Array.from({ length: lastRow - 1 }, () => ['COD']),
    );
  }
  const currentLastRow = sheet.getLastRow();
  const blankRowCount = sheet.getMaxRows() - currentLastRow;
  if (blankRowCount > 0) sheet.getRange(currentLastRow + 1, 12, blankRowCount, 1).clearDataValidations();
  migrateOrderStatuses(sheet);
  applyOrderStatusValidation(sheet);
}

function migrateOrderStatuses(sheet) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return;
  const range = sheet.getRange(2, 12, lastRow - 1, 1);
  const values = range.getValues().map(([value]) => [value === 'Awaiting WhatsApp' || !ORDER_STATUSES.includes(value) ? 'PENDING' : value]);
  range.setValues(values);
}

function applyOrderStatusValidation(sheet, startRow, rowCount) {
  if (sheet.getLastRow() < 2) return;
  const firstRow = startRow || 2;
  const count = rowCount || sheet.getLastRow() - firstRow + 1;
  if (count < 1) return;
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(ORDER_STATUSES, true)
    .setAllowInvalid(false)
    .build();
  sheet.getRange(firstRow, 12, count, 1).setDataValidation(rule);
}

function validatePayload(payload) {
  if (!/^NIB-[0-9]{8}-[A-Z0-9]{4}$/.test(payload.requestId)) throw new Error('Invalid request ID');
  for (const field of ['customerName', 'preferredDate', 'preferredTime', 'fulfilment']) {
    if (typeof payload[field] !== 'string' || !payload[field].trim()) throw new Error(`Missing ${field}`);
  }
  if (!['pickup', 'delivery'].includes(payload.fulfilment)) throw new Error('Invalid fulfilment');
  if (!['cod', 'qr_transfer'].includes(payload.paymentMethod)) throw new Error('Invalid payment method');
  if (payload.fulfilment === 'delivery' && (!payload.deliveryArea || !payload.deliveryArea.trim())) throw new Error('Missing delivery area');
  if (!Array.isArray(payload.items) || payload.items.length === 0 || payload.items.length > 20) throw new Error('Invalid items');
  payload.items.forEach((item) => {
    if (typeof item.name !== 'string' || !item.name.trim() || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) throw new Error('Invalid item');
  });
  for (const field of ['customerName', 'deliveryArea']) {
    if (String(payload[field] || '').length > 120) throw new Error(`Oversized ${field}`);
  }
}

function json(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
