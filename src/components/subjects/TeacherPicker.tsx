'use client';

import { useState, useRef, useEffect } from 'react';
import { useLocale } from '@/contexts/LocaleContext';

interface TeacherPickerProps {
    teachers: string[];
    selectedTeacher: string;
    onTeacherChange: (teacher: string) => void;
}

export default function TeacherPicker({
    teachers,
    selectedTeacher,
    onTeacherChange,
}: TeacherPickerProps) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useLocale();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleTeacherSelect = (teacher: string) => {
        onTeacherChange(teacher);
        setIsOpen(false);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full p-3 rounded-md bg-white border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm font-semibold text-[#626262] flex items-center justify-between"
            >
                <span className="truncate">
                    {selectedTeacher || t('subject.allTeachers')}
                </span>
                <svg
                    className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute w-full top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                    <div className="py-1">
                        <button
                            onClick={() => handleTeacherSelect('')}
                            className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                                selectedTeacher === ''
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-gray-700'
                            }`}
                        >
                            {t('subject.allTeachers')}
                        </button>
                        {teachers.map((teacher, index) => (
                            <button
                                key={index}
                                onClick={() => handleTeacherSelect(teacher)}
                                className={`w-full px-4 py-2 text-left hover:bg-gray-100 ${
                                    selectedTeacher === teacher
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700'
                                }`}
                            >
                                {teacher}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
