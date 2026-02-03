"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import axiosInstance from "@/lib/axios";
import { useUserState } from "@/contexts/UserContext";

interface GradeSummaryItem {
  subject_group_id: number;
  course_name: string;
  classroom_name: string;
  average: number | null;
  manual_count: number;
  assignment_grades_count: number;
  test_attempts_count: number;
}

export default function ParentChildGradesPage() {
  const params = useParams<{ childId: string }>();
  const childId = Number(params.childId);
  const { user } = useUserState();

  const [items, setItems] = useState<GradeSummaryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGrades = async () => {
      if (!user || !childId) return;
      setLoading(true);
      setError(null);

      try {
        const res = await axiosInstance.get(
          `/manual-grades/student-summary/`,
          { params: { student_id: childId } }
        );
        setItems(res.data.results || []);
      } catch (e) {
        console.error("Failed to load parent grades summary:", e);
        setError("Не удалось загрузить сводку оценок ребёнка.");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
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
        <div className="bg-white rounded-lg shadow p-6 text-red-600">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">
          Оценки ребёнка
        </h1>
        <p className="text-gray-600 text-sm">
          Сводный грейдбук по всем предметам: средние баллы и количество оценок.
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {items.length === 0 ? (
          <p className="text-sm text-gray-600">Пока нет данных по оценкам.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="py-2 pr-4 text-left text-gray-500 font-medium">
                    Предмет
                  </th>
                  <th className="py-2 px-4 text-left text-gray-500 font-medium">
                    Класс
                  </th>
                  <th className="py-2 px-4 text-left text-gray-500 font-medium">
                    Ср. балл
                  </th>
                  <th className="py-2 px-4 text-left text-gray-500 font-medium">
                    Домашка/задания
                  </th>
                  <th className="py-2 px-4 text-left text-gray-500 font-medium">
                    Тесты
                  </th>
                  <th className="py-2 px-4 text-left text-gray-500 font-medium">
                    Ручные оценки
                  </th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.subject_group_id} className="border-b last:border-0">
                    <td className="py-2 pr-4">
                      <span className="font-medium text-gray-900">
                        {item.course_name}
                      </span>
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {item.classroom_name}
                    </td>
                    <td className="py-2 px-4 text-gray-900">
                      {item.average !== null ? item.average.toFixed(2) : "—"}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {item.assignment_grades_count}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {item.test_attempts_count}
                    </td>
                    <td className="py-2 px-4 text-gray-700">
                      {item.manual_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

