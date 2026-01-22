/**
 * API service functions for Resources
 */

import axiosInstance from '@/lib/axios';
import type { Resource } from '@/types/course';

export const resourceService = {
    /**
     * Unlink resource from template
     */
    async unlinkFromTemplate(resourceId: number): Promise<Resource> {
        const response = await axiosInstance.post(`/resources/${resourceId}/unlink-from-template/`);
        return response.data;
    },
};
