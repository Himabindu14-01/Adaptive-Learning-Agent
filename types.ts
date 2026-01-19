export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DIAGNOSTIC = 'DIAGNOSTIC',
  TOPIC_SELECT = 'TOPIC_SELECT',
  QUIZ = 'QUIZ',
  DASHBOARD = 'DASHBOARD',
}

export enum ActionType {
  REMEDIAL = 'REMEDIAL',
  PRACTICE = 'PRACTICE',
  ADVANCE = 'ADVANCE',
}

export enum Goal {
  BASICS = 'BASICS',
  EXAM = 'EXAM',
  JOB = 'JOB',
}

export interface StudentProfile {
  id?: string;
  name: string;
  classLevel: string;
  subject: string;
  goal: Goal | string;
  language: string;
  dailyTime?: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctOptionIndex: number;
  explanation?: string;
}

export interface Task {
  id?: string;
  title: string;
  description: string;
  content: string;
  questions?: Question[];
}

export interface AiAction {
  type: ActionType;
  topic: string;
  title?: string;
  description?: string;
  content: string; // The explanation or task description
  timestamp: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export const AVAILABLE_SUBJECTS = {
  "Mathematics": ["Number System", "Fractions", "Algebra", "Geometry"],
  "Science": ["Living World", "Matter", "Force & Motion", "Light"],
  "English": ["Grammar", "Vocabulary", "Reading Comprehension", "Writing"]
};