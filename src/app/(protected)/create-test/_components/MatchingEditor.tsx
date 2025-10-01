import React from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface MatchingPair {
    left: string;
    right: string;
}

interface MatchingData {
    matching_pairs_json: MatchingPair[];
}

interface MatchingEditorProps {
    data: MatchingData;
    onChange: (data: MatchingData) => void;
}

export function MatchingEditor({ data, onChange }: MatchingEditorProps) {
    const updatePair = (
        index: number,
        side: 'left' | 'right',
        value: string
    ) => {
        const newPairs = [...data.matching_pairs_json];
        newPairs[index] = {
            ...newPairs[index],
            [side]: value,
        };
        onChange({ ...data, matching_pairs_json: newPairs });
    };

    const addPair = () => {
        const newPairs = [...data.matching_pairs_json, { left: '', right: '' }];
        onChange({ ...data, matching_pairs_json: newPairs });
    };

    const removePair = (index: number) => {
        if (data.matching_pairs_json.length <= 2) return; // Keep at least 2 pairs

        const newPairs = data.matching_pairs_json.filter((_, i) => i !== index);
        onChange({ ...data, matching_pairs_json: newPairs });
    };

    return (
        <div className="space-y-6">
            {/* Matching Pairs Section */}
            <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                    Matching Pairs
                </label>
                <div className="space-y-3">
                    {data.matching_pairs_json.map((pair, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-3 p-3 border border-[#694CFD]/20 rounded-md bg-[#694CFD]/5"
                        >
                            <input
                                type="text"
                                placeholder={`Left item ${index + 1}`}
                                value={pair.left}
                                onChange={e =>
                                    updatePair(index, 'left', e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                            />

                            <ArrowRight className="w-4 h-4 text-[#694CFD]" />

                            <input
                                type="text"
                                placeholder={`Right item ${index + 1}`}
                                value={pair.right}
                                onChange={e =>
                                    updatePair(index, 'right', e.target.value)
                                }
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
                            />

                            {data.matching_pairs_json.length > 2 && (
                                <button
                                    type="button"
                                    onClick={() => removePair(index)}
                                    className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded shrink-0"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={addPair}
                    className="flex items-center gap-2 px-3 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 text-sm"
                >
                    <Plus className="w-4 h-4" />
                    Add Matching Pair
                </button>
            </div>

            {/* Instructions */}
            <div className="text-sm text-slate-600 p-3 bg-[#694CFD]/5 rounded-md border border-[#694CFD]/10">
                <strong className="text-[#694CFD]">Instructions:</strong>{' '}
                Students will match items from the left column with items from
                the right column. Each pair above represents a correct match
                that students need to identify.
            </div>
        </div>
    );
}
