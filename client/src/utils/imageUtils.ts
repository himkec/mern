/**
 * Returns a fallback avatar URL if the provided URL is the old placeholder URL
 * @param url The profile picture URL
 * @param username The username to use for the fallback avatar
 * @returns The URL to use for the profile picture
 */
export const getProfilePictureUrl = (url: string | undefined, username: string = 'User'): string => {
  if (!url) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=150`;
  }
  
  if (url.includes('via.placeholder.com')) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=random&color=fff&size=150`;
  }
  
  return url;
}; 