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

const now = new Date();
const currentYear = now.getFullYear();
const currentMonth = now.getMonth() + 1;

// Interfaces for API data
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

const sampleEvents = [
    {
        id: '1',
        title: 'Домашнее Задание',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`,
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        display: 'block',
        description: 'Выполнить упражнения 1-10 из учебника по математике',
        subject: 'Математика',
        teacher: 'Иванова А.П.',
        time: '14:00',
    },
    {
        id: '2',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-03`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Итоговый экзамен по русскому языку',
        subject: 'Русский язык',
        teacher: 'Петрова М.С.',
        time: '09:00',
    },
    {
        id: '3',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-05`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Контрольная работа по физике',
        subject: 'Физика',
        teacher: 'Сидоров В.К.',
        time: '11:30',
    },
    {
        id: '4',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-07`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по истории России',
        subject: 'История',
        teacher: 'Козлова Е.В.',
        time: '10:00',
    },
    {
        id: '5',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-08`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по английскому языку',
        subject: 'Английский язык',
        teacher: 'Морозова Т.А.',
        time: '13:00',
    },
    {
        id: '6',
        title: 'Домашнее Задание',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-08`,
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        display: 'block',
        description: 'Подготовить доклад по биологии',
        subject: 'Биология',
        teacher: 'Волкова Л.Н.',
        time: '15:30',
    },
    {
        id: '7',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-10`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Тест по химии',
        subject: 'Химия',
        teacher: 'Новиков А.И.',
        time: '12:00',
    },
    {
        id: '8',
        title: 'Домашнее Задание',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-11`,
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        display: 'block',
        description: 'Решить задачи по геометрии',
        subject: 'Математика',
        teacher: 'Иванова А.П.',
        time: '16:00',
    },
    {
        id: '9',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-12`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по литературе',
        subject: 'Литература',
        teacher: 'Петрова М.С.',
        time: '09:30',
    },
    {
        id: '10',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-13`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Тест по географии',
        subject: 'География',
        teacher: 'Смирнов П.О.',
        time: '11:00',
    },
    {
        id: '11',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-13`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Тест по информатике',
        subject: 'Информатика',
        teacher: 'Кузнецов Д.В.',
        time: '14:30',
    },
    {
        id: '12',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-13`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по обществознанию',
        subject: 'Обществознание',
        teacher: 'Лебедева О.М.',
        time: '16:00',
    },
    {
        id: '13',
        title: 'Домашнее Задание',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-15`,
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        display: 'block',
        description: 'Написать сочинение по русскому языку',
        subject: 'Русский язык',
        teacher: 'Петрова М.С.',
        time: '17:00',
    },
    {
        id: '14',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-15`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Тест по алгебре',
        subject: 'Математика',
        teacher: 'Иванова А.П.',
        time: '10:30',
    },
    {
        id: '15',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-17`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по физике',
        subject: 'Физика',
        teacher: 'Сидоров В.К.',
        time: '09:00',
    },
    {
        id: '16',
        title: 'Домашнее Задание',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-18`,
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        display: 'block',
        description: 'Подготовить презентацию по биологии',
        subject: 'Биология',
        teacher: 'Волкова Л.Н.',
        time: '15:00',
    },
    {
        id: '17',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-19`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Тест по химии',
        subject: 'Химия',
        teacher: 'Новиков А.И.',
        time: '12:30',
    },
    {
        id: '18',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-22`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по географии',
        subject: 'География',
        teacher: 'Смирнов П.О.',
        time: '10:00',
    },
    {
        id: '19',
        title: 'Домашнее Задание',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-23`,
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        display: 'block',
        description: 'Решить задачи по физике',
        subject: 'Физика',
        teacher: 'Сидоров В.К.',
        time: '16:30',
    },
    {
        id: '20',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-24`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Тест по истории',
        subject: 'История',
        teacher: 'Козлова Е.В.',
        time: '11:00',
    },
    {
        id: '21',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-25`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по информатике',
        subject: 'Информатика',
        teacher: 'Кузнецов Д.В.',
        time: '13:30',
    },
    {
        id: '22',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-26`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Тест по литературе',
        subject: 'Литература',
        teacher: 'Петрова М.С.',
        time: '10:30',
    },
    {
        id: '23',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-26`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по обществознанию',
        subject: 'Обществознание',
        teacher: 'Лебедева О.М.',
        time: '14:00',
    },
    {
        id: '24',
        title: 'Тест',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-26`,
        backgroundColor: 'rgb(224, 242, 254)',
        borderColor: 'rgb(224, 242, 254)',
        textColor: '#374151',
        display: 'block',
        description: 'Тест по английскому языку',
        subject: 'Английский язык',
        teacher: 'Морозова Т.А.',
        time: '15:30',
    },
    {
        id: '25',
        title: 'Домашнее Задание',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-29`,
        backgroundColor: 'rgb(255, 237, 213)',
        borderColor: 'rgb(255, 237, 213)',
        textColor: '#374151',
        display: 'block',
        description: 'Подготовить проект по географии',
        subject: 'География',
        teacher: 'Смирнов П.О.',
        time: '17:00',
    },
    {
        id: '26',
        title: 'Экзамен',
        start: `${currentYear}-${currentMonth.toString().padStart(2, '0')}-30`,
        backgroundColor: 'rgb(254, 226, 226)',
        borderColor: 'rgb(254, 226, 226)',
        textColor: '#374151',
        display: 'block',
        description: 'Экзамен по биологии',
        subject: 'Биология',
        teacher: 'Волкова Л.Н.',
        time: '09:30',
    },
];

const Calendar = () => {
    // State for fetched data
    const [tests, setTests] = useState<Test[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

    // Transform API data to calendar events
    const calendarEvents = useMemo(() => {
        const events: any[] = [];

        // Add tests as events
        tests.forEach(test => {
            events.push({
                id: `test-${test.id}`,
                title: test.title,
                start: test.start_date.split('T')[0], // Use scheduled_at date
                backgroundColor: 'rgb(224, 242, 254)', // Blue for tests
                borderColor: 'rgb(224, 242, 254)',
                textColor: '#374151',
                display: 'block',
                description: test.description || '',
                subject: test.course_name,
                teacher: test.teacher_username,
                time: new Date(test.start_date).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                type: 'test',
            });
        });

        // Add assignments as events
        assignments.forEach(assignment => {
            events.push({
                id: `assignment-${assignment.id}`,
                title: assignment.title,
                start: assignment.due_at.split('T')[0], // Use due_at date
                backgroundColor: 'rgb(255, 237, 213)', // Orange for assignments
                borderColor: 'rgb(255, 237, 213)',
                textColor: '#374151',
                display: 'block',
                description: assignment.description || '',
                subject: assignment.course_name,
                teacher: assignment.teacher_username,
                time: new Date(assignment.due_at).toLocaleTimeString('ru-RU', {
                    hour: '2-digit',
                    minute: '2-digit',
                }),
                type: 'assignment',
            });
        });

        return events;
    }, [tests, assignments]);

    const calendarOptions = useMemo(
        () => ({
            plugins: [dayGridPlugin, interactionPlugin],
            initialView: 'dayGridMonth',
            headerToolbar: {
                left: 'title',
                center: '',
                right: 'prev,next',
            },
            height: 'auto',
            aspectRatio: 1.35,
            dayMaxEvents: 5,
            moreLinkClick: 'popover',
            events: calendarEvents,
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
            dateClick: function (info: any) {
                console.log('Date clicked:', info.dateStr);
            },
            datesSet: function (dateInfo: any) {
                // Handle date changes if needed
            },
        }),
        [calendarEvents]
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
                    <FullCalendar {...calendarOptions} />
                </div>
            </div>
        </div>
    );
};

export default Calendar;
