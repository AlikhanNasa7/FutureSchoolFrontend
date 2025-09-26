import React from 'react';
import { Plus, Trash2, ArrowRight } from 'lucide-react';

interface MatchingData {
  leftItems: string[];
  rightItems: string[];
  correctMatches: { left: number; right: number }[];
}

interface MatchingEditorProps {
  data: MatchingData;
  onChange: (data: MatchingData) => void;
}

export function MatchingEditor({ data, onChange }: MatchingEditorProps) {
  const updateLeftItem = (index: number, value: string) => {
    const newLeftItems = [...data.leftItems];
    newLeftItems[index] = value;
    onChange({ ...data, leftItems: newLeftItems });
  };

  const updateRightItem = (index: number, value: string) => {
    const newRightItems = [...data.rightItems];
    newRightItems[index] = value;
    onChange({ ...data, rightItems: newRightItems });
  };

  const addItemPair = () => {
    const newLeftItems = [...data.leftItems, ''];
    const newRightItems = [...data.rightItems, ''];
    const newCorrectMatches = [
      ...data.correctMatches,
      { left: newLeftItems.length - 1, right: newRightItems.length - 1 }
    ];
    
    onChange({
      leftItems: newLeftItems,
      rightItems: newRightItems,
      correctMatches: newCorrectMatches
    });
  };

  const removeItemPair = (index: number) => {
    if (data.leftItems.length <= 2) return; // Keep at least 2 pairs
    
    const newLeftItems = data.leftItems.filter((_, i) => i !== index);
    const newRightItems = data.rightItems.filter((_, i) => i !== index);
    
    // Update correct matches
    let newCorrectMatches = data.correctMatches.filter(match => 
      match.left !== index && match.right !== index
    );
    
    // Adjust indices in remaining matches
    newCorrectMatches = newCorrectMatches.map(match => ({
      left: match.left > index ? match.left - 1 : match.left,
      right: match.right > index ? match.right - 1 : match.right
    }));
    
    onChange({
      leftItems: newLeftItems,
      rightItems: newRightItems,
      correctMatches: newCorrectMatches
    });
  };

  const updateMatch = (matchIndex: number, side: 'left' | 'right', value: number) => {
    const newCorrectMatches = [...data.correctMatches];
    newCorrectMatches[matchIndex] = {
      ...newCorrectMatches[matchIndex],
      [side]: value
    };
    onChange({ ...data, correctMatches: newCorrectMatches });
  };

  const addMatch = () => {
    if (data.correctMatches.length >= Math.min(data.leftItems.length, data.rightItems.length)) {
      return; // Can't have more matches than available items
    }
    
    const newCorrectMatches = [...data.correctMatches, { left: 0, right: 0 }];
    onChange({ ...data, correctMatches: newCorrectMatches });
  };

  const removeMatch = (index: number) => {
    if (data.correctMatches.length <= 1) return; // Keep at least 1 match
    
    const newCorrectMatches = data.correctMatches.filter((_, i) => i !== index);
    onChange({ ...data, correctMatches: newCorrectMatches });
  };

  return (
    <div className="space-y-6">
      {/* Items Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Left Column Items</label>
          {data.leftItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Left item ${index + 1}`}
                value={item}
                onChange={(e) => updateLeftItem(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
              />
              {data.leftItems.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeItemPair(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Right Column Items</label>
          {data.rightItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                type="text"
                placeholder={`Right item ${index + 1}`}
                value={item}
                onChange={(e) => updateRightItem(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={addItemPair}
        className="flex items-center gap-2 px-3 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 text-sm"
      >
        <Plus className="w-4 h-4" />
        Add Item Pair
      </button>

      {/* Correct Matches Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Correct Matches</label>
        <div className="space-y-2">
          {data.correctMatches.map((match, index) => (
            <div key={index} className="flex items-center gap-3 p-3 border border-[#694CFD]/20 rounded-md bg-[#694CFD]/5">
              <select 
                value={match.left} 
                onChange={(e) => updateMatch(index, 'left', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
              >
                {data.leftItems.map((item, idx) => (
                  <option key={idx} value={idx}>
                    {item || `Left item ${idx + 1}`}
                  </option>
                ))}
              </select>

              <ArrowRight className="w-4 h-4 text-[#694CFD]" />

              <select 
                value={match.right} 
                onChange={(e) => updateMatch(index, 'right', parseInt(e.target.value))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
              >
                {data.rightItems.map((item, idx) => (
                  <option key={idx} value={idx}>
                    {item || `Right item ${idx + 1}`}
                  </option>
                ))}
              </select>

              {data.correctMatches.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMatch(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>

        {data.correctMatches.length < Math.min(data.leftItems.length, data.rightItems.length) && (
          <button
            type="button"
            onClick={addMatch}
            className="flex items-center gap-2 px-3 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Match
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="text-sm text-slate-600 p-3 bg-[#694CFD]/5 rounded-md border border-[#694CFD]/10">
        <strong className="text-[#694CFD]">Instructions:</strong> Students will drag items from the left column to match with items in the right column. 
        Define the correct matches above - students need to match all pairs correctly to get full points.
      </div>
    </div>
  );
}