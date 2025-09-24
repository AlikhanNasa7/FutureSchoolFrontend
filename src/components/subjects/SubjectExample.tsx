'use client';

import Subject from './Subject';

export default function SubjectExample() {
    const subjects = [
        {
            name: 'Математика',
            professor: 'Толегенова М.',
            bgId: 'math-bg.jpg',
        },
        {
            name: 'Физика',
            professor: 'Иванов А.',
            bgId: 'physics-bg.jpg',
        },
        {
            name: 'Химия',
            professor: 'Петрова Е.',
            bgId: 'chemistry-bg.jpg',
        },
    ];

    return (
        <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Предметы</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                    <Subject
                        key={index}
                        name={subject.name}
                        professor={subject.professor}
                        bgId={subject.bgId}
                    />
                ))}
            </div>
        </div>
    );
}
