import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  FileText, 
  Clock, 
  Bell, 
  LogOut, 
  ChevronRight, 
  Sparkles, 
  Search,
  Mail,
  X,
  UserCheck,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import QuizModule from './components/QuizModule';
import AssignmentUpload from './components/AssignmentUpload';
import { auth } from './firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('courses');
  const [showAuthModal, setShowAuthModal] = useState(true); // Forces modal open initially until registered/signed in
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('signup'); // Default to signup for new users
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'teacher'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Master Admin Email
  const MASTER_ADMIN_EMAIL = "amir.nawaz@uot.edu.pk"; 

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isMaster = user.email === MASTER_ADMIN_EMAIL;
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          role: isMaster ? 'teacher' : (selectedRole || 'student'),
        });
        setShowAuthModal(false);
      } else {
        setCurrentUser(null);
        setShowAuthModal(true); // Force registration/login if not authenticated
      }
    });
    return () => unsubscribe();
  }, [selectedRole]);

  // Google Sign-In Handler
  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Email/Password Submit Handler
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setCurrentUser({ 
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name, 
          role: selectedRole,
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowAuthModal(false);
    } catch (error) {
      setAuthError(error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setShowAuthModal(true);
    } catch (error) {
      console.error("Logout error", error);
    }
  };

  const userName = currentUser?.displayName || "User";
  const userRole = currentUser?.role || 'student';

  // STRICT GATE: IF NOT LOGGED IN / REGISTERED, ONLY SHOW AUTHENTICATION MODAL GATE
  if (!currentUser || showAuthModal) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 px-4 font-sans">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100">
          
          {/* BRANDING */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md shadow-blue-500/30">
              T
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Tezgam LMS Portal</h3>
              <p className="text-xs text-blue-600 font-medium">University of Turbat • Wash Atkay</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Please register or sign in with your Gmail to access your respective student study portal or teacher teaching portal.
          </p>

          {/* ROLE SELECTOR */}
          <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
            <button
              type="button"
              onClick={() => setSelectedRole('teacher')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                selectedRole === 'teacher' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Teacher Portal</span>
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole('student')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                selectedRole === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
          </div>

          {/* GMAIL AUTH BUTTON */}
          <button
            onClick={handleGoogleSignIn}
            disabled={authLoading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md mb-6 disabled:opacity-50"
          >
            <Mail className="w-4 h-4 text-red-400" />
            <span>Continue with Gmail Google Auth</span>
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">or use email password</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {authError && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-xs font-medium">
              {authError}
            </div>
          )}

          {/* FORM */}
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'teacher' ? "e.g. Mr. Amir Nawaz" : "e.g. Student Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Gmail Address</label>
              <input
                type="email"
                required
                placeholder="yourname@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30 text-xs mt-2 disabled:opacity-50"
            >
              {authLoading ? 'Processing...' : (authMode === 'signup' ? `Register for ${selectedRole === 'teacher' ? 'Teaching' : 'Study'} Portal` : 'Sign In to Portal')}
            </button>
          </form>

          {/* TOGGLE */}
          <div className="mt-6 text-center border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'signup' ? 'signin' : 'signup');
                setAuthError('');
              }}
              className="text-xs font-semibold text-blue-600 hover:underline"
            >
              {authMode === 'signup' 
                ? 'Already registered? Sign In here' 
                : "Don't have an account? Register Now"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // LOGGED IN DASHBOARD (SEPARATED BY TEACHING VS STUDY PORTAL SECTIONS)
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          {/* BRANDING */}
          <div className="flex items-center space-x-3 px-2 py-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-white">Tezgam LMS</h1>
              <p className="text-[10px] text-blue-400 font-medium">University of Turbat</p>
            </div>
          </div>

          {/* DYNAMIC PORTAL BADGE */}
          <div className="px-2 mb-4">
            <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
              userRole === 'teacher' ? 'bg-indigo-950/50 border-indigo-800 text-indigo-300' : 'bg-blue-950/50 border-blue-800 text-blue-300'
            }`}>
              {userRole === 'teacher' ? <Briefcase className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              <span>{userRole === 'teacher' ? 'Teaching Portal Active' : 'Study Portal Active'}</span>
            </div>
          </div>

          {/* MAIN MENU */}
          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'courses' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>{userRole === 'teacher' ? 'Manage Courses & Teach' : 'My Enrolled Studies'}</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Assignments</span>
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'quizzes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Timed Quizzes</span>
            </button>
          </nav>
        </div>

        {/* SIDEBAR FOOTER (USER PROFILE & LOGOUT) */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{userName}</p>
                <p className="text-[10px] text-blue-400 capitalize">{userRole}</p>
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
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search portal..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={handleLogout} 
              className="flex items-center space-x-1.5 text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-100 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log Out</span>
            </button>
          </div>
        </header>

        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-8">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Wash Atkay • University of Turbat
            </span>
            <h2 className="text-2xl font-extrabold mt-1">
              Welcome to {userRole === 'teacher' ? 'Teaching' : 'Study'} Portal, {userName}!
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

        {/* TABS */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {userRole === 'teacher' ? 'Course Management & Teaching Modules' : 'My Enrolled Study Modules'}
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold mb-4 border border-blue-100">
                  CS
                </div>
                <h4 className="font-bold text-slate-800 text-base">Web Application Development</h4>
                <p className="text-xs text-slate-500 mt-1">University of Turbat</p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                  <span className="text-slate-500 font-medium">45 Students Enrolled</span>
                  <ChevronRight className="w-4 h-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'assignments' && <AssignmentUpload />}
        {activeTab === 'quizzes' && <QuizModule />}
      </main>
    </div>
  );
}