import React, { useState } from 'react';
import { Sparkles, Send, X } from 'lucide-react';

export default function AIChatBot({ userRole, userName, activeCourseCode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState([
    { 
      sender: 'ai', 
      text: `Wash Atkay ${userName}! I am your Tezgam LMS AI Assistant. How can I help you with ${activeCourseCode || 'your courses'} today?` 
    }
  ]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInputMessage('');

    setTimeout(() => {
      let aiReply = "I can help you check assignment deadlines, review lecture notes, or look up course information.";
      const query = userText.toLowerCase();

      if (query.includes('deadline') || query.includes('assignment')) {
        aiReply = `For ${activeCourseCode || 'your active course'}, please check the Assignments & Deadlines tab for remaining submission hours.`;
      } else if (query.includes('lecture') || query.includes('notes') || query.includes('pdf')) {
        aiReply = `You can download PDF, slide (.pptx), and Word documents directly from the Course Modules tab under Lecture Notes.`;
      } else if (query.includes('attendance')) {
        aiReply = `Teachers can cycle attendance statuses (Present, Absent, Leave, Late) and export/import CSV reports in the course attendance panel.`;
      } else if (query.includes('exam') || query.includes('quiz')) {
        aiReply = `Timed quizzes are accessible via the Timed Quizzes tab in your sidebar.`;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: aiReply }]);
    }, 500);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-4 rounded-full shadow-2xl flex items-center space-x-2 transition transform hover:scale-105"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span className="text-xs font-bold">Ask AI Assistant</span>
        </button>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-80 md:w-96 flex flex-col overflow-hidden h-[450px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white p-4 flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-xs">Tezgam LMS AI</h4>
                <p className="text-[10px] text-blue-200">Online • Course Assistant</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50 text-xs">
            {messages.map((m, idx) => (
              <div key={idx} className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-2xl ${
                  m.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-none' 
                    : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-xs'
                }`}>
                  <p>{m.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex space-x-2">
            <input 
              type="text" 
              placeholder="Ask about notes, deadlines..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-xl transition shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
}