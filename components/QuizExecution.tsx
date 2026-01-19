import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface Props {
  topic: string;
  questions: Question[];
  onComplete: (score: number) => void;
}

export const QuizExecution: React.FC<Props> = ({ topic, questions, onComplete }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);

  const safeQuestions = questions || [];
  const currentQ = safeQuestions[currentIdx];

  const handleConfirm = () => {
    if (selectedOption === null) return;
    
    const isCorrect = selectedOption === currentQ.correctOptionIndex;
    if (isCorrect) setScore(s => s + 1);
    
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setSelectedOption(null);
    if (currentIdx < safeQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    } else {
       // If this was the last question, we need to account for its score which is already in state
       // We calculate the final percentage based on total correct
       onComplete(Math.round((score / safeQuestions.length) * 100));
    }
  };
  
  const handleFinish = () => {
       // Recalculate including the current question logic since state update might be pending in a real queue, 
       // but here we updated 'score' in handleConfirm.
       onComplete(Math.round((score / safeQuestions.length) * 100));
  }

  if (safeQuestions.length === 0) return <div>No questions generated.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Topic: {topic}</h2>
        <span className="text-sm font-medium text-slate-500">Question {currentIdx + 1}/{safeQuestions.length}</span>
      </div>

      <div className="w-full bg-slate-200 rounded-full h-2 mb-8">
        <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentIdx + 1) / safeQuestions.length) * 100}%` }}></div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100 mb-8">
        <p className="text-lg font-medium text-slate-900 mb-6">{currentQ.text}</p>
        
        <div className="space-y-3">
          {currentQ.options.map((opt, idx) => {
            let btnClass = "border-slate-200 hover:bg-slate-50 text-slate-700";
            if (showResult) {
                if (idx === currentQ.correctOptionIndex) btnClass = "bg-green-100 border-green-500 text-green-800";
                else if (idx === selectedOption) btnClass = "bg-red-100 border-red-500 text-red-800";
                else btnClass = "border-slate-100 text-slate-400 opacity-50";
            } else if (selectedOption === idx) {
                btnClass = "bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500";
            }

            return (
              <button
                key={idx}
                onClick={() => !showResult && setSelectedOption(idx)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-lg border transition-all ${btnClass}`}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {showResult && currentQ.explanation && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg text-sm text-slate-600 border border-slate-200">
                <strong>Explanation:</strong> {currentQ.explanation}
            </div>
        )}
      </div>

      <div className="flex justify-end">
        {!showResult ? (
            <button
                onClick={handleConfirm}
                disabled={selectedOption === null}
                className={`px-6 py-3 rounded-lg font-bold transition ${selectedOption !== null ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-200 text-slate-400'}`}
            >
                Check Answer
            </button>
        ) : (
            <button
                onClick={currentIdx === safeQuestions.length - 1 ? handleFinish : handleNext}
                className="px-6 py-3 rounded-lg font-bold bg-indigo-600 text-white hover:bg-indigo-700 flex items-center"
            >
                {currentIdx === safeQuestions.length - 1 ? 'Finish Quiz' : 'Next Question'}
                <CheckCircle2 className="w-5 h-5 ml-2" />
            </button>
        )}
      </div>
    </div>
  );
};
