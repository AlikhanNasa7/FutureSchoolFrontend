'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, FileText, Copy, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { testService, type Test } from '@/services/testService';
import { courseService } from '@/services/courseService';
import type { CourseSection } from '@/types/course';
import SelectSectionModal from './SelectSectionModal';

interface TemplateTestsTabProps {
    courseId: number;
    sections: CourseSection[];
    onTestsChange: () => void;
}

export default function TemplateTestsTab({
    courseId,
    sections,
    onTestsChange,
}: TemplateTestsTabProps) {
    const router = useRouter();
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const [isSelectSectionModalOpen, setIsSelectSectionModalOpen] = useState(false);

    useEffect(() => {
        fetchTests();
    }, [courseId]);

    const fetchTests = async () => {
        try {
            setLoading(true);
            const testsData = await testService.getTemplateTests(courseId);
            setTests(testsData);
        } catch (error) {
            console.error('Error fetching template tests:', error);
            alert('Не удалось загрузить шаблонные тесты');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Вы уверены, что хотите удалить этот тест? Это может повлиять на синхронизацию.')) {
            return;
        }

        try {
            setDeletingId(id);
            await testService.deleteTest(id);
            onTestsChange();
            fetchTests();
        } catch (error) {
            console.error('Error deleting test:', error);
            alert('Не удалось удалить тест');
        } finally {
            setDeletingId(null);
        }
    };

    const handleTogglePublish = async (test: Test) => {
        try {
            if (test.is_published) {
                await testService.unpublishTest(test.id);
                alert('Тест закрыт для доступа');
            } else {
                await testService.publishTest(test.id);
                alert('Тест открыт для доступа');
            }
            fetchTests();
            onTestsChange();
        } catch (error) {
            console.error('Error toggling test publish status:', error);
            alert('Не удалось изменить статус публикации теста');
        }
    };

    // Group tests by section (including tests without section)
    const testsBySection = tests.reduce((acc, test) => {
        const sectionId = test.course_section || 0; // Use 0 for tests without section
        if (!acc[sectionId]) {
            acc[sectionId] = [];
        }
        acc[sectionId].push(test);
        return acc;
    }, {} as Record<number, Test[]>);

    if (loading) {
        return (
            <div className="text-center py-12">
                <div className="animate-pulse text-gray-500">Загрузка тестов...</div>
            </div>
        );
    }

    const handleCreateTest = (sectionId?: number) => {
        if (sectionId) {
            // Create test in specific section
            router.push(`/create-test?template_section=${sectionId}&course=${courseId}`);
        } else if (sections.length === 0) {
            // No sections available, create test without section
            router.push(`/create-test?course=${courseId}&template=true`);
        } else if (sections.length === 1) {
            // Only one section, use it directly
            router.push(`/create-test?template_section=${sections[0].id}&course=${courseId}`);
        } else {
            // Multiple sections, show selection modal
            setIsSelectSectionModalOpen(true);
        }
    };

    const handleSectionSelect = (sectionId: number) => {
        router.push(`/create-test?template_section=${sectionId}&course=${courseId}`);
    };

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Шаблонные тесты</h2>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => router.push(`/create-test?course=${courseId}&template=true`)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        title="Создать тест без привязки к секции"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Создать тест (без секции)</span>
                    </button>
                    {sections.length > 0 && (
                        <button
                            onClick={() => handleCreateTest()}
                            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Создать тест в секции</span>
                        </button>
                    )}
                </div>
            </div>

            {tests.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                    <p>Нет шаблонных тестов. Создайте тест.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Tests without section */}
                    {testsBySection[0] && testsBySection[0].length > 0 && (
                        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-gray-900">
                                    Без привязки к секции
                                </h3>
                                <span className="text-sm text-gray-500">
                                    {testsBySection[0].length} тест{testsBySection[0].length !== 1 ? 'ов' : ''}
                                </span>
                            </div>
                            <div className="space-y-2">
                                {testsBySection[0].map((test) => (
                                    <div
                                        key={test.id}
                                        className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                                    >
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900 mb-1">
                                                {test.title}
                                            </h4>
                                            {test.description && (
                                                <p className="text-sm text-gray-600 line-clamp-2">
                                                    {test.description}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                <span>
                                                    {test.questions?.length || 0} вопросов
                                                </span>
                                                {test.total_points && (
                                                    <span>{test.total_points} баллов</span>
                                                )}
                                                {test.is_published && (
                                                    <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                        Опубликован
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-4">
                                            <button
                                                onClick={() => router.push(`/create-test?testId=${test.id}&course=${courseId}`)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                title="Редактировать тест"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(test.id)}
                                                disabled={deletingId === test.id}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                title="Удалить тест"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    
                    {/* Tests grouped by section */}
                    {sections.map((section) => {
                        const sectionTests = testsBySection[section.id] || [];
                        if (sectionTests.length === 0) return null;

                        return (
                            <div
                                key={section.id}
                                className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="font-semibold text-gray-900">
                                        {section.title}
                                    </h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-sm text-gray-500">
                                            {sectionTests.length} тест{sectionTests.length !== 1 ? 'ов' : ''}
                                        </span>
                                        <button
                                            onClick={() => handleCreateTest(section.id)}
                                            className="flex items-center gap-1 px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors"
                                            title="Создать тест в этой секции"
                                        >
                                            <Plus className="w-3 h-3" />
                                            <span>Добавить тест</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {sectionTests.map((test) => (
                                        <div
                                            key={test.id}
                                            className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                                        >
                                            <div className="flex-1">
                                                <h4 className="font-medium text-gray-900 mb-1">
                                                    {test.title}
                                                </h4>
                                                {test.description && (
                                                    <p className="text-sm text-gray-600 line-clamp-2">
                                                        {test.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span>
                                                        {test.questions?.length || 0} вопросов
                                                    </span>
                                                    {test.total_points && (
                                                        <span>{test.total_points} баллов</span>
                                                    )}
                                                    {test.is_published && (
                                                        <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded">
                                                            Опубликован
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2 ml-4">
                                                <button
                                                    onClick={() => handleTogglePublish(test)}
                                                    className={`p-2 rounded transition-colors ${
                                                        test.is_published
                                                            ? 'text-green-600 hover:bg-green-50'
                                                            : 'text-gray-600 hover:bg-gray-50'
                                                    }`}
                                                    title={test.is_published ? 'Закрыть доступ' : 'Открыть доступ'}
                                                >
                                                    {test.is_published ? (
                                                        <Eye className="w-4 h-4" />
                                                    ) : (
                                                        <EyeOff className="w-4 h-4" />
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => router.push(`/create-test?testId=${test.id}&course=${courseId}`)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                                                    title="Редактировать тест"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(test.id)}
                                                    disabled={deletingId === test.id}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                    title="Удалить тест"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Select Section Modal */}
            <SelectSectionModal
                isOpen={isSelectSectionModalOpen}
                onClose={() => setIsSelectSectionModalOpen(false)}
                sections={sections}
                onSelect={handleSectionSelect}
            />
        </div>
    );
}
