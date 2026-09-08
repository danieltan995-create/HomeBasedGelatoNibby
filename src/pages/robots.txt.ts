import { business } from '../data/business';

export function GET() {
  return new Response(`User-agent: *\n${business.mode === 'draft' ? 'Disallow: /' : 'Allow: /'}\n`, { headers: { 'Content-Type': 'text/plain' } });
}