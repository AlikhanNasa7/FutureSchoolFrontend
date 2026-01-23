/**
 * API service functions for Tests
 */

import axiosInstance from '@/lib/axios';

export interface Test {
    id: number;
    course_section: number;
    teacher: number;
    title: string;
    description: string | null;
    is_published: boolean;
    reveal_results_at: string | null;
    start_date: string | null;
    end_date: string | null;
    time_limit_minutes: number | null;
    allow_multiple_attempts: boolean;
    max_attempts: number | null;
    show_correct_answers: boolean;
    show_feedback: boolean;
    show_score_immediately: boolean;
    template_test: number | null;
    is_unlinked_from_template: boolean;
    course_section_title?: string;
    course_name?: string;
    course_code?: string;
    subject_group?: number;
    classroom_name?: string;
    classroom_grade?: number;
    classroom_letter?: string;
    teacher_username?: string;
    teacher_fullname?: string;
    total_points?: number;
    questions?: Question[];
    created_at: string;
    updated_at: string;
}

export interface Question {
    id: number;
    test: number;
    type: 'multiple_choice' | 'choose_all' | 'open_question' | 'matching';
    text: string;
    points: number;
    position: number;
    correct_answer_text?: string | null;
    sample_answer?: string | null;
    key_words?: string | null;
    matching_pairs_json?: any;
    options?: Option[];
    options_count?: number;
}

export interface Option {
    id: number;
    text: string | null;
    image_url: string | null;
    is_correct: boolean;
    position: number;
}

export const testService = {
    /**
     * Get template tests for a course
     */
    async getTemplateTests(courseId: number): Promise<Test[]> {
        const response = await axiosInstance.get('/tests/', {
            params: { is_template: 'true', course: courseId }
        });
        return response.data;
    },

    /**
     * Get tests for a course section
     */
    async getTestsForSection(courseSectionId: number): Promise<Test[]> {
        const response = await axiosInstance.get('/tests/', {
            params: { course_section: courseSectionId }
        });
        return response.data;
    },

    /**
     * Get test by ID
     */
    async getTestById(testId: number): Promise<Test> {
        const response = await axiosInstance.get(`/tests/${testId}/`);
        return response.data;
    },

    /**
     * Create a test
     */
    async createTest(data: Partial<Test>): Promise<Test> {
        const response = await axiosInstance.post('/tests/', data);
        return response.data;
    },

    /**
     * Update test
     */
    async updateTest(testId: number, data: Partial<Test>): Promise<Test> {
        const response = await axiosInstance.patch(`/tests/${testId}/`, data);
        return response.data;
    },

    /**
     * Delete test
     */
    async deleteTest(testId: number): Promise<void> {
        await axiosInstance.delete(`/tests/${testId}/`);
    },

    /**
     * Copy test from template to target section
     */
    async copyFromTemplate(
        templateTestId: number, 
        targetCourseSectionId: number,
        subjectGroupId?: number
    ): Promise<Test> {
        const data: any = { target_course_section_id: targetCourseSectionId };
        if (subjectGroupId) {
            data.subject_group_id = subjectGroupId;
        }
        const response = await axiosInstance.post(
            `/tests/${templateTestId}/copy-from-template/`,
            data
        );
        return response.data;
    },

    /**
     * Unlink test from its template
     */
    async unlinkFromTemplate(testId: number): Promise<Test> {
        const response = await axiosInstance.post(`/tests/${testId}/unlink-from-template/`);
        return response.data;
    },

    /**
     * Relink test to its template
     */
    async relinkToTemplate(testId: number): Promise<Test> {
        const response = await axiosInstance.post(`/tests/${testId}/relink-to-template/`);
        return response.data;
    },

    /**
     * Get sync status of test with its template
     */
    async getSyncStatus(testId: number): Promise<{
        is_linked: boolean;
        is_unlinked: boolean;
        is_outdated: boolean;
        outdated_fields?: string[];
        template_id?: number;
        message: string;
    }> {
        const response = await axiosInstance.get(`/tests/${testId}/sync-status/`);
        return response.data;
    },

    /**
     * Sync test from its template (superadmin only)
     */
    async syncFromTemplate(testId: number): Promise<Test> {
        const response = await axiosInstance.post(`/tests/${testId}/sync-from-template/`);
        return response.data;
    },

    /**
     * Publish test (make it available to students)
     */
    async publishTest(testId: number): Promise<Test> {
        const response = await axiosInstance.post(`/tests/${testId}/publish/`);
        return response.data;
    },

    /**
     * Unpublish test (make it unavailable to students)
     */
    async unpublishTest(testId: number): Promise<Test> {
        const response = await axiosInstance.post(`/tests/${testId}/unpublish/`);
        return response.data;
    },
};
