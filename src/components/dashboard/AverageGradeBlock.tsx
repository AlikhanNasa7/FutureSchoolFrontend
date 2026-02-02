'use client';

import { useMemo, useState } from 'react';
import { useUserState } from '@/contexts/UserContext';
import { useLocale } from '@/contexts/LocaleContext';

export default function AverageGradeBlock() {
    const { user } = useUserState();
    const { t } = useLocale();
    const isStudent = user?.role === 'student';
    const rawAverageGrade = useMemo(() => {
        const anyUser = user as any;
        return anyUser?.student_data?.statistics?.average_grade as number | undefined;
    }, [user]);

    const [scale, setScale] = useState<'percent' | '5' | '10'>('percent');

    const averageGradeDisplay = useMemo(() => {
        if (!isStudent || rawAverageGrade == null) return null;
        const percent = Math.round(rawAverageGrade);
        if (scale === 'percent') return `${percent}%`;
        if (scale === '5') return `${((rawAverageGrade / 100) * 5).toFixed(1)}/5`;
        return `${((rawAverageGrade / 100) * 10).toFixed(1)}/10`;
    }, [isStudent, rawAverageGrade, scale]);

    if (!isStudent || averageGradeDisplay == null) return null;

    return (
        <div className="w-full bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="px-6 py-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-gray-900">
                    {t('profile.averageGrade')}
                </h2>
                <div className="flex items-center gap-3 text-gray-700">
                    <span className="text-2xl sm:text-3xl font-bold tabular-nums">{averageGradeDisplay}</span>
                    <select
                        value={scale}
                        onChange={e => setScale(e.target.value as 'percent' | '5' | '10')}
                        className="border border-gray-300 rounded px-2 py-1.5 text-base bg-white"
                    >
                        <option value="percent">%</option>
                        <option value="5">/5</option>
                        <option value="10">/10</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
