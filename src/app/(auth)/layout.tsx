import type { Metadata } from 'next';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Вход - Future School',
    description: 'Страница авторизации Future School',
};

export default function AuthLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div
            className="min-h-screen flex items-center justify-center p-4 relative"
            style={{
                background: 'url(/future-school-login-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Overlay for better readability */}
            <div className="absolute top-[80px] flex items-center justify-center gap-1">
                <Image
                    src="/Logo-without-text.svg"
                    alt="Future School Logo"
                    width={44}
                    height={52.5}
                />
                <p className="text-white text-2xl font-bold">Astar</p>
            </div>

            {/* Auth Content */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                {children}
            </div>
        </div>
    );
}
