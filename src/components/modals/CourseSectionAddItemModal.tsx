'use client';

import { useEffect, useState } from 'react';
import { FileText, BookOpen, Calendar, Link, Upload } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import axiosInstance from '@/lib/axios';
import { AxiosError } from 'axios';
import Image from 'next/image';
import { useUserState } from '@/contexts/UserContext';
interface CourseSectionAddItemModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseSectionId: number;
    onItemCreated?: (itemType: 'resource' | 'assignment' | 'test') => void;
}

type ItemType = 'resource' | 'assignment';

interface ResourceFormData {
    title: string;
    url: string;
    type:
        | 'file'
        | 'link'
        | 'text'
        | 'directory'
        | 'document'
        | 'image'
        | 'video'
        | 'meet';
    file?: File | null;
    files?: File[]; // For multiple file uploads
}

interface AssignmentFormData {
    title: string;
    due_at: string;
    max_grade: number;
    teacher: number;
    file?: File | null;
}

const fileTypes = ['image', 'video', 'file', 'directory'];

// Helper function to get file accept types based on resource type
function getFileAcceptTypes(type: string): string {
    switch (type) {
        case 'image':
            return 'image/*';
        case 'video':
            return 'video/*';
        case 'file':
            return '*/*';
        case 'directory':
            return '*/*'; // Allow any file type for directories
        case 'document':
            return '.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf';
        default:
            return '*/*';
    }
}

