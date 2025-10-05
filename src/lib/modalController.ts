export type ModalType =
    | 'kundelik-integration'
    | 'other-modal'
    | 'event-modal'
    | 'course-section-add-item'
    | 'course-section-create'
    | 'file-viewer'
    | 'directory-viewer'
    | 'confirmation'
    | 'file-upload'
    | 'add-student'
    | 'add-file-to-directory';

export interface EventModalData {
    title: string;
    start: string;
    subject: string;
    teacher: string;
    time: string;
    description: string;
    url?: string;
    type?: 'test' | 'assignment';
}

export interface CourseSectionAddItemModalData {
    courseSectionId: number;
}

export interface CourseSectionCreateModalData {
    subjectId: number;
}

export interface FileViewerModalData {
    file: {
        url: string;
        title: string;
        type?: string;
        size?: number;
    };
}

export interface DirectoryModalData {
    directory: {
        title: string;
        files: Array<{
            id: number;
            title: string;
            type: string;
            file_url?: string;
            file?: string;
            size?: number;
            is_directory?: boolean;
        }>;
        parent_id?: number;
    };
    onFileClick?: (file: any) => void;
    onAddFile?: (parentId: number) => void;
    onDownloadFolder?: () => void;
}

export interface ConfirmationModalData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'primary' | 'secondary';
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
}

export interface FileUploadModalData {
    title?: string;
    onFileSelect: (file: File) => void;
}

export interface AddStudentModalData {
    classroomId: number;
    classroomName: string;
    onStudentAdded: () => void;
}

export interface AddFileToDirectoryModalData {
    directoryId: number;
    directoryTitle: string;
    courseSectionId: number;
    onSuccess?: () => void;
}

export interface ModalState {
    isOpen: boolean;
    type: ModalType | null;
    data?: unknown;
}

class ModalController {
    private listeners: Set<(state: ModalState) => void> = new Set();
    private state: ModalState = {
        isOpen: false,
        type: null,
        data: undefined,
    };

    subscribe(listener: (state: ModalState) => void) {
        this.listeners.add(listener);
        listener(this.state);

        return () => {
            this.listeners.delete(listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => listener(this.state));
    }

    open(type: ModalType, data?: unknown) {
        this.state = {
            isOpen: true,
            type,
            data,
        };
        this.notify();
    }

    close() {
        this.state = {
            isOpen: false,
            type: null,
            data: undefined,
        };
        this.notify();
    }

    getState(): ModalState {
        return { ...this.state };
    }
}

export const modalController = new ModalController();
