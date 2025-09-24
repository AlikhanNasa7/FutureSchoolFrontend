import { useState, useCallback } from 'react';
import axiosInstance from '@/lib/axios';
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import { useUserActions, useUserState } from '@/contexts/UserContext';

// Generic types for API responses
export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

// Hook state interface
interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

// Hook return type
interface UseApiReturn<T> extends UseApiState<T> {
    execute: (config?: AxiosRequestConfig) => Promise<T | null>;
    reset: () => void;
}

// CRUD operations interface
interface CrudOperations<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
    // Create
    create: (
        data: CreateData,
        config?: AxiosRequestConfig
    ) => Promise<T | null>;
    // Read
    get: (
        id: string | number,
        config?: AxiosRequestConfig
    ) => Promise<T | null>;
    getAll: (config?: AxiosRequestConfig) => Promise<T[] | null>;
    // Update
    update: (
        id: string | number,
        data: UpdateData,
        config?: AxiosRequestConfig
    ) => Promise<T | null>;
    // Delete
    delete: (
        id: string | number,
        config?: AxiosRequestConfig
    ) => Promise<boolean>;
    // State
    loading: boolean;
    error: string | null;
}

// Generic useApi hook for single operations
export function useApi<T>(endpoint?: string, initialData?: T): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: initialData || null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (config?: AxiosRequestConfig): Promise<T | null> => {
            if (!endpoint) {
                throw new Error('Endpoint is required for useApi hook');
            }

            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const response: AxiosResponse<ApiResponse<T>> =
                    await axiosInstance.get(endpoint, config);
                const result = response.data.data;

                setState(prev => ({
                    ...prev,
                    data: result,
                    loading: false,
                }));

                return result;
            } catch (error) {
                const errorMessage =
                    error instanceof AxiosError
                        ? error.response?.data?.message || error.message
                        : 'An error occurred';

                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: errorMessage,
                }));

                return null;
            }
        },
        [endpoint]
    );

    const reset = useCallback(() => {
        setState({
            data: initialData || null,
            loading: false,
            error: null,
        });
    }, [initialData]);

    return {
        ...state,
        execute,
        reset,
    };
}

// Generic useCrud hook for CRUD operations
export function useCrud<T, CreateData = Partial<T>, UpdateData = Partial<T>>(
    baseEndpoint: string
): CrudOperations<T, CreateData, UpdateData> {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleError = (error: unknown): string => {
        const errorMessage =
            error instanceof AxiosError
                ? error.response?.data?.message || error.message
                : 'An error occurred';

        setError(errorMessage);
        return errorMessage;
    };

    const create = useCallback(
        async (
            data: CreateData,
            config?: AxiosRequestConfig
        ): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                const response: AxiosResponse<ApiResponse<T>> =
                    await axiosInstance.post(baseEndpoint, data, config);
                setLoading(false);
                return response.data.data;
            } catch (error) {
                handleError(error);
                setLoading(false);
                return null;
            }
        },
        [baseEndpoint]
    );

    const get = useCallback(
        async (
            id: string | number,
            config?: AxiosRequestConfig
        ): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                const response: AxiosResponse<ApiResponse<T>> =
                    await axiosInstance.get(`${baseEndpoint}/${id}`, config);
                setLoading(false);
                return response.data.data;
            } catch (error) {
                handleError(error);
                setLoading(false);
                return null;
            }
        },
        [baseEndpoint]
    );

    const getAll = useCallback(
        async (config?: AxiosRequestConfig): Promise<T[] | null> => {
            setLoading(true);
            setError(null);

            try {
                const response: AxiosResponse<ApiResponse<T[]>> =
                    await axiosInstance.get(baseEndpoint, config);
                setLoading(false);
                return response.data.data;
            } catch (error) {
                handleError(error);
                setLoading(false);
                return null;
            }
        },
        [baseEndpoint]
    );

    const update = useCallback(
        async (
            id: string | number,
            data: UpdateData,
            config?: AxiosRequestConfig
        ): Promise<T | null> => {
            setLoading(true);
            setError(null);

            try {
                const response: AxiosResponse<ApiResponse<T>> =
                    await axiosInstance.put(
                        `${baseEndpoint}/${id}`,
                        data,
                        config
                    );
                setLoading(false);
                return response.data.data;
            } catch (error) {
                handleError(error);
                setLoading(false);
                return null;
            }
        },
        [baseEndpoint]
    );

    const deleteItem = useCallback(
        async (
            id: string | number,
            config?: AxiosRequestConfig
        ): Promise<boolean> => {
            setLoading(true);
            setError(null);

            try {
                await axiosInstance.delete(`${baseEndpoint}/${id}`, config);
                setLoading(false);
                return true;
            } catch (error) {
                handleError(error);
                setLoading(false);
                return false;
            }
        },
        [baseEndpoint]
    );

    return {
        create,
        get,
        getAll,
        update,
        delete: deleteItem,
        loading,
        error,
    };
}

