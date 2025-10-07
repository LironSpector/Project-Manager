// Small wrapper around localStorage for auth tokens and expiry timestamps.

const ACCESS_TOKEN_KEY = "pm.accessToken";
const REFRESH_TOKEN_KEY = "pm.refreshToken"; // Used only if not using cookie mode.
const EXPIRES_AT_KEY = "pm.expiresAtUtc";

export const storage = {
    /** Returns the current access token or null if not set. */
    getAccessToken: () => localStorage.getItem(ACCESS_TOKEN_KEY),

    /** Saves or removes the access token. */
    setAccessToken: (t: string | null) =>
        t ? localStorage.setItem(ACCESS_TOKEN_KEY, t) : localStorage.removeItem(ACCESS_TOKEN_KEY),

    /** Returns the current refresh token or null if not set. */
    getRefreshToken: () => localStorage.getItem(REFRESH_TOKEN_KEY),

    /** Saves or removes the refresh token. */
    setRefreshToken: (t: string | null) =>
        t ? localStorage.setItem(REFRESH_TOKEN_KEY, t) : localStorage.removeItem(REFRESH_TOKEN_KEY),

    /** Returns the ISO expiry string for the access token or null if not set. */
    getExpiresAtUtc: () => localStorage.getItem(EXPIRES_AT_KEY),

    /** Saves or removes the ISO expiry string for the access token. */
    setExpiresAtUtc: (s: string | null) =>
        s ? localStorage.setItem(EXPIRES_AT_KEY, s) : localStorage.removeItem(EXPIRES_AT_KEY),

    /** Clears all auth-related keys from localStorage. */
    clearAll: () => {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(EXPIRES_AT_KEY);
    },
};
