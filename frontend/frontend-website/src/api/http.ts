// Configures a shared Axios instance, attaches the access token, and implements a 401→refresh→retry flow.

import axios, { AxiosError, type AxiosInstance } from "axios";
import { storage } from "../utils/storage";
import type { AuthResponse, ProblemDetails } from "./types";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const USE_COOKIE_REFRESH = (import.meta.env.VITE_USE_COOKIE_REFRESH as string) === "true";

// Create a single Axios instance to share interceptors and baseURL.
export const http: AxiosInstance = axios.create({
    baseURL: API_BASE,
    withCredentials: USE_COOKIE_REFRESH, // Send cookies only when cookie-refresh mode is enabled.
});

// Attach Authorization header if an access token is present.
http.interceptors.request.use((config) => {
    const token = storage.getAccessToken();
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

// ------- Refresh gate (to avoid parallel refresh storms) -------
let isRefreshing = false;
let pendingQueue: Array<() => void> = [];

/** Resolves all queued promises once refresh completes. */
function runQueue() {
    pendingQueue.forEach((fn) => fn());
    pendingQueue = [];
}

/** Attempts to refresh the access token (cookie or body mode). Returns true on success. */
async function refreshAccessToken(): Promise<boolean> {
    if (isRefreshing) {
        // Wait until the current refresh attempt finishes.
        await new Promise<void>((res) => pendingQueue.push(res));
        return !!storage.getAccessToken();
    }

    isRefreshing = true;
    try {
        let resp;
        if (USE_COOKIE_REFRESH) {
            // Cookie-based refresh (HttpOnly cookie).
            resp = await axios.post<AuthResponse>(`${API_BASE}/api/auth/refresh`, {}, { withCredentials: true });
        } else {
            // Body-based refresh: send stored refresh token explicitly.
            const rt = storage.getRefreshToken();
            if (!rt) throw new Error("No refresh token");
            resp = await axios.post<AuthResponse>(
                `${API_BASE}/api/auth/refresh`,
                { refreshToken: rt },
                { withCredentials: false } // withCredentials: false in Axios means: Do not send or receive cookies, authorization headers, or TLS client certificates with this HTTP request.
            );
        }

        const data = resp.data;

        // Persist new tokens in storage.
        storage.setAccessToken(data.token);
        storage.setExpiresAtUtc(data.expiresAtUtc ?? null);
        if (!USE_COOKIE_REFRESH) {
            storage.setRefreshToken(data.refreshToken ?? null);
        }
        return true;
    } catch {
        // On failure, clear storage so the app can redirect to login.
        storage.clearAll();
        return false;
    } finally {
        isRefreshing = false;
        runQueue();
    }
}

// Response interceptor: on 401, try refresh once and then retry the original request.
http.interceptors.response.use(
    (r) => r,
    async (error: AxiosError<ProblemDetails>) => {
        const original = error.config!;
        const status = error.response?.status;

        if (status === 401 && !original._retried) {
            original._retried = true;
            const ok = await refreshAccessToken();
            if (ok) {
                const token = storage.getAccessToken();
                if (token) original.headers!["Authorization"] = `Bearer ${token}`;
                return http(original); // retry once with new token
            }
        }
        // Re-throw other errors or a failed refresh case.
        throw error;
    }
);

// Extend AxiosRequestConfig type to add an internal _retried flag used by the interceptor.
declare module "axios" {
    export interface AxiosRequestConfig {
        _retried?: boolean;
    }
}
