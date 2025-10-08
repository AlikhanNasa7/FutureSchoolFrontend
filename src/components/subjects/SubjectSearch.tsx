'use client';

import { useState } from 'react';

interface SubjectSearchProps {
    onSearchChange: (query: string) => void;
}

export default function SubjectSearch({ onSearchChange }: SubjectSearchProps) {
    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchChange = (query: string) => {
        setSearchQuery(query);
        onSearchChange(query);
    };

    return (
        <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                    className="h-5 w-5 text-gray-400"
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
            <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder="Поиск предметов..."
                className="w-full sm:w-[400px] lg:w-[480px] pl-10 p-3 rounded-md focus:outline-none leading-5 bg-white sm:text-sm text-lg font-semibold text-[#626262]"
            />
        </div>
    );
}
