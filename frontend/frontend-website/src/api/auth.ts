// Client helpers for authentication endpoints: register, login, logout. Also persists tokens.

import { http } from "./http";
import type { AuthResponse, LoginRequest, RegisterRequest } from "./types";
import { storage } from "../utils/storage";

const USE_COOKIE_REFRESH = (import.meta.env.VITE_USE_COOKIE_REFRESH as string) === "true";

/** Calls /api/auth/register and stores returned tokens. */
export async function register(payload: RegisterRequest) {
    const { data } = await http.post<AuthResponse>("/api/auth/register", payload);
    storage.setAccessToken(data.token);
    storage.setExpiresAtUtc(data.expiresAtUtc);
    if (!USE_COOKIE_REFRESH) storage.setRefreshToken(data.refreshToken ?? null);
    return data;
}

/** Calls /api/auth/login and stores returned tokens. */
export async function login(payload: LoginRequest) {
    const { data } = await http.post<AuthResponse>("/api/auth/login", payload);
    storage.setAccessToken(data.token);
    storage.setExpiresAtUtc(data.expiresAtUtc);
    if (!USE_COOKIE_REFRESH) storage.setRefreshToken(data.refreshToken ?? null);
    return data;
}

/** Calls /api/auth/logout and clears local storage regardless of server outcome. */
export async function logout() {
    try {
        if (USE_COOKIE_REFRESH) {
            // Cookie-based refresh: server clears the HttpOnly cookie.
            await http.post("/api/auth/logout", {});
        } else {
            // Body-based refresh: send stored refresh token so the server can revoke it.
            const rt = storage.getRefreshToken();
            await http.post("/api/auth/logout", { refreshToken: rt });
        }
    } finally {
        storage.clearAll();
    }
}
