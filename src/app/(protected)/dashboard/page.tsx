'use client';
import { useUserState } from '@/contexts/UserContext';
import Calender from '@/components/dashboard/Calender';
import DaySchedule from '@/components/dashboard/DaySchedule';
import PendingAssignments from '@/components/dashboard/PendingAssignments';

export default function DashboardPage() {
    const { user } = useUserState();

    return (
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
    );
}
