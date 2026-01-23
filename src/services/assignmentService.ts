/**
 * API service functions for Assignments
 */

import axiosInstance from '@/lib/axios';
import type { Assignment } from '@/types/course';

export const assignmentService = {
    /**
     * Unlink assignment from template
     */
    async unlinkFromTemplate(assignmentId: number): Promise<Assignment> {
        const response = await axiosInstance.post(`/assignments/${assignmentId}/unlink-from-template/`);
        return response.data;
    },

    /**
     * Relink assignment to template
     */
    async relinkToTemplate(assignmentId: number): Promise<Assignment> {
        const response = await axiosInstance.post(`/assignments/${assignmentId}/relink-to-template/`);
        return response.data;
    },

    /**
     * Get sync status of assignment with its template
     */
    async getSyncStatus(assignmentId: number): Promise<{
        is_linked: boolean;
        is_unlinked: boolean;
        is_outdated: boolean;
        outdated_fields?: string[];
        template_id?: number;
        message: string;
    }> {
        const response = await axiosInstance.get(`/assignments/${assignmentId}/sync-status/`);
        return response.data;
    },

    /**
     * Sync assignment from its template (superadmin only)
     */
    async syncFromTemplate(assignmentId: number): Promise<Assignment> {
        const response = await axiosInstance.post(`/assignments/${assignmentId}/sync-from-template/`);
        return response.data;
    },
};
