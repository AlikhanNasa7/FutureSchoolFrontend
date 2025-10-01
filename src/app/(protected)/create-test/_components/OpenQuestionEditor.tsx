import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface OpenQuestionData {
  correct_answer_text: string;
}

interface OpenQuestionEditorProps {
  data: OpenQuestionData;
  onChange: (data: OpenQuestionData) => void;
  questionId: string;
}

export function OpenQuestionEditor({ data, onChange, questionId }: OpenQuestionEditorProps) {
  const updateCorrectAnswer = (value: string) => {
    onChange({ ...data, correct_answer_text: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Provide the correct answer text for this open question. This will be used for manual grading.
        </p>
      </div>

      {/* Correct Answer Section */}
      <div className="space-y-2">
        <label htmlFor={`correct-answer-${questionId}`} className="block text-sm font-medium text-gray-700">Correct Answer</label>
        <textarea
          id={`correct-answer-${questionId}`}
          placeholder="Enter the correct answer for this question..."
          value={data.correct_answer_text}
          onChange={(e) => updateCorrectAnswer(e.target.value)}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent resize-vertical"
        />
      </div>

      {/* Grading Info */}
      <div className="text-sm text-slate-600 p-3 bg-[#694CFD]/5 rounded-md border border-[#694CFD]/10">
        <strong className="text-[#694CFD]">Manual Grading:</strong> This question will require manual grading. 
        The correct answer provided above will be used as a reference for grading student responses.
      </div>
    </div>
  );
}