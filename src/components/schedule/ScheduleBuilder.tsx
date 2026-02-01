'use client';

import { useState, useEffect, useRef } from 'react';
import { Plus, Trash2, Clock, MapPin } from 'lucide-react';

interface ScheduleSlot {
    id?: number;
    day_of_week: number; // 0=Monday, 6=Sunday
    start_time: string; // HH:MM format
    end_time: string; // HH:MM format
    room?: string;
    start_date?: string; // Optional date range
    end_date?: string;
    quarter?: number | null; // 1, 2, 3, 4, or null for all quarters
}

interface ScheduleBuilderProps {
    subjectGroupId?: number;
    initialSlots?: ScheduleSlot[];
    onChange: (slots: ScheduleSlot[]) => void;
    /** По умолчанию для новых слотов; при смене четверти в одном слоте применяется ко всем */
    defaultQuarter?: number | null;
    /** По умолчанию для новых слотов; можно переопределить в каждом слоте */
    defaultRoom?: string;
}

const DAYS_OF_WEEK = [
    { value: 0, label: 'Понедельник', short: 'Пн' },
    { value: 1, label: 'Вторник', short: 'Вт' },
    { value: 2, label: 'Среда', short: 'Ср' },
    { value: 3, label: 'Четверг', short: 'Чт' },
    { value: 4, label: 'Пятница', short: 'Пт' },
    { value: 5, label: 'Суббота', short: 'Сб' },
    { value: 6, label: 'Воскресенье', short: 'Вс' },
];

