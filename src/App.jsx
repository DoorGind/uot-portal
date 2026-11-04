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
  Users,
  Download,
  PlusCircle,
  GraduationCap,
  Briefcase,
  Megaphone,
  UserCheck,
  CheckCircle2,
  Upload,
  Layers,
  Award
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
  const [showAuthModal, setShowAuthModal] = useState(true);
  
  // Auth Form State
  const [authMode, setAuthMode] = useState('signup'); 
  const [selectedRole, setSelectedRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Student Registry (Simulated DB)
  const [studentRegistry, setStudentRegistry] = useState([
    { id: 1, name: 'Bilal Ahmed', roll: 'UOT-2023-CS-01', email: 'bilal@gmail.com', verified: true },
    { id: 2, name: 'Ayesha Baloch', roll: 'UOT-2023-CS-02', email: 'ayesha@gmail.com', verified: true },
    { id: 3, name: 'Tariq Khan', roll: 'UOT-2024-CS-15', email: 'tariq@gmail.com', verified: false }
  ]);

  // LMS Feature States
  const [courses, setCourses] = useState([
    { id: 1, title: 'Web Application Development', code: 'CS-401', students: 45, instructor: 'Mr. Amir Nawaz' },
    { id: 2, title: 'Software Engineering Principles', code: 'SE-302', students: 38, instructor: 'Dr. Mahnaz Baloch' }
  ]);
  const [selectedCourse, setSelectedCourse] = useState(courses[0]);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');

  // 1. Attendance Register
  const [attendanceList, setAttendanceList] = useState([
    { id: 1, name: 'Bilal Ahmed', roll: 'UOT-2023-CS-01', status: 'Present' },
    { id: 2, name: 'Ayesha Baloch', roll: 'UOT-2023-CS-02', status: 'Present' },
    { id: 3, name: 'Tariq Khan', roll: 'UOT-2023-CS-03', status: 'Absent' },
    { id: 4, name: 'Saima Noor', roll: 'UOT-2023-CS-04', status: 'Leave' }
  ]);

  // 2. Lecture Materials State
  const [lectures, setLectures] = useState([
    { id: 1, title: 'Week 1: React & Vite Architecture Setup', date: 'Nov 2026', size: '2.4 MB' },
    { id: 2, title: 'Week 2: Firebase Firestore & Auth Configuration', date: 'Nov 2026', size: '4.1 MB' }
  ]);
  const [newLectureTitle, setNewLectureTitle] = useState('');

  // 3. Noticeboard State
  const [notices, setNotices] = useState([
    { id: 1, title: 'Midterm Examination Schedule Announcement', content: 'Midterms will commence from next Monday. Please review the syllabus.', date: 'Today' }
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // 4. Presentation Groups State
  const [presentations, setPresentations] = useState([
    { id: 1, groupName: 'Alpha Team', topic: 'React State Management in LMS', members: 'Bilal Ahmed, Ayesha Baloch', marks: '85/100' }
  ]);
  const [newGroup, setNewGroup] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newMembers, setNewMembers] = useState('');

  // 5. Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Student Tariq Khan registered & waiting for Roll Number approval', time: 'Just now' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Master Admin Email
  const MASTER_ADMIN_EMAIL = "amir.nawaz@uot.edu.pk";

  const checkUserAuthorization = (userEmail, role, roll) => {
    if (userEmail === MASTER_ADMIN_EMAIL) return { authorized: true, role: 'teacher' };
    if (role === 'teacher') {
      const isOfficial = userEmail.endsWith('@uot.edu.pk');
      return { authorized: isOfficial, role: 'teacher', error: isOfficial ? null : "Teachers must use an official @uot.edu.pk email address." };
    }
    if (role === 'student') {
      const hasRoll = roll && roll.trim().toUpperCase().startsWith('UOT-');
      return { 
        authorized: hasRoll, 
        role: 'student', 
        error: hasRoll ? null : "Invalid Roll Number! Students must provide a valid UoT Roll No (e.g. UOT-2024-CS-01)." 
      };
    }
    return { authorized: false, role: 'student', error: 'Unauthorized login attempt.' };
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const isMaster = user.email === MASTER_ADMIN_EMAIL;
        const isTeacher = isMaster || user.email.endsWith('@uot.edu.pk');
        
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          role: isTeacher ? 'teacher' : 'student',
          isAuthorized: true
        });
        setShowAuthModal(false);
      } else {
        setCurrentUser(null);
        setShowAuthModal(true);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const isTeacher = result.user.email.endsWith('@uot.edu.pk') || result.user.email === MASTER_ADMIN_EMAIL;
      
      if (!isTeacher && selectedRole === 'student' && (!rollNumber || !rollNumber.trim().toUpperCase().startsWith('UOT-'))) {
        setAuthError("Google Auth successful! Please enter your University Roll No below (e.g., UOT-2024-CS-01) to complete registration.");
        return;
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message);
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    const authCheck = checkUserAuthorization(email, selectedRole, rollNumber);
    if (!authCheck.authorized) {
      setAuthError(authCheck.error);
      setAuthLoading(false);
      return;
    }

    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        if (selectedRole === 'student') {
          setStudentRegistry(prev => [...prev, {
            id: prev.length + 1,
            name: name,
            roll: rollNumber.toUpperCase(),
            email: email,
            verified: true
          }]);
        }

        setCurrentUser({ 
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name, 
          role: selectedRole,
          rollNumber: rollNumber.toUpperCase(),
          isAuthorized: true
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

  const exportAttendanceCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Roll No,Student Name,Status"]
      .concat(attendanceList.map(row => `${row.roll},${row.name},${row.status}`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "uot_attendance_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleAttendanceStatus = (id) => {
    const statuses = ['Present', 'Absent', 'Leave', 'Late'];
    setAttendanceList(attendanceList.map(item => {
      if (item.id === id) {
        const currentIndex = statuses.indexOf(item.status);
        const nextIndex = (currentIndex + 1) % statuses.length;
        return { ...item, status: statuses[nextIndex] };
      }
      return item;
    }));
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    const newCourse = {
      id: courses.length + 1,
      title: newCourseTitle,
      code: newCourseCode || 'CS-501',
      students: 1,
      instructor: currentUser?.displayName || 'Teacher'
    };
    setCourses([...courses, newCourse]);
    setSelectedCourse(newCourse);
    setNewCourseTitle('');
    setNewCourseCode('');
    setShowCreateCourseModal(false);
  };

  const userName = currentUser?.displayName || "User";
  const userRole = currentUser?.role || 'student';

  // STRICT AUTHENTICATION MODAL GATE
  if (!currentUser || showAuthModal) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 px-4 font-sans">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md shadow-blue-500/30">
              T
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Tezgam Secure Portal</h3>
              <p className="text-xs text-blue-600 font-medium">University of Turbat • Authorized Access</p>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-6">
            Teachers register with official <span className="font-bold text-slate-700">@uot.edu.pk</span> email. Students register using Gmail & Roll No.
          </p>

          <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
            <button
              type="button"
              onClick={() => { setSelectedRole('teacher'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                selectedRole === 'teacher' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Teacher Portal</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('student'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                selectedRole === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Student Portal</span>
            </button>
          </div>

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
            <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">or register with email</span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          {authError && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-xs font-medium">
              {authError}
            </div>
          )}

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

            {selectedRole === 'student' && authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-blue-600 mb-1">
                  UoT Student Roll Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UOT-2024-CS-01"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full bg-blue-50/50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                {selectedRole === 'teacher' ? 'Official Email (@uot.edu.pk)' : 'Personal Gmail / Email Address'}
              </label>
              <input
                type="email"
                required
                placeholder={selectedRole === 'teacher' ? "name@uot.edu.pk" : "student@gmail.com"}
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
              {authLoading ? 'Verifying...' : (authMode === 'signup' ? `Register ${selectedRole === 'teacher' ? 'Teacher' : 'Student'} Account` : 'Sign In')}
            </button>
          </form>

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
                ? 'Already registered? Sign In' 
                : "Need to register? Sign Up"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3 px-2 py-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-white">Tezgam LMS</h1>
              <p className="text-[10px] text-blue-400 font-medium">University of Turbat</p>
            </div>
          </div>

          <div className="px-2 mb-4">
            <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
              userRole === 'teacher' ? 'bg-indigo-950/50 border-indigo-800 text-indigo-300' : 'bg-blue-950/50 border-blue-800 text-blue-300'
            }`}>
              {userRole === 'teacher' ? <Briefcase className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              <span>{userRole === 'teacher' ? 'Teacher Portal Active' : 'Student Study Portal'}</span>
            </div>
          </div>

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

            {userRole === 'teacher' && (
              <button
                onClick={() => setActiveTab('verification')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'verification' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                <span>Student Verification Hub</span>
              </button>
            )}

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

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 shrink-0">
                {userName.charAt(0)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{userName}</p>
                <p className="text-[10px] text-blue-400 truncate">{currentUser?.email}</p>
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

        {/* VERIFICATION HUB FOR TEACHERS */}
        {activeTab === 'verification' && userRole === 'teacher' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Student Roll Number Verification Hub</h3>
            <p className="text-xs text-slate-500">Verify and authorize student Gmail accounts registered with UoT Roll Numbers.</p>
            
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Gmail Address</th>
                    <th className="p-4">Verification Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentRegistry.map((st) => (
                    <tr key={st.id} className="hover:bg-slate-50/50">
                      <td className="p-4 font-bold text-slate-800">{st.name}</td>
                      <td className="p-4 font-semibold text-blue-600">{st.roll}</td>
                      <td className="p-4 text-slate-600">{st.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          st.verified ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {st.verified ? 'Verified Student' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="p-4">
                        {!st.verified ? (
                          <button 
                            onClick={() => {
                              setStudentRegistry(studentRegistry.map(s => s.id === st.id ? { ...s, verified: true } : s));
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-3 py-1.5 rounded-xl text-[11px] transition shadow-sm flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve Student</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 font-semibold">Approved</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COURSES TAB & ALL 10 LMS MODULES VIEW */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {userRole === 'teacher' ? 'Course Management & Teaching Modules' : 'My Enrolled Study Modules'}
              </h3>
              {userRole === 'teacher' && (
                <button 
                  onClick={() => setShowCreateCourseModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center space-x-2 shadow-sm"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Course</span>
                </button>
              )}
            </div>

            {/* COURSE CARDS SELECTOR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  onClick={() => setSelectedCourse(course)}
                  className={`p-6 rounded-2xl border transition cursor-pointer ${
                    selectedCourse?.id === course.id 
                      ? 'bg-blue-50/40 border-blue-500 shadow-md ring-2 ring-blue-500/20' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      {course.code.split('-')[0]}
                    </div>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">{course.code}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 text-base">{course.title}</h4>
                  <p className="text-xs text-slate-500 mt-1">Instructor: {course.instructor}</p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium flex items-center space-x-1">
                      <Users className="w-3.5 h-3.5 text-blue-600" />
                      <span>{course.students} Enrolled Students</span>
                    </span>
                    <span className="text-blue-600 font-bold text-xs flex items-center space-x-1">
                      <span>View Course Modules</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 10 CORE LMS FEATURE MODULES DISPLAY */}
            {selectedCourse && (
              <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-10">
                <div className="flex justify-between items-center border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{selectedCourse.code}</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{selectedCourse.title} - Academic Modules</h3>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Active Session
                  </span>
                </div>

                {/* 1. CLASS ATTENDANCE REGISTER (WITH CSV EXPORT & CLICK STATUS TOGGLE) */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        <span>1. Class Attendance Register</span>
                      </h4>
                      <p className="text-xs text-slate-500">Click any status badge to cycle between Present, Absent, Leave, or Late.</p>
                    </div>
                    {userRole === 'teacher' && (
                      <button 
                        onClick={exportAttendanceCSV}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export CSV Report</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Roll Number</th>
                          <th className="p-3.5">Student Name</th>
                          <th className="p-3.5">Attendance Status (Click to Toggle)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendanceList.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/60 transition">
                            <td className="p-3.5 font-semibold text-slate-600">{student.roll}</td>
                            <td className="p-3.5 font-bold text-slate-800">{student.name}</td>
                            <td className="p-3.5">
                              <button
                                onClick={() => toggleAttendanceStatus(student.id)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs transition border shadow-xs ${
                                  student.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' :
                                  student.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                                  student.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' :
                                  'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                }`}
                              >
                                {student.status}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. LECTURE NOTES & SLIDES */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>2. Lecture Materials & PDF Download</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lectures.map((lec) => (
                      <div key={lec.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs text-slate-800">{lec.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lec.date} • {lec.size}</p>
                        </div>
                        <button 
                          onClick={() => alert(`Downloading "${lec.title}" to device...`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm transition"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {userRole === 'teacher' && (
                    <div className="flex space-x-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Add new lecture title..." 
                        value={newLectureTitle}
                        onChange={(e) => setNewLectureTitle(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                      />
                      <button 
                        onClick={() => {
                          if(!newLectureTitle) return;
                          setLectures([...lectures, { id: lectures.length + 1, title: newLectureTitle, date: 'Just now', size: '1.5 MB' }]);
                          setNewLectureTitle('');
                        }}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        Upload Lecture Note
                      </button>
                    </div>
                  )}
                </div>

                {/* 3. CLASS NOTICEBOARD & ANNOUNCEMENTS */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                    <span>3. Class Notice Board & Broadcasts</span>
                  </h4>
                  <div className="space-y-3">
                    {notices.map((n) => (
                      <div key={n.id} className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-xs text-blue-950">{n.title}</p>
                          <span className="text-[10px] font-semibold text-blue-600">{n.date}</span>
                        </div>
                        <p className="text-xs text-slate-600">{n.content}</p>
                      </div>
                    ))}
                  </div>

                  {userRole === 'teacher' && (
                    <div className="space-y-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Notice Title..." 
                        value={newNoticeTitle}
                        onChange={(e) => setNewNoticeTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <textarea 
                        placeholder="Notice Details..." 
                        value={newNoticeContent}
                        onChange={(e) => setNewNoticeContent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <button 
                        onClick={() => {
                          if(!newNoticeTitle || !newNoticeContent) return;
                          setNotices([...notices, { id: notices.length + 1, title: newNoticeTitle, content: newNoticeContent, date: 'Just now' }]);
                          setNewNoticeTitle('');
                          setNewNoticeContent('');
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                      >
                        Publish Notice
                      </button>
                    </div>
                  )}
                </div>

                {/* 4. PRESENTATION EVALUATION & GROUPING */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span>4. Presentation Groups & Evaluation</span>
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                        <tr>
                          <th className="p-3.5">Group Name</th>
                          <th className="p-3.5">Topic</th>
                          <th className="p-3.5">Group Members</th>
                          <th className="p-3.5">Marks / Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {presentations.map((p) => (
                          <tr key={p.id}>
                            <td className="p-3.5 font-bold text-slate-800">{p.groupName}</td>
                            <td className="p-3.5 text-slate-600">{p.topic}</td>
                            <td className="p-3.5 text-slate-600">{p.members}</td>
                            <td className="p-3.5 font-extrabold text-blue-600">{p.marks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {userRole === 'teacher' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      <input 
                        type="text" 
                        placeholder="Group Name (e.g. Beta Team)" 
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <input 
                        type="text" 
                        placeholder="Presentation Topic Title" 
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <input 
                        type="text" 
                        placeholder="Student Names / Rolls" 
                        value={newMembers}
                        onChange={(e) => setNewMembers(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <button 
                        onClick={() => {
                          if(!newGroup || !newTopic) return;
                          setPresentations([...presentations, { id: presentations.length + 1, groupName: newGroup, topic: newTopic, members: newMembers || 'Enrolled Students', marks: 'Pending' }]);
                          setNewGroup('');
                          setNewTopic('');
                          setNewMembers('');
                        }}
                        className="md:col-span-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        Create Presentation Group
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && <AssignmentUpload />}

        {/* QUIZZES TAB */}
        {activeTab === 'quizzes' && <QuizModule />}
      </main>

      {/* CREATE COURSE MODAL */}
      {showCreateCourseModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border">
            <h3 className="font-extrabold text-lg text-slate-900 mb-4">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Course Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Data Structures & Algorithms"
                  value={newCourseTitle}
                  onChange={(e) => setNewCourseTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">Course Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. CS-301"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button 
                  type="button" 
                  onClick={() => setShowCreateCourseModal(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/30"
                >
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}