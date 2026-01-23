'use client';

import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import ResourceForm from './courseSectionItems/ResourceForm';
import type { Resource } from '@/types/course';

interface EditResourceModalProps {
    isOpen: boolean;
    onClose: () => void;
    resource: Resource | null;
    courseSectionId: number;
    onSuccess: () => void;
}

export default function EditResourceModal({
    isOpen,
    onClose,
    resource,
    courseSectionId,
    onSuccess,
}: EditResourceModalProps) {
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleClose = () => {
        setError(null);
        setSuccess(null);
        onClose();
    };

    const handleSuccess = (message: string) => {
        setSuccess(message);
        setError(null);
    };

    const handleError = (message: string) => {
        setError(message);
    };

    const handleComplete = () => {
        handleClose();
        onSuccess();
    };

    if (!resource) {
        return null;
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            title="Редактировать ресурс"
            maxWidth="max-w-2xl"
        >
            <div className="space-y-6">
                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-600">{success}</p>
                    </div>
                )}

                {/* Resource Form */}
                <ResourceForm
                    courseSectionId={courseSectionId}
                    resourceId={resource.id}
                    initialData={{
                        title: resource.title,
                        url: resource.url || undefined,
                        type: resource.type as any,
                    }}
                    onSuccess={handleSuccess}
                    onError={handleError}
                    onComplete={handleComplete}
                />
            </div>
        </Modal>
    );
}
