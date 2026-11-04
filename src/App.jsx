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
  Award,
  Layers,
  Calendar,
  AlertCircle
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

  // Student Registry (Pending & Approved Students)
  const [studentRegistry, setStudentRegistry] = useState([
    { id: 1, name: 'Bilal Ahmed', roll: 'UOT-2023-CS-01', email: 'bilal@gmail.com', verified: true },
    { id: 2, name: 'Ayesha Baloch', roll: 'UOT-2023-CS-02', email: 'ayesha@gmail.com', verified: true },
    { id: 3, name: 'Tariq Khan', roll: 'UOT-2024-CS-15', email: 'tariq@gmail.com', verified: false }
  ]);

  // Master Courses Database (Teacher-isolated)
  const [allCourses, setAllCourses] = useState([
    { 
      id: 1, 
      title: 'Web Application Development', 
      code: 'CS-401', 
      students: 45, 
      instructorEmail: 'amir.nawaz@uot.edu.pk',
      instructor: 'Mr. Amir Nawaz',
      attendance: [
        { id: 1, name: 'Bilal Ahmed', roll: 'UOT-2023-CS-01', status: 'Present' },
        { id: 2, name: 'Ayesha Baloch', roll: 'UOT-2023-CS-02', status: 'Present' },
        { id: 3, name: 'Tariq Khan', roll: 'UOT-2023-CS-03', status: 'Absent' }
      ],
      lectures: [
        { id: 1, title: 'Week 1: React & Vite Setup.pdf', date: 'Nov 2026', size: '2.4 MB' }
      ],
      notices: [
        { id: 1, title: 'CS-401 Midterm Schedule', content: 'Midterm quiz will cover React Basics.', date: 'Today' }
      ],
      presentations: [
        { id: 1, groupName: 'Alpha Team', topic: 'React State Management', members: 'Bilal, Ayesha', marks: '85/100' }
      ]
    },
    { 
      id: 2, 
      title: 'Software Engineering Principles', 
      code: 'SE-302', 
      students: 38, 
      instructorEmail: 'mahnaz.baloch@uot.edu.pk',
      instructor: 'Dr. Mahnaz Baloch',
      attendance: [],
      lectures: [
        { id: 1, title: 'Week 1: Software Lifecycles.pdf', date: 'Nov 2026', size: '3.1 MB' }
      ],
      notices: [
        { id: 1, title: 'SE-302 Project Group Deadline', content: 'Submit your SRS document by Friday.', date: 'Yesterday' }
      ],
      presentations: []
    }
  ]);

  // Selected Course State
  const [selectedCourseId, setSelectedCourseId] = useState(1);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');

  // Course-scoped Module Inputs
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newNoticeTitle, setNewNoticeTitle] = useState('');
  const [newNoticeContent, setNewNoticeContent] = useState('');
  const [newGroup, setNewGroup] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newMembers, setNewMembers] = useState('');

  // Master Admin & Authorization Logic
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
        const isTeacher = user.email === MASTER_ADMIN_EMAIL || user.email.endsWith('@uot.edu.pk');
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
        setAuthError("Google Auth successful! Enter your UoT Roll No (e.g. UOT-2024-CS-01) to finalize.");
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

  // FILTERED DATA ACCESS (ISOLATES TEACHER & STUDENT PERMISSIONS)
  const userName = currentUser?.displayName || "User";
  const userRole = currentUser?.role || 'student';

  // FIX ISSUE #2: Teachers see ONLY their own courses. Students see enrolled courses.
  const visibleCourses = allCourses.filter(course => {
    if (userRole === 'teacher') {
      return course.instructorEmail === currentUser?.email || currentUser?.email === MASTER_ADMIN_EMAIL;
    }
    return true; // Students view enrolled courses
  });

  const activeCourse = visibleCourses.find(c => c.id === selectedCourseId) || visibleCourses[0];

  // FIX ISSUE #3: Working Upload Lecture Note Handler
  const handleAddLecture = (e) => {
    e.preventDefault();
    if (!newLectureTitle || !activeCourse) return;
    const newLec = {
      id: Date.now(),
      title: newLectureTitle.endsWith('.pdf') ? newLectureTitle : `${newLectureTitle}.pdf`,
      date: 'Just Now',
      size: '1.8 MB'
    };
    
    setAllCourses(allCourses.map(c => 
      c.id === activeCourse.id 
        ? { ...c, lectures: [...(c.lectures || []), newLec] }
        : c
    ));
    setNewLectureTitle('');
  };

  // FIX ISSUE #4: Course-specific Notice Board Announcement Handler
  const handleAddNotice = (e) => {
    e.preventDefault();
    if (!newNoticeTitle || !newNoticeContent || !activeCourse) return;
    const newNot = {
      id: Date.now(),
      title: newNoticeTitle,
      content: newNoticeContent,
      date: 'Just Now'
    };

    setAllCourses(allCourses.map(c => 
      c.id === activeCourse.id 
        ? { ...c, notices: [...(c.notices || []), newNot] }
        : c
    ));
    setNewNoticeTitle('');
    setNewNoticeContent('');
  };

  // Presentation Group Handler
  const handleAddPresentation = (e) => {
    e.preventDefault();
    if (!newGroup || !newTopic || !activeCourse) return;
    const newPres = {
      id: Date.now(),
      groupName: newGroup,
      topic: newTopic,
      members: newMembers || 'Enrolled Students',
      marks: 'Pending Evaluation'
    };

    setAllCourses(allCourses.map(c => 
      c.id === activeCourse.id 
        ? { ...c, presentations: [...(c.presentations || []), newPres] }
        : c
    ));
    setNewGroup('');
    setNewTopic('');
    setNewMembers('');
  };

  // CSV Attendance Export
  const exportAttendanceCSV = () => {
    if (!activeCourse) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Roll No,Student Name,Status"]
      .concat((activeCourse.attendance || []).map(row => `${row.roll},${row.name},${row.status}`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeCourse.code}_attendance_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    const newCourseObj = {
      id: Date.now(),
      title: newCourseTitle,
      code: newCourseCode || 'CS-501',
      students: 1,
      instructorEmail: currentUser?.email,
      instructor: currentUser?.displayName || 'Teacher',
      attendance: [],
      lectures: [],
      notices: [],
      presentations: []
    };
    setAllCourses([...allCourses, newCourseObj]);
    setSelectedCourseId(newCourseObj.id);
    setNewCourseTitle('');
    setNewCourseCode('');
    setShowCreateCourseModal(false);
  };

  // AUTHENTICATION MODAL GATE
  if (!currentUser || showAuthModal) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 px-4 font-sans">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
              T
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Tezgam Secure Portal</h3>
              <p className="text-xs text-blue-600 font-medium">University of Turbat • Class Isolation Gate</p>
            </div>
          </div>

          <div className="bg-slate-100 p-1 rounded-xl flex mb-6">
            <button
              type="button"
              onClick={() => { setSelectedRole('teacher'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                selectedRole === 'teacher' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Teacher Portal</span>
            </button>
            <button
              type="button"
              onClick={() => { setSelectedRole('student'); setAuthError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center space-x-1.5 ${
                selectedRole === 'student' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'
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

          {authError && (
            <div className="mb-4 bg-red-50 text-red-600 border border-red-200 p-3 rounded-xl text-xs font-medium">
              {authError}
            </div>
          )}

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            {authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder={selectedRole === 'teacher' ? "e.g. Mr. Amir Nawaz" : "e.g. Student Name"}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                />
              </div>
            )}

            {selectedRole === 'student' && authMode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold uppercase text-blue-600 mb-1">UoT Student Roll Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UOT-2024-CS-01"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                  className="w-full bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 text-xs font-semibold"
                />
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
                {selectedRole === 'teacher' ? 'Official Email (@uot.edu.pk)' : 'Personal Gmail Address'}
              </label>
              <input
                type="email"
                required
                placeholder={selectedRole === 'teacher' ? "amir.nawaz@uot.edu.pk" : "student@gmail.com"}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Password</label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition text-xs shadow-md shadow-blue-600/30"
            >
              {authLoading ? 'Signing In...' : (authMode === 'signup' ? `Register ${selectedRole === 'teacher' ? 'Teacher' : 'Student'} Account` : 'Sign In')}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans">
      {/* SIDEBAR NAVIGATION - FIX ISSUE #7 (Uncluttered, intuitive tabs) */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl">
        <div>
          <div className="flex items-center space-x-3 px-2 py-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-white">Tezgam LMS</h1>
              <p className="text-[10px] text-blue-400 font-medium">University of Turbat</p>
            </div>
          </div>

          <div className="px-2 mb-4">
            <div className={`p-2.5 rounded-xl border text-xs font-bold flex items-center space-x-2 ${
              userRole === 'teacher' ? 'bg-indigo-950 border-indigo-800 text-indigo-300' : 'bg-blue-950 border-blue-800 text-blue-300'
            }`}>
              {userRole === 'teacher' ? <Briefcase className="w-4 h-4" /> : <GraduationCap className="w-4 h-4" />}
              <span>{userRole === 'teacher' ? 'Teacher Management' : 'Student Workspace'}</span>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'courses' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>{userRole === 'teacher' ? 'My Courses & Modules' : 'Enrolled Courses'}</span>
            </button>

            {userRole === 'teacher' && (
              <button
                onClick={() => setActiveTab('verification')}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  activeTab === 'verification' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-5 h-5" />
                <span>Student Approval Hub</span>
              </button>
            )}

            {/* FIX ISSUE #5: Course-Isolated Assignments */}
            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>Course Assignments</span>
            </button>

            <button
              onClick={() => setActiveTab('quizzes')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'quizzes' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Timed Quizzes</span>
            </button>
          </nav>
        </div>

        <div className="border-t border-slate-800 pt-4">
          <div className="flex items-center justify-between px-2">
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{userName}</p>
              <p className="text-[10px] text-blue-400 truncate">{currentUser?.email}</p>
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
              placeholder="Search course materials..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={handleLogout} 
            className="flex items-center space-x-1.5 text-xs font-bold bg-red-50 text-red-600 px-3 py-1.5 rounded-xl border border-red-200 hover:bg-red-100 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Log Out</span>
          </button>
        </header>

        {/* HERO BANNER */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-8">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Wash Atkay • University of Turbat
            </span>
            <h2 className="text-2xl font-extrabold mt-1">
              Welcome to {userRole === 'teacher' ? 'Teaching Management' : 'Study Portal'}, {userName}!
            </h2>
            <p className="text-xs text-blue-100 mt-1">
              {userRole === 'teacher' 
                ? 'Manage your private classes, publish lecture notes, and review student submissions.' 
                : 'Access notes, announcements, and assignments for your registered courses.'}
            </p>
          </div>
          <Sparkles className="w-36 h-36 text-white/5 absolute -right-6 -bottom-6 pointer-events-none" />
        </div>

        {/* VERIFICATION HUB FOR TEACHERS */}
        {activeTab === 'verification' && userRole === 'teacher' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Student Roll Number Approval</h3>
            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Gmail Address</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {studentRegistry.map((st) => (
                    <tr key={st.id}>
                      <td className="p-4 font-bold text-slate-800">{st.name}</td>
                      <td className="p-4 font-semibold text-blue-600">{st.roll}</td>
                      <td className="p-4 text-slate-600">{st.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                          st.verified ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {st.verified ? 'Approved' : 'Pending Verification'}
                        </span>
                      </td>
                      <td className="p-4">
                        {!st.verified && (
                          <button 
                            onClick={() => {
                              setStudentRegistry(studentRegistry.map(s => s.id === st.id ? { ...s, verified: true } : s));
                            }}
                            className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-xl text-[11px]"
                          >
                            Approve
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* COURSES TAB & COURSE-SPECIFIC ISOLATED MODULES */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {userRole === 'teacher' ? 'My Teaching Courses' : 'My Enrolled Courses'}
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

            {/* FIX ISSUE #2: Course Cards List (Only Teacher's Own Courses Displayed) */}
            {visibleCourses.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                <p className="font-bold text-sm">No courses created yet.</p>
                <p className="text-xs">Click "Create New Course" above to start managing your class.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {visibleCourses.map((course) => (
                  <div 
                    key={course.id} 
                    className={`p-6 rounded-2xl border transition ${
                      activeCourse?.id === course.id 
                        ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20' 
                        : 'bg-white border-slate-200'
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
                    
                    {/* FIX ISSUE #1: Fully Functional View Course Modules Button */}
                    <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                      <span className="text-slate-500 font-medium flex items-center space-x-1">
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>{course.students} Enrolled Students</span>
                      </span>
                      <button 
                        type="button"
                        onClick={() => setSelectedCourseId(course.id)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition flex items-center space-x-1 shadow-xs"
                      >
                        <span>View Course Modules</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ACTIVE COURSE ISOLATED MODULE DASHBOARD */}
            {activeCourse && (
              <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-10">
                <div className="flex justify-between items-center border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{activeCourse.code}</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{activeCourse.title}</h3>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Active Class View
                  </span>
                </div>

                {/* 1. CLASS ATTENDANCE */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-blue-600" />
                      <span>Class Attendance Register</span>
                    </h4>
                    {userRole === 'teacher' && (
                      <button 
                        onClick={exportAttendanceCSV}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center space-x-1.5 shadow-sm"
                      >
                        <Download className="w-4 h-4" />
                        <span>Export Attendance CSV</span>
                      </button>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3.5">Roll Number</th>
                          <th className="p-3.5">Student Name</th>
                          <th className="p-3.5">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(activeCourse.attendance || []).map((student) => (
                          <tr key={student.id}>
                            <td className="p-3.5 font-semibold text-slate-600">{student.roll}</td>
                            <td className="p-3.5 font-bold text-slate-800">{student.name}</td>
                            <td className="p-3.5">
                              <span className={`px-2.5 py-1 rounded-lg font-bold text-[10px] ${
                                student.status === 'Present' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
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

                {/* 2. FIX ISSUE #3: Working Upload Lecture Notes */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Lecture Notes & PDF Files for {activeCourse.code}</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(activeCourse.lectures || []).map((lec) => (
                      <div key={lec.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-xs text-slate-800">{lec.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{lec.date} • {lec.size}</p>
                        </div>
                        <button 
                          onClick={() => alert(`Downloading file: ${lec.title}`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {userRole === 'teacher' && (
                    <form onSubmit={handleAddLecture} className="flex space-x-2 mt-2">
                      <input 
                        type="text" 
                        required
                        placeholder="Enter lecture title or PDF name..." 
                        value={newLectureTitle}
                        onChange={(e) => setNewLectureTitle(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                      />
                      <button 
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Lecture Note</span>
                      </button>
                    </form>
                  )}
                </div>

                {/* 3. FIX ISSUE #4: Course-Isolated Notice Board */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                    <Megaphone className="w-5 h-5 text-blue-600" />
                    <span>Notice Board ({activeCourse.code} Students Only)</span>
                  </h4>

                  <div className="space-y-3">
                    {(activeCourse.notices || []).map((n) => (
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
                    <form onSubmit={handleAddNotice} className="space-y-2 mt-2">
                      <input 
                        type="text" 
                        required
                        placeholder="Announcement Title for this class..." 
                        value={newNoticeTitle}
                        onChange={(e) => setNewNoticeTitle(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <textarea 
                        required
                        placeholder="Notice Message (Will NOT be visible to other classes)..." 
                        value={newNoticeContent}
                        onChange={(e) => setNewNoticeContent(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <button 
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition"
                      >
                        Publish Class Announcement
                      </button>
                    </form>
                  )}
                </div>

                {/* 4. PRESENTATION GROUPS & MARKS */}
                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                    <Award className="w-5 h-5 text-blue-600" />
                    <span>Presentation Groups & Marks ({activeCourse.code})</span>
                  </h4>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3.5">Group</th>
                          <th className="p-3.5">Topic</th>
                          <th className="p-3.5">Members</th>
                          <th className="p-3.5">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(activeCourse.presentations || []).map((p) => (
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
                    <form onSubmit={handleAddPresentation} className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-2">
                      <input 
                        type="text" 
                        required
                        placeholder="Group Name" 
                        value={newGroup}
                        onChange={(e) => setNewGroup(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <input 
                        type="text" 
                        required
                        placeholder="Presentation Topic" 
                        value={newTopic}
                        onChange={(e) => setNewTopic(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <input 
                        type="text" 
                        placeholder="Student Names" 
                        value={newMembers}
                        onChange={(e) => setNewMembers(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                      />
                      <button 
                        type="submit"
                        className="md:col-span-3 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition"
                      >
                        Create Presentation Group
                      </button>
                    </form>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

        {/* FIX ISSUE #5: COURSE-ISOLATED ASSIGNMENTS TAB */}
        {activeTab === 'assignments' && (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-blue-900">
                  Viewing Assignments for: {activeCourse ? `${activeCourse.code} - ${activeCourse.title}` : 'All Enrolled Courses'}
                </h4>
                <p className="text-xs text-blue-700">Assignments uploaded here are isolated specifically to students of this course.</p>
              </div>
            </div>
            <AssignmentUpload courseCode={activeCourse?.code} />
          </div>
        )}

        {activeTab === 'quizzes' && <QuizModule courseCode={activeCourse?.code} />}
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