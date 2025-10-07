// Creates and exports a React Query client with sensible defaults for this app.

import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Do not refetch on window focus to reduce network noise.
            refetchOnWindowFocus: false,
            // Retry failed queries once before surfacing an error.
            retry: 1,
        },
    },
});
