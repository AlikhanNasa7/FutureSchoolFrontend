import Sidebar from '@/components/layout/Sidebar';
import Navbar from '@/components/layout/Navbar';
import MobileBottomNav from '@/components/layout/MobileBottomNav';

export default function ProtectedLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900">
            {/* Desktop Sidebar - Hidden on mobile */}
            <div className="hidden min-[576px]:block">
                <Sidebar />
            </div>

            <div className="flex-1">
                <Navbar />
                <main className="p-4 lg:p-8 pb-20 min-[576px]:pb-4">
                    {children}
                </main>
            </div>

            {/* Mobile Bottom Navigation - Only visible on mobile */}
            <MobileBottomNav />
        </div>
    );
}
