import React, { useState } from 'react';
import { StudentProfile, Goal } from '../types';
import { BookOpen, User, Calendar, Languages, School, Target } from 'lucide-react';

interface Props {
  onComplete: (profile: StudentProfile) => void;
}

export const Onboarding: React.FC<Props> = ({ onComplete }) => {
  const [formData, setFormData] = useState<StudentProfile>({
    name: '',
    classLevel: '',
    subject: '',
    goal: Goal.BASICS,
    language: 'English',
    dailyTime: 30,
  });

  const handleChange = (field: keyof StudentProfile, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.name && formData.subject) {
      // Generate a unique ID for the student for API/Session tracking
      const profileWithId: StudentProfile = {
        ...formData,
        id: crypto.randomUUID()
      };
      onComplete(profileWithId);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-lg mt-10 border border-slate-100">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-slate-800">Student Onboarding</h2>
        <p className="text-slate-500 mt-2">Let's set up your personalized learning agent.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Name */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <User className="w-4 h-4 mr-2 text-indigo-500" />
              Full Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition"
              placeholder="e.g. Aarav Patel"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
            />
          </div>

          {/* Class */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <School className="w-4 h-4 mr-2 text-indigo-500" />
              Class / Grade
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Grade 8"
              value={formData.classLevel}
              onChange={(e) => handleChange('classLevel', e.target.value)}
            />
          </div>

          {/* Subject */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <BookOpen className="w-4 h-4 mr-2 text-indigo-500" />
              Subject
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
            >
              <option value="" disabled>Select a subject</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Science">Science</option>
              <option value="English">English</option>
              <option value="History">History</option>
            </select>
          </div>

          {/* Goal */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <Target className="w-4 h-4 mr-2 text-indigo-500" />
              Primary Goal
            </label>
            <select
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              value={formData.goal}
              onChange={(e) => handleChange('goal', e.target.value as Goal)}
            >
              <option value={Goal.BASICS}>Clear Basics</option>
              <option value={Goal.EXAM}>Ace Exam</option>
              <option value={Goal.JOB}>Job Readiness</option>
            </select>
          </div>

          {/* Language */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <Languages className="w-4 h-4 mr-2 text-indigo-500" />
              Preferred Language
            </label>
            <input
              type="text"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              placeholder="e.g. Hindi, English"
              value={formData.language}
              onChange={(e) => handleChange('language', e.target.value)}
            />
          </div>

          {/* Time */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-medium text-slate-700">
              <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
              Daily Study Time (mins)
            </label>
            <input
              type="number"
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.dailyTime}
              onChange={(e) => handleChange('dailyTime', parseInt(e.target.value))}
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md flex justify-center items-center"
        >
          Initialize Learning Path
        </button>
      </form>
    </div>
  );
};