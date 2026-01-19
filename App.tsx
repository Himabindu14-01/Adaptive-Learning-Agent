import React, { useState, useEffect } from 'react';
import { AppView, StudentProfile, Question, AiAction } from './types';
import { agentService } from './services/geminiService';
import { Onboarding } from './components/Onboarding';
import { TopicSelection } from './components/TopicSelection';
import { QuizExecution } from './components/QuizExecution';
import { Dashboard } from './components/Dashboard';
import { Diagnostic } from './components/Diagnostic';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  // Initialize student from localStorage if available to persist session
  const [student, setStudent] = useState<StudentProfile | null>(() => {
    try {
      const saved = localStorage.getItem('student_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Determine initial view based on whether student is logged in
  const [view, setView] = useState<AppView>(() => {
    return localStorage.getItem('student_profile') ? AppView.TOPIC_SELECT : AppView.ONBOARDING;
  });

  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  
  // App State
  const [currentSubject, setCurrentSubject] = useState<string>('');
  const [currentTopic, setCurrentTopic] = useState<string>('');
  
  // Question States
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [diagnosticQuestions, setDiagnosticQuestions] = useState<Question[]>([]);
  
  const [latestAction, setLatestAction] = useState<AiAction | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Mastery Tracking: { "Topic": score }
  // Simulating fetch from Supabase 'progress' table on initialization
  const [topicMastery, setTopicMastery] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('topic_mastery');
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      return {};
    }
  });

  // 1. Handle Onboarding Submit -> Trigger Diagnostic
  const handleOnboardingComplete = async (profile: StudentProfile) => {
    setStudent(profile);
    
    // Save to localStorage for persistence
    localStorage.setItem('student_profile', JSON.stringify(profile));
    if (profile.id) {
        localStorage.setItem('student_id', profile.id);
    }
    
    setLoading(true);
    setLoadingMsg(`Preparing diagnostic assessment for ${profile.subject}...`);
    
    try {
        const questions = await agentService.generateDiagnostic(profile);
        setDiagnosticQuestions(questions);
        setView(AppView.DIAGNOSTIC);
    } catch (error) {
        console.error("Failed to generate diagnostic", error);
        // Fallback to topic select if diagnostic fails
        setView(AppView.TOPIC_SELECT);
    } finally {
        setLoading(false);
    }
  };

  // 1.5 Handle Diagnostic Complete
  const handleDiagnosticComplete = (answers: number[]) => {
      // Logic to analyze answers could go here to pre-seed mastery
      // For now, we simply move to the learning phase
      setView(AppView.TOPIC_SELECT);
  };

  // 2. Handle Topic Selection
  const handleTopicSelect = async (subject: string, topic: string) => {
    if (!student) return;
    setCurrentSubject(subject);
    setCurrentTopic(topic);
    
    // Determine difficulty based on mastery
    let difficulty: 'Weak' | 'Average' | 'Strong' = 'Average';
    const previousScore = topicMastery[topic];
    
    if (previousScore !== undefined) {
      if (previousScore < 40) difficulty = 'Weak';
      else if (previousScore < 70) difficulty = 'Average';
      else difficulty = 'Strong';
    }

    setLoading(true);
    setLoadingMsg(`Generating ${difficulty.toLowerCase()} quiz for ${topic}...`);
    
    const questions = await agentService.generateQuiz(student, topic, difficulty);
    setQuizQuestions(questions);
    
    setLoading(false);
    setView(AppView.QUIZ);
  };

  // 3. Handle Quiz Completion & Agent Planning
  const handleQuizComplete = async (score: number) => {
    if (!student || !currentTopic) return;
    
    // Update mastery for the current topic and persist (Simulate DB update)
    const newMastery = { ...topicMastery, [currentTopic]: score };
    setTopicMastery(newMastery);
    localStorage.setItem('topic_mastery', JSON.stringify(newMastery));

    // Fetch student ID directly from localStorage to ensure we have the persisted ID
    const storedStudentId = localStorage.getItem('student_id') || student.id;

    // --- MOCK BACKEND SUBMISSION ---
    // Simulating POST /submit-quiz endpoint call
    const quizPayload = {
      student_id: storedStudentId,
      topic: currentTopic,
      score: score,
      timestamp: new Date().toISOString()
    };
    console.log("🚀 [POST /submit-quiz] Sending payload:", quizPayload);
    // -------------------------------

    // OPTIMIZATION: Don't block UI. Determine action immediately.
    const actionType = agentService.determineNextAction(score);
    
    // Create immediate partial action state
    const pendingAction: AiAction = {
      type: actionType,
      topic: currentTopic,
      content: "", 
      timestamp: new Date().toISOString()
    };
    
    setLatestAction(pendingAction);
    setIsActionLoading(true);
    setView(AppView.DASHBOARD);

    // Fetch content in background
    try {
      const data = await agentService.generateActionContent(student, currentTopic, actionType);
      setLatestAction(prev => prev ? { 
        ...prev, 
        content: data.content,
        title: data.title,
        description: data.description
      } : null);
    } catch (e) {
      console.error("Failed to load content", e);
    } finally {
      setIsActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white/90 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-4">
          <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 animate-pulse text-center">{loadingMsg}</h3>
          <p className="text-slate-500 mt-2 text-sm"> AI Agent is working...</p>
        </div>
      )}

      {/* Main Content Router */}
      <main className="container mx-auto">
        {view === AppView.ONBOARDING && (
          <Onboarding onComplete={handleOnboardingComplete} />
        )}
        
        {view === AppView.DIAGNOSTIC && (
          <Diagnostic 
            questions={diagnosticQuestions}
            onSubmit={handleDiagnosticComplete}
          />
        )}

        {view === AppView.TOPIC_SELECT && (
          <TopicSelection 
            onSelect={handleTopicSelect} 
            selectedSubject={student?.subject}
          />
        )}

        {view === AppView.QUIZ && (
          <QuizExecution 
            topic={currentTopic}
            questions={quizQuestions}
            onComplete={handleQuizComplete}
          />
        )}

        {view === AppView.DASHBOARD && student && (
          <Dashboard 
            student={student} 
            latestAction={latestAction} 
            isActionLoading={isActionLoading}
            onNewTopic={() => setView(AppView.TOPIC_SELECT)} 
            topicMastery={topicMastery}
          />
        )}
      </main>
    </div>
  );
};

export default App;