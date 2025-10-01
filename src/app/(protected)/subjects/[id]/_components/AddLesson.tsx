import axiosInstance from '@/lib/axios';
import { Plus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useState } from 'react';

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

interface AddLessonProps {
    lessonDays: LessonDay[];
    setLessonDays: (lessonDays: LessonDay[]) => void;
}

export default function AddLesson({
    lessonDays,
    setLessonDays,
}: AddLessonProps) {
    const subjectId = useParams().id;
    const [isLoading, setIsLoading] = useState(false);

    const isTodayAlreadyExists = () => {
        const today = new Date();
        const todayLocal = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
        );
        const todayString = todayLocal.toISOString().split('T')[0]; // YYYY-MM-DD format

        return lessonDays.some(lesson => {
            const lessonDate = new Date(lesson.taken_at);
            const lessonDateLocal = new Date(
                lessonDate.getFullYear(),
                lessonDate.getMonth(),
                lessonDate.getDate()
            );
            const lessonDateString = lessonDateLocal
                .toISOString()
                .split('T')[0];
            return lessonDateString === todayString;
        });
    };

    const handleAddLesson = async () => {
        if (isTodayAlreadyExists()) {
            alert('Урок на сегодня уже существует!');
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosInstance.post('/attendance/', {
                subject_group: subjectId,
                records: [],
            });
            console.log(response);
            setLessonDays([...lessonDays, response.data]);
        } catch (error) {
            console.error('Error adding lesson:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="justify-center w-full bg-purple-100 overflow-hidden rounded-lg border-2 border-purple-500 p-4 flex items-center space-x-3 border-dashed">
            <Plus className="w-4 h-4 text-purple-500" />
            <button
                className=" cursor-pointer text-purple-500 text-xl font-inter font-semibold underline"
                onClick={handleAddLesson}
            >
                Добавить Урок
            </button>
        </div>
    );
}
