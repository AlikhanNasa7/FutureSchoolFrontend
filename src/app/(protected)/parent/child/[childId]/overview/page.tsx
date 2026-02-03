'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axiosInstance from '@/lib/axios';
import { useUserState } from '@/contexts/UserContext';
import { FileText, Award, Calendar, BarChart3 } from 'lucide-react';

interface SummaryItem {
  subject_group_id: number;
  course_name: string;
  classroom_name: string;
  average: number | null;
  manual_count: number;
  assignment_grades_count: number;
  test_attempts_count: number;
}

interface AttendanceSummary {
  total_sessions: number;
  present_count: number;
  excused_count: number;
  not_present_count: number;
  attendance_percentage: number;
}

export default function ParentChildOverviewPage() {
  const params = useParams<{ childId: string }>();
  const childId = Number(params.childId);
  const router = useRouter();
  const { user } = useUserState();

  const [gradeSummary, setGradeSummary] = useState<SummaryItem[]>([]);
  const [attendanceSummary, setAttendanceSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!user || !childId) return;

      setLoading(true);
      setError(null);

      try {
        const gradesRes = await axiosInstance.get('/manual-grades/student-summary/', {
          params: { student_id: childId },
        });
        setGradeSummary(gradesRes.data.results || []);

        const attendanceRes = await axiosInstance.get('/attendance/student-history/', {
          params: { student_id: childId },
        });
        const records = attendanceRes.data as Array<{ status: string }>;

        const total = records.length;
        let present = 0;
        let excused = 0;
        let notPresent = 0;

        records.forEach((r) => {
          if (r.status === 'present') present += 1;
          else if (r.status === 'excused') excused += 1;
          else if (r.status === 'absent') notPresent += 1;
        });

        const percentage = total > 0 ? Math.round((present / total) * 100 * 100) / 100 : 0;

        setAttendanceSummary({
          total_sessions: total,
          present_count: present,
          excused_count: excused,
          not_present_count: notPresent,
          attendance_percentage: percentage,
        });
      } catch (e) {
        console.error('Failed to load parent overview:', e);
        setError('Не удалось загрузить сводку по ребёнку.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, childId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow p-6 text-red-600">{error}</div>
      </div>
    );
  }

  const overallAverage =
    gradeSummary.length > 0
      ? (() => {
          const vals = gradeSummary
            .map((g) => g.average)
            .filter((v): v is number => v !== null);
          if (!vals.length) return null;
          return Math.round((vals.reduce((a, b) => a + b, 0) / vals.length) * 100) / 100;
        })()
      : null;

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Обзор ребёнка</h1>
          <p className="text-gray-600 text-sm">
            Общий прогресс: оценки, тесты, задания и посещаемость.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Средний балл по предметам</p>
            <p className="text-3xl font-bold text-gray-900">
              {overallAverage !== null ? overallAverage.toFixed(2) : '—'}
            </p>
          </div>
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Посещаемость</p>
            <p className="text-3xl font-bold text-gray-900">
              {attendanceSummary
                ? `${attendanceSummary.attendance_percentage.toFixed(1)}%`
                : '—'}
            </p>
          </div>
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
            <Calendar className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Предметы и успеваемость</h2>
        </div>
        {gradeSummary.length === 0 ? (
          <p className="text-sm text-gray-600">Пока нет данных по оценкам.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 text-left text-gray-500 font-medium">Предмет</th>
                  <th className="py-2 px-4 text-left text-gray-500 font-medium">Класс</th>
                  <th className="py-2 px-4 text-left text-gray-500 font-medium">Ср. балл</th>
                  <th className="py-2 px-4 text-left text-gray-500 font-medium">Оценки</th>
                  <th className="py-2 pl-4 text-right text-gray-500 font-medium">Действия</th>
                </tr>
              </thead>
              <tbody>
                {gradeSummary.map((item) => (
                  <tr key={item.subject_group_id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <span className="font-medium text-gray-900">{item.course_name}</span>
                    </td>
                    <td className="py-2 px-4 text-gray-700">{item.classroom_name}</td>
                    <td className="py-2 px-4 text-gray-900">
                      {item.average !== null ? item.average.toFixed(2) : '—'}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      Домашка/задания: {item.assignment_grades_count}; тесты:{' '}
                      {item.test_attempts_count}; ручные: {item.manual_count}
                    </td>
                    <td className="py-2 pl-4 text-right">
                      <button
                        onClick={() =>
                          router.push(
                            `/parent/child/${childId}/subjects?subject_group=${item.subject_group_id}`,
                          )
                        }
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Подробнее
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button
          onClick={() => router.push(`/parent/child/${childId}/assignments`)}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Задания</p>
              <p className="text-sm text-gray-600">Список заданий</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/parent/child/${childId}/tests`)}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Тесты</p>
              <p className="text-sm text-gray-600">Результаты тестов</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => router.push(`/parent/child/${childId}/attendance`)}
          className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-900">Посещаемость</p>
              <p className="text-sm text-gray-600">Детали посещения уроков</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

