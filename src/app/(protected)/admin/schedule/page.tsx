'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Edit2, Plus, CalendarPlus } from 'lucide-react';
import { useUserState } from '@/contexts/UserContext';
import axiosInstance from '@/lib/axios';
import EditScheduleModal, { type SubjectGroupForSchedule } from './_components/EditScheduleModal';

interface Classroom {
    id: number;
    grade: number;
    letter: string;
    school_name?: string;
    name?: string;
}

const DAYS = [
    { value: 0, short: 'Пн', label: 'Понедельник' },
    { value: 1, short: 'Вт', label: 'Вторник' },
    { value: 2, short: 'Ср', label: 'Среда' },
    { value: 3, short: 'Чт', label: 'Четверг' },
    { value: 4, short: 'Пт', label: 'Пятница' },
    { value: 5, short: 'Сб', label: 'Суббота' },
    { value: 6, short: 'Вс', label: 'Воскресенье' },
];

// Time bands: 30-min from 08:00 to 18:00
function buildTimeBands(): { start: number; end: number; label: string }[] {
    const bands: { start: number; end: number; label: string }[] = [];
    for (let h = 8; h <= 17; h++) {
        for (let m = 0; m < 60; m += 30) {
            const start = h * 60 + m;
            const endM = m + 30;
            const end = endM >= 60 ? (h + 1) * 60 + (endM - 60) : h * 60 + endM;
            if (end > 18 * 60) break;
            const startStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
            const endStr = `${String(Math.floor(end / 60)).padStart(2, '0')}:${String(end % 60).padStart(2, '0')}`;
            bands.push({ start, end, label: `${startStr}–${endStr}` });
        }
    }
    return bands;
}

const TIME_BANDS = buildTimeBands();

function timeToMinutes(t: string): number {
    const match = String(t).match(/^(\d{1,2}):(\d{2})/);
    if (!match) return 0;
    return parseInt(match[1], 10) * 60 + parseInt(match[2], 10);
}

function slotOverlapsBand(
    slotStartMin: number,
    slotEndMin: number,
    bandStart: number,
    bandEnd: number
): boolean {
    return slotStartMin < bandEnd && slotEndMin > bandStart;
}

interface SlotWithSubject {
    id: number;
    subject_group: number;
    subject_group_course_name: string;
    subject_group_teacher_fullname: string | null;
    day_of_week: number;
    start_time: string;
    end_time: string;
    room?: string | null;
}

