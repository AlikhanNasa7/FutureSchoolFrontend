export interface AssignmentAttachment {
    id: number;
    type: string;
    title: string;
    content: string;
    file_url: string;
    file: string;
    position: number;
    assignment?: number;
}

export interface SubmissionAttachment {
    id: number;
    type: string;
    title: string;
    content: string;
    file_url: string;
    file: string;
    position: number;
}

export interface StudentSubmission {
    id: number;
    submitted_at: string;
    text: string;
    file: string;
    grade_value?: number;
    grade_feedback?: string;
    graded_at?: string;
    attachments: SubmissionAttachment[];
}

export interface AllSubmission {
    id: number;
    submitted_at: string;
    text: string;
    file: string;
    student_username: string;
    student_first_name: string;
    student_last_name: string;
    grade_value?: number;
    grade_feedback?: string;
    graded_at?: string;
    attachments: SubmissionAttachment[];
}

export interface Assignment {
    id: number;
    course_section: number;
    teacher: number;
    title: string;
    description: string;
    due_at: string;
    max_grade: number;
    file: string;
    course_section_title: string;
    subject_group_course_name: string;
    subject_group_course_code: string;
    teacher_username: string;
    submission_count: string;
    attachments: AssignmentAttachment[];
    is_available: string;
    is_deadline_passed: boolean;
    is_submitted: boolean;
    student_submission?: StudentSubmission | null;
    all_submissions?: AllSubmission[] | null;
}
