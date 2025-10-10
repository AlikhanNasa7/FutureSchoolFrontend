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
            className="min-h-screen flex items-center justify-center p-3 sm:p-4 md:p-6 relative"
            style={{
                background: 'url(/future-school-login-bg.jpg)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
            }}
        >
            {/* Logo - adjusted for mobile */}
            <div className="absolute top-8 sm:top-12 md:top-[80px] flex items-center justify-center gap-1 px-4">
                <Image
                    src="/Logo.svg"
                    alt="Future School Logo"
                    width={280}
                    height={280}
                    className="w-32 h-auto sm:w-48 md:w-[280px]"
                />
            </div>

            {/* Modal - responsive padding and max-width */}
            <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 md:p-8 mt-24 sm:mt-32 md:mt-0">
                {children}
            </div>
        </div>
    );
}