export default function CourseSectionAddItemModal({
    isOpen,
    onClose,
    courseSectionId,
    onItemCreated,
}: CourseSectionAddItemModalProps) {
    const [itemType, setItemType] = useState<ItemType>('resource');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const [resourceForm, setResourceForm] = useState<ResourceFormData>({
        title: '',
        url: '',
        type: 'file',
        file: null,
        files: [],
    });

    const [assignmentForm, setAssignmentForm] = useState<AssignmentFormData>({
        title: '',
        due_at: '',
        max_grade: 100,
        teacher: 0,
        file: null,
    });

    const { user } = useUserState();

    const handleResourceSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let response;

            if (
                resourceForm.type === 'directory' &&
                resourceForm.files &&
                resourceForm.files.length > 0
            ) {
                // Handle directory with multiple files using new backend endpoint
                const formData = new FormData();
                formData.append('course_section', courseSectionId.toString());
                formData.append('title', resourceForm.title);

                // Append all files
                resourceForm.files.forEach(file => {
                    formData.append('files', file);
                });

                console.log('Creating directory with files:', {
                    course_section: courseSectionId,
                    title: resourceForm.title,
                    fileCount: resourceForm.files.length,
                });

                response = await axiosInstance.post(
                    '/resources/create-directory-with-files/',
                    formData,
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data',
                        },
                    }
                );
            } else if (
                fileTypes.includes(resourceForm.type) &&
                resourceForm.file
            ) {
                // Handle single file upload
                const formData = new FormData();
                formData.append('course_section', courseSectionId.toString());
                formData.append('type', resourceForm.type);
                formData.append('title', resourceForm.title);
                formData.append('file', resourceForm.file);

                console.log('Creating file resource:', {
                    course_section: courseSectionId,
                    type: resourceForm.type,
                    title: resourceForm.title,
                    file: resourceForm.file.name,
                });

                response = await axiosInstance.post('/resources/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Handle regular resource (link, text, directory without files)
                const resourceData = {
                    course_section: courseSectionId,
                    type: resourceForm.type,
                    title: resourceForm.title,
                    url: resourceForm.url,
                };

                console.log('Creating resource:', resourceData);

                response = await axiosInstance.post(
                    '/resources/',
                    resourceData
                );
            }

            console.log('Resource created successfully:', response.data);
            setSuccess('Resource created successfully!');
            setTimeout(() => {
                onClose();
                resetForms();
                onItemCreated?.('resource');
            }, 1500);
        } catch (error: unknown) {
            console.error('Error creating resource:', error);
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message ||
                      error.response?.data?.error ||
                      error.message
                    : 'Failed to create resource';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssignmentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            let response;

            if (assignmentForm.file) {
                // Handle file upload with FormData
                const formData = new FormData();
                formData.append('course_section', courseSectionId.toString());
                formData.append(
                    'teacher',
                    (assignmentForm.teacher || user?.id || 0).toString()
                );
                formData.append('title', assignmentForm.title);
                formData.append('due_at', assignmentForm.due_at);
                formData.append(
                    'max_grade',
                    assignmentForm.max_grade.toString()
                );
                formData.append('file', assignmentForm.file);

                console.log('Creating assignment with file:', {
                    course_section: courseSectionId,
                    teacher: assignmentForm.teacher || user?.id,
                    title: assignmentForm.title,
                    due_at: assignmentForm.due_at,
                    max_grade: assignmentForm.max_grade,
                    file: assignmentForm.file.name,
                });

                response = await axiosInstance.post('/assignments/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
            } else {
                // Handle assignment without file
                const assignmentData = {
                    course_section: courseSectionId,
                    teacher: assignmentForm.teacher || user?.id,
                    title: assignmentForm.title,
                    due_at: assignmentForm.due_at,
                    max_grade: assignmentForm.max_grade,
                };

                console.log('Creating assignment:', assignmentData);

                response = await axiosInstance.post(
                    '/assignments/',
                    assignmentData
                );
            }

            console.log('Assignment created successfully:', response.data);
            setSuccess('Assignment created successfully!');
            setTimeout(() => {
                onClose();
                resetForms();
                onItemCreated?.('assignment');
            }, 1500);
        } catch (error: unknown) {
            console.error('Error creating assignment:', error);
            const errorMessage =
                error instanceof AxiosError
                    ? error.response?.data?.message ||
                      error.response?.data?.error ||
                      error.message
                    : 'Failed to create assignment';
            setError(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForms = () => {
        setResourceForm({
            title: '',
            url: '',
            type: 'file',
            file: null,
            files: [],
        });
        setAssignmentForm({
            title: '',
            due_at: '',
            max_grade: 100,
            teacher: 0,
            file: null,
        });
        setError(null);
        setSuccess(null);
    };

    const handleClose = () => {
        resetForms();
        onClose();
    };

    useEffect(() => {
        setResourceForm(prev => ({
            ...prev,
            title: '',
            url: '',
            file: null,
            files: [],
        }));
    }, [resourceForm.type]);

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Add Item to Course Section"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                <div className="flex space-x-4">
                    <button
                        type="button"
                        onClick={() => setItemType('resource')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                            itemType === 'resource'
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <FileText className="w-4 h-4" />
                        <span>Resource</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setItemType('assignment')}
                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                            itemType === 'assignment'
                                ? 'bg-blue-50 border-blue-200 text-blue-700'
                                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                    >
                        <BookOpen className="w-4 h-4" />
                        <span>Assignment</span>
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                )}

                {/* Resource Form */}
                {itemType === 'resource' && (
                    <form onSubmit={handleResourceSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Resource Type
                            </label>
                            <ul className="w-full flex items-center gap-2">
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setResourceForm(prev => ({
                                                ...prev,
                                                type: 'file',
                                            }))
                                        }
                                        className={`rounded-md transition-all duration-200 ${
                                            resourceForm.type === 'file'
                                                ? 'ring-2 ring-blue-500 bg-blue-50 focus:ring-offset-2'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <Image
                                            src="/document-icons/document.png"
                                            alt="File"
                                            width={40}
                                            height={40}
                                        />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setResourceForm(prev => ({
                                                ...prev,
                                                type: 'image',
                                            }))
                                        }
                                        className={`rounded-md transition-all duration-200 ${
                                            resourceForm.type === 'image'
                                                ? 'ring-2 ring-blue-500 bg-blue-50 focus:ring-offset-2'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <Image
                                            src="/document-icons/image.png"
                                            alt="File"
                                            width={40}
                                            height={40}
                                        />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setResourceForm(prev => ({
                                                ...prev,
                                                type: 'video',
                                            }))
                                        }
                                        className={`rounded-md transition-all duration-200 ${
                                            resourceForm.type === 'video'
                                                ? 'ring-2 ring-blue-500 bg-blue-50 focus:ring-offset-2'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <Image
                                            src="/document-icons/video.png"
                                            alt="File"
                                            width={40}
                                            height={40}
                                        />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setResourceForm(prev => ({
                                                ...prev,
                                                type: 'link',
                                            }))
                                        }
                                        className={`rounded-md transition-all duration-200 ${
                                            resourceForm.type === 'link'
                                                ? 'ring-2 ring-blue-500 bg-blue-50 focus:ring-offset-2'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <Image
                                            src="/document-icons/link.png"
                                            alt="Link"
                                            width={40}
                                            height={40}
                                        />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setResourceForm(prev => ({
                                                ...prev,
                                                type: 'text',
                                            }))
                                        }
                                        className={`rounded-md transition-all duration-200 ${
                                            resourceForm.type === 'text'
                                                ? 'ring-2 ring-blue-500 bg-blue-50 focus:ring-offset-2'
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <Image
                                            src="/document-icons/info.png"
                                            alt="Text"
                                            width={40}
                                            height={40}
                                        />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setResourceForm(prev => ({
                                                ...prev,
                                                type: 'directory',
                                            }))
                                        }
                                        className={`rounded-md transition-all duration-200 ${
                                            resourceForm.type === 'directory'
                                                ? 'ring-2 ring-blue-500 bg-blue-50 focus:ring-offset-2'
                                                : 'hover:bg-gray-50 focus:ring-offset-2'
                                        }`}
                                    >
                                        <Image
                                            src="/document-icons/folder.png"
                                            alt="Directory"
                                            width={40}
                                            height={40}
                                        />
                                    </button>
                                </li>
                                <li>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setResourceForm(prev => ({
                                                ...prev,
                                                type: 'meet',
                                            }))
                                        }
                                        className={`rounded-md transition-all duration-200 ${
                                            resourceForm.type === 'meet'
                                                ? 'ring-2 ring-blue-500 bg-blue-50 focus:ring-offset-2'
                                                : 'hover:bg-gray-50 focus:ring-offset-2'
                                        }`}
                                    >
                                        <Image
                                            src="/document-icons/meet.png"
                                            alt="Meet"
                                            width={40}
                                            height={40}
                                        />
                                    </button>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={resourceForm.title}
                                onChange={e =>
                                    setResourceForm(prev => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter resource title"
                            />
                        </div>

                        {/* File Upload or URL Input */}
                        {fileTypes.includes(resourceForm.type) && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {resourceForm.type === 'directory'
                                        ? `Attach Files (Optional) - ${resourceForm.files?.length || 0}/10`
                                        : 'File *'}
                                </label>

                                {/* Multiple file input for directories */}
                                {resourceForm.type === 'directory' ? (
                                    <div>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                multiple
                                                onChange={e => {
                                                    const selectedFiles =
                                                        Array.from(
                                                            e.target.files || []
                                                        );
                                                    const currentFiles =
                                                        resourceForm.files ||
                                                        [];
                                                    const totalFiles =
                                                        currentFiles.length +
                                                        selectedFiles.length;

                                                    if (totalFiles > 10) {
                                                        setError(
                                                            'Maximum 10 files allowed'
                                                        );
                                                        return;
                                                    }

                                                    setResourceForm(prev => ({
                                                        ...prev,
                                                        files: [
                                                            ...(prev.files ||
                                                                []),
                                                            ...selectedFiles,
                                                        ],
                                                    }));
                                                }}
                                                className="absolute inset-0 w-full h-32 opacity-0 cursor-pointer"
                                                accept={getFileAcceptTypes(
                                                    resourceForm.type
                                                )}
                                            />
                                            <div className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                                                <div className="text-center">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">
                                                        Click to attach files to
                                                        directory
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        or drag and drop (Max 10
                                                        files)
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Display selected files */}
                                        {resourceForm.files &&
                                            resourceForm.files.length > 0 && (
                                                <div className="mt-3 space-y-2">
                                                    <p className="text-sm font-medium text-gray-700">
                                                        Selected Files:
                                                    </p>
                                                    <div className="space-y-1 max-h-32 overflow-y-auto">
                                                        {resourceForm.files.map(
                                                            (file, index) => (
                                                                <div
                                                                    key={index}
                                                                    className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                                                >
                                                                    <div className="flex items-center space-x-2">
                                                                        <FileText className="w-4 h-4 text-blue-500" />
                                                                        <span className="text-sm text-gray-700 truncate max-w-48">
                                                                            {
                                                                                file.name
                                                                            }
                                                                        </span>
                                                                        <span className="text-xs text-gray-500">
                                                                            {(
                                                                                file.size /
                                                                                1024
                                                                            ).toFixed(
                                                                                1
                                                                            )}{' '}
                                                                            KB
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => {
                                                                            setResourceForm(
                                                                                prev => ({
                                                                                    ...prev,
                                                                                    files:
                                                                                        prev.files?.filter(
                                                                                            (
                                                                                                _,
                                                                                                i
                                                                                            ) =>
                                                                                                i !==
                                                                                                index
                                                                                        ) ||
                                                                                        [],
                                                                                })
                                                                            );
                                                                        }}
                                                                        className="text-red-500 hover:text-red-700 text-sm"
                                                                    >
                                                                        Remove
                                                                    </button>
                                                                </div>
                                                            )
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                    </div>
                                ) : (
                                    /* Single file input for other types */
                                    <div className="relative">
                                        <input
                                            type="file"
                                            onChange={e =>
                                                setResourceForm(prev => ({
                                                    ...prev,
                                                    file:
                                                        e.target.files?.[0] ||
                                                        null,
                                                }))
                                            }
                                            className="absolute inset-0 w-32 h-32 opacity-0 cursor-pointer"
                                            accept={getFileAcceptTypes(
                                                resourceForm.type
                                            )}
                                        />
                                        <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                                            {resourceForm.file ? (
                                                <div className="text-center">
                                                    <div className="flex items-center justify-center mb-2">
                                                        <FileText className="w-8 h-8 text-blue-500" />
                                                    </div>
                                                    <p className="text-sm text-gray-700 font-medium truncate max-w-48">
                                                        {resourceForm.file.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {(
                                                            resourceForm.file
                                                                .size / 1024
                                                        ).toFixed(1)}{' '}
                                                        KB
                                                    </p>
                                                </div>
                                            ) : (
                                                <div className="text-center">
                                                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                                    <p className="text-sm text-gray-500">
                                                        Click to upload file
                                                    </p>
                                                    <p className="text-xs text-gray-400">
                                                        or drag and drop
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {resourceForm.file && (
                                    <p className="mt-1 text-sm text-gray-600">
                                        Selected: {resourceForm.file.name}
                                    </p>
                                )}
                            </div>
                        )}
                        {(resourceForm.type === 'link' ||
                            resourceForm.type === 'meet') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    URL *
                                </label>
                                <div className="relative">
                                    <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="url"
                                        value={resourceForm.url}
                                        onChange={e =>
                                            setResourceForm(prev => ({
                                                ...prev,
                                                url: e.target.value,
                                            }))
                                        }
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={
                                            resourceForm.type === 'link'
                                                ? 'https://example.com'
                                                : 'https://meet.google.com/example'
                                        }
                                    />
                                </div>
                            </div>
                        )}

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting
                                    ? 'Creating...'
                                    : 'Create Resource'}
                            </button>
                        </div>
                    </form>
                )}

                {/* Assignment Form */}
                {itemType === 'assignment' && (
                    <form
                        onSubmit={handleAssignmentSubmit}
                        className="space-y-4"
                    >
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Title *
                            </label>
                            <input
                                type="text"
                                value={assignmentForm.title}
                                onChange={e =>
                                    setAssignmentForm(prev => ({
                                        ...prev,
                                        title: e.target.value,
                                    }))
                                }
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter assignment title"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Due Date *
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="datetime-local"
                                        value={assignmentForm.due_at}
                                        onChange={e =>
                                            setAssignmentForm(prev => ({
                                                ...prev,
                                                due_at: e.target.value,
                                            }))
                                        }
                                        required
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Max Grade
                                </label>
                                <input
                                    type="number"
                                    value={assignmentForm.max_grade}
                                    onChange={e =>
                                        setAssignmentForm(prev => ({
                                            ...prev,
                                            max_grade:
                                                parseInt(e.target.value) || 100,
                                        }))
                                    }
                                    min="1"
                                    max="1000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Assignment File (Optional)
                            </label>
                            <div className="relative">
                                <input
                                    type="file"
                                    onChange={e =>
                                        setAssignmentForm(prev => ({
                                            ...prev,
                                            file: e.target.files?.[0] || null,
                                        }))
                                    }
                                    className="absolute inset-0 w-32 h-32 opacity-0 cursor-pointer"
                                    accept="*/*"
                                />
                                <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
                                    {assignmentForm.file ? (
                                        <div className="text-center">
                                            <div className="flex items-center justify-center mb-2">
                                                <FileText className="w-8 h-8 text-blue-500" />
                                            </div>
                                            <p className="text-sm text-gray-700 font-medium truncate max-w-48">
                                                {assignmentForm.file.name}
                                            </p>
                                            <p className="text-xs text-gray-500">
                                                {(
                                                    assignmentForm.file.size /
                                                    1024
                                                ).toFixed(1)}{' '}
                                                KB
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="text-center">
                                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                            <p className="text-sm text-gray-500">
                                                Click to upload file
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                or drag and drop
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                            {assignmentForm.file && (
                                <p className="mt-1 text-sm text-gray-600">
                                    Selected: {assignmentForm.file.name}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={handleClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isSubmitting
                                    ? 'Creating...'
                                    : 'Create Assignment'}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </Modal>
    );
}
