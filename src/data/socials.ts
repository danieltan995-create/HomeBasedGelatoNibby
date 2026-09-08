import type { SocialProfile } from '../lib/socials';

// Replace null with the full, owner-verified business profile URL, not a handle.
// Keep null while unconfirmed: the logo is visible but the card is not a link.
// Social profiles are optional and independent of the WhatsApp ordering mode.
export const socialProfiles: SocialProfile[] = [
  { id: 'instagram', name: 'Instagram', url: null },
  { id: 'rednote', name: 'REDnote', url: null },
  { id: 'facebook', name: 'Facebook', url: null },
];