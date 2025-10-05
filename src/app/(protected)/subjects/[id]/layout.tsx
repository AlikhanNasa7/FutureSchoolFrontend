'use client';

import { useParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import React, { useEffect, useState, createContext, useContext } from 'react';
import axiosInstance from '@/lib/axios';
import { Plus } from 'lucide-react';

interface SubjectData {
    id: string;
    name: string;
    professor: string;
    bgId: string;
    urlPath: string;
    course_name: string;
    teacher_username?: string;
    course_code?: string;
    grade?: number;
    type?: string;
    description?: string;
    classroom_display?: string;
    teacher_email?: string;
}

// Create context for subject data
export const SubjectContext = createContext<{
    subject: SubjectData | null;
    loading: boolean;
    error: string | null;
    subjectGroupMembers: any[];
}>({
    subject: null,
    loading: true,
    error: null,
    subjectGroupMembers: [],
});

// Hook to use subject context
export const useSubject = () => {
    const context = useContext(SubjectContext);
    if (!context) {
        throw new Error('useSubject must be used within a SubjectProvider');
    }
    return context;
};

const tabs = [
    { href: 'contents', label: 'Contents' },
    { href: 'participants', label: 'Participants' },
    { href: 'grades', label: 'Grades' },
    { href: 'attendance', label: 'Attendance' },
];

function useParentPath() {
    const pathname = usePathname();
    return pathname.replace(/\/[^/]+\/?$/, '') || '/';
}

export default function SubjectDetailPage({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const subjectId = decodeURIComponent(params.id as string);
    const pathName = usePathname();
    const parentPath = useParentPath();
    const [subject, setSubject] = useState<SubjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subjectGroupMembers, setSubjectGroupMembers] = useState([]);
    console.log(subject, 'subject');
    console.log(subjectGroupMembers, 'subjectGroupMembers');

    useEffect(() => {
        const fetchSubject = async () => {
            setLoading(true);
            setError(null);
            const response = await axiosInstance.get(
                `/subject-groups/${subjectId}/`
            );
            setSubject(response.data);
            setLoading(false);
        };
        const fetchSubjectGroupMembers = async () => {
            const response = await axiosInstance.get(
                `/subject-groups/${subjectId}/members/`
            );
            setSubjectGroupMembers(response.data);
        };
        fetchSubject();
        fetchSubjectGroupMembers();
    }, [subjectId]);

    console.log(pathName, pathName.split('/')[pathName.split('/').length - 1]);

    // Show loading state
    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8 bg-white p-8">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </div>
                <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    // Show error state
    if (error || !subject) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">
                        Предмет не найден
                    </h1>
                    <p className="text-gray-500">
                        {error || 'Предмет не существует'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8 bg-white p-8">
                <div className="flex gap-4 font-bold mb-2">
                    <h1 className="text-2xl">{subject?.course_name}</h1>
                    <div className="bg-[rgba(15,174,246,1)] rounded-md flex justify-center items-center px-1 self-center">
                        <p className="text-white text-sm">
                            {subject.teacher_username}
                        </p>
                    </div>
                </div>
                <div className='flex justify-between md:flex-row flex-col'>
                    <ul className="flex gap-2 font-bold">
                        {tabs.map(t => {
                            const active =
                                pathName.split('/')[
                                    pathName.split('/').length - 1
                                ] == t.href;
                            const url = `${parentPath}/${t.href}`;
                            return (
                                <Link
                                    key={t.href}
                                    href={url}
                                    className={[
                                        'px-2 py-1 rounded-md transition-colors',
                                        active
                                            ? 'bg-[rgba(246,246,246,1)] text-black'
                                            : 'text-[rgba(16,16,16,0.4)] hover:bg-gray-100',
                                    ].join(' ')}
                                >
                                    {t.label}
                                </Link>
                            );
                        })}
                    </ul>
                    <Link href={`/create-test/?subject=${subjectId}`} className='bg-[#694CFD] flex items-center gap-2 px-4 py-1 rounded-md transition-colors text-white font-bold w-fit'>
                        Добавить тест
                    </Link>
                </div>
            </div>
            <SubjectContext.Provider value={{ subject, loading, error, subjectGroupMembers }}>
                {children}
            </SubjectContext.Provider>
        </div>
    );
}
