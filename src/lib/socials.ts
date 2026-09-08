const profileHosts = {
  instagram: ['instagram.com', 'www.instagram.com'],
  rednote: ['xiaohongshu.com', 'www.xiaohongshu.com', 'rednote.com', 'www.rednote.com'],
  facebook: ['facebook.com', 'www.facebook.com', 'm.facebook.com'],
} as const;

export type SocialPlatform = keyof typeof profileHosts;

export interface SocialProfile {
  id: SocialPlatform;
  name: string;
  url: string | null;
}

// Validate supplied destinations at build time; null is an honest, non-clickable
// placeholder. URL validation cannot establish account ownership or availability.
export function getSocialProfileUrl(platform: SocialPlatform, value: string | null): string | null {
  if (value === null) return null;

  try {
    const url = new URL(value);
    const hosts: readonly string[] = profileHosts[platform];
    if (
      value === value.trim() && /^https:\/\//i.test(value) && !/\s|\\/.test(value) &&
      url.protocol === 'https:' && hosts.includes(url.hostname) &&
      !url.username && !url.password && !url.port && url.pathname !== '/'
    ) {
      return url.href;
    }
  } catch {
    // Report one actionable error for malformed and unsupported destinations.
  }

  throw new Error(`Invalid ${platform} profile URL. Use a full HTTPS profile URL on its platform, or null for a placeholder.`);
}