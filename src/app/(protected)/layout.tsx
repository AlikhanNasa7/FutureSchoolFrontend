import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
            <Sidebar />
            <div className="flex-1">
                <Navbar />
                <main className="p-4 lg:p-8">{children}</main>
            </div>
        </div>
    );
}
