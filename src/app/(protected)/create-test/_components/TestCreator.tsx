'use client';
import React, { useState } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import { QuestionEditor } from './QuestionEditor';

export interface Question {
  id: string;
  type: 'multiple-choice' | 'open' | 'matching';
  title: string;
  points: number;
  data: any;
}

export interface Test {
  title: string;
  description: string;
  openingDate: string;
  deadline: string;
  questions: Question[];
}

export default function TestCreator() {
  const [test, setTest] = useState<Test>({
    title: '',
    description: '',
    openingDate: '',
    deadline: '',
    questions: []
  });

  const addQuestion = (type: Question['type']) => {
    const newQuestion: Question = {
      id: Date.now().toString(),
      type,
      title: '',
      points: 1,
      data: getDefaultQuestionData(type)
    };
    
    setTest(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const getDefaultQuestionData = (type: Question['type']) => {
    switch (type) {
      case 'multiple-choice':
        return {
          options: ['', '', '', ''],
          correctAnswer: 0
        };
      case 'open':
        return {
          keywords: [''],
          sampleAnswer: ''
        };
      case 'matching':
        return {
          leftItems: ['', ''],
          rightItems: ['', ''],
          correctMatches: [{ left: 0, right: 0 }]
        };
      default:
        return {};
    }
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions.map(q => 
        q.id === questionId ? { ...q, ...updates } : q
      )
    }));
  };

  const removeQuestion = (questionId: string) => {
    setTest(prev => ({
      ...prev,
      questions: prev.questions.filter(q => q.id !== questionId)
    }));
  };

  const handleTestUpdate = (field: keyof Test, value: string) => {
    setTest(prev => ({ ...prev, [field]: value }));
  };

  const saveTest = () => {
    // Here you would typically save to a database
    console.log('Saving test:', test);
    alert('Test saved successfully!');
  };

  const getTotalPoints = () => {
    return test.questions.reduce((total, question) => total + question.points, 0);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="border border-[#694CFD]/20 shadow-lg shadow-[#694CFD]/5 bg-white rounded-lg">
        <div className="bg-gradient-to-r from-[#694CFD]/5 to-[#694CFD]/10 border-b border-[#694CFD]/20 p-6 rounded-t-lg">
          <h2 className="flex items-center gap-2 text-[#694CFD] font-semibold text-xl">
            <Calendar className="w-5 h-5" />
            Test Information
          </h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Test Title</label>
              <input
                id="title"
                type="text"
                placeholder="Enter test title"
                value={test.title}
                onChange={(e) => handleTestUpdate('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="total-points" className="block text-sm font-medium text-gray-700">Total Points</label>
              <input
                id="total-points"
                type="number"
                value={getTotalPoints()}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="opening-date" className="block text-sm font-medium text-gray-700">Opening Date</label>
              <input
                id="opening-date"
                type="datetime-local"
                value={test.openingDate}
                onChange={(e) => handleTestUpdate('openingDate', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
              <input
                id="deadline"
                type="datetime-local"
                value={test.deadline}
                onChange={(e) => handleTestUpdate('deadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              placeholder="Enter test description and instructions"
              value={test.description}
              onChange={(e) => handleTestUpdate('description', e.target.value)}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#694CFD] focus:border-transparent resize-vertical"
            />
          </div>
        </div>
      </div>

      <div className="border border-[#694CFD]/20 shadow-lg shadow-[#694CFD]/5 bg-white rounded-lg">
        <div className="bg-gradient-to-r from-[#694CFD]/5 to-[#694CFD]/10 border-b border-[#694CFD]/20 p-6 rounded-t-lg">
          <h2 className="text-[#694CFD] font-semibold text-xl">Questions ({test.questions.length})</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button 
              onClick={() => addQuestion('multiple-choice')}
              className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Multiple Choice
            </button>
            <button 
              onClick={() => addQuestion('open')}
              className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Open Question
            </button>
            <button 
              onClick={() => addQuestion('matching')}
              className="flex items-center gap-2 px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 hover:border-[#694CFD]/50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Matching
            </button>
          </div>

          <div className="space-y-4">
            {test.questions.map((question, index) => (
              <div key={question.id} className="border-l-4 border-l-[#694CFD] shadow-md hover:shadow-lg transition-shadow bg-white rounded-lg border border-gray-200">
                <div className="bg-gradient-to-r from-[#694CFD]/5 to-transparent p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#694CFD] font-semibold">
                        Question {index + 1}
                      </span>
                      <span className="px-2 py-1 bg-[#694CFD]/10 text-[#694CFD] rounded text-xs capitalize border border-[#694CFD]/20 font-medium">
                        {question.type.replace('-', ' ')}
                      </span>
                    </div>
                    <button
                      onClick={() => removeQuestion(question.id)}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <QuestionEditor
                    question={question}
                    onUpdate={(updates) => updateQuestion(question.id, updates)}
                  />
                </div>
              </div>
            ))}
          </div>

          {test.questions.length === 0 && (
            <div className="text-center py-8 text-slate-500">
              <p>No questions added yet. Click the buttons above to add questions.</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <button className="px-4 py-2 border border-[#694CFD]/30 text-[#694CFD] rounded-md hover:bg-[#694CFD]/10 transition-colors">
          Save as Draft
        </button>
        <button 
          onClick={saveTest} 
          className="px-4 py-2 bg-gradient-to-r from-[#694CFD] to-[#694CFD]/90 hover:from-[#694CFD]/90 hover:to-[#694CFD] shadow-lg shadow-[#694CFD]/25 text-white rounded-md transition-all"
        >
          Publish Test
        </button>
      </div>
    </div>
  );
}