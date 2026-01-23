import { useEffect, useState } from 'react';
import { X, Users, User as UserIcon, Save, Loader2 } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface ParentChildrenModalProps {
    parentId: number | null;
    parentName?: string;
    isOpen: boolean;
    onClose: () => void;
}

interface ChildOption {
    id: number;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
}

export default function ParentChildrenModal({
    parentId,
    parentName,
    isOpen,
    onClose,
}: ParentChildrenModalProps) {
    const [allStudents, setAllStudents] = useState<ChildOption[]>([]);
    const [selectedChildIds, setSelectedChildIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!isOpen || !parentId) return;

        const fetchData = async () => {
            try {
                setLoading(true);

                // 1) Load all students
                const studentsResponse = await axiosInstance.get('/users/', {
                    params: { role: 'student' },
                });
                const studentsData = Array.isArray(studentsResponse.data)
                    ? studentsResponse.data
                    : studentsResponse.data.results || [];

                setAllStudents(studentsData);

                // 2) Load parent with children
                const parentResponse = await axiosInstance.get(`/users/${parentId}/`);
                const parentData = parentResponse.data;
                const children = parentData.children || [];

                setSelectedChildIds(children.map((c: any) => c.id));
            } catch (error) {
                console.error('Failed to load parent/children data:', error);
                alert('Не удалось загрузить данные о детях родителя');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [isOpen, parentId]);

    if (!isOpen || !parentId) return null;

    const toggleChild = (childId: number) => {
        setSelectedChildIds(prev =>
            prev.includes(childId)
                ? prev.filter(id => id !== childId)
                : [...prev, childId]
        );
    };

    const handleSave = async () => {
        try {
            setSaving(true);

            // We don't know current children on backend side beyond what we loaded,
            // so simplest approach: remove all, then add selected.

            // 1) Load current relationships list for this parent
            const listResponse = await axiosInstance.get('/parent-child/list/');
            const relationships = listResponse.data.relationships || [];
            const currentChildIds: number[] = relationships
                .filter((r: any) => r.parent_id === parentId)
                .map((r: any) => r.child_id);

            const toAdd = selectedChildIds.filter(id => !currentChildIds.includes(id));
            const toRemove = currentChildIds.filter(id => !selectedChildIds.includes(id));

            // 2) Bulk remove old
            if (toRemove.length > 0) {
                await axiosInstance.post('/parent-child/bulk-remove/', {
                    parent_id: parentId,
                    child_ids: toRemove,
                });
            }

            // 3) Bulk add new
            if (toAdd.length > 0) {
                await axiosInstance.post('/parent-child/bulk-add/', {
                    parent_id: parentId,
                    child_ids: toAdd,
                });
            }

            alert('Связи родитель–дети успешно обновлены');
            onClose();
        } catch (error) {
            console.error('Failed to save parent-child relationships:', error);
            alert('Не удалось сохранить связи родитель–дети');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-100 flex items-center justify-center">
                            <Users className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Дети родителя
                            </h2>
                            <p className="text-sm text-gray-600">
                                {parentName || `ID: ${parentId}`}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    {loading ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                        </div>
                    ) : allStudents.length === 0 ? (
                        <p className="text-center text-gray-500 py-6">
                            Нет доступных учеников
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {allStudents.map(student => {
                                const isSelected = selectedChildIds.includes(student.id);
                                return (
                                    <button
                                        key={student.id}
                                        onClick={() => toggleChild(student.id)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg border transition-colors ${
                                            isSelected
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:bg-gray-50'
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                    isSelected
                                                        ? 'bg-blue-600 text-white'
                                                        : 'bg-gray-200 text-gray-600'
                                                }`}
                                            >
                                                <UserIcon className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {student.first_name} {student.last_name}
                                                </p>
                                                <p className="text-xs text-gray-600">
                                                    {student.username} • {student.email}
                                                </p>
                                            </div>
                                        </div>
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleChild(student.id)}
                                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                    </button>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        disabled={saving}
                    >
                        Отмена
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving || loading}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Сохранение...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Сохранить
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}

