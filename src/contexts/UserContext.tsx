'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

// User type definition
export interface User {
    id: string;
    username: string;
    email: string;
    role: string;
    name: string;
    classroom?: string; // For students
}

// State interface
interface UserState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}

// Action types
type UserAction =
    | { type: 'LOGIN_START' }
    | { type: 'LOGIN_SUCCESS'; payload: User }
    | { type: 'LOGIN_FAILURE'; payload: string }
    | { type: 'LOGOUT' }
    | { type: 'CLEAR_ERROR' }
    | { type: 'SET_LOADING'; payload: boolean };

// Initial state
const initialState: UserState = {
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
};

// Reducer function
function userReducer(state: UserState, action: UserAction): UserState {
    switch (action.type) {
        case 'LOGIN_START':
            return {
                ...state,
                isLoading: true,
                error: null,
            };
        case 'LOGIN_SUCCESS':
            return {
                ...state,
                user: action.payload,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };
        case 'LOGIN_FAILURE':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };
        case 'LOGOUT':
            return {
                ...state,
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };
        case 'CLEAR_ERROR':
            return {
                ...state,
                error: null,
            };
        case 'SET_LOADING':
            return {
                ...state,
                isLoading: action.payload,
            };
        default:
            return state;
    }
}

// Context
const UserContext = createContext<{
    state: UserState;
    dispatch: React.Dispatch<UserAction>;
} | null>(null);

// Provider component
export function UserProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(userReducer, initialState);

    useEffect(() => {
        const loadUserFromStorage = () => {
            try {
                const isLoggedIn = localStorage.getItem('isLoggedIn');
                if (isLoggedIn === 'true') {
                    // In a real app, you might want to validate the token here
                    // For now, we'll just check if user data exists
                    const userData = localStorage.getItem('user');
                    if (userData) {
                        const user = JSON.parse(userData);
                        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
                    }
                }
            } catch (error) {
                console.error('Error loading user from storage:', error);
                dispatch({ type: 'LOGOUT' });
            }
        };

        loadUserFromStorage();
    }, []);

    return (
        <UserContext.Provider value={{ state, dispatch }}>
            {children}
        </UserContext.Provider>
    );
}

// Custom hook to use the context
export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUser must be used within a UserProvider');
    }
    console.log(context);
    return context;
}

// Helper hooks for specific state
export function useUserState() {
    const { state } = useUser();
    return state;
}

export function useUserActions() {
    const { dispatch } = useUser();

    return {
        loginStart: () => dispatch({ type: 'LOGIN_START' }),
        loginSuccess: (user: User) =>
            dispatch({ type: 'LOGIN_SUCCESS', payload: user }),
        loginFailure: (error: string) =>
            dispatch({ type: 'LOGIN_FAILURE', payload: error }),
        logout: () => dispatch({ type: 'LOGOUT' }),
        clearError: () => dispatch({ type: 'CLEAR_ERROR' }),
        setLoading: (loading: boolean) =>
            dispatch({ type: 'SET_LOADING', payload: loading }),
    };
}
