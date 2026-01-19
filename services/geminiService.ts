import { GoogleGenAI, Type } from "@google/genai";
import { StudentProfile, Question, ActionType, ChatMessage } from "../types";

// Ensure the key exists or fallback to empty string to prevent runtime crash before valid check
const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });
const MODEL_NAME = 'gemini-3-flash-preview'; 

export class AgentService {
  
  private cleanAndParseJSON(text: string | undefined): any {
    if (!text) return [];
    try {
      // 1. Remove markdown code blocks if present
      const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      return JSON.parse(cleanText);
    } catch (e) {
      console.error("Failed to parse JSON response:", text?.substring(0, 200) + "...", e);
      return [];
    }
  }

  private getSystemInstruction(profile: StudentProfile): string {
    return `
      You are an expert AI tutor for K-12 students in India.
      Student: ${profile.name}, Class: ${profile.classLevel}, Subject: ${profile.subject}.
      
      Your Goal: Create high-quality, error-free educational content.
      Tone: Encouraging, simple, and practical.
      Context: Use relatable examples from rural India (e.g., agriculture, village life, local markets, cricket, festivals).
    `;
  }

  // 1. GENERATE ADAPTIVE QUIZ
  async generateQuiz(profile: StudentProfile, topic: string, level: 'Weak' | 'Average' | 'Strong'): Promise<Question[]> {
    const difficultyDesc = level === 'Weak' ? 'beginner (focus on basics)' 
                         : level === 'Average' ? 'intermediate (application based)' 
                         : 'advanced (critical thinking)';

    const prompt = `
      Topic: ${topic}
      Difficulty: ${difficultyDesc}
      
      Generate 5 high-quality multiple-choice questions.
      
      Requirements:
      1. Questions must be conceptually accurate and clear.
      2. Options must be distinct and plausible.
      3. Explanations should be helpful and educational.
      4. Avoid repetition.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: this.getSystemInstruction(profile),
          responseMimeType: "application/json",
          temperature: 0.3, 
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOptionIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["id", "text", "options", "correctOptionIndex", "explanation"]
            },
          },
        },
      });
      
      const json = this.cleanAndParseJSON(response.text);
      
      if (!Array.isArray(json) || json.length === 0) {
         throw new Error("Invalid quiz format received");
      }
      
      return json.map((q: any, i: number) => ({
        id: q.id || `q-${Date.now()}-${i}`,
        text: q.text || "Question unavailable",
        options: Array.isArray(q.options) ? q.options : ["Yes", "No"],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
        explanation: q.explanation || "No explanation provided."
      }));
    } catch (e) {
      console.error("Quiz generation failed", e);
      return [
        { 
          id: "err1", 
          text: "We couldn't load the questions right now. Please try reloading.", 
          options: ["Retry"], 
          correctOptionIndex: 0, 
          explanation: "Network or parsing error." 
        }
      ];
    }
  }

  // 1.5 GENERATE DIAGNOSTIC ASSESSMENT
  async generateDiagnostic(profile: StudentProfile): Promise<Question[]> {
    const prompt = `
      Subject: ${profile.subject}
      Class: ${profile.classLevel}
      
      Generate 5 diagnostic questions to assess proficiency.
      Difficulty: Mixed (Easy to Hard).
      
      Requirements:
      1. Use practical, real-world scenarios.
      2. Ensure clear wording suited for the class level.
      3. Focus on core concepts of the subject.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: this.getSystemInstruction(profile),
          responseMimeType: "application/json",
          temperature: 0.3, 
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                text: { type: Type.STRING },
                options: { type: Type.ARRAY, items: { type: Type.STRING } },
                correctOptionIndex: { type: Type.INTEGER },
                explanation: { type: Type.STRING }
              },
              required: ["id", "text", "options", "correctOptionIndex", "explanation"]
            },
          },
        },
      });

      const json = this.cleanAndParseJSON(response.text);
      if (!Array.isArray(json) || json.length === 0) throw new Error("Invalid diagnostic format");

      return json.map((q: any, i: number) => ({
        id: q.id || `d-${Date.now()}-${i}`,
        text: q.text || "Question unavailable",
        options: Array.isArray(q.options) ? q.options : ["Option A", "Option B"],
        correctOptionIndex: typeof q.correctOptionIndex === 'number' ? q.correctOptionIndex : 0,
        explanation: q.explanation || ""
      }));

    } catch (e) {
      console.error("Diagnostic generation failed", e);
      return [
        { 
          id: "d_err", 
          text: "Could not load diagnostic. Please select a topic manually.", 
          options: ["Go to Dashboard"], 
          correctOptionIndex: 0 
        }
      ];
    }
  }

  // 2. DECIDE NEXT ACTION (Planner)
  determineNextAction(score: number): ActionType {
    if (score < 40) return ActionType.REMEDIAL;
    if (score >= 40 && score < 70) return ActionType.PRACTICE;
    return ActionType.ADVANCE;
  }

  // 3. GENERATE REMEDIAL/PRACTICE CONTENT
  async generateActionContent(profile: StudentProfile, topic: string, action: ActionType): Promise<{title: string, description: string, content: string}> {
    const prompt = `
      Topic: "${topic}"
      Action Plan: ${action}
      
      Create a structured learning task.
      
      Requirements:
      1. Title: Short, catchy title for the task (max 5 words).
      2. Description: A single sentence summary of what the student will learn.
      3. Content: The detailed advice, explanation, or activity (max 80 words).
      
      Context: Rural India.
    `;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: this.getSystemInstruction(profile),
          responseMimeType: "application/json",
          temperature: 0.4,
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["title", "description", "content"]
          }
        },
      });
      
      const json = this.cleanAndParseJSON(response.text);
      if (json && json.content) {
          return {
              title: json.title || "Learning Task",
              description: json.description || "Review this topic.",
              content: json.content
          };
      }
      throw new Error("Invalid format");
    } catch (e) {
      console.error("Action content generation failed", e);
      return {
          title: "Next Steps",
          description: "Continue your learning journey.",
          content: "We encountered an issue loading the personalized content. Please try reviewing the topic again."
      };
    }
  }

  // 4. CHAT TUTOR
  async chatWithTutor(profile: StudentProfile, history: ChatMessage[], message: string, topic: string): Promise<string> {
    const prompt = `
      Topic: ${topic}
      Student Question: "${message}"
      
      Provide a helpful, direct answer (max 3 sentences). 
      Use a rural India context if helpful for explanation.
    `;

    try {
       const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction: this.getSystemInstruction(profile),
        },
      });
      return response.text || "I didn't quite get that. Could you rephrase?";
    } catch (e) {
      return "Network error. Please try again.";
    }
  }
}

export const agentService = new AgentService();
