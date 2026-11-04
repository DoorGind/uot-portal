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
  ShieldAlert
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
  const [selectedRole, setSelectedRole] = useState('student'); // 'student' or 'teacher'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // LMS Feature States
  const [courses, setCourses] = useState([
    { id: 1, title: 'Web Application Development', code: 'CS-401', students: 45, instructor: 'Mr. Amir Nawaz' },
    { id: 2, title: 'Software Engineering Principles', code: 'SE-302', students: 38, instructor: 'Dr. Mahnaz Baloch' }
  ]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');

  // Attendance State
  const [attendanceList, setAttendanceList] = useState([
    { id: 1, name: 'Bilal Ahmed', roll: 'UOT-2023-CS-01', status: 'Present' },
    { id: 2, name: 'Ayesha Baloch', roll: 'UOT-2023-CS-02', status: 'Present' },
    { id: 3, name: 'Tariq Khan', roll: 'UOT-2023-CS-03', status: 'Absent' },
    { id: 4, name: 'Saima Noor', roll: 'UOT-2023-CS-04', status: 'Leave' }
  ]);

  // Lecture Materials State
  const [lectures, setLectures] = useState([
    { id: 1, title: 'Week 1: React & Vite Architecture Setup', date: 'Nov 2026', size: '2.4 MB' },
    { id: 2, title: 'Week 2: Firebase Firestore & Auth Configuration', date: 'Nov 2026', size: '4.1 MB' }
  ]);
  const [newLectureTitle, setNewLectureTitle] = useState('');

  // Noticeboard State
  const [notices, setNotices] = useState([
    { id: 1, title: 'Midterm Examination Schedule Announcement', content: 'Midterms will commence from next Monday. Please review the syllabus.', date: 'Today' }
  ]);
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');

  // Presentation Groups State
  const [presentations, setPresentations] = useState([
    { id: 1, groupName: 'Alpha Team', topic: 'React State Management in LMS', members: 'Bilal Ahmed, Ayesha Baloch', marks: '85/100' }
  ]);
  const [newGroup, setNewGroup] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newMembers, setNewMembers] = useState('');

  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Student Bilal Ahmed submitted Assignment #1', time: '10 mins ago' }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // STRICT AUTHORIZATION WHITELIST & MASTER ADMIN
  const MASTER_ADMIN_EMAIL = "amir.nawaz@uot.edu.pk";
  
  // List of pre-authorized teacher/student emails or domains allowed into the portal
  const AUTHORIZED_WHITELIST = [
    "amir.nawaz@uot.edu.pk",
    "mahnaz.baloch@uot.edu.pk",
    "student@uot.edu.pk"
  ];

  const isEmailAuthorized = (userEmail) => {
    if (!userEmail) return false;
    if (userEmail === MASTER_ADMIN_EMAIL) return true;
    // Must be part of university domain or explicit whitelist
    return userEmail.endsWith('@uot.edu.pk') || AUTHORIZED_WHITELIST.includes(userEmail);
  };

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        const authorized = isEmailAuthorized(user.email);
        setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || user.email.split('@')[0],
          role: user.email === MASTER_ADMIN_EMAIL ? 'teacher' : (selectedRole || 'student'),
          isAuthorized: authorized
        });
        setShowAuthModal(false);
      } else {
        setCurrentUser(null);
        setShowAuthModal(true);
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
      const result = await signInWithPopup(auth, provider);
      if (!isEmailAuthorized(result.user.email)) {
        setAuthError("Access Denied: This email is not authorized for the University of Turbat Portal.");
        await signOut(auth);
      }
    } catch (error) {
      if (error.code !== 'auth/popup-closed-by-user') {
        setAuthError(error.message);
      }
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
      if (!isEmailAuthorized(email)) {
        setAuthError("Unauthorized Email! Only official UoT portal accounts (@uot.edu.pk or pre-approved emails) are permitted.");
        setAuthLoading(false);
        return;
      }

      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        setCurrentUser({ 
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: name, 
          role: selectedRole,
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
    setNewCourseTitle('');
    setNewCourseCode('');
    setShowCreateCourseModal(false);
  };

  const userName = currentUser?.displayName || "User";
  const userRole = currentUser?.role || 'student';

  // STRICT AUTHENTICATION GATE & UNAUTHORIZED BLOCK
  if (!currentUser || showAuthModal || (currentUser && !currentUser.isAuthorized)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 px-4 font-sans">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md shadow-blue-500/30">
              T
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Tezgam Secure Portal</h3>
              <p className="text-xs text-blue-600 font-medium">University of Turbat • Authorized Access Only</p>
            </div>
          </div>

          {currentUser && !currentUser.isAuthorized ? (
            <div className="bg-red-50 border border-red-200 p-4 rounded-2xl text-center space-y-3 mb-4">
              <ShieldAlert className="w-10 h-10 text-red-600 mx-auto" />
              <h4 className="font-bold text-sm text-red-900">Unauthorized Account</h4>
              <p className="text-xs text-red-600">
                Your email ({currentUser.email}) is not authorized to access the University of Turbat portal. Please sign in with an official faculty or student credential.
              </p>
              <button 
                onClick={handleLogout}
                className="w-full bg-red-600 text-white py-2 rounded-xl text-xs font-bold shadow-sm"
              >
                Sign Out & Try Another Account
              </button>
            </div>
          ) : (
            <>
              <p className="text-xs text-slate-500 mb-6">
                Restricted portal. Only verified University of Turbat faculty and enrolled students can register or sign in.
              </p>

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

              <button
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center justify-center space-x-2 transition shadow-md mb-6 disabled:opacity-50"
              >
                <Mail className="w-4 h-4 text-red-400" />
                <span>Continue with Authorized UoT Google Auth</span>
              </button>

              <div className="relative flex py-2 items-center mb-6">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-400 uppercase font-bold tracking-wider">or institutional email</span>
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

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">Institutional Email (@uot.edu.pk)</label>
                  <input
                    type="email"
                    required
                    placeholder="name@uot.edu.pk"
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
                  {authLoading ? 'Verifying Authorization...' : (authMode === 'signup' ? `Register Authorized ${selectedRole === 'teacher' ? 'Teacher' : 'Student'}` : 'Secure Sign In')}
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
                    ? 'Already have an authorized account? Sign In' 
                    : "Need to register an account? Sign Up"}
                </button>
              </div>
            </>
          )}
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
              <span>{userRole === 'teacher' ? 'Authorized Teacher Portal' : 'Authorized Student Portal'}</span>
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

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Assignments & Deadlines</span>
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

      {/* MAIN CONTENT */}
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

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course) => (
                <div 
                  key={course.id} 
                  onClick={() => setSelectedCourse(course)}
                  className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
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
                    <ChevronRight className="w-4 h-4 text-blue-600" />
                  </div>
                </div>
              ))}
            </div>

            {selectedCourse && (
              <div className="mt-8 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-8">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <span className="text-xs font-bold text-blue-600">{selectedCourse.code}</span>
                    <h3 className="text-xl font-extrabold text-slate-900">{selectedCourse.title} - Module Dashboard</h3>
                  </div>
                  <button 
                    onClick={() => setSelectedCourse(null)}
                    className="text-xs bg-slate-100 hover:bg-slate-200 font-bold px-3 py-1.5 rounded-xl transition"
                  >
                    Close Module
                  </button>
                </div>

                {/* ATTENDANCE */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                      <UserCheck className="w-4 h-4 text-blue-600" />
                      <span>Class Attendance Register</span>
                    </h4>
                    {userRole === 'teacher' && (
                      <button 
                        onClick={exportAttendanceCSV}
                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-xl border border-emerald-200 transition flex items-center space-x-1"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>
                    )}
                  </div>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="p-3">Roll Number</th>
                          <th className="p-3">Student Name</th>
                          <th className="p-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {attendanceList.map((student) => (
                          <tr key={student.id} className="hover:bg-slate-50/50">
                            <td className="p-3 font-semibold text-slate-600">{student.roll}</td>
                            <td className="p-3 font-bold text-slate-800">{student.name}</td>
                            <td className="p-3">
                              <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                                student.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                                student.status === 'Absent' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {student.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* NOTES */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-blue-600" />
                    <span>Course Notes & Materials</span>
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lectures.map((lec) => (
                      <div key={lec.id} className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs text-slate-800">{lec.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lec.date} • {lec.size}</p>
                        </div>
                        <button 
                          onClick={() => alert(`Downloading ${lec.title}...`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-xl text-xs font-semibold flex items-center space-x-1"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* NOTICES */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                    <Megaphone className="w-4 h-4 text-blue-600" />
                    <span>Announcements</span>
                  </h4>
                  <div className="space-y-3">
                    {notices.map((n) => (
                      <div key={n.id} className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-1">
                          <p className="font-bold text-xs text-blue-900">{n.title}</p>
                          <span className="text-[10px] text-blue-600">{n.date}</span>
                        </div>
                        <p className="text-xs text-slate-600">{n.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PRESENTATIONS */}
                <div className="space-y-4 pt-4 border-t">
                  <h4 className="font-bold text-sm text-slate-800 flex items-center space-x-2">
                    <Users className="w-4 h-4 text-blue-600" />
                    <span>Presentation Groups & Evaluation</span>
                  </h4>
                  <div className="overflow-x-auto border border-slate-200 rounded-xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                        <tr>
                          <th className="p-3">Group Name</th>
                          <th className="p-3">Topic Title</th>
                          <th className="p-3">Members</th>
                          <th className="p-3">Marks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {presentations.map((p) => (
                          <tr key={p.id}>
                            <td className="p-3 font-bold text-slate-800">{p.groupName}</td>
                            <td className="p-3 text-slate-600">{p.topic}</td>
                            <td className="p-3 text-slate-600">{p.members}</td>
                            <td className="p-3 font-extrabold text-blue-600">{p.marks}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}
          </div>
        )}

        {activeTab === 'assignments' && <AssignmentUpload />}
        {activeTab === 'quizzes' && <QuizModule />}
      </main>

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
                  placeholder="e.g. Data Structures"
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl text-xs font-bold"
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