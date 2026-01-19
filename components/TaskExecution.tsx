import React, { useState } from 'react';
import { Task } from '../types';
import ReactMarkdown from 'react-markdown';
import { ArrowLeft, Check, Send } from 'lucide-react';

interface Props {
  task: Task;
  onComplete: (answers: number[]) => void;
  onBack: () => void;
}

export const TaskExecution: React.FC<Props> = ({ task, onComplete, onBack }) => {
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [view, setView] = useState<'content' | 'questions'>('content');

  // Handle answers
  const handleAnswer = (optionIdx: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIdx] = optionIdx;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (!task.questions) return;
    if (currentQuestionIdx < task.questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    } else {
      onComplete(answers);
    }
  };

  const startQuestions = () => {
    if (!task.questions || task.questions.length === 0) {
      onComplete([]); // Lesson only
    } else {
      setView('questions');
    }
  };

  const currentQuestion = task.questions?.[currentQuestionIdx];
  const options = currentQuestion?.options || [];

  return (
    <div className="max-w-4xl mx-auto p-6 min-h-screen bg-white shadow-sm border-x border-slate-100">
      <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-indigo-600 transition">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
      </button>

      {view === 'content' && (
        <div className="prose prose-slate max-w-none lg:prose-lg">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">{task.title}</h1>
          <p className="text-xl text-slate-500 mb-8 font-light">{task.description}</p>
          
          <div className="bg-slate-50 p-8 rounded-2xl border border-slate-100 mb-8">
            <ReactMarkdown>{task.content}</ReactMarkdown>
          </div>

          <div className="flex justify-end">
            <button
              onClick={startQuestions}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold shadow-md flex items-center"
            >
              <span>{task.questions && task.questions.length > 0 ? 'Start Exercises' : 'Complete Lesson'}</span>
              <Check className="w-5 h-5 ml-2" />
            </button>
          </div>
        </div>
      )}

      {view === 'questions' && currentQuestion && (
        <div className="max-w-2xl mx-auto mt-12">
           <div className="mb-6 flex justify-between items-center text-sm text-slate-400">
               <span>Question {currentQuestionIdx + 1} of {task.questions!.length}</span>
               <div className="w-32 h-2 bg-slate-100 rounded-full overflow-hidden">
                   <div 
                      className="h-full bg-indigo-500 transition-all duration-300" 
                      style={{ width: `${((currentQuestionIdx + 1) / task.questions!.length) * 100}%` }}
                   />
               </div>
           </div>

           <div className="bg-white rounded-xl">
               <h3 className="text-xl font-medium text-slate-900 mb-6 leading-relaxed">
                   {currentQuestion.text}
               </h3>
               
               <div className="space-y-3">
                   {options.map((opt, idx) => (
                       <button
                          key={idx}
                          onClick={() => handleAnswer(idx)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                              answers[currentQuestionIdx] === idx
                              ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-500'
                              : 'border-slate-200 hover:border-indigo-300 text-slate-700'
                          }`}
                       >
                           {opt}
                       </button>
                   ))}
               </div>

               <div className="mt-8 flex justify-end">
                   <button
                       onClick={handleNext}
                       disabled={answers[currentQuestionIdx] === undefined}
                       className={`px-6 py-3 rounded-lg font-semibold flex items-center ${
                           answers[currentQuestionIdx] !== undefined
                           ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md'
                           : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                       }`}
                   >
                       {currentQuestionIdx === (task.questions?.length || 0) - 1 ? 'Submit Assignment' : 'Next Question'}
                       <Send className="w-4 h-4 ml-2" />
                   </button>
               </div>
           </div>
        </div>
      )}
    </div>
  );
};