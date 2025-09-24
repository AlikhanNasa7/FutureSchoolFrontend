import SubjectOverviewPanel from './SubjectOverviewPanel.client';

export type SubjectOverviewData = {
    title: string; // e.g., "Общая информация" | "General information"
    description?: string; // short paragraph
    resources?: Array<{
        id: string;
        label: string; // e.g., "Постоянная ссылка урока"
        title: string; // Resource title
        href: string;
        type?:
            | 'meet'
            | 'document'
            | 'folder'
            | 'link'
            | 'file'
            | 'info'
            | 'test'
            | 'video'
            | 'image'
            | 'recording'; // icon type
        icon?: React.ReactNode; // optional custom icon
    }>;
};

interface SubjectOverviewCardProps {
    data: SubjectOverviewData;
    courseSectionId?: number;
    onDeleteItem?: (itemId: string) => void;
}

export default function SubjectOverviewCard({
    data,
    courseSectionId,
    onDeleteItem,
}: SubjectOverviewCardProps) {
    return (
        <SubjectOverviewPanel
            data={data}
            courseSectionId={courseSectionId}
            onDeleteItem={onDeleteItem}
        />
    );
}
