'use client';

import { useParams } from 'next/navigation';
import React, { useEffect, useState, createContext, useContext } from 'react';
import { ArrowUp } from 'lucide-react';
import axiosInstance from '@/lib/axios';

interface SubjectData {
    id: string;
    name: string;
    teacher_username: string;
    teacher_fullname: string;
    bgId: string;
    urlPath: string;
    course_name: string;
    course_code?: string;
    grade?: number;
    type?: string;
    description?: string;
    classroom_display?: string;
    teacher_email?: string;
}

export const SubjectContext = createContext<{
    subject: SubjectData | null;
    loading: boolean;
    error: string | null;
    subjectGroupMembers: unknown[];
}>({
    subject: null,
    loading: true,
    error: null,
    subjectGroupMembers: [],
});

// Hook to use subject context
export const useSubject = () => {
    const context = useContext(SubjectContext);
    if (!context) {
        throw new Error('useSubject must be used within a SubjectProvider');
    }
    return context;
};

export default function SubjectLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const params = useParams();
    const subjectId = decodeURIComponent(params.id as string);
    const [subject, setSubject] = useState<SubjectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [subjectGroupMembers, setSubjectGroupMembers] = useState([]);
    const [showScrollTop, setShowScrollTop] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    useEffect(() => {
        const fetchSubject = async () => {
            if (!subjectId) {
                setError('Subject ID is missing');
                setLoading(false);
                return;
            }
            
            setLoading(true);
            setError(null);
            try {
                const url = `/subject-groups/${subjectId}/`;
                console.log('Fetching subject from:', url);
                const response = await axiosInstance.get(url);
                console.log('Subject response:', response.data);
                setSubject(response.data);
            } catch (err: any) {
                const errorMessage = err.response?.data?.detail || err.message || 'Failed to load subject';
                setError(errorMessage);
                console.error('Error fetching subject:', {
                    url: `/subject-groups/${subjectId}/`,
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    error: err
                });
            } finally {
                setLoading(false);
            }
        };
        const fetchSubjectGroupMembers = async () => {
            try {
                const response = await axiosInstance.get(
                    `/subject-groups/${subjectId}/members/`
                );
                setSubjectGroupMembers(response.data);
            } catch (err: any) {
                // Silently fail for members, but log for debugging
                console.warn('Error fetching subject group members:', err.response?.status, err.response?.data);
            }
        };
        if (subjectId) {
            fetchSubject();
            fetchSubjectGroupMembers();
        }
    }, [subjectId]);

    return (
        <>
            <SubjectContext.Provider
                value={{ subject, loading, error, subjectGroupMembers }}
            >
                {children}
            </SubjectContext.Provider>

            {/* Scroll to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-12 h-12 bg-purple-600 hover:bg-purple-700 text-white rounded-full shadow-lg transition-all duration-300 hover:scale-110"
                    aria-label="Scroll to top"
                >
                    <ArrowUp className="w-6 h-6" />
                </button>
            )}
        </>
    );
}
