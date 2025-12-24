'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, FileText, Calendar, FolderPlus } from 'lucide-react';
import { courseService } from '@/services/courseService';
import type { CourseSection } from '@/types/course';
import CreateTemplateSectionModal from './CreateTemplateSectionModal';
import CourseSectionAddItemModal from '@/components/modals/CourseSectionAddItemModal';

interface TemplateSectionsTabProps {
    courseId: number;
    sections: CourseSection[];
    onSectionsChange: () => void;
}

export default function TemplateSectionsTab({
    courseId,
    sections,
    onSectionsChange,
}: TemplateSectionsTabProps) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingSection, setEditingSection] = useState<CourseSection | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [addItemSectionId, setAddItemSectionId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить эту секцию? Это может повлиять на синхронизацию.')) {
            return;
        }

        try {
            setDeletingId(id);
            await courseService.deleteCourseSection(id);
            onSectionsChange();
        } catch (error) {
            console.error('Error deleting section:', error);
            alert('Не удалось удалить секцию');
        } finally {
            setDeletingId(null);
        }
    };

    const formatTemplateParams = (section: CourseSection) => {
        if (section.template_week_index !== null && section.template_week_index !== undefined) {
            return `Неделя ${section.template_week_index + 1}`;
        }
        if (section.template_start_offset_days !== null && section.template_start_offset_days !== undefined) {
            return `Смещение: ${section.template_start_offset_days} дней`;
        }
        return 'Не указано';
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Шаблонные секции
                </h3>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Добавить секцию</span>
                </button>
            </div>

            {sections.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p className="mb-4">Нет шаблонных секций</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                        Создать первую секцию
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {sections.map((section) => (
                        <div
                            key={section.id}
                            className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-semibold">
                                            Позиция {section.position}
                                        </span>
                                        {section.is_general && (
                                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-semibold">
                                                Общая
                                            </span>
                                        )}
                                    </div>
                                    <h4 className="text-base font-semibold text-gray-900 mb-2">
                                        {section.title}
                                    </h4>
                                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatTemplateParams(section)}</span>
                                        </div>
                                        {section.template_duration_days && (
                                            <span>
                                                Длительность: {section.template_duration_days} дней
                                            </span>
                                        )}
                                    </div>
                                    
                                    {/* Resources and Assignments */}
                                    {(section.resources && section.resources.length > 0) ||
                                    (section.assignments && section.assignments.length > 0) ? (
                                        <div className="mt-3 space-y-2 pt-3 border-t border-gray-200">
                                            {section.resources && section.resources.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 mb-1">
                                                        Ресурсы ({section.resources.length}):
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {section.resources.map((resource) => (
                                                            <span
                                                                key={resource.id}
                                                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs border border-blue-200"
                                                            >
                                                                {resource.title || `Ресурс #${resource.id}`}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {section.assignments && section.assignments.length > 0 && (
                                                <div>
                                                    <p className="text-xs font-semibold text-gray-500 mb-1">
                                                        Задания ({section.assignments.length}):
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        {section.assignments.map((assignment) => (
                                                            <span
                                                                key={assignment.id}
                                                                className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs border border-green-200"
                                                            >
                                                                {assignment.title || `Задание #${assignment.id}`}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-400">
                                                Нет ресурсов и заданий в шаблоне
                                            </p>
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-2 mt-3">
                                        <button
                                            onClick={() => setAddItemSectionId(section.id)}
                                            className="flex items-center gap-1 px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors"
                                        >
                                            <FolderPlus className="w-4 h-4" />
                                            <span>Добавить ресурс/задание</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => setEditingSection(section)}
                                        className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Редактировать секцию"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(section.id)}
                                        disabled={deletingId === section.id}
                                        className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                        title="Удалить секцию"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || editingSection) && (
                <CreateTemplateSectionModal
                    isOpen={isCreateModalOpen || !!editingSection}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditingSection(null);
                    }}
                    courseId={courseId}
                    section={editingSection}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        setEditingSection(null);
                        onSectionsChange();
                    }}
                />
            )}

            {/* Add Item Modal */}
            {addItemSectionId && (
                <CourseSectionAddItemModal
                    isOpen={!!addItemSectionId}
                    onClose={() => setAddItemSectionId(null)}
                    courseSectionId={addItemSectionId}
                    onItemCreated={() => {
                        setAddItemSectionId(null);
                        onSectionsChange(); // Refresh sections to show new items
                    }}
                />
            )}
        </div>
    );
}

