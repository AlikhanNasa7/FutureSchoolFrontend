import React from 'react';
import { Plus, Trash2, AlertCircle } from 'lucide-react';

interface OpenQuestionData {
  keywords: string[];
  sampleAnswer: string;
}

interface OpenQuestionEditorProps {
  data: OpenQuestionData;
  onChange: (data: OpenQuestionData) => void;
}

export function OpenQuestionEditor({ data, onChange }: OpenQuestionEditorProps) {
  const updateKeyword = (index: number, value: string) => {
    const newKeywords = [...data.keywords];
    newKeywords[index] = value;
    onChange({ ...data, keywords: newKeywords });
  };

  const addKeyword = () => {
    const newKeywords = [...data.keywords, ''];
    onChange({ ...data, keywords: newKeywords });
  };

  const removeKeyword = (index: number) => {
    if (data.keywords.length <= 1) return; // Keep at least 1 keyword
    
    const newKeywords = data.keywords.filter((_, i) => i !== index);
    onChange({ ...data, keywords: newKeywords });
  };

  const updateSampleAnswer = (value: string) => {
    onChange({ ...data, sampleAnswer: value });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-md">
        <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
        <p className="text-sm text-blue-700">
          Keywords are used for automatic grading. Student answers containing these keywords will be marked correct.
        </p>
      </div>

      {/* Keywords Section */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">Keywords for Automatic Grading</label>
        {data.keywords.map((keyword, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              placeholder={`Keyword ${index + 1}`}
              value={keyword}
              onChange={(e) => updateKeyword(index, e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
            />
            {data.keywords.length > 1 && (
              <button
                type="button"
                onClick={() => removeKeyword(index)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
        
        <button
          type="button"
          onClick={addKeyword}
          className="flex items-center gap-2 px-3 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Keyword
        </button>
      </div>

      {/* Sample Answer Section */}
      <div className="space-y-2">
        <label htmlFor="sample-answer" className="block text-sm font-medium text-gray-700">Sample Answer (Optional)</label>
        <textarea
          id="sample-answer"
          placeholder="Provide a sample answer for reference. This helps students understand what kind of response is expected."
          value={data.sampleAnswer}
          onChange={(e) => updateSampleAnswer(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent resize-vertical"
        />
      </div>

      {/* Grading Info */}
      <div className="text-sm text-slate-600 p-3 bg-[#694CFD]/5 rounded-md border border-[#694CFD]/10">
        <strong className="text-[#694CFD]">Automatic Grading:</strong> Student answers will be checked against the keywords above. 
        The system will award full points if the answer contains any of the specified keywords (case-insensitive).
      </div>
    </div>
  );
}