import { describe, expect, it } from 'vitest';
import { socialProfiles } from '../src/data/socials';
import { getSocialProfileUrl, type SocialPlatform } from '../src/lib/socials';

describe('social profiles', () => {
  it('starts with three explicitly unconnected profiles, not invented handles', () => {
    expect(socialProfiles).toEqual([
      { id: 'instagram', name: 'Instagram', url: null },
      { id: 'rednote', name: 'REDnote', url: null },
      { id: 'facebook', name: 'Facebook', url: null },
    ]);
  });

  it.each<SocialPlatform>(['instagram', 'rednote', 'facebook'])('keeps a missing %s link null', (platform) => {
    expect(getSocialProfileUrl(platform, null)).toBeNull();
  });

  // Synthetic paths only: these URLs are never opened or contacted by tests.
  it.each<[SocialPlatform, string]>([
    ['instagram', 'https://www.instagram.com/example-profile/'],
    ['instagram', 'https://instagram.com/example-profile'],
    ['facebook', 'https://www.facebook.com/example-page/'],
    ['facebook', 'https://facebook.com/profile.php?id=123456789'],
    ['facebook', 'https://m.facebook.com/example-page'],
    ['rednote', 'https://www.xiaohongshu.com/user/profile/example-profile'],
    ['rednote', 'https://xiaohongshu.com/user/profile/example-profile?xsec_token=example&xsec_source=app_share'],
    ['rednote', 'https://www.rednote.com/user/profile/example-profile'],
  ])('accepts a full %s HTTPS profile URL: %s', (platform, url) => {
    expect(getSocialProfileUrl(platform, url)).toBe(url);
  });

  it.each<[SocialPlatform, string]>([
    ['instagram', ''],
    ['instagram', '@example-profile'],
    ['instagram', '#'],
    ['instagram', '/example-profile'],
    ['instagram', 'javascript:alert(1)'],
    ['instagram', 'http://instagram.com/example-profile'],
    ['instagram', '//instagram.com/example-profile'],
    ['instagram', 'https://instagram.com/'],
    ['instagram', 'https://instagram.com.evil.example/example-profile'],
    ['instagram', 'https://instagram.com@evil.example/example-profile'],
    ['instagram', 'https://user:password@instagram.com/example-profile'],
    ['instagram', 'https://instagram.com:8443/example-profile'],
    ['instagram', ' https://instagram.com/example-profile'],
    ['instagram', 'https://instagram.com/example\nprofile'],
    ['instagram', 'https://instagram.com\\example-profile'],
    ['instagram', 'https://www.facebook.com/example-profile'],
    ['rednote', 'https://www.xiaohongshu.com.evil.example/user/profile/example'],
    ['rednote', 'https://example.com/user/profile/example'],
    ['facebook', 'https://www.instagram.com/example-profile'],
    ['facebook', 'data:text/html,example'],
  ])('rejects an invalid %s destination: %s', (platform, url) => {
    expect(() => getSocialProfileUrl(platform, url)).toThrow(/profile URL/);
  });
});