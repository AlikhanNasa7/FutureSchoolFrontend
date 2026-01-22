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
};
