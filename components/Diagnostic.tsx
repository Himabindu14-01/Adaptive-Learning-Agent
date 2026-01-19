import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  questions: Question[];
  onSubmit: (answers: number[]) => void;
}

export const Diagnostic: React.FC<Props> = ({ questions, onSubmit }) => {
  const safeQuestions = questions || [];
  const [answers, setAnswers] = useState<number[]>(new Array(safeQuestions.length).fill(-1));

  const handleSelect = (qIndex: number, optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[qIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const isComplete = safeQuestions.length > 0 && answers.every(a => a !== -1);

  if (safeQuestions.length === 0) {
      return (
          <div className="text-center p-10 text-slate-500">
              No diagnostic questions available. Please try again.
          </div>
      )
  }

  return (
    <div className="max-w-3xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Diagnostic Assessment</h2>
        <p className="text-slate-600">The agent needs to determine your starting level.</p>
      </div>

      <div className="space-y-6">
        {safeQuestions.map((q, idx) => (
          <div key={q.id || idx} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <p className="text-lg font-medium text-slate-900 mb-4">
              <span className="text-slate-400 mr-2">{idx + 1}.</span> {q.text}
            </p>
            <div className="space-y-3">
              {(q.options || []).map((option, optIdx) => (
                <button
                  key={optIdx}
                  onClick={() => handleSelect(idx, optIdx)}
                  className={`w-full text-left px-4 py-3 rounded-lg border transition-all ${
                    answers[idx] === optIdx
                      ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500'
                      : 'bg-white border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border mr-3 flex items-center justify-center ${
                       answers[idx] === optIdx ? 'border-indigo-500' : 'border-slate-300'
                    }`}>
                      {answers[idx] === optIdx && <div className="w-2 h-2 rounded-full bg-indigo-500" />}
                    </div>
                    {option}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={() => onSubmit(answers)}
        disabled={!isComplete}
        className={`w-full mt-8 py-3 rounded-lg font-semibold flex items-center justify-center space-x-2 transition ${
          isComplete
            ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
        }`}
      >
        <span>Submit Assessment</span>
        <CheckCircle2 className="w-5 h-5" />
      </button>
    </div>
  );
};