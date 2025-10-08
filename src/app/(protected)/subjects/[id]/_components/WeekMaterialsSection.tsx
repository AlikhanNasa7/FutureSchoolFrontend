import WeekMaterialsPanel from './WeekMaterialsPanel.client';

export type WeekItem =
    | {
          id: string;
          kind: 'link';
          title: string;
          file?: string;
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
      }
    | {
          id: string;
          kind: 'task';
          title: string;
          file?: string;
          actionHref: string;
          actionLabel: string;
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
          is_available?: boolean;
          is_deadline_passed?: boolean;
          is_submitted?: boolean;
          score?: string;
          grade_value?: number;
          max_grade?: number;
          icon?: React.ReactNode;
      }
    | {
          id: string;
          kind: 'test';
          title: string;
          file?: string;
          type?: 'test';
          is_available?: boolean;
          is_deadline_passed?: boolean;
          is_submitted?: boolean;
          score?: string;
          grade_value?: number;
          max_grade?: number;
          icon?: React.ReactNode;
      };

export type WeekMaterialsData = {
    id: string;
    title: string;
    resources: WeekItem[];
    assignments: WeekItem[];
    tests: WeekItem[];
    is_current?: boolean;
};

interface WeekMaterialsSectionProps {
    data: WeekMaterialsData;
    courseSectionId?: number;
    onRefresh?: () => void;
    onDeleteItem?: (
        itemId: string,
        itemType: 'resource' | 'assignment'
    ) => void;
    onDeleteSection?: (sectionId: string) => void;
}

export default function WeekMaterialsSection({
    data,
    courseSectionId,
    onRefresh,
}: WeekMaterialsSectionProps) {
    if (!data?.title) return null;

    return (
        <WeekMaterialsPanel
            data={data}
            courseSectionId={courseSectionId}
            onRefresh={onRefresh}
        />
    );
}
