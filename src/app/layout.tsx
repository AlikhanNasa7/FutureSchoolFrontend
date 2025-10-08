import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ModalProvider from '@/components/modals/ModalProvider';
import { UserProvider } from '@/contexts/UserContext';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    title: 'Astar',
    description: "Future School's site",
    icons: {
        icon: '/Logo-without-text.svg',
        shortcut: '/Logo-without-text.svg',
        apple: '/Logo-without-text.svg',
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
            >
                <UserProvider>
                    {children}
                    <ModalProvider />
                </UserProvider>
            </body>
        </html>
    );
}
