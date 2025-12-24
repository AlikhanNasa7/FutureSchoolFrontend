'use client';

import { Link, Unlink, AlertCircle } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

interface TemplateLinkIndicatorProps {
    isLinked: boolean; // template_resource or template_assignment is not null
    isUnlinked: boolean; // is_unlinked_from_template is true
    onUnlink?: () => void;
    showButton?: boolean;
}

export default function TemplateLinkIndicator({
    isLinked,
    isUnlinked,
    onUnlink,
    showButton = false,
}: TemplateLinkIndicatorProps) {
    const { t } = useLocale();

    if (!isLinked) {
        return null; // No template link, don't show anything
    }

    if (isUnlinked) {
        return (
            <div className="flex items-center gap-2 text-orange-600">
                <Unlink className="w-4 h-4" />
                <span className="text-xs font-medium">Отвязано от шаблона</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-blue-600">
                <Link className="w-4 h-4" />
                <span className="text-xs font-medium">Связано с шаблоном</span>
            </div>
            {showButton && onUnlink && (
                <button
                    onClick={onUnlink}
                    className="text-xs text-orange-600 hover:text-orange-700 underline"
                    title="Отвязать от шаблона"
                >
                    Отвязать
                </button>
            )}
        </div>
    );
}

