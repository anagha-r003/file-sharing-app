/** Returns true when the JWT is missing, malformed, or within `bufferSeconds` of expiry. */
export function isAccessTokenExpired(token, bufferSeconds = 60) {
  if (!token) return true;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const expiresAt = payload.exp * 1000;
    return Date.now() >= expiresAt - bufferSeconds * 1000;
  } catch {
    return true;
  }
}
