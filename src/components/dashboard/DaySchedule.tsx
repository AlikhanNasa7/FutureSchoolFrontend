'use client';

import { useMemo } from 'react';
import { modalController } from '@/lib/modalController';
import type { EventModalData } from '@/lib/modalController';

interface Event {
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
}

interface DayScheduleProps {
    date?: Date;
    events?: Event[];
}

// Sample events data (you can pass this as props or fetch from API)
const sampleEvents: Event[] = [
    {
        id: '1',
        title: 'Урок',
        start: '2025-08-31',
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        description: 'Урок математики - алгебраические уравнения',
        subject: 'Математика',
        teacher: 'Иванова А.П.',
        time: '08:00',
    },
    {
        id: '2',
        title: 'Экзамен',
        start: '2025-08-31',
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        description: 'Итоговый экзамен по русскому языку',
        subject: 'Русский язык',
        teacher: 'Петрова М.С.',
        time: '10:30',
    },
    {
        id: '3',
        title: 'Тест',
        start: '2025-08-31',
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        description: 'Контрольная работа по физике',
        subject: 'Физика',
        teacher: 'Сидоров В.К.',
        time: '13:00',
    },
    {
        id: '4',
        title: 'Урок',
        start: '2025-08-31',
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        description: 'Урок биологии - клеточное строение',
        subject: 'Биология',
        teacher: 'Волкова Л.Н.',
        time: '15:30',
    },
    {
        id: '5',
        title: 'Экзамен',
        start: '2025-08-31',
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        description: 'Экзамен по истории России',
        subject: 'История',
        teacher: 'Козлова Е.В.',
        time: '17:00',
    },
    {
        id: '6',
        title: 'Урок',
        start: '2025-08-31',
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        description: 'Урок английского языка - грамматика',
        subject: 'Английский язык',
        teacher: 'Морозова Т.А.',
        time: '18:30',
    },
];

export default function DaySchedule({
    date = new Date(),
    events = sampleEvents,
}: DayScheduleProps) {
    const dayEvents = useMemo(() => {
        const dateString = date.toISOString().split('T')[0];
        return events
            .filter(event => {
                // Only show exams, tests, and lessons (not homework)
                const isHomework = event.title === 'Домашнее Задание';
                const isSameDate = event.start === dateString;
                return !isHomework && isSameDate;
            })
            .sort((a, b) => {
                const timeA = new Date(`2000-01-01T${a.time}`);
                const timeB = new Date(`2000-01-01T${b.time}`);
                return timeA.getTime() - timeB.getTime();
            });
    }, [date, events]);

    const handleEventClick = (event: Event) => {
        const eventData: EventModalData = {
            title: event.title,
            start: event.start,
            subject: event.subject,
            teacher: event.teacher,
            time: event.time,
            description: event.description,
        };
        modalController.open('event-modal', eventData);
    };

    const getEventTypeColor = (title: string) => {
        if (title === 'Домашнее Задание') return 'rgb(255, 237, 213)';
        if (title === 'Экзамен') return 'rgb(254, 226, 226)';
        if (title === 'Тест') return 'rgb(224, 242, 254)';
        if (title === 'Урок') return 'rgb(220, 252, 231)';
        return 'rgb(255, 237, 213)';
    };

    const getEventTypeText = (title: string) => {
        if (title === 'Домашнее Задание') return 'ДЗ';
        if (title === 'Экзамен') return 'Экз';
        if (title === 'Тест') return 'Тест';
        if (title === 'Урок') return 'Урок';
        return title;
    };

    return (
        <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">    
                <h2 className="text-lg font-semibold text-gray-900">
                    Расписание на{' '}
                    {date.toLocaleDateString('ru-RU', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    })}
                </h2>
            </div>

            <div className="p-4 sm:h-80 overflow-y-auto h-auto">
                {dayEvents.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                            <svg
                                className="w-8 h-8 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Нет событий
                        </h3>
                        <p className="text-gray-500">
                            На этот день не запланировано никаких событий
                        </p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {dayEvents.map(event => (
                            <div
                                key={event.id}
                                onClick={() => handleEventClick(event)}
                                className="group relative p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 focus:border-blue-300"
                                tabIndex={0}
                                onKeyDown={e => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        handleEventClick(event);
                                    }
                                }}
                            >
                                <div className="flex items-center justify-between">
                                    {/* Left side - Time and Type */}
                                    <div className="flex items-center space-x-3">
                                        <div className="text-sm font-semibold text-gray-900 min-w-[45px]">
                                            {event.time}
                                        </div>
                                        <div
                                            className="px-2 py-1 rounded-md text-xs font-medium"
                                            style={{
                                                backgroundColor:
                                                    getEventTypeColor(
                                                        event.title
                                                    ),
                                                color: '#374151',
                                            }}
                                        >
                                            {getEventTypeText(event.title)}
                                        </div>
                                    </div>

                                    {/* Right side - Subject and Teacher */}
                                    <div className="flex-1 ml-4 text-right">
                                        <div className="text-sm font-medium text-gray-900 truncate">
                                            {event.subject}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">
                                            {event.teacher}
                                        </div>
                                    </div>
                                </div>

                                {/* Hover Effect */}
                                <div className="absolute inset-0 bg-blue-50 opacity-0 group-hover:opacity-5 rounded-lg transition-opacity duration-200 pointer-events-none"></div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
