import React, { useState, useEffect } from 'react';
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
  Search,
  UserPlus,
  LogIn
} from 'lucide-react';
import QuizModule from './components/QuizModule';
import AssignmentUpload from './components/AssignmentUpload';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('courses');
  const [userRole, setUserRole] = useState('Teacher');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Auth Form State
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Handle Login / Registration Submit
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setCurrentUser({ ...userCredential.user, displayName: name });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      setAuthError(error.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const teacherName = currentUser?.displayName || "Mr. Amir Nawaz";

  // IF NOT LOGGED IN: SHOW AUTHENTICATION / REGISTRATION SCREEN
  if (!currentUser) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 px-4 font-sans">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl text-white">
          <div className="flex items-center space-x-3 mb-6 border-b border-slate-700 pb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide">Tezgam LMS</h1>
              <p className="text-[10px] text-blue-400 font-medium">University of Turbat • Wash Atkay</p>
            </div>
          </div>

          <h2 className="text-xl font-bold mb-2">
            {isRegistering ? 'Register New Account' : 'Faculty & Student Login'}
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            {isRegistering 
              ? 'Create your credentials to access university coursework modules.' 
              : 'Enter your credentials to access your personalized portal dashboard.'}
          </p>

          {authError && (
            <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Dr. Mahnaz Baloch"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input 
                type="email" 
                required
                placeholder="teacher@uot.edu.pk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition shadow-lg shadow-blue-600/30 text-xs mt-2"
            >
              {isRegistering ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center border-t border-slate-700 pt-4">
            <button 
              onClick={() => { setIsRegistering(!isRegistering); setAuthError(''); }}
              className="text-xs text-blue-400 hover:underline font-medium"
            >
              {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Register Now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // IF LOGGED IN: SHOW DASHBOARD
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          {/* LOGO & BRANDING */}
          <div className="flex items-center space-x-3 px-2 py-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-white">Tezgam LMS</h1>
              <p className="text-[10px] text-blue-400 font-medium">University of Turbat</p>
            </div>
          </div>

          {/* MAIN MENU TABS */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'courses'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>Courses</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'assignments'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Assignments</span>
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'quizzes'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Timed Quizzes</span>
            </button>
          </nav>
        </div>

        {/* SIDEBAR FOOTER / PROFILE & LOGOUT */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 shrink-0">
                {teacherName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{teacherName}</p>
                <p className="text-[10px] text-slate-400">{userRole}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log Out"
              className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-8">
        {/* TOP NAVBAR */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search courses, modules..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition shadow-sm">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full"></span>
            </button>
            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3 py-1.5 rounded-xl border border-blue-200">
              UoT Portal Active
            </span>
          </div>
        </header>

        {/* HERO GREETING BANNER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-8">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Wash Atkay • University of Turbat
            </span>
            <h2 className="text-2xl font-extrabold mt-1">
              Welcome to Tezgam, {teacherName}!
            </h2>
            <div className="flex items-center space-x-2 mt-3">
              <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
              <p className="text-sm font-semibold text-blue-100 tracking-wide">
                "Let's Learn Together"
              </p>
            </div>
          </div>
          <Sparkles className="w-36 h-36 text-white/5 absolute -right-6 -bottom-6 pointer-events-none" />
        </div>

        {/* DYNAMIC TAB CONTENT */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Active Course Modules</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4 border border-blue-100">
                  CS
                </div>
                <h4 className="font-bold text-slate-800 text-base">Web Application Development</h4>
                <p className="text-xs text-slate-500 mt-1">Department of Computer Science</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">45 Enrolled Students</span>
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold mb-4 border border-indigo-100">
                  SE
                </div>
                <h4 className="font-bold text-slate-800 text-base">Software Engineering Principles</h4>
                <p className="text-xs text-slate-500 mt-1">University of Turbat</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">38 Enrolled Students</span>
                  <ChevronRight className="w-4 h-4 text-indigo-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <AssignmentUpload />
          </div>
        )}

        {activeTab === 'quizzes' && (
          <div className="space-y-6">
            <QuizModule />
          </div>
        )}
      </main>
    </div>
  );
}