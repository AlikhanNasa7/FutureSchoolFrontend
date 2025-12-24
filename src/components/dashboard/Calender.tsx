'use client';
import React, {
    useMemo,
    useState,
    useEffect,
    useCallback,
    useRef,
} from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg } from '@fullcalendar/core';
import { Settings, ChevronDown } from 'lucide-react';
import { modalController } from '@/lib/modalController';
import type { EventModalData } from '@/lib/modalController';
import axiosInstance from '@/lib/axios';
import { useLocale } from '@/contexts/LocaleContext';
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

type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay';

const Calendar = () => {
    const [tests, setTests] = useState<Test[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const [view, setView] = useState<CalendarView>(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 576 ? 'timeGridWeek' : 'dayGridMonth';
        }
        return 'dayGridMonth';
    });
    const [isViewMenuOpen, setIsViewMenuOpen] = useState(false);
    const [currentDateRange, setCurrentDateRange] = useState<{
        start: Date | null;
        end: Date | null;
    }>({ start: null, end: null });
    const menuRef = useRef<HTMLDivElement>(null);
    const calendarRef = useRef<any>(null);
    const { t, locale } = useLocale();

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 576);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target as Node)
            ) {
                setIsViewMenuOpen(false);
            }
        };

        if (isViewMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isViewMenuOpen]);

    const handleViewChange = (newView: CalendarView) => {
        setView(newView);
        setIsViewMenuOpen(false);
    };

    // Format date range for display
    const formatDateRange = useCallback(() => {
        if (!currentDateRange.start || !currentDateRange.end) {
            return '';
        }

        const startDate = currentDateRange.start;
        const endDate = currentDateRange.end;

        // Get locale string based on current locale
        const localeMap: Record<string, string> = {
            en: 'en-US',
            ru: 'ru-RU',
            kk: 'kk-KZ',
        };
        const dateLocale = localeMap[locale] || 'en-US';

        if (view === 'timeGridDay') {
            // For daily view, show full date with weekday
            return startDate.toLocaleDateString(dateLocale, {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } else if (view === 'timeGridWeek') {
            // For weekly view, show date range in a readable format
            const startDay = startDate.getDate();
            const endDay = endDate.getDate();
            const startMonth = startDate.toLocaleDateString(dateLocale, {
                month: 'long',
            });
            const endMonth = endDate.toLocaleDateString(dateLocale, {
                month: 'long',
            });
            const year = startDate.getFullYear();

            // If same month and year
            if (
                startDate.getMonth() === endDate.getMonth() &&
                startDate.getFullYear() === endDate.getFullYear()
            ) {
                return `${startDay} - ${endDay} ${startMonth} ${year}`;
            }
            // If same year but different months
            if (startDate.getFullYear() === endDate.getFullYear()) {
                const startMonthShort = startDate.toLocaleDateString(
                    dateLocale,
                    {
                        month: 'short',
                    }
                );
                const endMonthShort = endDate.toLocaleDateString(dateLocale, {
                    month: 'short',
                });
                return `${startDay} ${startMonthShort} - ${endDay} ${endMonthShort} ${year}`;
            }
            // Different years
            const startMonthShort = startDate.toLocaleDateString(dateLocale, {
                month: 'short',
            });
            const endMonthShort = endDate.toLocaleDateString(dateLocale, {
                month: 'short',
            });
            const startYear = startDate.getFullYear();
            const endYear = endDate.getFullYear();
            return `${startDay} ${startMonthShort} ${startYear} - ${endDay} ${endMonthShort} ${endYear}`;
        }
        return '';
    }, [currentDateRange, view, locale]);

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
            end?: string;
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
            const testDate = new Date(test.start_date);
            const testTime = testDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            });
            const endDate = test.end_date
                ? new Date(test.end_date)
                : new Date(testDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration

            events.push({
                id: `test-${test.id}`,
                title: test.title,
                start: test.start_date,
                end: endDate.toISOString(),
                backgroundColor: 'rgb(224, 242, 254)',
                borderColor: 'rgb(224, 242, 254)',
                textColor: '#374151',
                display: 'auto',
                description: test.description || '',
                subject: test.course_name,
                teacher: test.teacher_username,
                time: testTime,
                type: 'test',
            });
        });

        assignments.forEach(assignment => {
            const assignmentDate = new Date(assignment.due_at);
            const assignmentTime = assignmentDate.toLocaleTimeString('ru-RU', {
                hour: '2-digit',
                minute: '2-digit',
            });
            // Default duration for assignments: 1 hour
            const endDate = new Date(assignmentDate.getTime() + 60 * 60 * 1000);

            events.push({
                id: `assignment-${assignment.id}`,
                title: assignment.title,
                start: assignment.due_at,
                end: endDate.toISOString(),
                backgroundColor: 'rgb(255, 237, 213)',
                borderColor: 'rgb(255, 237, 213)',
                textColor: '#374151',
                display: 'auto',
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
            plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
            initialView: view,
            headerToolbar: {
                left: 'title',
                center: '',
                right: 'prev,next',
            },
            height: 'auto',
            aspectRatio:
                view === 'timeGridDay'
                    ? 0.8
                    : view === 'timeGridWeek'
                      ? 0.9
                      : isMobile
                        ? 1.0
                        : 1.1,
            dayMaxEvents:
                view === 'dayGridMonth' ? (isMobile ? false : 5) : false,
            moreLinkClick: 'popover',
            events: calendarEvents,
            eventOrder: 'time,title',
            eventDisplay: 'auto',
            allDaySlot: false,
            dayHeaderFormat: {
                weekday: 'short' as const,
            },
            titleFormat: {
                month: 'long',
                week: 'short',
            },
            buttonText: {
                today: t('dashboard.calendarButtons.today'),
                month: t('dashboard.calendarButtons.month'),
                week: t('dashboard.calendarButtons.week'),
                day: t('dashboard.calendarButtons.day'),
            },
            selectable: true,
            selectMirror: true,
            weekends: true,
            firstDay: 1, // Monday
            locale: locale === 'kk' ? 'kk' : locale === 'ru' ? 'ru' : 'en',
            slotMinTime: '08:00:00',
            slotMaxTime: '22:00:00',
            scrollTime: '08:00:00',
            scrollTimeReset: false,
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
            datesSet: function (arg: { start: Date; end: Date; view: any }) {
                setCurrentDateRange({
                    start: arg.start,
                    end: arg.end,
                });
            },
        }),
        [calendarEvents, isMobile, view, t, locale]
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
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-xl font-semibold text-gray-800">
                            {t('dashboard.calendar')}
                        </h2>
                        {(view === 'timeGridWeek' ||
                            view === 'timeGridDay') && (
                            <p className="text-sm text-gray-600 mt-1">
                                {formatDateRange()}
                            </p>
                        )}
                    </div>
                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setIsViewMenuOpen(!isViewMenuOpen)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            aria-label={t('dashboard.selectView')}
                        >
                            <Settings className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-medium text-gray-700 hidden sm:inline">
                                {view === 'dayGridMonth'
                                    ? t('dashboard.viewMonthly')
                                    : view === 'timeGridWeek'
                                      ? t('dashboard.viewWeekly')
                                      : t('dashboard.viewDaily')}
                            </span>
                            <ChevronDown
                                className={`w-4 h-4 text-gray-600 transition-transform ${
                                    isViewMenuOpen ? 'rotate-180' : ''
                                }`}
                            />
                        </button>
                        {isViewMenuOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                                <div className="py-1">
                                    <button
                                        onClick={() =>
                                            handleViewChange('dayGridMonth')
                                        }
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                            view === 'dayGridMonth'
                                                ? 'bg-purple-50 text-purple-700 font-medium'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {t('dashboard.viewMonthly')}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleViewChange('timeGridWeek')
                                        }
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                            view === 'timeGridWeek'
                                                ? 'bg-purple-50 text-purple-700 font-medium'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {t('dashboard.viewWeekly')}
                                    </button>
                                    <button
                                        onClick={() =>
                                            handleViewChange('timeGridDay')
                                        }
                                        className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                            view === 'timeGridDay'
                                                ? 'bg-purple-50 text-purple-700 font-medium'
                                                : 'text-gray-700'
                                        }`}
                                    >
                                        {t('dashboard.viewDaily')}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                <div className="calendar-container">
                    <FullCalendar
                        ref={calendarRef}
                        key={`${view}-${isMobile ? 'mobile' : 'desktop'}`}
                        {...calendarOptions}
                    />
                </div>
            </div>
        </div>
    );
};

export default Calendar;
