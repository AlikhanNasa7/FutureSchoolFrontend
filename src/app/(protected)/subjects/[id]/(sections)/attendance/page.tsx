'use client';
import axiosInstance from '@/lib/axios';
import LessonDay from '@/app/(protected)/subjects/[id]/_components/LessonDay';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUserState } from '@/contexts/UserContext';
import AddLesson from '../../_components/AddLesson';

interface AttendanceRecord {
    student: number;
    status: 'present' | 'excused' | 'not_present';
    notes: string;
}

interface LessonDay {
    id: number;
    taken_at: string;
    records: AttendanceRecord[];
}

export default function AttendancePage() {
    const { user } = useUserState();
    const subjectId = useParams().id;
    const [lessonDays, setLessonDays] = useState<LessonDay[]>([]);
    const [studentAttendanceData, setStudentAttendanceData] =
        useState<any>(null);

    console.log(lessonDays, 'lessonDays');

    useEffect(() => {
        const fetchData = async () => {
            if (user?.role === 'teacher') {
                // Teacher view - fetch lesson days for management
                const response = await axiosInstance.get(
                    `/attendance/?subject_group=${subjectId}`
                );
                setLessonDays(response.data);
            } else {
                // Student view - fetch same data but filter for current student
                const response = await axiosInstance.get(
                    `/attendance/?subject_group=${subjectId}`
                );
                setStudentAttendanceData(response.data);
            }
        };
        fetchData();
    }, [subjectId, user?.role]);

    // Teacher view - show management interface
    if (user?.role === 'teacher') {
        return (
            <div>
                <ul className="flex flex-col gap-4 mb-4">
                    {lessonDays.map(lessonDay => (
                        <li key={lessonDay.id}>
                            <LessonDay data={lessonDay} />
                        </li>
                    ))}
                </ul>
                <AddLesson
                    lessonDays={lessonDays}
                    setLessonDays={setLessonDays}
                />
            </div>
        );
    }

    // Student view - show read-only attendance
    // Calculate attendance statistics
    const totalLessons = studentAttendanceData?.length || 0;
    const attendedLessons =
        studentAttendanceData?.filter((lessonDay: LessonDay) => {
            const studentRecord = lessonDay.records.find(
                record => record.student === user?.id
            );
            return studentRecord?.status === 'present';
        }).length || 0;

    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Моя посещаемость</h2>
            {studentAttendanceData && studentAttendanceData.length > 0 ? (
                <>
                    <div className="bg-white rounded-lg p-5 mb-4">
                        <p className="text-lg font-semibold text-gray-900">
                            Участие - {attendedLessons} / {totalLessons} уроков
                        </p>
                    </div>
                    <ul className="flex flex-col gap-4">
                        {studentAttendanceData.map((lessonDay: LessonDay) => {
                            const studentRecord = lessonDay.records.find(
                                record => record.student === user?.id
                            );

                            if (!studentRecord) return null;

                            return (
                                <li
                                    key={lessonDay.id}
                                    className="w-full bg-white rounded-lg overflow-hidden relative"
                                    style={{ height: '100%' }}
                                >
                                    <div className="flex justify-between items-center p-5">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-gray-900 leading-6">
                                                Урок -{' '}
                                                {new Date(
                                                    lessonDay.taken_at
                                                ).getDate()}{' '}
                                                {new Date(
                                                    lessonDay.taken_at
                                                ).toLocaleDateString('ru-RU', {
                                                    month: 'long',
                                                })}
                                            </h3>
                                            {studentRecord.notes && (
                                                <div className="mt-3 p-3 rounded-md">
                                                    Примечание:{' '}
                                                    {studentRecord.notes}
                                                </div>
                                            )}
                                        </div>
                                        <div
                                            className={`px-4 py-2 rounded-lg text-base font-semibold text-white ${
                                                studentRecord.status ===
                                                'present'
                                                    ? 'bg-green-600'
                                                    : studentRecord.status ===
                                                        'excused'
                                                      ? 'bg-yellow-500'
                                                      : 'bg-red-500'
                                            }`}
                                        >
                                            {studentRecord.status === 'present'
                                                ? 'Присутствовал'
                                                : studentRecord.status ===
                                                    'excused'
                                                  ? 'Уважительная причина'
                                                  : 'Отсутствовал'}
                                        </div>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </>
            ) : (
                <p className="text-gray-500">Нет записей о посещаемости</p>
            )}
        </div>
    );
}
