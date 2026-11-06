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
  AlertCircle,
  Home as HomeIcon,
  Trash2,
  Edit3,
  FileSpreadsheet,
  Check,
  X,
  FileCheck
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
  const [activeTab, setActiveTab] = useState('home');
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

  // Search Queries
  const [searchQuery, setSearchQuery] = useState('');
  const [studentSearchQuery, setStudentSearchQuery] = useState('');

  // Teacher Notification Hub
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New Submission', text: 'Bilal Ahmed submitted Assignment 1 (CS-401)', time: '10 mins ago', read: false },
    { id: 2, title: 'Roll Approval Request', text: 'Tariq Khan registered with UOT-2024-CS-15', time: '1 hour ago', read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Separate Assignment Marks Database
  const [assignmentMarksList, setAssignmentMarksList] = useState([
    { id: 1, name: 'Bilal Ahmed', roll: 'UOT-2023-CS-01', email: 'bilal@gmail.com', courseCode: 'CS-401', assignmentTitle: 'Assignment 1: Component State', marks: '88/100' },
    { id: 2, name: 'Ayesha Baloch', roll: 'UOT-2023-CS-02', email: 'ayesha@gmail.com', courseCode: 'CS-401', assignmentTitle: 'Assignment 1: Component State', marks: '92/100' },
    { id: 3, name: 'Tariq Khan', roll: 'UOT-2024-CS-15', email: 'tariq@gmail.com', courseCode: 'SE-302', assignmentTitle: 'Assignment 2: System Arch', marks: '75/100' }
  ]);
  const [editingAssignId, setEditingAssignId] = useState(null);
  const [editAssignMarks, setEditAssignMarks] = useState('');

  // Master Courses Database
  const [allCourses, setAllCourses] = useState([
    { 
      id: 1, 
      title: 'Web Application Development', 
      code: 'CS-401', 
      studentsCount: 45, 
      instructorEmail: 'amir.nawaz@uot.edu.pk',
      instructor: 'Mr. Amir Nawaz',
      attendance: [
        { id: 1, name: 'Bilal Ahmed', roll: 'UOT-2023-CS-01', status: 'Present' },
        { id: 2, name: 'Ayesha Baloch', roll: 'UOT-2023-CS-02', status: 'Late' },
        { id: 3, name: 'Tariq Khan', roll: 'UOT-2023-CS-03', status: 'Absent' }
      ],
      lectures: [
        { id: 1, title: 'React Architecture Overview', fileType: 'pdf', fileName: 'React_Arch.pdf', date: 'Nov 2026', size: '2.4 MB' },
        { id: 2, title: 'Vite & Tailwind Setup Slides', fileType: 'slides', fileName: 'Setup_Slides.pptx', date: 'Nov 2026', size: '4.8 MB' }
      ],
      notices: [
        { id: 1, title: 'CS-401 Midterm Schedule', content: 'Midterm quiz will cover React Basics.', date: 'Today' }
      ],
      presentations: [
        { id: 1, groupNumber: 'Group 01', groupName: 'Alpha Team', topic: 'State Management in LMS', members: 'Bilal Ahmed, Ayesha Baloch', marks: '85/100' }
      ]
    },
    { 
      id: 2, 
      title: 'Software Engineering Principles', 
      code: 'SE-302', 
      studentsCount: 38, 
      instructorEmail: 'mahnaz.baloch@uot.edu.pk',
      instructor: 'Dr. Mahnaz Baloch',
      attendance: [],
      lectures: [
        { id: 1, title: 'Software Requirement Docs Guide', fileType: 'docx', fileName: 'SRS_Guide.docx', date: 'Nov 2026', size: '1.2 MB' }
      ],
      notices: [],
      presentations: []
    }
  ]);

  // Assignments with Countdown Timers
  const [assignments, setAssignments] = useState([
    { id: 1, courseCode: 'CS-401', title: 'Assignment 1: Component State Design', deadline: '2026-11-28T23:59', totalMarks: 100 },
    { id: 2, courseCode: 'SE-302', title: 'Assignment 2: System Architecture Diagram', deadline: '2026-11-30T17:00', totalMarks: 50 }
  ]);
  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentDeadline, setNewAssignmentDeadline] = useState('');

  const [selectedCourseId, setSelectedCourseId] = useState(1);
  const [showCreateCourseModal, setShowCreateCourseModal] = useState(false);
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseCode, setNewCourseCode] = useState('');

  // Lecture Upload State
  const [newLectureTitle, setNewLectureTitle] = useState('');
  const [newLectureFileType, setNewLectureFileType] = useState('pdf');

  // Presentation State
  const [newGroupNum, setNewGroupNum] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newMembers, setNewMembers] = useState('');

  const MASTER_ADMIN_EMAIL = "amir.nawaz@uot.edu.pk";

  const checkUserAuthorization = (userEmail, role, roll) => {
    if (userEmail === MASTER_ADMIN_EMAIL) return { authorized: true, role: 'teacher' };
    if (role === 'teacher') {
      const isOfficial = userEmail.endsWith('@uot.edu.pk');
      return { authorized: isOfficial, role: 'teacher', error: isOfficial ? null : "Teachers must use an official @uot.edu.pk email." };
    }
    if (role === 'student') {
      const hasRoll = roll && roll.trim().toUpperCase().startsWith('UOT-');
      return { 
        authorized: hasRoll, 
        role: 'student', 
        error: hasRoll ? null : "Invalid Roll Number! Enter a valid UoT Roll No (e.g. UOT-2024-CS-01)." 
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
        setAuthError("Google Auth successful! Enter your UoT Roll No (e.g. UOT-2024-CS-01) to finish.");
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

    if (authMode === 'signup') {
      const authCheck = checkUserAuthorization(email, selectedRole, rollNumber);
      if (!authCheck.authorized) {
        setAuthError(authCheck.error);
        setAuthLoading(false);
        return;
      }
    }

    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: name });
        
        if (selectedRole === 'student') {
          setAssignmentMarksList(prev => [...prev, {
            id: Date.now(),
            name: name,
            roll: rollNumber.toUpperCase(),
            email: email,
            courseCode: 'CS-401',
            assignmentTitle: 'Assignment 1',
            marks: 'Pending'
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const isTeacher = userCredential.user.email === MASTER_ADMIN_EMAIL || userCredential.user.email.endsWith('@uot.edu.pk');
        setCurrentUser({
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: userCredential.user.displayName || userCredential.user.email.split('@')[0],
          role: isTeacher ? 'teacher' : 'student',
          isAuthorized: true
        });
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

  const visibleCourses = allCourses.filter(course => {
    if (userRole === 'teacher') {
      return course.instructorEmail === currentUser?.email || currentUser?.email === MASTER_ADMIN_EMAIL;
    }
    return true;
  });

  const activeCourse = visibleCourses.find(c => c.id === selectedCourseId) || visibleCourses[0];

  const toggleAttendanceStatus = (studentId) => {
    if (!activeCourse) return;
    const statuses = ['Present', 'Absent', 'Leave', 'Late'];
    
    setAllCourses(allCourses.map(c => {
      if (c.id === activeCourse.id) {
        const updatedAttendance = c.attendance.map(st => {
          if (st.id === studentId) {
            const nextIdx = (statuses.indexOf(st.status) + 1) % statuses.length;
            return { ...st, status: statuses[nextIdx] };
          }
          return st;
        });
        return { ...c, attendance: updatedAttendance };
      }
      return c;
    }));
  };

  const exportAttendanceCSV = () => {
    if (!activeCourse) return;
    const csvContent = "data:text/csv;charset=utf-8," + 
      ["Roll No,Student Name,Status"]
      .concat((activeCourse.attendance || []).map(row => `${row.roll},${row.name},${row.status}`))
      .join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${activeCourse.code}_Attendance_Report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file || !activeCourse) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split("\n").slice(1);
      const importedData = lines.filter(l => l.trim()).map((l, idx) => {
        const [roll, name, status] = l.split(",");
        return { id: Date.now() + idx, roll: roll?.trim(), name: name?.trim(), status: status?.trim() || 'Present' };
      });
      setAllCourses(allCourses.map(c => c.id === activeCourse.id ? { ...c, attendance: importedData } : c));
      alert(`Imported ${importedData.length} student attendance records!`);
    };
    reader.readAsText(file);
  };

  const handleAddLecture = (e) => {
    e.preventDefault();
    if (!newLectureTitle || !activeCourse) return;
    const ext = newLectureFileType === 'pdf' ? '.pdf' : newLectureFileType === 'slides' ? '.pptx' : '.docx';
    const newLec = {
      id: Date.now(),
      title: newLectureTitle,
      fileType: newLectureFileType,
      fileName: `${newLectureTitle.replace(/\s+/g, '_')}${ext}`,
      date: 'Just Now',
      size: '2.1 MB'
    };
    
    setAllCourses(allCourses.map(c => 
      c.id === activeCourse.id 
        ? { ...c, lectures: [...(c.lectures || []), newLec] }
        : c
    ));
    setNewLectureTitle('');
  };

  const calculateTimeRemaining = (deadlineStr) => {
    const total = Date.parse(deadlineStr) - Date.parse(new Date());
    if (total <= 0) return { expired: true, text: 'Deadline Passed' };
    const hours = Math.floor((total / (1000 * 60 * 60)));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return { expired: false, text: `${days}d ${remHours}h remaining` };
  };

  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!newAssignmentTitle || !newAssignmentDeadline || !activeCourse) return;
    const newAssign = {
      id: Date.now(),
      courseCode: activeCourse.code,
      title: newAssignmentTitle,
      deadline: newAssignmentDeadline,
      totalMarks: 100
    };
    setAssignments([...assignments, newAssign]);
    setNewAssignmentTitle('');
    setNewAssignmentDeadline('');
  };

  const handleAddPresentationGroup = (e) => {
    e.preventDefault();
    if (!newGroupName || !newTopic || !activeCourse) return;
    const newPres = {
      id: Date.now(),
      groupNumber: newGroupNum || `Group 0${(activeCourse.presentations?.length || 0) + 1}`,
      groupName: newGroupName,
      topic: newTopic,
      members: newMembers || 'Assigned Students',
      marks: 'Pending Evaluation'
    };

    setAllCourses(allCourses.map(c => 
      c.id === activeCourse.id 
        ? { ...c, presentations: [...(c.presentations || []), newPres] }
        : c
    ));
    setNewGroupNum('');
    setNewGroupName('');
    setNewTopic('');
    setNewMembers('');
  };

  const updatePresentationMarks = (presId, marksValue) => {
    setAllCourses(allCourses.map(c => {
      if (c.id === activeCourse.id) {
        const updatedPres = c.presentations.map(p => p.id === presId ? { ...p, marks: marksValue } : p);
        return { ...c, presentations: updatedPres };
      }
      return c;
    }));
  };

  const handleDeleteAssignmentMark = (assignId) => {
    if (window.confirm("Are you sure you want to delete this assignment mark record?")) {
      setAssignmentMarksList(assignmentMarksList.filter(s => s.id !== assignId));
    }
  };

  const handleSaveAssignmentMarks = (assignId) => {
    setAssignmentMarksList(assignmentMarksList.map(s => s.id === assignId ? { ...s, marks: editAssignMarks } : s));
    setEditingAssignId(null);
  };

  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseTitle) return;
    const newCourseObj = {
      id: Date.now(),
      title: newCourseTitle,
      code: newCourseCode || 'CS-501',
      studentsCount: 1,
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

  if (!currentUser || showAuthModal) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 px-4 font-sans">
        <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl relative border border-slate-100">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center font-bold text-white text-xl shadow-md">
              T
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">Welcome to Tezgam LMS</h3>
              <p className="text-xs text-blue-600 font-medium">University of Turbat • Official Portal</p>
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
                {selectedRole === 'teacher' ? 'Official Email (@uot.edu.pk)' : 'Email Address'}
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
              {authLoading ? 'Processing...' : (authMode === 'signup' ? `Register ${selectedRole === 'teacher' ? 'Teacher' : 'Student'} Account` : 'Sign In')}
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
              {authMode === 'signup' ? 'Already have an account? Sign In' : "Need an account? Register"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredAssignmentMarks = assignmentMarksList.filter(st => {
    if (userRole === 'student') {
      return st.email === currentUser?.email;
    }
    return st.name.toLowerCase().includes(studentSearchQuery.toLowerCase()) || 
           st.roll.toLowerCase().includes(studentSearchQuery.toLowerCase());
  });

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
              onClick={() => setActiveTab('home')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'home' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <HomeIcon className="w-5 h-5" />
              <span>Home Dashboard</span>
            </button>

            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'courses' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-5 h-5" />
              <span>{userRole === 'teacher' ? 'My Courses & Lectures' : 'Enrolled Courses'}</span>
            </button>

            {/* SEPARATE TABS FOR ASSIGNMENT MARKS & PRESENTATION MARKS */}
            <button
              onClick={() => setActiveTab('assignmentMarks')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'assignmentMarks' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <FileText className="w-5 h-5" />
              <span>{userRole === 'teacher' ? 'Assignment Marks' : 'My Assignment Grades'}</span>
            </button>

            <button
              onClick={() => setActiveTab('presentationMarks')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'presentationMarks' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Award className="w-5 h-5" />
              <span>{userRole === 'teacher' ? 'Presentation Marks' : 'My Presentation Grades'}</span>
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

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Clock className="w-5 h-5" />
              <span>Assignments & Deadlines</span>
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

        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="px-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Developed by: Amir Nawaz</p>
          </div>
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
              placeholder="Search LMS portal..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-4 relative">
            {userRole === 'teacher' && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition relative text-slate-600"
                >
                  <Bell className="w-4 h-4" />
                  {notifications.some(n => !n.read) && (
                    <span className="w-2 h-2 bg-red-500 rounded-full absolute top-1 right-1"></span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 z-50">
                    <h4 className="font-bold text-xs text-slate-800 border-b pb-2 mb-2">Teacher Notifications</h4>
                    <div className="space-y-2">
                      {notifications.map(n => (
                        <div key={n.id} className="p-2 bg-slate-50 rounded-xl text-xs">
                          <p className="font-bold text-slate-800">{n.title}</p>
                          <p className="text-[11px] text-slate-600">{n.text}</p>
                          <span className="text-[9px] text-slate-400">{n.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

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
              Wash Atkay Amir nawaz!
            </h2>
            <div className="flex items-center space-x-2 mt-3">
              <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
              <p className="text-sm font-semibold text-blue-100 tracking-wide">
                "Lets Learn Together"
              </p>
            </div>
          </div>
          <Sparkles className="w-36 h-36 text-white/5 absolute -right-6 -bottom-6 pointer-events-none" />
        </div>

        {activeTab === 'home' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Active Enrolled Courses</span>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">{visibleCourses.length}</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Total Class Students</span>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">
                  {visibleCourses.reduce((acc, c) => acc + (c.studentsCount || 0), 0)}
                </p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <span className="text-xs font-bold text-slate-400 uppercase">Pending Assignments</span>
                <p className="text-3xl font-extrabold text-indigo-600 mt-2">{assignments.length}</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="font-bold text-base text-slate-800 mb-4">Quick Overview & Recent Courses</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {visibleCourses.map(c => (
                  <div key={c.id} className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{c.code}</span>
                      <p className="font-bold text-xs text-slate-800 mt-1">{c.title}</p>
                      <p className="text-[11px] text-slate-500">{c.studentsCount} Students Enrolled</p>
                    </div>
                    <button 
                      onClick={() => { setSelectedCourseId(c.id); setActiveTab('courses'); }}
                      className="bg-blue-600 text-white text-xs px-3 py-1.5 rounded-xl font-bold"
                    >
                      Open Class
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SEPARATED TAB 1: ASSIGNMENT MARKS */}
        {activeTab === 'assignmentMarks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {userRole === 'teacher' ? 'Assignment Marks Management' : 'My Assignment Grades'}
                </h3>
                <p className="text-xs text-slate-500">
                  {userRole === 'teacher' ? 'Manage and update scores for student coursework assignments.' : 'View your isolated assignment marks.'}
                </p>
              </div>
              {userRole === 'teacher' && (
                <div className="relative w-64">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input 
                    type="text" 
                    placeholder="Search by student name or roll..." 
                    value={studentSearchQuery}
                    onChange={(e) => setStudentSearchQuery(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs"
                  />
                </div>
              )}
            </div>

            <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Roll Number</th>
                    <th className="p-4">Course</th>
                    <th className="p-4">Assignment Title</th>
                    <th className="p-4">Assignment Marks</th>
                    {userRole === 'teacher' && <th className="p-4">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredAssignmentMarks.map((st) => (
                    <tr key={st.id}>
                      <td className="p-4 font-bold text-slate-800">{st.name}</td>
                      <td className="p-4 font-semibold text-blue-600">{st.roll}</td>
                      <td className="p-4 text-slate-600">{st.courseCode}</td>
                      <td className="p-4 text-slate-600">{st.assignmentTitle}</td>
                      <td className="p-4 font-extrabold text-emerald-600">
                        {editingAssignId === st.id ? (
                          <input 
                            type="text" 
                            value={editAssignMarks}
                            onChange={(e) => setEditAssignMarks(e.target.value)}
                            className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs w-20"
                          />
                        ) : (
                          st.marks
                        )}
                      </td>
                      {userRole === 'teacher' && (
                        <td className="p-4 flex items-center space-x-2">
                          {editingAssignId === st.id ? (
                            <button 
                              onClick={() => handleSaveAssignmentMarks(st.id)}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg"
                              title="Save Marks"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => { setEditingAssignId(st.id); setEditAssignMarks(st.marks); }}
                              className="p-1.5 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                              title="Edit Marks"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteAssignmentMark(st.id)}
                            className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100"
                            title="Delete Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEPARATED TAB 2: PRESENTATION MARKS */}
        {activeTab === 'presentationMarks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  {userRole === 'teacher' ? 'Presentation Marks & Group Evaluation' : 'My Presentation Grades'}
                </h3>
                <p className="text-xs text-slate-500">
                  {userRole === 'teacher' ? 'Evaluate group presentations, topics, and assign marks.' : 'View your group presentation evaluations.'}
                </p>
              </div>
            </div>

            {visibleCourses.map(course => (
              <div key={course.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b pb-3">
                  <div>
                    <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{course.code}</span>
                    <h4 className="font-bold text-sm text-slate-800 mt-1">{course.title} - Presentation Evaluation</h4>
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Group No</th>
                        <th className="p-3.5">Group Name</th>
                        <th className="p-3.5">Presentation Topic</th>
                        <th className="p-3.5">Assigned Members</th>
                        <th className="p-3.5">Presentation Marks / Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(course.presentations || []).map((p) => (
                        <tr key={p.id}>
                          <td className="p-3.5 font-bold text-blue-600">{p.groupNumber}</td>
                          <td className="p-3.5 font-bold text-slate-800">{p.groupName}</td>
                          <td className="p-3.5 text-slate-600">{p.topic}</td>
                          <td className="p-3.5 text-slate-600">{p.members}</td>
                          <td className="p-3.5 font-extrabold text-emerald-600">
                            {userRole === 'teacher' ? (
                              <input 
                                type="text" 
                                value={p.marks}
                                onChange={(e) => updatePresentationMarks(p.id, e.target.value)}
                                className="bg-slate-50 border border-slate-300 rounded px-2 py-1 text-xs w-24"
                              />
                            ) : (
                              p.marks
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <h3 className="text-lg font-bold text-slate-800">Assignments & Live Reminders</h3>

            {userRole === 'teacher' && (
              <form onSubmit={handleCreateAssignment} className="bg-white p-6 border border-slate-200 rounded-2xl space-y-4">
                <h4 className="font-bold text-xs text-slate-700">Assign New Assignment</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    type="text" 
                    required
                    placeholder="Assignment Title..." 
                    value={newAssignmentTitle}
                    onChange={(e) => setNewAssignmentTitle(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                  />
                  <input 
                    type="datetime-local" 
                    required
                    value={newAssignmentDeadline}
                    onChange={(e) => setNewAssignmentDeadline(e.target.value)}
                    className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-xs"
                  />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-xl text-xs font-bold">
                  Publish Assignment
                </button>
              </form>
            )}

            <div className="space-y-4">
              {assignments.map(a => {
                const rem = calculateTimeRemaining(a.deadline);
                return (
                  <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-6 flex justify-between items-center shadow-sm">
                    <div>
                      <span className="text-[10px] font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-lg">{a.courseCode}</span>
                      <h4 className="font-bold text-sm text-slate-800 mt-2">{a.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Deadline: {new Date(a.deadline).toLocaleString()}</p>
                    </div>

                    <div className="text-right">
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold border flex items-center space-x-1 ${
                        rem.expired ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{rem.text}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <AssignmentUpload courseCode={activeCourse?.code} />
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-800">
                {userRole === 'teacher' ? 'My Teaching Courses' : 'My Enrolled Courses'}
              </h3>
              {userRole === 'teacher' && (
                <button 
                  onClick={() => setShowCreateCourseModal(true)}
                  className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center space-x-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Create New Course</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {visibleCourses.map((course) => (
                <div 
                  key={course.id} 
                  className={`p-6 rounded-2xl border transition ${
                    activeCourse?.id === course.id ? 'bg-blue-50/40 border-blue-500 ring-2 ring-blue-500/20' : 'bg-white border-slate-200'
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
                      <span>{course.studentsCount} Total Students Enrolled</span>
                    </span>
                    <button 
                      type="button"
                      onClick={() => setSelectedCourseId(course.id)}
                      className="bg-blue-600 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center space-x-1"
                    >
                      <span>Open Course Modules</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {activeCourse && (
              <div className="mt-8 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm space-y-10">
                <div className="flex justify-between items-center border-b border-slate-200 pb-5">
                  <div>
                    <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">{activeCourse.code}</span>
                    <h3 className="text-2xl font-extrabold text-slate-900">{activeCourse.title}</h3>
                  </div>
                  <span className="text-xs font-bold bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl border border-emerald-200">
                    Active Class Session
                  </span>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                        <UserCheck className="w-5 h-5 text-blue-600" />
                        <span>Class Attendance Register</span>
                      </h4>
                      <p className="text-xs text-slate-500">Click any status to cycle between Present, Absent, Leave, or Late.</p>
                    </div>

                    {userRole === 'teacher' && (
                      <div className="flex items-center space-x-2">
                        <label className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold px-3 py-2 rounded-xl cursor-pointer flex items-center space-x-1 border">
                          <FileSpreadsheet className="w-3.5 h-3.5" />
                          <span>Import CSV</span>
                          <input type="file" accept=".csv" onChange={handleImportCSV} className="hidden" />
                        </label>
                        <button 
                          onClick={exportAttendanceCSV}
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center space-x-1.5 shadow-sm"
                        >
                          <Download className="w-4 h-4" />
                          <span>Export CSV Report</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                        <tr>
                          <th className="p-3.5">Roll Number</th>
                          <th className="p-3.5">Student Name</th>
                          <th className="p-3.5">Attendance Status (Click to Toggle)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(activeCourse.attendance || []).map((student) => (
                          <tr key={student.id}>
                            <td className="p-3.5 font-semibold text-slate-600">{student.roll}</td>
                            <td className="p-3.5 font-bold text-slate-800">{student.name}</td>
                            <td className="p-3.5">
                              <button
                                onClick={() => toggleAttendanceStatus(student.id)}
                                className={`px-3 py-1 rounded-xl font-bold text-xs border ${
                                  student.status === 'Present' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                  student.status === 'Absent' ? 'bg-red-50 text-red-700 border-red-200' :
                                  student.status === 'Leave' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                  'bg-purple-50 text-purple-700 border-purple-200'
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

                <div className="space-y-4 pt-6 border-t border-slate-200">
                  <h4 className="font-bold text-base text-slate-800 flex items-center space-x-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <span>Course Notes & Lecture Downloads ({activeCourse.code})</span>
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(activeCourse.lectures || []).map((lec) => (
                      <div key={lec.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex justify-between items-center">
                        <div>
                          <div className="flex items-center space-x-1.5">
                            <span className="text-[9px] font-bold uppercase bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                              {lec.fileType}
                            </span>
                            <p className="font-bold text-xs text-slate-800">{lec.title}</p>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1">{lec.fileName} • {lec.size}</p>
                        </div>
                        <button 
                          onClick={() => alert(`Downloading "${lec.fileName}" to your device...`)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl text-xs font-bold flex items-center space-x-1 shadow-sm"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download</span>
                        </button>
                      </div>
                    ))}
                  </div>

                  {userRole === 'teacher' && (
                    <form onSubmit={handleAddLecture} className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-2">
                      <input 
                        type="text" 
                        required
                        placeholder="Lecture note title..." 
                        value={newLectureTitle}
                        onChange={(e) => setNewLectureTitle(e.target.value)}
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs"
                      />
                      <select
                        value={newLectureFileType}
                        onChange={(e) => setNewLectureFileType(e.target.value)}
                        className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs font-semibold"
                      >
                        <option value="pdf">PDF Document (.pdf)</option>
                        <option value="slides">Presentation Slides (.pptx)</option>
                        <option value="docx">Word Document (.docx)</option>
                      </select>
                      <button 
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center space-x-1"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload File</span>
                      </button>
                    </form>
                  )}
                </div>

              </div>
            )}
          </div>
        )}

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
                  {assignmentMarksList.map((st) => (
                    <tr key={st.id}>
                      <td className="p-4 font-bold text-slate-800">{st.name}</td>
                      <td className="p-4 font-semibold text-blue-600">{st.roll}</td>
                      <td className="p-4 text-slate-600">{st.email}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          Approved
                        </span>
                      </td>
                      <td className="p-4">
                        <span className="text-slate-400 text-xs">Verified</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'quizzes' && <QuizModule courseCode={activeCourse?.code} />}
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