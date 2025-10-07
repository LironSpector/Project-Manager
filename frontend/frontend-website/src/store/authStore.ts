// Zustand store for basic auth state kept in memory and synced with local storage.

import { create } from "zustand";
import { storage } from "../utils/storage";

type AuthState = {
    accessToken: string | null;
    expiresAtUtc: string | null;
    email: string | null;
    userId: string | null;
    setAuth: (a: Partial<AuthState>) => void;
    clear: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
    // Initialize from persistent storage to survive reloads.
    accessToken: storage.getAccessToken(),
    expiresAtUtc: storage.getExpiresAtUtc(),
    email: null,
    userId: null,

    // Updates selected auth fields in the store.
    setAuth: (a) => set((s) => ({ ...s, ...a })),

    // Clears all auth fields and persistent storage.
    clear: () =>
        set(() => {
            storage.clearAll();
            return { accessToken: null, expiresAtUtc: null, email: null, userId: null };
        }),
}));
