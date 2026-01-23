'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import type { CourseSection } from '@/types/course';

interface SelectSectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    sections: CourseSection[];
    onSelect: (sectionId: number) => void;
}

export default function SelectSectionModal({
    isOpen,
    onClose,
    sections,
    onSelect,
}: SelectSectionModalProps) {
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(null);

    const handleConfirm = () => {
        if (selectedSectionId) {
            onSelect(selectedSectionId);
            setSelectedSectionId(null);
            onClose();
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Выберите секцию для создания теста"
            maxWidth="max-w-md"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600">
                    Выберите шаблонную секцию, в которой будет создан тест:
                </p>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Секция:
                    </label>
                    <select
                        value={selectedSectionId || ''}
                        onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                        <option value="">-- Выберите секцию --</option>
                        {sections.map((section) => (
                            <option key={section.id} value={section.id}>
                                {section.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!selectedSectionId}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Выбрать
                    </button>
                </div>
            </div>
        </Modal>
    );
}