// Specialized hooks for common entities
interface User {
    id: string;
    username: string;
    email: string;
    name: string;
    role: string;
}

export function useUsers() {
    return useCrud<User>('/users');
}

interface Post {
    id: string;
    title: string;
    content: string;
    author: string;
    createdAt: string;
}

export function usePosts() {
    return useCrud<Post>('/posts');
}

interface Comment {
    id: string;
    content: string;
    author: string;
    createdAt: string;
}

export function useComments() {
    return useCrud<Comment>('/comments');
}

// Hook for authentication
export function useAuth() {
    const {
        loginStart,
        loginSuccess,
        loginFailure,
        logout: logoutAction,
        clearError,
    } = useUserActions();
    const { isLoading, error, isAuthenticated, user } = useUserState();

    const login = useCallback(
        async (credentials: { username: string; password: string }) => {
            loginStart();

            try {
                const response = await axiosInstance.post(
                    '/auth/login/',
                    credentials
                );

                console.log(response.data);

                const { access, refresh, user } = response.data;

                // Store tokens
                if (typeof window !== 'undefined') {
                    localStorage.setItem('accessToken', access);
                    localStorage.setItem('refreshToken', refresh);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('isLoggedIn', 'true');
                    console.log('🔑 Tokens stored:', {
                        access: access.substring(0, 20) + '...',
                        refresh: refresh.substring(0, 20) + '...',
                    });
                }

                // Update global state
                loginSuccess(user);
                return true;
            } catch (error) {
                const errorMessage =
                    error instanceof AxiosError
                        ? error.response?.data?.error ||
                          error.response?.data?.message ||
                          error.message
                        : 'Login failed';

                loginFailure(errorMessage);
                return false;
            }
        },
        [loginStart, loginSuccess, loginFailure]
    );

    const logout = useCallback(() => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isLoggedIn');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
        }
        logoutAction();
    }, [logoutAction]);

    const register = useCallback(
        async (userData: { email: string; password: string; name: string }) => {
            loginStart();

            try {
                const response: AxiosResponse<
                    ApiResponse<{ token: string; user: User }>
                > = await axiosInstance.post('/auth/register', userData);

                const { token, user } = response.data.data;

                // Store token
                if (typeof window !== 'undefined') {
                    localStorage.setItem('token', token);
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('isLoggedIn', 'true');
                }

                loginSuccess(user);
                return { token, user };
            } catch (error) {
                const errorMessage =
                    error instanceof AxiosError
                        ? error.response?.data?.message || error.message
                        : 'Registration failed';

                loginFailure(errorMessage);
                return null;
            }
        },
        [loginStart, loginSuccess, loginFailure]
    );

    return {
        login,
        logout,
        register,
        loading: isLoading,
        error,
        isAuthenticated,
        user,
        clearError,
    };
}
