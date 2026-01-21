import React, { useState, useRef, useEffect } from 'react';
import { StudentProfile, AiAction, ActionType, ChatMessage, AVAILABLE_SUBJECTS } from '../types';
import { agentService } from '../services/geminiService';
import { generateProjectReport } from '../services/pdfGenerator';
import { BookOpen, MessageCircle, Send, X, AlertTriangle, CheckCircle, ArrowRight, User, Bot, Loader2, Trophy, BarChart3, FileText, Download } from 'lucide-react';

interface Props {
  student: StudentProfile;
  latestAction: AiAction | null;
  isActionLoading?: boolean;
  onNewTopic: () => void;
  topicMastery: Record<string, number>;
}

export const Dashboard: React.FC<Props> = ({ student, latestAction, isActionLoading = false, onNewTopic, topicMastery }) => {
  const [chatOpen, setChatOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([{ role: 'model', text: `Namaste ${student.name}! I am your AI tutor. Ask me anything about ${student.subject}.` }]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, chatOpen]);

  const handleChatSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = { role: 'user', text: chatInput };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setSending(true);

    const responseText = await agentService.chatWithTutor(student, [...chatHistory, userMsg], userMsg.text, latestAction?.topic || student.subject);
    
    setChatHistory(prev => [...prev, { role: 'model', text: responseText }]);
    setSending(false);
  };

  const getActionColor = (type?: ActionType) => {
    switch (type) {
      case ActionType.REMEDIAL: return 'bg-red-50 border-red-200 text-red-800';
      case ActionType.PRACTICE: return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case ActionType.ADVANCE: return 'bg-green-50 border-green-200 text-green-800';
      default: return 'bg-slate-50 border-slate-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-500';
    if (score >= 50) return 'text-yellow-600 bg-yellow-500';
    return 'text-red-600 bg-red-500';
  };

  // Group mastery data by subject
  const progressBySubject = Object.entries(AVAILABLE_SUBJECTS).reduce((acc, [subject, topics]) => {
    const subjectProgress = topics
      .filter(topic => topicMastery[topic] !== undefined)
      .map(topic => ({ topic, score: topicMastery[topic] }));
    
    if (subjectProgress.length > 0) {
      acc[subject] = subjectProgress;
    }
    return acc;
  }, {} as Record<string, { topic: string; score: number }[]>);

  // Catch-all for topics not in standard list
  const knownTopics = new Set(Object.values(AVAILABLE_SUBJECTS).flat());
  const otherTopics = Object.entries(topicMastery)
    .filter(([topic]) => !knownTopics.has(topic))
    .map(([topic, score]) => ({ topic, score: score as number }));

  if (otherTopics.length > 0) {
    progressBySubject['Other'] = otherTopics;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24 grid grid-cols-1 lg:grid-cols-3 gap-8">
      
      {/* LEFT COLUMN: Main Agent Interaction */}
      <div className="lg:col-span-2 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Namaste, {student.name} 🙏</h1>
            <p className="text-slate-500">Class {student.classLevel} • {student.goal}</p>
          </div>
          <div className="flex space-x-2">
             <button 
                onClick={generateProjectReport} 
                className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-sm font-semibold shadow-sm hover:bg-slate-50 transition flex items-center"
                title="Download Project Report PDF"
             >
                <FileText className="w-4 h-4 mr-2 text-red-500" /> Report
             </button>
             <button onClick={onNewTopic} className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow hover:bg-indigo-700 transition flex items-center">
                <BookOpen className="w-4 h-4 mr-2" /> Select New Topic
             </button>
          </div>
        </div>

        {latestAction ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              {/* AI Decision Card */}
              <div className={`p-6 rounded-xl border-2 shadow-sm ${getActionColor(latestAction.type)}`}>
                <div className="flex items-center space-x-2 mb-4">
                    {latestAction.type === ActionType.REMEDIAL && <AlertTriangle className="w-6 h-6 text-red-600" />}
                    {latestAction.type === ActionType.PRACTICE && <BookOpen className="w-6 h-6 text-yellow-600" />}
                    {latestAction.type === ActionType.ADVANCE && <CheckCircle className="w-6 h-6 text-green-600" />}
                    <h2 className="text-xl font-bold uppercase tracking-wide">{latestAction.type} Recommendation</h2>
                </div>
                
                <div className="bg-white/80 p-6 rounded-lg backdrop-blur-sm border border-black/5 shadow-inner min-h-[150px]">
                    <div className="mb-4">
                        <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Topic: {latestAction.topic}</span>
                        {latestAction.title && <h3 className="font-bold text-xl text-slate-900 leading-tight mt-1">{latestAction.title}</h3>}
                        {latestAction.description && <p className="text-sm text-slate-600 mt-1">{latestAction.description}</p>}
                    </div>
                    
                    {isActionLoading || !latestAction.content ? (
                      <div className="space-y-3 mt-4 animate-pulse">
                        <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                        <div className="h-4 bg-slate-200 rounded w-full"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                        <div className="flex items-center text-indigo-600 text-sm mt-2">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating personalized study plan...
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm prose-slate max-w-none text-slate-700 animate-in fade-in duration-500 border-t border-slate-200 pt-4 mt-4">
                          <p className="whitespace-pre-wrap">{latestAction.content}</p>
                      </div>
                    )}
                </div>

                <div className="mt-6 flex justify-end">
                    <button onClick={onNewTopic} className="flex items-center text-sm font-bold opacity-70 hover:opacity-100 transition">
                      Continue Learning <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                </div>
              </div>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-300">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No recent activity.</p>
              <button onClick={onNewTopic} className="mt-4 text-indigo-600 font-bold hover:underline">Select a topic to start</button>
          </div>
        )}
      </div>

      {/* RIGHT COLUMN: Progress & Stats */}
      <div className="lg:col-span-1 space-y-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex items-center space-x-2 mb-6 border-b border-slate-100 pb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-slate-800">Learning Progress</h2>
          </div>

          {Object.keys(progressBySubject).length === 0 ? (
            <div className="text-center py-8 text-slate-400">
              <BarChart3 className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Complete a quiz to see your progress here.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(progressBySubject).map(([subject, items]) => (
                <div key={subject}>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{subject}</h3>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div key={item.topic}>
                        <div className="flex justify-between items-end mb-1">
                          <span className="text-sm font-medium text-slate-700">{item.topic}</span>
                          <span className={`text-xs font-bold ${getScoreColor(item.score).split(' ')[0]}`}>{item.score}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${getScoreColor(item.score).split(' ')[1]}`} 
                            style={{ width: `${item.score}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setChatOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 transition-transform transform hover:scale-105 z-40 flex items-center space-x-2"
      >
        <MessageCircle className="w-6 h-6" />
        <span className="font-bold pr-1 hidden md:inline">AI Tutor</span>
      </button>

      {/* Chat Modal */}
      {chatOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-end sm:justify-center pointer-events-none p-4 sm:p-0">
           {/* Backdrop */}
           <div className="absolute inset-0 bg-black/20 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={() => setChatOpen(false)} />
           
           {/* Chat Box */}
           <div className="pointer-events-auto bg-white w-full sm:w-[400px] sm:h-[600px] h-[80vh] rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in slide-in-from-bottom-10 duration-300">
              
              {/* Header */}
              <div className="bg-indigo-600 p-4 text-white flex justify-between items-center shadow-md z-10">
                <div className="flex items-center">
                  <div className="bg-white/20 p-2 rounded-full mr-3">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold">AI Tutor</h3>
                    <p className="text-xs text-indigo-100 opacity-90">Always here to help</p>
                  </div>
                </div>
                <button onClick={() => setChatOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                     <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                       msg.role === 'user' 
                       ? 'bg-indigo-600 text-white rounded-br-none' 
                       : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-sm'
                     }`}>
                        {msg.text}
                     </div>
                  </div>
                ))}
                {sending && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-slate-200 shadow-sm flex space-x-1 items-center">
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Input */}
              <form onSubmit={handleChatSend} className="p-4 bg-white border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-slate-100 border-0 rounded-full px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || sending}
                    className="bg-indigo-600 text-white p-3 rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition shadow-md"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};