export default function ScheduleBuilder({
    subjectGroupId,
    initialSlots = [],
    onChange,
    defaultQuarter = null,
    defaultRoom = '',
}: ScheduleBuilderProps) {
    const [slots, setSlots] = useState<ScheduleSlot[]>(initialSlots);
    const [editingSlot, setEditingSlot] = useState<number | null>(null);
    const isInitialMount = useRef(true);
    const prevInitialSlotsRef = useRef<string>(JSON.stringify(initialSlots));
    const isUpdatingFromProps = useRef(false);
    const prevSlotsRef = useRef<string>(JSON.stringify(initialSlots));
    const onChangeRef = useRef(onChange);

    // Keep onChange ref up to date
    useEffect(() => {
        onChangeRef.current = onChange;
    }, [onChange]);

    useEffect(() => {
        // Only update slots if initialSlots actually changed (deep comparison)
        const initialSlotsStr = JSON.stringify(initialSlots);
        
        if (initialSlotsStr !== prevInitialSlotsRef.current) {
            isUpdatingFromProps.current = true;
            setSlots(initialSlots);
            prevInitialSlotsRef.current = initialSlotsStr;
            prevSlotsRef.current = initialSlotsStr;
        }
    }, [initialSlots]);

    useEffect(() => {
        // Skip onChange on initial mount
        if (isInitialMount.current) {
            isInitialMount.current = false;
            prevSlotsRef.current = JSON.stringify(slots);
            return;
        }
        
        // Skip onChange when updating from props
        if (isUpdatingFromProps.current) {
            isUpdatingFromProps.current = false;
            prevSlotsRef.current = JSON.stringify(slots);
            return;
        }
        
        // Only call onChange if slots actually changed (deep comparison)
        const slotsStr = JSON.stringify(slots);
        if (slotsStr !== prevSlotsRef.current) {
            prevSlotsRef.current = slotsStr;
            onChangeRef.current(slots);
        }
    }, [slots]);

    const addSlot = (dayOfWeek: number, e?: React.MouseEvent) => {
        if (e) {
            e.stopPropagation();
            e.preventDefault();
        }
        const newSlot: ScheduleSlot = {
            day_of_week: dayOfWeek,
            start_time: '09:00',
            end_time: '10:30',
            room: defaultRoom || '',
            quarter: defaultQuarter ?? null,
        };
        setSlots([...slots, newSlot]);
        setEditingSlot(slots.length);
    };

    const updateSlot = (index: number, updates: Partial<ScheduleSlot>) => {
        if (updates.quarter !== undefined) {
            setSlots(prev => prev.map(s => ({ ...s, quarter: updates.quarter ?? null })));
            return;
        }
        const updated = [...slots];
        updated[index] = { ...updated[index], ...updates };
        setSlots(updated);
    };

    const removeSlot = (index: number) => {
        setSlots(slots.filter((_, i) => i !== index));
        if (editingSlot === index) {
            setEditingSlot(null);
        } else if (editingSlot !== null && editingSlot > index) {
            setEditingSlot(editingSlot - 1);
        }
    };

    const getSlotsForDay = (dayOfWeek: number) => {
        return slots.filter(s => s.day_of_week === dayOfWeek);
    };

    const formatTime = (time: string) => {
        return time || '09:00';
    };

    /** Time string to minutes since midnight for comparison */
    const timeToMinutes = (t: string): number => {
        if (!t || typeof t !== 'string') return 0;
        const parts = t.trim().split(':');
        const h = parseInt(parts[0], 10) || 0;
        const m = parseInt(parts[1], 10) || 0;
        return h * 60 + m;
    };

    /** Валидация: время окончания должно быть позже времени начала */
    const isSlotTimeValid = (start: string, end: string): boolean =>
        timeToMinutes(end) > timeToMinutes(start);

    /** Normalize time input to HH:MM so "1:00" doesn't become 01:00 when user meant 10:00 */
    const padTime = (t: string): string => {
        if (!t || typeof t !== 'string') return '09:00';
        const parts = t.trim().split(':');
        const h = Math.min(23, Math.max(0, parseInt(parts[0], 10) || 0));
        const m = Math.min(59, Math.max(0, parseInt(parts[1], 10) || 0));
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    };

    return (
        <div className="space-y-4 w-full">
            {/* Header removed - now in parent component */}

            {/* Weekly Schedule Grid */}
            <div className="grid grid-cols-7 gap-3 mb-4">
                {DAYS_OF_WEEK.map(day => {
                    const daySlots = getSlotsForDay(day.value);
                    return (
                        <div
                            key={day.value}
                            className={`border-2 rounded-xl p-3 min-h-[280px] transition-all cursor-pointer ${
                                daySlots.length > 0
                                    ? 'border-purple-400 bg-purple-50 shadow-md'
                                    : 'border-gray-300 bg-white hover:border-purple-300 hover:bg-purple-50/70 hover:shadow-sm'
                            }`}
                            onClick={(e) => {
                                if (!daySlots.length) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    addSlot(day.value, e);
                                }
                            }}
                        >
                            <div className="flex items-center justify-between mb-3 pb-2 border-b-2 border-gray-300">
                                <h4 className={`font-bold text-sm ${
                                    daySlots.length > 0 ? 'text-purple-700' : 'text-gray-700'
                                }`}>
                                    {day.short}
                                </h4>
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        e.preventDefault();
                                        addSlot(day.value, e);
                                    }}
                                    className="p-1.5 hover:bg-purple-300 rounded-lg transition-colors bg-purple-200 shadow-sm"
                                    title={`Добавить урок в ${day.label}`}
                                >
                                    <Plus className="w-4 h-4 text-purple-800" />
                                </button>
                            </div>

                            <div className="space-y-2">
                                {daySlots.map((slot, slotIndex) => {
                                    const globalIndex = slots.findIndex(
                                        s => s === slot
                                    );
                                    const isEditing = editingSlot === globalIndex;

                                    return (
                                        <div
                                            key={globalIndex}
                                            className={`bg-white border-2 rounded-lg p-3 text-xs mb-2 shadow-sm ${
                                                isEditing
                                                    ? 'border-purple-500 shadow-md ring-2 ring-purple-200'
                                                    : 'border-purple-300 hover:border-purple-400 hover:shadow-md transition-all'
                                            }`}
                                        >
                                            {isEditing ? (
                                                <div className="space-y-2">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Время начала
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={slot.start_time}
                                                            onChange={e =>
                                                                updateSlot(
                                                                    globalIndex,
                                                                    {
                                                                        start_time:
                                                                            padTime(e.target.value),
                                                                    }
                                                                )
                                                            }
                                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Время окончания
                                                        </label>
                                                        <input
                                                            type="time"
                                                            value={slot.end_time}
                                                            onChange={e =>
                                                                updateSlot(
                                                                    globalIndex,
                                                                    {
                                                                        end_time:
                                                                            padTime(e.target.value),
                                                                    }
                                                                )
                                                            }
                                                            className={`w-full px-2 py-1 text-xs border rounded focus:ring-1 focus:ring-purple-500 ${
                                                                !isSlotTimeValid(slot.start_time, slot.end_time)
                                                                    ? 'border-red-500 bg-red-50'
                                                                    : 'border-gray-300'
                                                            }`}
                                                        />
                                                        {!isSlotTimeValid(slot.start_time, slot.end_time) && (
                                                            <p className="mt-1 text-xs text-red-600">
                                                                Время окончания должно быть позже времени начала
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Кабинет (необязательно)
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={slot.room || ''}
                                                            onChange={e =>
                                                                updateSlot(
                                                                    globalIndex,
                                                                    {
                                                                        room:
                                                                            e.target
                                                                                .value,
                                                                    }
                                                                )
                                                            }
                                                            placeholder="101"
                                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-700 mb-1">
                                                            Четверть
                                                        </label>
                                                        <select
                                                            value={slot.quarter || ''}
                                                            onChange={e =>
                                                                updateSlot(
                                                                    globalIndex,
                                                                    {
                                                                        quarter:
                                                                            e.target.value === ''
                                                                                ? null
                                                                                : parseInt(
                                                                                      e.target
                                                                                          .value
                                                                                  ),
                                                                    }
                                                                )
                                                            }
                                                            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                                                        >
                                                            <option value="">
                                                                Все четверти
                                                            </option>
                                                            <option value="1">
                                                                1 четверть
                                                            </option>
                                                            <option value="2">
                                                                2 четверть
                                                            </option>
                                                            <option value="3">
                                                                3 четверть
                                                            </option>
                                                            <option value="4">
                                                                4 четверть
                                                            </option>
                                                        </select>
                                                    </div>
                                                    <div className="flex gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                setEditingSlot(null);
                                                            }}
                                                            className="flex-1 px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded transition-colors"
                                                        >
                                                            Готово
                                                        </button>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            removeSlot(globalIndex);
                                                        }}
                                                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                            title="Удалить"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    <div className="flex items-center gap-1 mb-1">
                                                        <Clock className="w-3 h-3 text-gray-400" />
                                                        <span className="font-medium text-gray-900">
                                                            {formatTime(
                                                                slot.start_time
                                                            )}
                                                            {' - '}
                                                            {formatTime(
                                                                slot.end_time
                                                            )}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                                        {slot.room && (
                                                            <div className="flex items-center gap-1 text-gray-600 text-xs bg-gray-100 px-2 py-0.5 rounded-full">
                                                                <MapPin className="w-3 h-3" />
                                                                <span>{slot.room}</span>
                                                            </div>
                                                        )}
                                                        {slot.quarter && (
                                                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                                                {slot.quarter} четверть
                                                            </span>
                                                        )}
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setEditingSlot(globalIndex);
                                                        }}
                                                        className="mt-2 w-full px-2 py-1.5 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
                                                    >
                                                        ✏️ Редактировать
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Summary */}
            {slots.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg p-4 mt-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-700">
                                Всего уроков в неделю:
                            </p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">
                                {slots.length}
                            </p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-600">
                                Расписание готово
                            </p>
                            <div className="mt-1 text-green-600">✓</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
