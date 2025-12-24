/**
 * API service functions for Course Templates
 */

import axiosInstance from '@/lib/axios';
import type { Course, CourseSection, CourseWithStats, SubjectGroup } from '@/types/course';

export const courseService = {
    /**
     * Get all courses
     */
    async getAllCourses(params?: { grade?: number; search?: string }): Promise<Course[]> {
        const response = await axiosInstance.get('/courses/', { params });
        return response.data;
    },

    /**
     * Get course by ID
     */
    async getCourseById(id: number): Promise<Course> {
        const response = await axiosInstance.get(`/courses/${id}/`);
        return response.data;
    },

    /**
     * Create a new course
     */
    async createCourse(data: {
        course_code: string;
        name: string;
        description?: string;
        grade: number;
    }): Promise<Course> {
        const response = await axiosInstance.post('/courses/', data);
        return response.data;
    },

    /**
     * Update course
     */
    async updateCourse(id: number, data: Partial<Course>): Promise<Course> {
        const response = await axiosInstance.patch(`/courses/${id}/`, data);
        return response.data;
    },

    /**
     * Delete course
     */
    async deleteCourse(id: number): Promise<void> {
        await axiosInstance.delete(`/courses/${id}/`);
    },

    /**
     * Get all courses with stats (subject groups, sections)
     */
    async getAllCoursesWithStats(): Promise<CourseWithStats[]> {
        const response = await axiosInstance.get('/courses/full/');
        return response.data;
    },

    /**
     * Sync content from course to all subject groups
     */
    async syncContent(
        courseId: number,
        academicStartDate?: string
    ): Promise<{ detail: string }> {
        const response = await axiosInstance.post(`/courses/${courseId}/sync-content/`, {
            academic_start_date: academicStartDate,
        });
        return response.data;
    },

    /**
     * Get template sections for a course
     */
    async getTemplateSections(courseId: number): Promise<CourseSection[]> {
        const response = await axiosInstance.get(`/course-sections/?course=${courseId}`);
        return response.data;
    },

    /**
     * Create a template section
     */
    async createTemplateSection(data: {
        course: number;
        subject_group: null;
        title: string;
        position?: number;
        is_general?: boolean;
        template_week_index?: number | null;
        template_start_offset_days?: number | null;
        template_duration_days?: number;
    }): Promise<CourseSection> {
        const response = await axiosInstance.post('/course-sections/', data);
        return response.data;
    },

    /**
     * Update course section
     */
    async updateCourseSection(
        id: number,
        data: Partial<CourseSection>
    ): Promise<CourseSection> {
        const response = await axiosInstance.patch(`/course-sections/${id}/`, data);
        return response.data;
    },

    /**
     * Delete course section
     */
    async deleteCourseSection(id: number): Promise<void> {
        await axiosInstance.delete(`/course-sections/${id}/`);
    },

    /**
     * Get subject groups for a course
     */
    async getSubjectGroupsForCourse(courseId: number): Promise<SubjectGroup[]> {
        const response = await axiosInstance.get(`/subject-groups/?course=${courseId}`);
        return response.data;
    },

    /**
     * Create a new subject group (link course to teacher and classroom)
     */
    async createSubjectGroup(data: {
        course: number;
        classroom: number;
        teacher: number | null;
    }): Promise<SubjectGroup> {
        const response = await axiosInstance.post('/subject-groups/', data);
        return response.data;
    },

    /**
     * Update subject group
     */
    async updateSubjectGroup(
        id: number,
        data: Partial<SubjectGroup>
    ): Promise<SubjectGroup> {
        const response = await axiosInstance.patch(`/subject-groups/${id}/`, data);
        return response.data;
    },

    /**
     * Delete subject group
     */
    async deleteSubjectGroup(id: number): Promise<void> {
        await axiosInstance.delete(`/subject-groups/${id}/`);
    },
};

