'use client';

import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';

export type Locale = 'ru' | 'en' | 'kk';

interface LocaleContextType {
    locale: Locale;
    setLocale: (locale: Locale) => void;
    t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

export function LocaleProvider({ children }: { children: ReactNode }) {
    const [locale, setLocale] = useState<Locale>('ru');
    const [messages, setMessages] = useState<Record<string, any>>({});

    useEffect(() => {
        // Load locale from localStorage on mount
        if (typeof window !== 'undefined') {
            const savedLocale = localStorage.getItem('locale') as Locale;
            if (savedLocale && ['ru', 'en', 'kk'].includes(savedLocale)) {
                setLocale(savedLocale);
            }
        }
    }, []);

    useEffect(() => {
        // Save locale to localStorage and load translations
        if (typeof window !== 'undefined') {
            localStorage.setItem('locale', locale);
        }

        // Dynamically import translation file
        import(`../../messages/${locale}.json`)
            .then(module => {
                setMessages(module.default);
            })
            .catch(error => {
                console.error(
                    `Failed to load translations for ${locale}:`,
                    error
                );
            });
    }, [locale]);

    const t = (key: string): string => {
        try {
            const keys = key.split('.');
            let value: any = messages;

            for (const k of keys) {
                if (value && typeof value === 'object' && k in value) {
                    value = value[k];
                } else {
                    return key; // Return key if translation not found
                }
            }

            return typeof value === 'string' ? value : key;
        } catch (error) {
            console.error(`Translation error for key: ${key}`, error);
            return key;
        }
    };

    return (
        <LocaleContext.Provider value={{ locale, setLocale, t }}>
            {children}
        </LocaleContext.Provider>
    );
}

export function useLocale() {
    const context = useContext(LocaleContext);
    if (context === undefined) {
        throw new Error('useLocale must be used within a LocaleProvider');
    }
    return context;
}
