import React, { useState } from 'react';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  Bell, 
  UserCheck, 
  LogOut, 
  ChevronRight, 
  Award,
  Sparkles,
  Search
} from 'lucide-react';
import QuizModule from './components/QuizModule';
import AssignmentUpload from './components/AssignmentUpload';

export default function App() {
  const [activeTab, setActiveTab] = useState('courses');
  const [userRole, setUserRole] = useState('Teacher');

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3 px-2 py-4 border-b border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
              T
            </div>
            <div>
              <h1 className="font-bold text-lg leading-none">Tezgam <span className="text-blue-400">LMS</span></h1>
              <p className="text-xs text-blue-300 italic mt-1">Wash Atkay</p>
            </div>
          </div>

          <nav className="mt-6 space-y-1">
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'courses' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <BookOpen className="w-5 h-5" />
                <span>Course Hub</span>
              </div>
              {activeTab === 'courses' && <ChevronRight className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5" />
                <span>Assignments</span>
              </div>
              {activeTab === 'assignments' && <ChevronRight className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'quizzes' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Clock className="w-5 h-5" />
                <span>Timed Quizzes</span>
              </div>
              {activeTab === 'quizzes' && <ChevronRight className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setActiveTab('notices')}
              className={`w-full flex items-center justify-between px-3 py-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'notices' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5" />
                <span>Notice Board</span>
              </div>
              {activeTab === 'notices' && <ChevronRight className="w-4 h-4" />}
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between bg-slate-800/60 p-2.5 rounded-lg border border-slate-700/50">
            <div>
              <p className="text-sm font-semibold text-white">Amir Nawaz</p>
              <span className="inline-block px-2 py-0.5 text-[10px] bg-blue-500/20 text-blue-400 border border-blue-500/30 rounded font-medium mt-0.5">
                {userRole}
              </span>
            </div>
            <button 
              onClick={() => setUserRole(userRole === 'Teacher' ? 'Student' : 'Teacher')} 
              className="text-xs text-slate-400 hover:text-blue-400 transition"
            >
              Switch
            </button>
          </div>

          <button className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center space-x-3 w-96 bg-slate-100 rounded-lg px-3 py-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search courses, announcements, resources..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700"
            />
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
            University of Turbat
          </span>
        </header>

        <div className="p-8 space-y-6">
          {/* Welcome Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
              <Sparkles className="w-64 h-64" />
            </div>
            <div className="relative z-10 max-w-2xl">
              <span className="text-xs font-semibold tracking-wider uppercase text-blue-300">Welcome Back</span>
              <h2 className="text-2xl font-bold mt-1">Hello, Amir Nawaz!</h2>
              <p className="text-sm text-blue-100 italic mt-2 border-l-2 border-blue-400 pl-3">
                "I am not a teacher, but an awakener."
              </p>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><BookOpen className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Active Courses</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">4</h3>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg"><UserCheck className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Enrolled Students</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">128</h3>
              </div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Award className="w-6 h-6" /></div>
              <div>
                <p className="text-xs font-medium text-slate-500 uppercase">Pending Tasks</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-0.5">3</h3>
              </div>
            </div>
          </div>

          {/* Dynamic Views */}
          {activeTab === 'courses' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">Enrolled Courses</h3>
                  <p className="text-xs text-slate-500">Manage your course materials and rosters</p>
                </div>
                {userRole === 'Teacher' && (
                  <button className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition shadow-md">
                    + Create Course
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {['Computer Networks', 'Database Systems', 'Web Development', 'Software Engineering'].map((course, idx) => (
                  <div key={idx} className="border border-slate-200 hover:border-blue-300 p-5 rounded-xl transition hover:shadow-md bg-slate-50/50">
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded">CS-{101 + idx}</span>
                    <h4 className="font-bold text-slate-800 text-base mt-2">{course}</h4>
                    <p className="text-xs text-slate-500 mt-1">University of Turbat • Fall Semester</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'assignments' && <AssignmentUpload />}
          {activeTab === 'quizzes' && <QuizModule />}

          {activeTab === 'notices' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-slate-800 mb-2">Notice Board</h3>
              <p className="text-sm text-slate-500 mb-4">Official announcements for University of Turbat faculty and students.</p>
              <div className="space-y-3">
                <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40">
                  <span className="text-xs font-bold text-blue-600">Departmental Notice</span>
                  <h4 className="font-bold text-slate-800 text-sm mt-1">Midterm Examination Schedule Released</h4>
                  <p className="text-xs text-slate-600 mt-1">All semester quizzes will be conducted online through Tezgam LMS.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}