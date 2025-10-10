'use client';
import React, { useMemo, useState, useEffect, useCallback } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { modalController } from '@/lib/modalController';
import type { EventModalData } from '@/lib/modalController';
import axiosInstance from '@/lib/axios';
import './calendar.css';

interface Test {
    id: number;
    title: string;
    start_date: string;
    end_date: string;
    due_at?: string;
    course_name: string;
    teacher_username: string;
    description?: string;
}

interface Assignment {
    id: number;
    title: string;
    due_at: string;
    course_name: string;
    teacher_username: string;
    description?: string;
}

const Calendar = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 576);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    console.log(tests, 'tests');
    console.log(assignments, 'assignments');
    // Fetch tests and assignments data
    const fetchCalendarData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch tests and assignments in parallel
            const [testsResponse, assignmentsResponse] = await Promise.all([
                axiosInstance.get('/tests/'),
                axiosInstance.get('/assignments/'),
            ]);

            setTests(testsResponse.data.results || testsResponse.data);
            setAssignments(
                assignmentsResponse.data.results || assignmentsResponse.data
            );
        } catch (err) {
            console.error('Error fetching calendar data:', err);
            setError('Failed to load calendar data');
        } finally {
            setLoading(false);
        }
    }, []);

    // Fetch data on component mount
    useEffect(() => {
        fetchCalendarData();
    }, [fetchCalendarData]);

    const calendarEvents = useMemo(() => {
        const events: Array<{
            id: string;
            title: string;
            start: string;
            backgroundColor: string;
            borderColor: string;
            textColor: string;
            display: string;
            description?: string;
            subject?: string;
            teacher?: string;
            time?: string;
            type?: string;
        }> = [];

        tests.forEach(test => {
            const testTime = new Date(test.start_date).toLocaleTimeString(
                'ru-RU',
                {
                    hour: '2-digit',
                    minute: '2-digit',
                }
            );

            events.push({
                id: `test-${test.id}`,
                title: `${testTime} - ${test.title}`,
                start: test.start_date.split('T')[0],
                backgroundColor: 'rgb(224, 242, 254)',
                borderColor: 'rgb(224, 242, 254)',
                textColor: '#374151',
                display: 'block',
                description: test.description || '',
                subject: test.course_name,
                teacher: test.teacher_username,
                time: testTime,
                type: 'test',
            });
        });

        assignments.forEach(assignment => {
            const assignmentTime = new Date(
                assignment.due_at
            ).toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            });

            events.push({
                id: `assignment-${assignment.id}`,
                title: `${assignmentTime} - ${assignment.title}`,
                start: assignment.due_at.split('T')[0],
                backgroundColor: 'rgb(255, 237, 213)',
                borderColor: 'rgb(255, 237, 213)',
                textColor: '#374151',
                display: 'block',
                description: assignment.description || '',
                subject: assignment.course_name,
                teacher: assignment.teacher_username,
                time: assignmentTime,
                type: 'assignment',
            });
        });

        return events;
    }, [tests, assignments]);

    const calendarOptions = useMemo(
        () => ({
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: isMobile ? 'dayGridWeek' : 'dayGridMonth',
            headerToolbar: {
                left: 'title',
                center: '',
                right: 'prev,next',
            },
            height: 'auto',
            aspectRatio: isMobile ? 1.2 : 1.35,
            dayMaxEvents: isMobile ? false : 5,
            moreLinkClick: 'popover',
            events: calendarEvents,
            eventOrder: 'time,title',
            eventDisplay: 'block',
            dayHeaderFormat: {
                weekday: 'short' as const,
            },
            titleFormat: {
                month: 'long' as const,
            },
            buttonText: {
                today: 'Сегодня',
                month: 'Месяц',
            },
            selectable: true,
            selectMirror: true,
            weekends: true,
            firstDay: 1, // Monday
            locale: 'ru',
            eventClick: function (eventInfo: EventClickArg) {
                if (eventInfo.event.start) {
                    const eventType = eventInfo.event.extendedProps?.type;
                    const eventId = eventInfo.event.id.replace(
                        `${eventType}-`,
                        ''
                    );
                    const url =
                        eventType === 'test'
                            ? `/tests/${eventId}`
                            : `/assignments/${eventId}`;

                    const eventData: EventModalData = {
                        title: eventInfo.event.title,
                        start: eventInfo.event.start
                            .toISOString()
                            .split('T')[0],
                        subject: eventInfo.event.extendedProps?.subject || '',
                        teacher: eventInfo.event.extendedProps?.teacher || '',
                        time: eventInfo.event.extendedProps?.time || '',
                        description:
                            eventInfo.event.extendedProps?.description || '',
                        url: url,
                        type: eventType,
                    };
                    modalController.open('event-modal', eventData);
                }
            },
            dateClick: function (info: { dateStr: string }) {
                console.log('Date clicked:', info.dateStr);
            },
        }),
        [calendarEvents, isMobile]
    );

    // Show loading state
    if (loading) {
        return (
            <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="pl-8 pr-6 pt-6 pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-gray-500">
                            Загрузка календаря...
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error) {
        return (
            <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="pl-8 pr-6 pt-6 pb-6">
                    <div className="flex items-center justify-center h-64">
                        <div className="text-red-500">{error}</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="pl-8 pr-6 pt-6">
                <div className="calendar-container">
                    <FullCalendar
                        key={isMobile ? 'mobile-week' : 'desktop-month'}
                        {...calendarOptions}
                    />
                </div>
            </div>
        </div>
    );
};

export default Calendar;
