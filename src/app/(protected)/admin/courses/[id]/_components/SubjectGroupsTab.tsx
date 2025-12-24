'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, ExternalLink, Plus, User, Edit, Trash2 } from 'lucide-react';
import type { SubjectGroup } from '@/types/course';
import CreateSubjectGroupModal from './CreateSubjectGroupModal';
import { courseService } from '@/services/courseService';

interface SubjectGroupsTabProps {
    courseId: number;
    subjectGroups: SubjectGroup[];
    onSubjectGroupsChange: () => void;
}

export default function SubjectGroupsTab({
    courseId,
    subjectGroups,
    onSubjectGroupsChange,
}: SubjectGroupsTabProps) {
    const router = useRouter();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingGroup, setEditingGroup] = useState<SubjectGroup | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить эту связь? Это удалит все секции и материалы предмета.')) {
            return;
        }

        try {
            setDeletingId(id);
            await courseService.deleteSubjectGroup(id);
            onSubjectGroupsChange();
        } catch (error) {
            console.error('Error deleting subject group:', error);
            alert('Не удалось удалить связь');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                    Классы, использующие этот курс
                </h3>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Добавить класс</span>
                </button>
            </div>

            {subjectGroups.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Нет классов, использующих этот курс</p>
                    <p className="text-sm mt-2">
                        Нажмите "Добавить класс" чтобы связать курс с классом и учителем
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subjectGroups.map((group) => (
                        <div
                            key={group.id}
                            className="bg-gray-50 rounded-lg border border-gray-200 p-4 hover:bg-gray-100 transition-colors"
                        >
                            <div className="flex items-start justify-between mb-2">
                                <div
                                    className="flex items-center gap-3 flex-1 cursor-pointer"
                                    onClick={() => router.push(`/subjects/${group.id}`)}
                                >
                                    <Users className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-gray-900 truncate">
                                            {group.classroom_display || `Класс #${group.classroom}`}
                                        </p>
                                        {group.teacher_username && (
                                            <div className="flex items-center gap-1 mt-1 text-sm text-gray-600">
                                                <User className="w-3 h-3" />
                                                <span className="truncate">
                                                    {group.teacher_fullname || group.teacher_username}
                                                </span>
                                            </div>
                                        )}
                                        {!group.teacher_username && (
                                            <p className="text-xs text-gray-400 mt-1">
                                                Учитель не назначен
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 ml-2">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingGroup(group);
                                        }}
                                        className="p-1.5 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                        title="Редактировать"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(group.id);
                                        }}
                                        disabled={deletingId === group.id}
                                        className="p-1.5 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                        title="Удалить"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => router.push(`/subjects/${group.id}`)}
                                        className="p-1.5 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
                                        title="Открыть предмет"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Subject Group Modal */}
            {(isCreateModalOpen || editingGroup) && (
                <CreateSubjectGroupModal
                    isOpen={isCreateModalOpen || !!editingGroup}
                    onClose={() => {
                        setIsCreateModalOpen(false);
                        setEditingGroup(null);
                    }}
                    courseId={courseId}
                    subjectGroup={editingGroup}
                    onSuccess={() => {
                        setIsCreateModalOpen(false);
                        setEditingGroup(null);
                        onSubjectGroupsChange();
                    }}
                />
            )}
        </div>
    );
}

