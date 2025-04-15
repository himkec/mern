import { getProfilePictureUrl } from './imageUtils';

describe('getProfilePictureUrl', () => {
  it('returns the provided URL if it exists and is not a placeholder', () => {
    const url = 'https://example.com/avatar.jpg';
    const username = 'testuser';
    expect(getProfilePictureUrl(url, username)).toBe(url);
  });

  it('returns a UI Avatars URL if no URL is provided', () => {
    const username = 'testuser';
    const result = getProfilePictureUrl(undefined, username);
    expect(result).toContain('ui-avatars.com');
    expect(result).toContain(encodeURIComponent(username));
  });

  it('returns a UI Avatars URL if the URL contains via.placeholder.com', () => {
    const url = 'https://via.placeholder.com/150';
    const username = 'testuser';
    const result = getProfilePictureUrl(url, username);
    expect(result).toContain('ui-avatars.com');
    expect(result).toContain(encodeURIComponent(username));
  });

  it('uses "User" as default username if none provided', () => {
    const result = getProfilePictureUrl(undefined);
    expect(result).toContain('ui-avatars.com');
    expect(result).toContain(encodeURIComponent('User'));
  });
}); 