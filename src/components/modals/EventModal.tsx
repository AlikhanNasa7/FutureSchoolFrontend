'use client';

import Modal from '@/components/ui/Modal';
import type { EventModalData } from '@/lib/modalController';

interface EventModalProps {
    event: EventModalData | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function EventModal({
    event,
    isOpen,
    onClose,
}: EventModalProps) {
    if (!isOpen || !event) return null;

    const getEventTypeColor = (title: string) => {
        if (title === 'Домашнее Задание') return 'rgb(255, 237, 213)';
        if (title === 'Экзамен') return 'rgb(254, 226, 226)';
        if (title === 'Тест') return 'rgb(224, 242, 254)';
        return 'rgb(255, 237, 213)';
    };

    const getEventTypeText = (title: string) => {
        if (title === 'Домашнее Задание') return 'Домашнее задание';
        if (title === 'Экзамен') return 'Экзамен';
        if (title === 'Тест') return 'Тест';
        return title;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="flex items-center justify-between mb-4">
                <div
                    className="px-3 py-1 rounded-full text-sm font-medium"
                    style={{
                        backgroundColor: getEventTypeColor(event.title),
                        color: '#374151',
                    }}
                >
                    {getEventTypeText(event.title)}
                </div>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {event.title}
            </h3>

            <div className="space-y-3">
                <div className="flex items-center">
                    <span className="text-gray-500 w-20">Предмет:</span>
                    <span className="font-medium">{event.subject}</span>
                </div>

                <div className="flex items-center">
                    <span className="text-gray-500 w-20">Учитель:</span>
                    <span className="font-medium">{event.teacher}</span>
                </div>

                <div className="flex items-center">
                    <span className="text-gray-500 w-20">Время:</span>
                    <span className="font-medium">{event.time}</span>
                </div>

                <div className="flex items-center">
                    <span className="text-gray-500 w-20">Дата:</span>
                    <span className="font-medium">
                        {new Date(event.start).toLocaleDateString('ru-RU', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                        })}
                    </span>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Описание:
                </h4>
                <p className="text-gray-600 text-sm">{event.description}</p>
            </div>

            <div className="mt-6 flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Закрыть
                </button>
            </div>
        </Modal>
    );
}
