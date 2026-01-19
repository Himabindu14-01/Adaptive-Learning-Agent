import React, { useState } from 'react';
import { AVAILABLE_SUBJECTS } from '../types';
import { Book, ChevronRight } from 'lucide-react';

interface Props {
  onSelect: (subject: string, topic: string) => void;
  selectedSubject?: string;
}

export const TopicSelection: React.FC<Props> = ({ onSelect, selectedSubject: initialSubject }) => {
  const [subject, setSubject] = useState<string>(initialSubject || Object.keys(AVAILABLE_SUBJECTS)[0]);
  const [topic, setTopic] = useState<string>('');

  const handleStart = () => {
    if (subject && topic) {
      onSelect(subject, topic);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg border border-slate-100 mt-10">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
          <Book className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-800">What do you want to learn today?</h2>
        <p className="text-slate-500">Select a subject and a topic to start.</p>
      </div>

      <div className="space-y-6">
        {/* Subject Selection */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Subject</label>
          <div className="grid grid-cols-3 gap-3">
            {Object.keys(AVAILABLE_SUBJECTS).map((sub) => (
              <button
                key={sub}
                onClick={() => { setSubject(sub); setTopic(''); }}
                className={`py-3 px-4 rounded-lg border text-sm font-medium transition-all ${
                  subject === sub
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>
        </div>

        {/* Topic Selection */}
        {subject && (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300">
            <label className="block text-sm font-medium text-slate-700 mb-2">Topic in {subject}</label>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            >
              <option value="" disabled>Choose a topic...</option>
              {AVAILABLE_SUBJECTS[subject as keyof typeof AVAILABLE_SUBJECTS].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={handleStart}
          disabled={!topic}
          className={`w-full mt-4 py-3 rounded-lg font-bold flex items-center justify-center space-x-2 transition ${
            topic
              ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg transform hover:-translate-y-0.5'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          <span>Start Learning</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
