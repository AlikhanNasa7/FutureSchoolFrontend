'use client';

import { Link, Unlink, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';
import { useUser } from '@/contexts/UserContext';

interface TemplateLinkIndicatorProps {
    isLinked: boolean; // template_resource or template_assignment is not null
    isUnlinked: boolean; // is_unlinked_from_template is true
    isOutdated?: boolean; // resource/assignment is outdated compared to template
    onUnlink?: () => void;
    onRelink?: () => void;
    showButton?: boolean;
    type?: 'resource' | 'assignment' | 'test';
    itemId?: number;
}

export default function TemplateLinkIndicator({
    isLinked,
    isUnlinked,
    isOutdated = false,
    onUnlink,
    onRelink,
    showButton = false,
    type = 'resource',
    itemId,
}: TemplateLinkIndicatorProps) {
    const { t } = useLocale();
    const { state } = useUser();
    const isAdmin = state.user?.role === 'superadmin' || state.user?.role === 'schooladmin';
    const isTeacher = state.user?.role === 'teacher';

    if (!isLinked) {
        return null; // No template link, don't show anything
    }

    // Show outdated indicator for teachers and admins
    if ((isTeacher || isAdmin) && isOutdated && !isUnlinked) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-red-600">
                    <AlertCircle className="w-4 h-4" />
                    <span className="text-xs font-medium">Устарело (требуется синхронизация)</span>
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

    if (isUnlinked) {
        return (
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 text-orange-600">
                    <Unlink className="w-4 h-4" />
                    <span className="text-xs font-medium">Отвязано от шаблона</span>
                </div>
                {showButton && onRelink && (
                    <button
                        onClick={onRelink}
                        className="text-xs text-blue-600 hover:text-blue-700 underline"
                        title="Привязать к шаблону"
                    >
                        Привязать
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-medium">Синхронизировано</span>
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

