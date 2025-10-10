export default function TestsPage() {
    return (
        <div className="mx-auto">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Тесты</h1>

                <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Список тестов
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Здесь будут отображаться все доступные тесты.
                    </p>

                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Тест по Математике - Арифметика (Не начат)
                            </h3>
                            <p className="text-gray-600 mb-3">
                                Проверьте свои знания основ арифметики
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    30 мин • 15 вопросов
                                </span>
                                <a
                                    href="/tests/math-arith-not-started"
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Начать тест
                                </a>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Тест по Физике - Механика (В процессе)
                            </h3>
                            <p className="text-gray-600 mb-3">
                                Основы механики и движения
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    45 мин • 20 вопросов • Вопрос 3
                                </span>
                                <a
                                    href="/tests/physics-mech-in-progress"
                                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    Продолжить
                                </a>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Тест по Химии - Органическая (Завершен)
                            </h3>
                            <p className="text-gray-600 mb-3">
                                Основы органической химии
                            </p>
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-500">
                                    40 мин • 18 вопросов • Оценка: 85/100
                                </span>
                                <a
                                    href="/tests/chemistry-org-finished"
                                    className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    Результаты
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
