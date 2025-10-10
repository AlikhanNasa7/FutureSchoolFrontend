'use client';
import { useUserState } from '@/contexts/UserContext';
import Calender from '@/components/dashboard/Calender';
import DaySchedule from '@/components/dashboard/DaySchedule';
import PendingAssignments from '@/components/dashboard/PendingAssignments';

export default function DashboardPage() {
    const { user } = useUserState();

    return (
        <div className="flex gap-6 md:flex-row flex-col">
            <div className="flex-3/4">
                <Calender />
            </div>
            <div className="flex-1/4 flex flex-col gap-6 sm:flex-row md:flex-col">
                <DaySchedule />
                {/* Only show PendingAssignments for students */}
                {user?.role === 'student' && <PendingAssignments />}
            </div>
        </div>
    );
}
