import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Time before data is considered stale
            staleTime: 5 * 60 * 1000, // 5 minutes
            
            // Time before inactive queries are garbage collected
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            
            // Retry failed requests
            retry: (failureCount, error: any) => {
                // Don't retry on 4xx errors (client errors)
                if (error?.status >= 400 && error?.status < 500) {
                    return false;
                }
                // Retry up to 3 times for other errors
                return failureCount < 3;
            },
            
            // Refetch on window focus
            refetchOnWindowFocus: false,
            
            // Refetch on reconnect
            refetchOnReconnect: true,
        },
        mutations: {
            // Retry failed mutations
            retry: 1,
        },
    },
}); 