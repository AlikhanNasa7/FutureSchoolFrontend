/**
 * API service functions for Resources
 */

import axiosInstance from '@/lib/axios';
import type { Resource } from '@/types/course';

export const resourceService = {
    /**
     * Get resource by ID
     */
    async getResourceById(resourceId: number): Promise<Resource> {
        const response = await axiosInstance.get(`/resources/${resourceId}/`);
        return response.data;
    },

    /**
     * Update resource
     */
    async updateResource(resourceId: number, data: Partial<Resource>): Promise<Resource> {
        const response = await axiosInstance.patch(`/resources/${resourceId}/`, data);
        return response.data;
    },

    /**
     * Update resource with file upload
     */
    async updateResourceWithFile(
        resourceId: number,
        formData: FormData
    ): Promise<Resource> {
        const response = await axiosInstance.patch(`/resources/${resourceId}/`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    /**
     * Delete resource
     */
    async deleteResource(resourceId: number): Promise<void> {
        await axiosInstance.delete(`/resources/${resourceId}/`);
    },

    /**
     * Unlink resource from template
     */
    async unlinkFromTemplate(resourceId: number): Promise<Resource> {
        const response = await axiosInstance.post(`/resources/${resourceId}/unlink-from-template/`);
        return response.data;
    },

    /**
     * Relink resource to template
     */
    async relinkToTemplate(resourceId: number): Promise<Resource> {
        const response = await axiosInstance.post(`/resources/${resourceId}/relink-to-template/`);
        return response.data;
    },

    /**
     * Get sync status of resource with its template
     */
    async getSyncStatus(resourceId: number): Promise<{
        is_linked: boolean;
        is_unlinked: boolean;
        is_outdated: boolean;
        outdated_fields?: string[];
        template_id?: number;
        message: string;
    }> {
        const response = await axiosInstance.get(`/resources/${resourceId}/sync-status/`);
        return response.data;
    },
};
