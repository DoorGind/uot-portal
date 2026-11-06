import React, { useState } from 'react';
import { Sparkles, Send, X, BookOpen, FileText } from 'lucide-react';

export default function AIChatBot({ userRole, userName, activeCourse }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('General');
  
  const courseNotesContext = activeCourse?.lectures?.map(l => l.title).join(", ") || "General Course Materials";

  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: `Wash Atkay ${userName}! I am ready to analyze your notes for ${activeCourse?.code || 'this course'}. Ask me to explain concepts, summarize files, or generate practice questions!` 
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInputMessage('');

    // Simulated Smart Note Analyzer Response
    setTimeout(() => {
      let aiReply = "";
      const q = userText.toLowerCase();

      if (q.includes('explain') || q.includes('what is') || q.includes('concept')) {
        aiReply = `Based on the lecture notes for ${activeCourse?.code} (${courseNotesContext}): Here is a breakdown:\n\n1. **Core Definition**: This concept focuses on structured component state and isolated architecture.\n2. **Key Takeaway**: Make sure to review the slides on data flow before the quiz!`;
      } else if (q.includes('summarize') || q.includes('summary')) {
        aiReply = `Here is a quick study summary of ${courseNotesContext}:\n• Main focus: Setup and core development lifecycles.\n• Important topics: Architecture diagrams and component design.`;
      } else if (q.includes('quiz') || q.includes('test me') || q.includes('question')) {
        aiReply = `Here is a practice study question based on ${activeCourse?.code}:\n\n*Question*: What is the primary advantage of isolating course module data in a LMS platform?\n*(Reply with your answer and I will grade it!)*`;
      } else {
        aiReply = `I analyzed the notes for ${activeCourse?.code} (${courseNotesContext}). Could you specify if you want a **summary**, a **concept explanation**, or a **practice quiz**?`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 600);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 transition transform hover:scale-105"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold">Ask Note AI Tutor</span>
        </button>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden h-[480px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Tezgam Note AI Tutor</h4>
                <p className="text-[10px] text-blue-200">Analyzing: {activeCourse?.code || 'Course Notes'}</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white p-1 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Prompt Chips */}
          <div className="bg-slate-100 px-3 py-2 border-b flex space-x-1.5 overflow-x-auto text-[10px]">
            <button onClick={() => setInputMessage("Explain key concepts from today's notes")} className="bg-white px-2.5 py-1 rounded-full border text-blue-700 font-semibold whitespace-nowrap">
              💡 Explain Concepts
            </button>
            <button onClick={() => setInputMessage("Summarize the lecture files")} className="bg-white px-2.5 py-1 rounded-full border text-slate-700 font-semibold whitespace-nowrap">
              📝 Summarize Notes
            </button>
            <button onClick={() => setInputMessage("Give me a practice quiz question")} className="bg-white px-2.5 py-1 rounded-full border text-emerald-700 font-semibold whitespace-nowrap">
              ❓ Test Me
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl whitespace-pre-line ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                }`}>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex space-x-2">
            <input 
              type="text" 
              placeholder="Ask a question about your course notes..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition shadow-sm">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}