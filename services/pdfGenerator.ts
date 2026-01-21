import jsPDF from 'jspdf';

export const generateProjectReport = () => {
  const doc = new jsPDF();
  let y = 20; // Vertical cursor position
  const leftMargin = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxLineWidth = pageWidth - (leftMargin * 2);

  // Helper function to add text and advance cursor
  const addText = (text: string, fontSize: number, fontType: string = 'normal', align: 'left' | 'center' = 'left', spacing: number = 7) => {
    doc.setFont("helvetica", fontType);
    doc.setFontSize(fontSize);

    if (align === 'center') {
      doc.text(text, pageWidth / 2, y, { align: 'center' });
    } else {
      const splitText = doc.splitTextToSize(text, maxLineWidth);
      doc.text(splitText, leftMargin, y);
      // specific adjustment for multi-line text
      if (Array.isArray(splitText) && splitText.length > 1) {
         y += (splitText.length - 1) * (fontSize / 2); 
      }
    }
    y += spacing;
    checkPageBreak();
  };

  const checkPageBreak = () => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
  };

  // --- COVER PAGE SECTION ---
  
  // Header
  addText("AI-ML Project Report", 16, "bold", "center", 15);
  
  // Team Info
  addText("Presented By: [Insert Team Name]", 12, "normal", "left", 10);
  addText("Group Members:", 12, "bold", "left", 8);
  addText("1. [Member Name 1]", 12, "normal", "left", 6);
  addText("2. [Member Name 2]", 12, "normal", "left", 6);
  addText("3. [Member Name 3]", 12, "normal", "left", 6);
  addText("4. [Member Name 4]", 12, "normal", "left", 15);

  addText("College: [Insert College Name]", 12, "bold", "left", 20);

  // Report Title
  doc.setLineWidth(0.5);
  doc.line(leftMargin, y, pageWidth - leftMargin, y);
  y += 10;
  
  addText("Report", 14, "bold", "center", 10);
  addText("Title: Development of an Agentic AI System for Personalized and Adaptive Education", 14, "bold", "left", 15);

  // --- CONTENT SECTIONS ---

  // Introduction
  addText("Introduction:", 12, "bold", "left", 7);
  addText(
    "Quality education is a fundamental right, yet a significant disparity exists in educational outcomes, particularly in rural and underserved regions. Standardized curriculums often fail to account for individual student learning speeds. This report outlines the development of the 'Adaptive Learning Agent,' a system that functions as an autonomous personal tutor, leveraging Google's Gemini API to democratize access to personalized pedagogy.",
    11, "normal", "left", 12
  );

  // Problem Statement
  addText("Problem Statement:", 12, "bold", "left", 7);
  addText(
    "The primary challenge addressed by this project is the 'One-Size-Fits-All' limitation in the current education system. Students in rural areas often lack access to quality mentorship. A static textbook cannot explain a concept in a different way if a student fails to understand it. This lack of personalization leads to learning gaps and loss of confidence.",
    11, "normal", "left", 12
  );

  // Objective
  addText("Objective:", 12, "bold", "left", 7);
  addText(
    "The main objective is to develop a web-based, AI-driven educational agent that continuously assesses a student's proficiency and dynamically adapts the curriculum. The model aims to provide instant, culturally contextualized remedial content or advanced challenges.",
    11, "normal", "left", 12
  );

  // Solution Overview
  addText("Solution Overview:", 12, "bold", "left", 7);
  addText(
    "The solution is a React-based application powered by the Google Gemini API (gemini-3-flash-preview). Unlike a standard chatbot, this system acts as an 'Agent.' It follows a cognitive loop: Assess -> Plan -> Act. It administers diagnostic quizzes, analyzes performance scores, and generates tailored educational content in real-time.",
    11, "normal", "left", 12
  );

  // Features
  addText("Key Features:", 12, "bold", "left", 7);
  addText("- Dynamic Assessments: Quizzes that adapt difficulty (Weak/Average/Strong).", 11, "normal", "left", 6);
  addText("- Agentic Planner: Automatically triggers Remedial or Advanced workflows.", 11, "normal", "left", 6);
  addText("- Contextualized Content: Uses examples from rural India (agriculture, markets).", 11, "normal", "left", 6);
  addText("- Socratic AI Tutor: An embedded chat interface for follow-up questions.", 11, "normal", "left", 12);

  // Technical Implementation
  addText("Technical Implementation:", 12, "bold", "left", 7);
  addText(
    "The application uses TypeScript for strict data structures and Google Gemini API with 'responseSchema' to ensure structured JSON output. The frontend is built with React and Vite for high performance on mobile devices.",
    11, "normal", "left", 12
  );

  // Conclusion
  addText("Conclusion:", 12, "bold", "left", 7);
  addText(
    "This project demonstrates the potential of Agentic AI to transform education. By leveraging the reasoning capabilities of Google Gemini, the Adaptive Learning Agent provides a scalable, cost-effective alternative to human tutoring, ensuring no student is left behind.",
    11, "normal", "left", 12
  );

  doc.save("Adaptive_Learning_Agent_Report.pdf");
};
