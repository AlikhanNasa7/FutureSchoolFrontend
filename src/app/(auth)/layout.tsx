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
            <div className="absolute top-[80px] flex items-center justify-center gap-1">
                <Image
                    src="/Logo.svg"
                    alt="Future School Logo"
                    width={280}
                    height={280}
                />
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
                {children}
            </div>
        </div>
    );
}
