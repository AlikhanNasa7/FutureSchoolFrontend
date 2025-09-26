'use client';

import { useEffect, useState } from 'react';
import { modalController } from '@/lib/modalController';
import KundelikIntegrationModal from './KundelikIntegrationModal';
import EventModal from './EventModal';
import CourseSectionAddItemModal from './CourseSectionAddItemModal';
import CourseSectionCreateModal from './CourseSectionCreateModal';
import FileViewerModal from './FileViewerModal';
import ConfirmationModal from './ConfirmationModal';
import FileUploadModal from './FileUploadModal';
import type {
    ModalState,
    EventModalData,
    CourseSectionAddItemModalData,
    CourseSectionCreateModalData,
    FileViewerModalData,
    ConfirmationModalData,
    FileUploadModalData,
} from '@/lib/modalController';

export default function ModalProvider() {
    const [modalState, setModalState] = useState<ModalState>({
        isOpen: false,
        type: null,
        data: undefined,
    });

    useEffect(() => {
        const unsubscribe = modalController.subscribe(setModalState);
        return unsubscribe;
    }, []);

    if (!modalState.isOpen) {
        return null;
    }

    switch (modalState.type) {
        case 'kundelik-integration':
            return (
                <KundelikIntegrationModal
                    onClose={() => modalController.close()}
                />
            );
        case 'event-modal':
            return (
                <EventModal
                    event={modalState.data as EventModalData}
                    isOpen={modalState.isOpen}
                    onClose={() => modalController.close()}
                />
            );
        case 'course-section-add-item':
            return (
                <CourseSectionAddItemModal
                    courseSectionId={
                        (modalState.data as CourseSectionAddItemModalData)
                            ?.courseSectionId || 0
                    }
                    isOpen={modalState.isOpen}
                    onClose={() => modalController.close()}
                />
            );
        case 'course-section-create':
            return (
                <CourseSectionCreateModal
                    subjectId={
                        (modalState.data as CourseSectionCreateModalData)
                            ?.subjectId || 0
                    }
                    isOpen={modalState.isOpen}
                    onClose={() => modalController.close()}
                />
            );
        case 'file-viewer':
            return (
                <FileViewerModal
                    file={
                        (modalState.data as FileViewerModalData)?.file || {
                            url: '',
                            title: '',
                        }
                    }
                    isOpen={modalState.isOpen}
                    onClose={() => modalController.close()}
                />
            );
        case 'confirmation':
            return (
                <ConfirmationModal
                    data={modalState.data as ConfirmationModalData}
                    isOpen={modalState.isOpen}
                    onClose={() => modalController.close()}
                />
            );
        case 'file-upload':
            return (
                <FileUploadModal
                    isOpen={modalState.isOpen}
                    onClose={() => modalController.close()}
                    onFileSelect={
                        (modalState.data as FileUploadModalData)
                            ?.onFileSelect || (() => {})
                    }
                    title={(modalState.data as FileUploadModalData)?.title}
                />
            );
        default:
            return null;
    }
}
