'use client';

import { useRouter } from 'next/navigation';
import { Edit, Trash2 } from 'lucide-react';
import Subject from './Subject';

interface SubjectData {
    id: string;
    name: string;
    professor: string;
    bgId: string;
    urlPath: string;
}

interface SubjectListProps {
    subjects: SubjectData[];
    searchQuery?: string;
    canEdit?: boolean;
    onEdit?: (subject: SubjectData) => void;
    onDelete?: (id: string) => void;
    loading?: boolean;
}

export default function SubjectList({
    subjects,
    searchQuery = '',
    canEdit = false,
    onEdit,
    onDelete,
    loading = false,
}: SubjectListProps) {
    const router = useRouter();

    const handleSubjectClick = (subject: SubjectData) => {
        console.log('Subject clicked:', subject);
        const urlPathName = subject.id;
        router.push(`/subjects/${urlPathName}`);
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {subjects.map(subject => (
                    <div key={subject.id} className="relative group">
                        <div
                            onClick={() => handleSubjectClick(subject)}
                            className="transition-transform duration-200 hover:scale-105 cursor-pointer"
                        >
                            <Subject
                                name={subject.name}
                                professor={subject.professor}
                                bgId={subject.bgId}
                                course_code={subject.course_code}
                                grade={subject.grade}
                                type={subject.type}
                                description={subject.description}
                                classroom_display={subject.classroom_display}
                                teacher_email={subject.teacher_email}
                            />
                        </div>

                        {canEdit && (
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        onEdit?.(subject);
                                    }}
                                    className="p-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                    disabled={loading}
                                >
                                    <Edit className="w-3 h-3" />
                                </button>
                                <button
                                    onClick={e => {
                                        e.stopPropagation();
                                        onDelete?.(subject.id);
                                    }}
                                    className="p-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                                    disabled={loading}
                                >
                                    <Trash2 className="w-3 h-3" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {subjects.length === 0 && (
                <div className="text-center py-12">
                    <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg
                            className="w-12 h-12 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {searchQuery
                            ? 'Предметы не найдены'
                            : 'Нет доступных предметов'}
                    </h3>
                    <p className="text-gray-500">
                        {searchQuery
                            ? `По запросу "${searchQuery}" ничего не найдено`
                            : 'Предметы появятся здесь после их добавления'}
                    </p>
                </div>
            )}
        </div>
    );
}
