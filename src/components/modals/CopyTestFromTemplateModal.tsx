'use client';

import { useState, useEffect } from 'react';
import { Copy, Loader2 } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import { testService, type Test } from '@/services/testService';
import { courseService } from '@/services/courseService';
import type { CourseSection } from '@/types/course';
import axiosInstance from '@/lib/axios';

interface CopyTestFromTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetCourseSectionId?: number;
    courseId: number;
    subjectGroupId?: number;
    onTestCopied?: () => void;
}

export default function CopyTestFromTemplateModal({
    isOpen,
    onClose,
    targetCourseSectionId,
    courseId,
    subjectGroupId,
    onTestCopied,
}: CopyTestFromTemplateModalProps) {
    const [tests, setTests] = useState<Test[]>([]);
    const [sections, setSections] = useState<CourseSection[]>([]);
    const [targetSections, setTargetSections] = useState<CourseSection[]>([]);
    const [selectedSectionId, setSelectedSectionId] = useState<number | null>(targetCourseSectionId || null);
    const [loading, setLoading] = useState(true);
    const [copyingId, setCopyingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, courseId]);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            const promises: Promise<any>[] = [
                testService.getTemplateTests(courseId),
                courseService.getTemplateSections(courseId),
            ];
            
            // Fetch target sections if subjectGroupId is provided
            if (subjectGroupId) {
                promises.push(
                    axiosInstance.get(`/course-sections/?subject_group=${subjectGroupId}`)
                        .then(res => res.data)
                );
            }
            
            const results = await Promise.all(promises);
            setTests(results[0]);
            setSections(results[1]);
            if (results[2]) {
                setTargetSections(results[2]);
                if (!selectedSectionId && results[2].length > 0) {
                    // Try to find recommended section from first test
                    const firstTest = results[0]?.[0];
                    if (firstTest?.course_section) {
                        const recommended = results[2].find(
                            (s: CourseSection) => s.template_section === firstTest.course_section
                        );
                        setSelectedSectionId(recommended?.id || results[2][0].id);
                    } else {
                        setSelectedSectionId(results[2][0].id);
                    }
                }
            }
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Не удалось загрузить данные');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async (templateTestId: number, recommendedSectionId?: number | null) => {
        // Use recommended section if available, otherwise use selected section
        const targetSectionId = recommendedSectionId || selectedSectionId;
        
        if (!targetSectionId) {
            setError('Пожалуйста, выберите секцию для копирования теста');
            return;
        }
        
        try {
            setCopyingId(templateTestId);
            setError(null);
            await testService.copyFromTemplate(templateTestId, targetSectionId, subjectGroupId);
            onTestCopied?.();
            onClose();
        } catch (err: any) {
            console.error('Error copying test:', err);
            setError(err.response?.data?.error || 'Не удалось скопировать тест');
        } finally {
            setCopyingId(null);
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

    const getSectionTitle = (sectionId: number | null) => {
        if (!sectionId || sectionId === 0) return 'Без привязки к секции';
        const section = sections.find(s => s.id === sectionId);
        return section?.title || `Секция ${sectionId}`;
    };

    // Find recommended section for a test (if test has a template section)
    const getRecommendedSection = (test: Test): number | null => {
        if (!test.course_section || !subjectGroupId) return null;
        
        // Find corresponding section in subject group
        const correspondingSection = targetSections.find(
            section => section.template_section === test.course_section
        );
        
        return correspondingSection?.id || null;
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Скопировать тест из шаблона"
            maxWidth="max-w-3xl"
        >
            <div className="space-y-4">
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Section Selection */}
                {targetSections.length > 0 && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Выберите секцию для копирования теста:
                        </label>
                        <select
                            value={selectedSectionId || ''}
                            onChange={(e) => setSelectedSectionId(Number(e.target.value))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                            {targetSections.map((section) => (
                                <option key={section.id} value={section.id}>
                                    {section.title}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                {loading ? (
                    <div className="text-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-gray-400 mb-4" />
                        <p className="text-gray-500">Загрузка шаблонных тестов...</p>
                    </div>
                ) : tests.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <p>Нет доступных шаблонных тестов для этого курса</p>
                    </div>
                ) : (
                    <div className="space-y-6 max-h-96 overflow-y-auto">
                        {/* Tests without section */}
                        {testsBySection[0] && testsBySection[0].length > 0 && (
                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                <h3 className="font-semibold text-gray-900 mb-3">
                                    Без привязки к секции
                                </h3>
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
                                                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                        {test.description}
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-4 text-xs text-gray-500">
                                                    <span>
                                                        {test.questions?.length || 0} вопросов
                                                    </span>
                                                    {test.total_points && (
                                                        <span>{test.total_points} баллов</span>
                                                    )}
                                                </div>
                                            </div>
                                            <button
                                                onClick={() => handleCopy(test.id)}
                                                disabled={copyingId === test.id || !selectedSectionId}
                                                className="ml-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {copyingId === test.id ? (
                                                    <>
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                        <span>Копирование...</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Copy className="w-4 h-4" />
                                                        <span>Скопировать</span>
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        
                        {/* Tests grouped by section */}
                        {sections
                            .filter(section => testsBySection[section.id]?.length > 0)
                            .map((section) => {
                                const sectionTests = testsBySection[section.id] || [];
                                return (
                                    <div
                                        key={section.id}
                                        className="bg-gray-50 rounded-lg border border-gray-200 p-4"
                                    >
                                        <h3 className="font-semibold text-gray-900 mb-3">
                                            {section.title}
                                        </h3>
                                        <div className="space-y-2">
                                            {sectionTests.map((test) => {
                                                const recommendedSectionId = getRecommendedSection(test);
                                                return (
                                                    <div
                                                        key={test.id}
                                                        className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between hover:shadow-sm transition-shadow"
                                                    >
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900 mb-1">
                                                                {test.title}
                                                            </h4>
                                                            {test.description && (
                                                                <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                                    {test.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center gap-4 text-xs text-gray-500">
                                                                <span>
                                                                    {test.questions?.length || 0} вопросов
                                                                </span>
                                                                {test.total_points && (
                                                                    <span>{test.total_points} баллов</span>
                                                                )}
                                                                {recommendedSectionId && (
                                                                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                                                                        Рекомендуется: {targetSections.find(s => s.id === recommendedSectionId)?.title}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => handleCopy(test.id, recommendedSectionId)}
                                                            disabled={copyingId === test.id}
                                                            className="ml-4 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        >
                                                            {copyingId === test.id ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                                    <span>Копирование...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Copy className="w-4 h-4" />
                                                                    <span>Скопировать</span>
                                                                </>
                                                            )}
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                    </div>
                )}
            </div>
        </Modal>
    );
}
