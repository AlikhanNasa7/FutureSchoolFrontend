'use client';

import { useState, useCallback, useEffect } from 'react';
import { useUserState } from '@/contexts/UserContext';
import { useRouter } from 'next/navigation';
import Calender from '@/components/dashboard/Calender';
import DaySchedule from '@/components/dashboard/DaySchedule';
import PendingAssignments from '@/components/dashboard/PendingAssignments';

export interface DayScheduleEvent {
    id: string;
    title: string;
    start: string;
    subject: string;
    teacher: string;
    time: string;
    description: string;
    backgroundColor: string;
    borderColor: string;
    textColor: string;
    type?: string;
}

export default function DashboardPage() {
    const { user } = useUserState();
    const router = useRouter();
    const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
    const [dayEvents, setDayEvents] = useState<DayScheduleEvent[]>([]);

    const handleDateChange = useCallback((date: Date, events: DayScheduleEvent[]) => {
        setSelectedDate(date);
        setDayEvents(events);
    }, []);

    useEffect(() => {
        if (user?.role === 'parent') {
            router.push('/parent/dashboard');
        }
    }, [user, router]);

    if (user?.role === 'parent') {
        return null;
    }

    return (
        <div className="flex gap-6 md:flex-row flex-col">
            <div className="flex-3/4 order-3 md:order-1">
                <Calender
                    selectedDate={selectedDate}
                    onDateChange={handleDateChange}
                />
            </div>
            <div className="flex-1/4 flex flex-col gap-6 sm:flex-row md:flex-col order-1 md:order-2">
                {user?.role === 'student' && (
                    <div className="order-1">
                        <PendingAssignments />
                    </div>
                )}
                <div className={user?.role === 'student' ? 'order-2' : ''}>
                    <DaySchedule date={selectedDate} events={dayEvents} />
                </div>
            </div>
        </div>
    );
}
