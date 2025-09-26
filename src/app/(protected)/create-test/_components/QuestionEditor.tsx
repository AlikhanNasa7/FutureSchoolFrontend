import React from 'react';
import { Question } from './TestCreator';
import { MultipleChoiceEditor } from './MultipleChoiceEditor';
import { OpenQuestionEditor } from './OpenQuestionEditor';
import { MatchingEditor } from './MatchingEditor';

interface QuestionEditorProps {
  question: Question;
  onUpdate: (updates: Partial<Question>) => void;
}

export function QuestionEditor({ question, onUpdate }: QuestionEditorProps) {
  const handleTitleChange = (title: string) => {
    onUpdate({ title });
  };

  const handlePointsChange = (points: number) => {
    onUpdate({ points });
  };

  const handleDataChange = (data: any) => {
    onUpdate({ data });
  };

  return (
    <div className="space-y-4">
      {/* Question Title and Points */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2 md:col-span-3">
          <label htmlFor={`question-title-${question.id}`} className="block text-sm font-medium text-gray-700">Question Text</label>
          <input
            id={`question-title-${question.id}`}
            type="text"
            placeholder="Enter your question here"
            value={question.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
          />
        </div>
        <div className="space-y-2">
          <label htmlFor={`question-points-${question.id}`} className="block text-sm font-medium text-gray-700">Points</label>
          <input
            id={`question-points-${question.id}`}
            type="number"
            min="1"
            max="100"
            value={question.points}
            onChange={(e) => handlePointsChange(parseInt(e.target.value) || 1)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
          />
        </div>
      </div>

      {/* Question Type Specific Editor */}
      {question.type === 'multiple-choice' && (
        <MultipleChoiceEditor
          data={question.data}
          onChange={handleDataChange}
        />
      )}

      {question.type === 'open' && (
        <OpenQuestionEditor
          data={question.data}
          onChange={handleDataChange}
        />
      )}

      {question.type === 'matching' && (
        <MatchingEditor
          data={question.data}
          onChange={handleDataChange}
        />
      )}
    </div>
  );
}