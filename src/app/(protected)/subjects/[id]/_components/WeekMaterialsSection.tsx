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
          status?: 'not_started' | 'in_progress' | 'submitted' | 'graded';
          score?: string;
          icon?: React.ReactNode;
      }
    | {
          id: string;
          kind: 'test';
          title: string;
          file?: string;
          type?: 'test';
          status?: 'not_started' | 'in_progress' | 'completed' | 'graded';
          score?: string;
          icon?: React.ReactNode;
      };

export type WeekMaterialsData = {
    id: string;
    title: string;
    resources: WeekItem[];
    assignments: WeekItem[];
    tests: WeekItem[];
};

interface WeekMaterialsSectionProps {
    data: WeekMaterialsData;
    courseSectionId?: number;
    onDeleteItem?: (
        itemId: string,
        itemType: 'resource' | 'assignment'
    ) => void;
    onDeleteSection?: (sectionId: string) => void;
}

export default function WeekMaterialsSection({
    data,
    courseSectionId,
}: WeekMaterialsSectionProps) {
    if (!data?.title) return null;

    return <WeekMaterialsPanel data={data} courseSectionId={courseSectionId} />;
}
