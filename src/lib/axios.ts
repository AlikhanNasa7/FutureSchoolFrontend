import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';

// Extend AxiosRequestConfig to include metadata
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    metadata?: {
        startTime: Date;
    };
}

// Extend InternalAxiosRequestConfig to include _retry flag
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

// Create axios instance
const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Track if we're currently refreshing the token
let isRefreshing = false;
// Store failed requests to retry after token refresh
let failedQueue: Array<{
    resolve: (value?: unknown) => void;
    reject: (error?: unknown) => void;
    config: InternalAxiosRequestConfig;
}> = [];

// Process the queue of failed requests
const processQueue = (error: unknown, token: string | null = null) => {
    failedQueue.forEach(({ resolve, reject, config }) => {
        if (error) {
            reject(error);
        } else {
            // Retry the original request with new token
            if (token && config.headers) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            resolve(axiosInstance(config));
        }
    });

    // Clear the queue
    failedQueue = [];
};

// Function to refresh the access token
const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken =
            typeof window !== 'undefined'
                ? localStorage.getItem('refreshToken') ||
                  sessionStorage.getItem('refreshToken')
                : null;

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await axios.post(
            `${
                process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
            }/auth/refresh/`,
            { refresh: refreshToken }
        );

        const { access, refresh: newRefreshToken } = response.data;

        // Store the new tokens
        if (typeof window !== 'undefined') {
            localStorage.setItem('accessToken', access);
            localStorage.setItem('refreshToken', newRefreshToken);
        }

        return access;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
    }
};

// Request interceptor
axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        // Get token from localStorage or sessionStorage
        const token =
            typeof window !== 'undefined'
                ? localStorage.getItem('accessToken') ||
                  sessionStorage.getItem('accessToken')
                : null;

        // Add authorization header if token exists
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('⚠️ No token found for request');
        }

        // Add request timestamp for debugging
        (config as CustomAxiosRequestConfig).metadata = {
            startTime: new Date(),
        };

        console.log('🚀 Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            headers: config.headers,
            data: config.data,
        });

        return config;
    },
    (error: AxiosError) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response: AxiosResponse) => {
        const endTime = new Date();
        const startTime = (response.config as CustomAxiosRequestConfig).metadata
            ?.startTime;
        const duration = startTime
            ? endTime.getTime() - startTime.getTime()
            : 0;

        console.log('✅ Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            duration: `${duration}ms`,
            data: response.data,
        });

        return response;
    },
    async (error: AxiosError) => {
        const endTime = new Date();
        const startTime = (error.config as CustomAxiosRequestConfig)?.metadata
            ?.startTime;
        const duration = startTime
            ? endTime.getTime() - startTime.getTime()
            : 0;

        console.error('❌ Response Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            duration: `${duration}ms`,
            message: error.message,
            data: error.response?.data,
        });

        // Log authentication errors specifically
        if (error.response?.status === 401) {
            console.error(
                '🔒 Authentication Error - Token may be invalid or expired'
            );
        }

        const originalRequest = error.config;

        // Handle authentication errors with token refresh
        if (error.response?.status === 401 && originalRequest) {
            // Don't retry refresh token requests to avoid infinite loops
            if (originalRequest.url?.includes('/auth/refresh')) {
                // Clear stored tokens and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');
                }
                return Promise.reject(error);
            }

            if (isRefreshing) {
                // If we're already refreshing, add this request to the queue
                return new Promise((resolve, reject) => {
                    failedQueue.push({
                        resolve,
                        reject,
                        config: originalRequest,
                    });
                });
            }

            (originalRequest as CustomInternalAxiosRequestConfig)._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();

                if (newToken) {
                    // Update the original request with new token
                    if (originalRequest.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }

                    // Process the queue with success
                    processQueue(null, newToken);

                    // Retry the original request
                    return axiosInstance(originalRequest);
                } else {
                    // Token refresh failed, process queue with error
                    processQueue(new Error('Token refresh failed'));

                    // Clear tokens and redirect to login
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        sessionStorage.removeItem('accessToken');
                        sessionStorage.removeItem('refreshToken');
                    }

                    return Promise.reject(error);
                }
            } catch (refreshError) {
                // Token refresh failed, process queue with error
                processQueue(refreshError);

                // Clear tokens and redirect to login
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');
                    sessionStorage.removeItem('accessToken');
                    sessionStorage.removeItem('refreshToken');
                    window.location.href = '/login';
                }

                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        // Handle server errors
        if (error.response?.status && error.response.status >= 500) {
            console.error('Server Error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
