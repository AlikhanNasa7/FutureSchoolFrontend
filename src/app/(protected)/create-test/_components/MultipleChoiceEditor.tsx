import React from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface MultipleChoiceData {
  options: string[];
  correctAnswer: number;
}

interface MultipleChoiceEditorProps {
  data: MultipleChoiceData;
  onChange: (data: MultipleChoiceData) => void;
}

export function MultipleChoiceEditor({ data, onChange }: MultipleChoiceEditorProps) {
  const updateOption = (index: number, value: string) => {
    const newOptions = [...data.options];
    newOptions[index] = value;
    onChange({ ...data, options: newOptions });
  };

  const addOption = () => {
    const newOptions = [...data.options, ''];
    onChange({ ...data, options: newOptions });
  };

  const removeOption = (index: number) => {
    if (data.options.length <= 2) return; // Keep at least 2 options
    
    const newOptions = data.options.filter((_, i) => i !== index);
    let newCorrectAnswer = data.correctAnswer;
    
    // Adjust correct answer if needed
    if (data.correctAnswer === index) {
      newCorrectAnswer = 0; // Reset to first option
    } else if (data.correctAnswer > index) {
      newCorrectAnswer = data.correctAnswer - 1;
    }
    
    onChange({ 
      options: newOptions, 
      correctAnswer: newCorrectAnswer 
    });
  };

  const setCorrectAnswer = (index: number) => {
    onChange({ ...data, correctAnswer: index });
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Answer Options</label>
      
      <div className="space-y-3">
        {data.options.map((option, index) => (
          <div key={index} className="flex items-center gap-3">
            <input
              type="radio"
              id={`option-${index}`}
              name="correct-answer"
              checked={data.correctAnswer === index}
              onChange={() => setCorrectAnswer(index)}
              className="w-4 h-4 text-[#694CFD] border-gray-300 focus:ring-[#694CFD] shrink-0"
            />
            <div className="flex-1 flex items-center gap-2">
              <label htmlFor={`option-${index}`} className="sr-only">
                Option {index + 1}
              </label>
              <input
                type="text"
                placeholder={`Option ${index + 1}`}
                value={option}
                onChange={(e) => updateOption(index, e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
              />
              {data.options.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeOption(index)}
                  className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={addOption}
          className="flex items-center gap-2 px-3 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Option
        </button>
        <span className="text-sm text-slate-600">
          Select the correct answer by clicking the radio button
        </span>
      </div>
    </div>
  );
}