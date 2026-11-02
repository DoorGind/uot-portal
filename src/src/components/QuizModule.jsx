import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Award } from 'lucide-react';

export default function QuizModule() {
  const [quizStarted, setQuizStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const questions = [
    {
      id: 1,
      question: "Which hook is used to manage state in a React functional component?",
      options: ["useEffect", "useState", "useContext", "useReducer"],
      correct: 1
    },
    {
      id: 2,
      question: "What is the default database used for Tezgam LMS backend?",
      options: ["MySQL", "Firebase Firestore", "MongoDB", "SQLite"],
      correct: 1
    }
  ];

  useEffect(() => {
    if (!quizStarted || submitted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleNext();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [quizStarted, currentQuestion, submitted]);

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setTimeLeft(30);
    } else {
      setSubmitted(true);
    }
  };

  const calculateScore = () => {
    let score = 0;
    questions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score += 1;
    });
    return score;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
      {!quizStarted ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-blue-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-slate-800">Midterm Assessment: Web Engineering</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-2">
            Strict single-attempt exam. Each question features a 30-second countdown timer. Automated grading is applied instantly upon completion.
          </p>
          <button 
            onClick={() => setQuizStarted(true)} 
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2.5 rounded-lg transition shadow-md shadow-blue-600/30"
          >
            Start Timed Assessment
          </button>
        </div>
      ) : !submitted ? (
        <div>
          <div className="flex justify-between items-center border-b border-slate-100 pb-4 mb-6">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <div className="flex items-center space-x-2 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
              <Clock className="w-3.5 h-3.5" />
              <span>{timeLeft}s remaining</span>
            </div>
          </div>

          <h4 className="text-lg font-bold text-slate-800 mb-4">
            {questions[currentQuestion].question}
          </h4>

          <div className="space-y-3">
            {questions[currentQuestion].options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedAnswers({ ...selectedAnswers, [currentQuestion]: idx })}
                className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition ${
                  selectedAnswers[currentQuestion] === idx 
                    ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm' 
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <div className="mt-8 flex justify-end">
            <button 
              onClick={handleNext} 
              className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg transition shadow-md"
            >
              {currentQuestion < questions.length - 1 ? 'Next Question' : 'Submit Exam'}
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <Award className="w-16 h-16 text-emerald-600 mx-auto mb-3" />
          <h3 className="text-2xl font-bold text-slate-800">Assessment Completed!</h3>
          <p className="text-sm text-slate-600 mt-2">
            Your response has been automatically graded and stored securely in Firestore.
          </p>
          <div className="mt-4 inline-block bg-slate-100 px-6 py-3 rounded-xl border border-slate-200">
            <span className="text-xs font-semibold text-slate-500 uppercase">Final Score</span>
            <p className="text-3xl font-extrabold text-blue-600">{calculateScore()} / {questions.length}</p>
          </div>
        </div>
      )}
    </div>
  );
}