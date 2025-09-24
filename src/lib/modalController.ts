export type ModalType =
    | 'kundelik-integration'
    | 'other-modal'
    | 'event-modal'
    | 'course-section-add-item'
    | 'course-section-create'
    | 'file-viewer'
    | 'confirmation';

export interface EventModalData {
    title: string;
    start: string;
    subject: string;
    teacher: string;
    time: string;
    description: string;
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

export interface ConfirmationModalData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?: 'danger' | 'primary' | 'secondary';
    loading?: boolean;
    onConfirm: () => void | Promise<void>;
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