export default function SchedulePage() {
    const router = useRouter();
    const { user } = useUserState();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
    const [subjectGroups, setSubjectGroups] = useState<SubjectGroupForSchedule[]>([]);
    const [loadingClassrooms, setLoadingClassrooms] = useState(true);
    const [loadingSchedule, setLoadingSchedule] = useState(false);
    const [editSubjectGroup, setEditSubjectGroup] = useState<SubjectGroupForSchedule | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'superadmin' && user.role !== 'schooladmin') {
            router.push('/dashboard');
            return;
        }
    }, [user, router]);

    useEffect(() => {
        let cancelled = false;
        async function fetchClassrooms() {
            try {
                setLoadingClassrooms(true);
                const res = await axiosInstance.get('/classrooms/');
                const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
                const list = data.map((c: Classroom) => ({
                    ...c,
                    name: `${c.grade}${c.letter}`,
                }));
                if (!cancelled) {
                    setClassrooms(list);
                    if (list.length && !selectedClassroomId) setSelectedClassroomId(list[0].id);
                }
            } catch (e) {
                console.error('Error fetching classrooms:', e);
            } finally {
                if (!cancelled) setLoadingClassrooms(false);
            }
        }
        fetchClassrooms();
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (!selectedClassroomId) {
            setSubjectGroups([]);
            return;
        }
        let cancelled = false;
        async function fetchSchedule() {
            try {
                setLoadingSchedule(true);
                const res = await axiosInstance.get('/subject-groups/', {
                    params: { classroom: selectedClassroomId },
                });
                const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
                if (!cancelled) setSubjectGroups(data);
            } catch (e) {
                console.error('Error fetching subject groups:', e);
                if (!cancelled) setSubjectGroups([]);
            } finally {
                if (!cancelled) setLoadingSchedule(false);
            }
        }
        fetchSchedule();
        return () => { cancelled = true; };
    }, [selectedClassroomId]);

    const allSlots = useMemo(() => {
        const out: SlotWithSubject[] = [];
        for (const sg of subjectGroups) {
            const slots = sg.schedule_slots ?? [];
            for (const s of slots) {
                out.push({
                    id: s.id,
                    subject_group: sg.id,
                    subject_group_course_name: sg.course_name ?? '',
                    subject_group_teacher_fullname: sg.teacher_fullname ?? null,
                    day_of_week: s.day_of_week,
                    start_time: s.start_time,
                    end_time: s.end_time,
                    room: s.room,
                });
            }
        }
        return out;
    }, [subjectGroups]);

    const selectedClassroom = useMemo(
        () => classrooms.find((c) => c.id === selectedClassroomId),
        [classrooms, selectedClassroomId]
    );

    const handleEditSchedule = (sg: SubjectGroupForSchedule) => {
        setEditSubjectGroup(sg);
        setEditModalOpen(true);
    };

    const handleEditSuccess = () => {
        if (!selectedClassroomId) return;
        axiosInstance
            .get('/subject-groups/', { params: { classroom: selectedClassroomId } })
            .then((res) => {
                const data = Array.isArray(res.data) ? res.data : res.data.results ?? [];
                setSubjectGroups(data);
            })
            .catch(console.error);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-6">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <Calendar className="h-7 w-7 text-purple-600" />
                        Расписание по классам
                    </h1>
                </div>

                {loadingClassrooms ? (
                    <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                        Загрузка классов...
                    </div>
                ) : classrooms.length === 0 ? (
                    <div className="rounded-xl bg-white p-8 text-center text-gray-500">
                        Нет классов. Создайте классы в разделе «Классы».
                    </div>
                ) : (
                    <>
                        {/* Tabs: classrooms */}
                        <div className="mb-4 flex flex-wrap gap-2">
                            {classrooms.map((c) => (
                                <button
                                    key={c.id}
                                    type="button"
                                    onClick={() => setSelectedClassroomId(c.id)}
                                    className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                                        selectedClassroomId === c.id
                                            ? 'border-purple-500 bg-purple-100 text-purple-800'
                                            : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300 hover:bg-purple-50'
                                    }`}
                                >
                                    {c.name ?? `${c.grade}${c.letter}`}
                                    {c.school_name ? ` (${c.school_name})` : ''}
                                </button>
                            ))}
                        </div>

                        {selectedClassroomId && (
                            <>
                                {/* Список предметов класса: добавить / настроить расписание */}
                                {!loadingSchedule && subjectGroups.length > 0 && (
                                    <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                                        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
                                            <CalendarPlus className="h-4 w-4 text-purple-600" />
                                            Предметы класса — добавить или настроить расписание
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {subjectGroups.map((sg) => {
                                                const slotCount = (sg.schedule_slots ?? []).length;
                                                return (
                                                    <button
                                                        key={sg.id}
                                                        type="button"
                                                        onClick={() => handleEditSchedule(sg)}
                                                        className="flex items-center gap-2 rounded-lg border-2 border-purple-200 bg-white px-4 py-2.5 text-left text-sm transition-colors hover:border-purple-400 hover:bg-purple-50"
                                                    >
                                                        <span className="font-medium text-gray-900">
                                                            {sg.course_name}
                                                        </span>
                                                        {sg.teacher_fullname && (
                                                            <span className="text-gray-500">
                                                                ({sg.teacher_fullname})
                                                            </span>
                                                        )}
                                                        {slotCount > 0 ? (
                                                            <span className="rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700">
                                                                {slotCount} сл.
                                                            </span>
                                                        ) : (
                                                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                                                <Plus className="inline h-3 w-3" /> добавить
                                                            </span>
                                                        )}
                                                        <Edit2 className="h-4 w-4 flex-shrink-0 text-purple-500" />
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}

                                <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
                                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                                        <h2 className="font-semibold text-gray-800">
                                            Класс {selectedClassroom?.name ?? selectedClassroom?.grade + selectedClassroom?.letter}
                                        </h2>
                                        <p className="text-sm text-gray-500">
                                            Нажмите на предмет в сетке или в списке выше, чтобы добавить или редактировать расписание
                                        </p>
                                    </div>

                                {loadingSchedule ? (
                                    <div className="p-8 text-center text-gray-500">
                                        Загрузка расписания...
                                    </div>
                                ) : subjectGroups.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p className="mb-2">У этого класса пока нет предметов.</p>
                                        <p className="text-sm">
                                            Добавьте класс к курсу в разделе «Курсы» — тогда здесь появится список предметов и можно будет настроить расписание.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full max-w-full table-fixed border-collapse text-sm">
                                            <colgroup>
                                                <col style={{ width: '10%', minWidth: '4.5rem' }} />
                                                {DAYS.map((d) => (
                                                    <col key={d.value} style={{ width: `${90 / DAYS.length}%`, minWidth: '3.5rem' }} />
                                                ))}
                                            </colgroup>
                                            <thead>
                                                <tr className="bg-gray-100">
                                                    <th className="border-b border-r border-gray-200 p-1.5 text-left text-xs font-medium text-gray-600">
                                                        Время
                                                    </th>
                                                    {DAYS.map((d) => (
                                                        <th
                                                            key={d.value}
                                                            className="border-b border-r border-gray-200 p-1.5 text-center text-xs font-medium text-gray-600 last:border-r-0"
                                                        >
                                                            {d.short}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {TIME_BANDS.map((band) => (
                                                    <tr key={band.label} className="hover:bg-gray-50/50">
                                                        <td className="whitespace-nowrap border-b border-r border-gray-200 p-2 text-gray-600">
                                                            {band.label}
                                                        </td>
                                                        {DAYS.map((day) => {
                                                            const bandStart = band.start;
                                                            const bandEnd = band.end;
                                                            const cellSlots = allSlots.filter((s) => {
                                                                if (s.day_of_week !== day.value) return false;
                                                                const startMin = timeToMinutes(s.start_time);
                                                                const endMin = timeToMinutes(s.end_time);
                                                                return slotOverlapsBand(startMin, endMin, bandStart, bandEnd);
                                                            });
                                                            const bySubjectGroup = new Map<number, SlotWithSubject>();
                                                            cellSlots.forEach((s) => {
                                                                if (!bySubjectGroup.has(s.subject_group))
                                                                    bySubjectGroup.set(s.subject_group, s);
                                                            });
                                                            const sgList = Array.from(bySubjectGroup.values());
                                                            const subjectGroup = sgList[0]
                                                                ? subjectGroups.find((sg) => sg.id === sgList[0].subject_group)
                                                                : null;
                                                            return (
                                                                <td
                                                                    key={day.value}
                                                                    className="relative min-w-0 border-b border-r border-gray-200 p-1 align-top last:border-r-0 overflow-visible"
                                                                >
                                                                    {sgList.length === 0 ? (
                                                                        <span className="text-gray-400">—</span>
                                                                    ) : (
                                                                        sgList.map((s) => {
                                                                            const sg = subjectGroups.find(
                                                                                (x) => x.id === s.subject_group
                                                                            );
                                                                            if (!sg) return null;
                                                                            const tooltipText = s.subject_group_teacher_fullname
                                                                                ? `${s.subject_group_course_name} (${s.subject_group_teacher_fullname})`
                                                                                : s.subject_group_course_name;
                                                                            return (
                                                                                <div key={s.id} className="group/slot relative mb-1">
                                                                                    <button
                                                                                        type="button"
                                                                                        onClick={() => handleEditSchedule(sg)}
                                                                                        className="flex w-full min-w-0 items-center gap-1 rounded-lg border border-purple-200 bg-purple-50 px-1.5 py-1 text-left text-xs transition-colors hover:border-purple-400 hover:bg-purple-100"
                                                                                    >
                                                                                        <Edit2 className="h-3 w-3 flex-shrink-0 text-purple-600" />
                                                                                        <span className="min-w-0 truncate font-medium text-purple-900">
                                                                                            {s.subject_group_course_name}
                                                                                        </span>
                                                                                        {s.subject_group_teacher_fullname && (
                                                                                            <span className="min-w-0 truncate text-purple-700">
                                                                                                ({s.subject_group_teacher_fullname})
                                                                                            </span>
                                                                                        )}
                                                                                    </button>
                                                                                    <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-lg border border-purple-200 bg-white px-2 py-1.5 text-xs font-medium text-gray-800 shadow-lg opacity-0 transition-opacity duration-150 group-hover/slot:opacity-100">
                                                                                        {tooltipText}
                                                                                    </div>
                                                                                </div>
                                                                            );
                                                                        })
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                                </div>
                            </>
                        )}
                    </>
                )}
            </div>

            <EditScheduleModal
                isOpen={editModalOpen}
                onClose={() => {
                    setEditModalOpen(false);
                    setEditSubjectGroup(null);
                }}
                subjectGroup={editSubjectGroup}
                onSuccess={handleEditSuccess}
            />
        </div>
    );
}
