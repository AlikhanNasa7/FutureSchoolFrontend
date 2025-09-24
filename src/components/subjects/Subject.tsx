'use client';

import Image from 'next/image';

interface SubjectProps {
    name: string;
    professor: string;
    bgId: string;
    course_code?: string;
    grade?: number;
    type?: string;
    description?: string;
    classroom_display?: string;
    teacher_email?: string;
}

export default function Subject({
    name,
    professor,
    bgId,
    course_code,
    grade,
    type,
    description,
    classroom_display,
    teacher_email,
}: SubjectProps) {
    return (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer group">
            {/* Top Section - Gradient Blue Header with Abstract Background */}
            <div className="relative h-24 bg-gradient-to-r from-blue-600 to-cyan-400">
                {/* Abstract Background Image */}
                <Image
                    src={`/subjects/${bgId}`}
                    alt={`${name} background`}
                    fill
                    className="object-cover opacity-80"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>

            {/* Bottom Section - White Body */}
            <div className="relative h-24 bg-white p-4 flex flex-col justify-between">
                {/* Subject Name and Course Code */}
                <div>
                    <h3 className="text-xl font-bold text-gray-900 leading-tight">
                        {name}
                    </h3>
                    {/* {course_code && (
                        <p className="text-sm text-gray-600 mt-1">
                            {course_code}
                        </p>
                    )} */}
                </div>

                {/* Professor and Additional Info */}
                <div className="flex items-center justify-between">
                    <span className="inline-block px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-lg">
                        {professor}
                    </span>
                    {classroom_display && (
                        <span className="text-xs text-gray-500">
                            {classroom_display}
                        </span>
                    )}
                </div>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/0 to-black/0 group-hover:from-black/5 group-hover:to-black/10 transition-all duration-300 pointer-events-none"></div>
        </div>
    );
}
