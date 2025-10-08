import axios, {
    AxiosInstance,
    AxiosRequestConfig,
    AxiosResponse,
    AxiosError,
    InternalAxiosRequestConfig,
} from 'axios';
import { redirect } from 'next/navigation';

interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    metadata?: {
        startTime: Date;
    };
}

interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

const axiosInstance: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

let isRefreshing = false;

const refreshAccessToken = async (): Promise<string | null> => {
    try {
        const refreshToken = localStorage.getItem('refreshToken');

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

axiosInstance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
        const token = localStorage.getItem('accessToken');

        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            console.log('⚠️ No token found for request');
        }

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

        if (error.response?.status === 401) {
            console.error(
                '🔒 Authentication Error - Token may be invalid or expired'
            );
        }

        const originalRequest = error.config;

        if (error.response?.status === 401 && originalRequest) {
            if (originalRequest?.url?.includes('/auth/refresh')) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');

                return Promise.reject(error);
            }

            (originalRequest as CustomInternalAxiosRequestConfig)._retry = true;
            isRefreshing = true;

            try {
                const newToken = await refreshAccessToken();

                if (newToken) {
                    if (originalRequest?.headers) {
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    }

                    return axiosInstance(originalRequest);
                } else {
                    localStorage.removeItem('accessToken');
                    localStorage.removeItem('refreshToken');

                    return Promise.reject(error);
                }
            } catch (refreshError) {
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                redirect('/login');

                return Promise.reject(error);
            } finally {
                isRefreshing = false;
            }
        }

        if (error.response?.status && error.response.status >= 500) {
            console.error('Server Error:', error.response.data);
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
