'use client';
import { useUserState } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import Calender from '@/components/dashboard/Calender';
import DaySchedule from '@/components/dashboard/DaySchedule';
import PendingAssignments from '@/components/dashboard/PendingAssignments';
import CreateAnnouncementModal from '@/components/modals/CreateAnnouncementModal';

export default function DashboardPage() {
    const { user } = useUserState();
    const router = useRouter();
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);

    useEffect(() => {
        // Redirect parents to their dashboard
        if (user?.role === 'parent') {
            router.push('/parent/dashboard');
        }
    }, [user, router]);

    // Don't render anything for parents (will redirect)
    if (user?.role === 'parent') {
        return null;
    }

    return (
        <>
            {user?.role === 'teacher' && (
                <div className="mb-6">
                    <button
                        onClick={() => setShowAnnouncementModal(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        📢 Создать объявление
                    </button>
                </div>
            )}
            <div className="flex gap-6 md:flex-row flex-col">
                <div className="flex-3/4 order-3 md:order-1">
                    <Calender />
                </div>
                <div className="flex-1/4 flex flex-col gap-6 sm:flex-row md:flex-col order-1 md:order-2">
                    {user?.role === 'student' && (
                        <div className="order-1">
                            <PendingAssignments />
                        </div>
                    )}
                    <div className={user?.role === 'student' ? 'order-2' : ''}>
                        <DaySchedule />
                    </div>
                </div>
            </div>
            <CreateAnnouncementModal
                isOpen={showAnnouncementModal}
                onClose={() => setShowAnnouncementModal(false)}
                onAnnouncementCreated={() => {}} // No refresh needed on dashboard
            />
        </>
    );
}
