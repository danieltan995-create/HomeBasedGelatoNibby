import type { BusinessConfig } from '../lib/types';

// Edit here, then rebuild. No customer information is stored by the storefront.
export const business: BusinessConfig = {
  mode: 'draft',
  name: 'Nibby Gelato',
  area: 'Melaka',
  currency: 'MYR',
  whatsappNumber: '60172688120', // International digits only, without +, spaces or a local leading zero.
  auditWebhookUrl: 'https://script.google.com/macros/s/AKfycbz0Qig3M1DNO_8-GHLBwoqs4AqZForiApcdKYKIE0yEQaxrjG9E3IwSErvhCSR6rtbPPQ/exec', // Google Apps Script web app URL; keep null until the endpoint is deployed and tested.
  siteUrl: null,
  fulfilment: null,
  contactVerified: false,
  launchReviewed: false,
};