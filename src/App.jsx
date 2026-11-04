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
  Plus,
  Download,
  Upload,
  Users,
  Megaphone,
  CheckCircle,
  XCircle,
  Calendar,
  Layers,
  FileSpreadsheet,
  AlertCircle,
  Mail,
  ShieldCheck,
  ShieldAlert,
  FileCode,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

// ==========================================
// MOCK INITIAL DATA
// ==========================================
const INITIAL_COURSES = [
  {
    id: 'cs-101',
    code: 'CS-301',
    title: 'Web Application Development',
    dept: 'Department of Computer Science',
    desc: 'Full-stack web application development with React, Node.js, and modern cloud databases.',
    students: [
      { id: 's1', name: 'Zahid Ali', email: 'zahid.cs@uot.edu.pk', regNo: 'UOT-CS-2022-014' },
      { id: 's2', name: 'Samina Baloch', email: 'samina.b@uot.edu.pk', regNo: 'UOT-CS-2022-021' },
      { id: 's3', name: 'Yasir Jan', email: 'yasir.jan@uot.edu.pk', regNo: 'UOT-CS-2022-009' },
      { id: 's4', name: 'Ganj Khatun', email: 'ganj.k@uot.edu.pk', regNo: 'UOT-CS-2022-033' }
    ]
  },
  {
    id: 'se-202',
    code: 'SE-402',
    title: 'Software Engineering Principles',
    dept: 'Department of Computer Science',
    desc: 'Software development lifecycle, Agile methodologies, system design, and testing patterns.',
    students: [
      { id: 's1', name: 'Zahid Ali', email: 'zahid.cs@uot.edu.pk', regNo: 'UOT-CS-2022-014' },
      { id: 's5', name: 'Bilal Ahmed', email: 'bilal.ahmed@uot.edu.pk', regNo: 'UOT-SE-2022-005' }
    ]
  }
];

const INITIAL_ASSIGNMENTS = [
  {
    id: 'asg-1',
    courseId: 'cs-101',
    title: 'Assignment 1: Responsive Layout with Tailwind CSS',
    description: 'Design a responsive dashboard layout for Tezgam LMS using Tailwind utility classes.',
    maxMarks: 50,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 36).toISOString(), // 36 hours from now
    submissions: [
      { studentId: 's1', studentName: 'Zahid Ali', fileUrl: 'https://github.com/zahid/uot-tailwind-task', submittedAt: '2026-11-03 14:20', marks: 48 }
    ]
  },
  {
    id: 'asg-2',
    courseId: 'cs-101',
    title: 'Project Proposal & System Architecture',
    description: 'Submit your 2-page PDF project proposal along with sequence and architecture diagrams.',
    maxMarks: 100,
    dueDate: new Date(Date.now() + 1000 * 60 * 60 * 120).toISOString(), // 5 days from now
    submissions: []
  }
];

const INITIAL_MATERIALS = [
  { id: 'm1', courseId: 'cs-101', title: 'Lecture 01 - Intro to React & Vite', type: 'PDF Document', size: '2.4 MB', date: '2026-11-01' },
  { id: 'm2', courseId: 'cs-101', title: 'Lecture 02 - Tailwind CSS Design Tokens', type: 'Presentation Slides', size: '5.1 MB', date: '2026-11-03' }
];

const INITIAL_NOTICES = [
  { id: 'n1', courseId: 'cs-101', title: 'Mid-term Project Discussion Scheduled', content: 'Our mid-term project presentations will start next Monday at 10:00 AM in Lab 2.', date: '2026-11-02 09:00 AM', author: 'Mr. Amir Nawaz' }
];

const INITIAL_PRESENTATIONS = [
  {
    id: 'grp-1',
    courseId: 'cs-101',
    groupNumber: 'Group 1',
    groupName: 'CodeCraft Turbat',
    topic: 'Building Scalable Realtime Portals with Firebase',
    maxMarks: 30,
    studentIds: ['s1', 's2'],
    evaluated: true,
    obtainedMarks: 28,
    feedback: 'Excellent slides and clear demonstration of backend authorization listeners.'
  }
];

export default function App() {
  // Master Admin Email (Authorized Teacher by default)
  const MASTER_ADMIN_EMAIL = "amir.nawaz@uot.edu.pk";

  // Auth User State
  const [currentUser, setCurrentUser] = useState({
    uid: 'teacher-1',
    name: 'Mr. Amir Nawaz',
    email: MASTER_ADMIN_EMAIL,
    role: 'Teacher', // 'Teacher' or 'Student'
    isAuthorized: true
  });
  
  // Navigation State
  const [activeTab, setActiveTab] = useState('courses'); // courses, attendance, assignments, materials, notices, presentations
  const [selectedCourseId, setSelectedCourseId] = useState('cs-101');

  // Login / Auth Form States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [authRole, setAuthRole] = useState('Student');
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');

  // Data States
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [notices, setNotices] = useState(INITIAL_NOTICES);
  const [presentations, setPresentations] = useState(INITIAL_PRESENTATIONS);

  // Attendance State
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceRecords, setAttendanceRecords] = useState({
    's1': 'Present',
    's2': 'Present',
    's3': 'Absent',
    's4': 'Late'
  });

  // Notifications State
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Zahid Ali submitted Assignment 1: Responsive Layout', time: '10 mins ago', read: false },
    { id: 2, text: 'Samina Baloch registered and joined CS-301 Web App Dev', time: '1 hour ago', read: false }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);

  // Modals & Creation Forms
  const [showNewCourseModal, setShowNewCourseModal] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseDept, setNewCourseDept] = useState('Department of Computer Science');
  const [newCourseDesc, setNewCourseDesc] = useState('');

  const [showNewAsgModal, setShowNewAsgModal] = useState(false);
  const [asgTitle, setAsgTitle] = useState('');
  const [asgDesc, setAsgDesc] = useState('');
  const [asgMarks, setAsgMarks] = useState(50);
  const [asgDueDate, setAsgDueDate] = useState('');

  const [showNewMatModal, setShowNewMatModal] = useState(false);
  const [matTitle, setMatTitle] = useState('');
  const [matType, setMatType] = useState('PDF Document');

  const [showNewNoticeModal, setShowNewNoticeModal] = useState(false);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeContent, setNoticeContent] = useState('');

  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupNo, setGroupNo] = useState('Group 2');
  const [groupName, setGroupName] = useState('');
  const [groupTopic, setGroupTopic] = useState('');
  const [groupMaxMarks, setGroupMaxMarks] = useState(30);
  const [selectedGroupStudents, setSelectedGroupStudents] = useState([]);

  // Assignment Submission link for students
  const [submissionLink, setSubmissionLink] = useState('');

  // Active selected course
  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Notification helper
  const addNotification = (text) => {
    setNotifications(prev => [{ id: Date.now(), text, time: 'Just now', read: false }, ...prev]);
  };

  // Gmail / Google Auth Handler
  const handleGmailAuth = () => {
    const isTeacher = authRole === 'Teacher';
    const mockEmail = isTeacher ? 'prof.baloch@gmail.com' : 'student.gmail@uot.edu.pk';
    const mockName = isTeacher ? 'Dr. Mahnaz Baloch' : 'Khurram Shehzad';
    
    // Authorization logic: Master Admin or Students are authorized instantly. Teachers require authorization.
    const isAuth = mockEmail === MASTER_ADMIN_EMAIL || !isTeacher;

    const newUser = {
      uid: 'user-' + Date.now(),
      name: mockName,
      email: mockEmail,
      role: authRole,
      isAuthorized: isAuth
    };

    setCurrentUser(newUser);

    if (authRole === 'Student' && currentCourse) {
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          const exists = c.students.some(s => s.email === mockEmail);
          if (!exists) {
            return {
              ...c,
              students: [...c.students, { id: 's-' + Date.now(), name: mockName, email: mockEmail, regNo: 'UOT-2026-GMAIL' }]
            };
          }
        }
        return c;
      }));
      addNotification(`${mockName} registered via Gmail & enrolled in ${currentCourse.code}`);
    }

    setShowAuthModal(false);
  };

  // Custom Email Auth Submit Handler
  const handleEmailAuthSubmit = (e) => {
    e.preventDefault();
    if (!authEmail) return;

    const isTeacher = authRole === 'Teacher';
    const displayName = authName || authEmail.split('@')[0];
    const isAuth = authEmail === MASTER_ADMIN_EMAIL || !isTeacher;

    const newUser = {
      uid: 'user-' + Date.now(),
      name: displayName,
      email: authEmail,
      role: authRole,
      isAuthorized: isAuth
    };

    setCurrentUser(newUser);

    if (authRole === 'Student' && currentCourse) {
      setCourses(prev => prev.map(c => {
        if (c.id === selectedCourseId) {
          const exists = c.students.some(s => s.email === authEmail);
          if (!exists) {
            return {
              ...c,
              students: [...c.students, { id: 's-' + Date.now(), name: displayName, email: authEmail, regNo: 'UOT-2026-' + Math.floor(100+Math.random()*900) }]
            };
          }
        }
        return c;
      }));
      addNotification(`${displayName} registered & enrolled in ${currentCourse.code}`);
    }

    setShowAuthModal(false);
  };

  // Create Course
  const handleCreateCourse = (e) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseCode) return;

    const newC = {
      id: 'course-' + Date.now(),
      code: newCourseCode,
      title: newCourseTitle,
      dept: newCourseDept,
      desc: newCourseDesc,
      students: []
    };

    setCourses([...courses, newC]);
    setSelectedCourseId(newC.id);
    setShowNewCourseModal(false);
    setNewCourseCode('');
    setNewCourseTitle('');
    setNewCourseDesc('');
  };

  // CSV Attendance Export
  const exportAttendanceCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,Reg Number,Student Name,Email,Date,Attendance Status\n";
    currentCourse.students.forEach(s => {
      const status = attendanceRecords[s.id] || 'Present';
      csvContent += `${s.regNo},"${s.name}",${s.email},${attendanceDate},${status}\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${currentCourse.code}_Attendance_${attendanceDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Attendance Import Simulation
  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTimeout(() => {
        alert(`Successfully imported attendance register from "${file.name}". Records synced.`);
      }, 500);
    }
  };

  // Create Assignment
  const handleCreateAssignment = (e) => {
    e.preventDefault();
    if (!asgTitle || !asgDueDate) return;

    const newAsg = {
      id: 'asg-' + Date.now(),
      courseId: selectedCourseId,
      title: asgTitle,
      description: asgDesc,
      maxMarks: Number(asgMarks),
      dueDate: new Date(asgDueDate).toISOString(),
      submissions: []
    };

    setAssignments([...assignments, newAsg]);
    setShowNewAsgModal(false);
    setAsgTitle('');
    setAsgDesc('');
  };

  // Student Assignment Submission
  const handleSubmitAssignment = (asgId) => {
    if (!submissionLink) return;
    
    setAssignments(prev => prev.map(a => {
      if (a.id === asgId) {
        const newSub = {
          studentId: currentUser.uid,
          studentName: currentUser.name,
          fileUrl: submissionLink,
          submittedAt: new Date().toLocaleString(),
          marks: null
        };
        return { ...a, submissions: [...a.submissions, newSub] };
      }
      return a;
    }));

    addNotification(`${currentUser.name} submitted assignment work.`);
    setSubmissionLink('');
    alert('Assignment submitted successfully!');
  };

  // Create Lecture Material
  const handleCreateMaterial = (e) => {
    e.preventDefault();
    if (!matTitle) return;

    const newMat = {
      id: 'mat-' + Date.now(),
      courseId: selectedCourseId,
      title: matTitle,
      type: matType,
      size: '3.5 MB',
      date: new Date().toISOString().split('T')[0]
    };

    setMaterials([...materials, newMat]);
    setShowNewMatModal(false);
    setMatTitle('');
  };

  // Create Notice Announcement
  const handleCreateNotice = (e) => {
    e.preventDefault();
    if (!noticeTitle || !noticeContent) return;

    const newN = {
      id: 'not-' + Date.now(),
      courseId: selectedCourseId,
      title: noticeTitle,
      content: noticeContent,
      date: new Date().toLocaleString(),
      author: currentUser.name
    };

    setNotices([newN, ...notices]);
    setShowNewNoticeModal(false);
    setNoticeTitle('');
    setNoticeContent('');
  };

  // Create Presentation Group
  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!groupName || !groupTopic) return;

    const newG = {
      id: 'grp-' + Date.now(),
      courseId: selectedCourseId,
      groupNumber: groupNo,
      groupName,
      topic: groupTopic,
      maxMarks: Number(groupMaxMarks),
      studentIds: selectedGroupStudents,
      evaluated: false,
      obtainedMarks: 0,
      feedback: ''
    };

    setPresentations([...presentations, newG]);
    setShowNewGroupModal(false);
    setGroupName('');
    setGroupTopic('');
    setSelectedGroupStudents([]);
  };

  // Evaluate Group Presentation Marks
  const handleEvaluateGroup = (groupId, marks, feedback) => {
    setPresentations(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          evaluated: true,
          obtainedMarks: Number(marks),
          feedback
        };
      }
      return g;
    }));
  };

  // Time remaining countdown helper
  const renderCountdown = (dueDateString) => {
    const diff = new Date(dueDateString) - new Date();
    if (diff <= 0) {
      return <span className="text-red-600 font-bold px-2.5 py-1 bg-red-50 rounded-lg text-xs">Deadline Passed</span>;
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diff / 1000 / 60) % 60);

    return (
      <span className="text-amber-700 bg-amber-50 border border-amber-200 font-semibold px-3 py-1 rounded-lg text-xs flex items-center space-x-1">
        <Clock className="w-3.5 h-3.5 text-amber-600 inline mr-1" />
        {days > 0 ? `${days}d ${hours}h remaining` : `${hours}h ${mins}m remaining`}
      </span>
    );
  };

  // UNAUTHORIZED TEACHER SCREEN
  if (currentUser && currentUser.role === 'Teacher' && !currentUser.isAuthorized) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-900 px-4 font-sans text-white text-center">
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full shadow-2xl">
          <ShieldAlert className="w-16 h-16 text-amber-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold">Teacher Authorization Pending</h2>
          <p className="text-xs text-slate-400 mt-2">
            Your teacher account ({currentUser.email}) is pending approval by the Master Administrator before course access is granted.
          </p>
          <button 
            onClick={() => setCurrentUser(null)}
            className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-6 py-2.5 rounded-xl transition"
          >
            Sign In with Authorized Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between p-4 shadow-xl shrink-0">
        <div>
          {/* BRANDING HEADER */}
          <div className="flex items-center space-x-3 px-2 py-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl shadow-lg shadow-blue-500/30">
              T
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-wide text-white">Tezgam LMS</h1>
              <p className="text-[10px] text-blue-400 font-semibold">University of Turbat</p>
            </div>
          </div>

          {/* ACTIVE COURSE SELECTOR */}
          <div className="mb-6 px-2">
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1.5 tracking-wider">
              Active Course Context
            </label>
            <select
              value={selectedCourseId}
              onChange={(e) => setSelectedCourseId(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-white text-xs font-semibold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {courses.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.title}</option>
              ))}
            </select>
          </div>

          {/* MAIN MENU TABS */}
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'courses' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>All Courses</span>
            </button>

            <button
              onClick={() => setActiveTab('attendance')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Attendance Register</span>
            </button>

            <button
              onClick={() => setActiveTab('assignments')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'assignments' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Assignments & Deadlines</span>
            </button>

            <button
              onClick={() => setActiveTab('materials')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'materials' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Lecture Notes & Slides</span>
            </button>

            <button
              onClick={() => setActiveTab('notices')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'notices' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <Megaphone className="w-4 h-4" />
              <span>Course Noticeboard</span>
            </button>

            <button
              onClick={() => setActiveTab('presentations')}
              className={`w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                activeTab === 'presentations' ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Presentation Groups</span>
            </button>
          </nav>
        </div>

        {/* SIDEBAR FOOTER & USER PROFILE */}
        <div className="border-t border-slate-800 pt-4 space-y-3">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-blue-400 shrink-0">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-200 truncate">{currentUser?.name}</p>
                <span className={`inline-block text-[10px] px-2 py-0.5 rounded font-bold ${currentUser?.role === 'Teacher' ? 'bg-indigo-900 text-indigo-300' : 'bg-emerald-900 text-emerald-300'}`}>
                  {currentUser?.role}
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowAuthModal(true)}
              title="Switch or Register Account"
              className="p-2 text-slate-400 hover:text-blue-400 hover:bg-slate-800 rounded-lg transition"
            >
              <ShieldCheck className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN DASHBOARD CONTENT */}
      <main className="flex-1 overflow-y-auto p-8">
        
        {/* TOP NAVBAR */}
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
          <div className="relative w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input 
              type="text" 
              placeholder="Search lectures, assignments, students..." 
              className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-sm"
            />
          </div>

          <div className="flex items-center space-x-4 relative">
            {/* NOTIFICATION BELL */}
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-100 transition shadow-sm"
            >
              <Bell className="w-4 h-4" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-blue-600 rounded-full ring-2 ring-white"></span>
              )}
            </button>

            {/* NOTIFICATION DRAWER */}
            {showNotifications && (
              <div className="absolute right-0 top-12 w-80 bg-white border border-slate-200 rounded-2xl shadow-xl z-50 p-4">
                <div className="flex justify-between items-center mb-3 border-b pb-2">
                  <h4 className="text-xs font-bold text-slate-800">Teacher Alerts</h4>
                  <button 
                    onClick={() => setNotifications(notifications.map(n => ({...n, read: true})))}
                    className="text-[10px] text-blue-600 font-semibold hover:underline"
                  >
                    Mark read
                  </button>
                </div>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-xl text-xs ${n.read ? 'bg-slate-50' : 'bg-blue-50/70 border border-blue-100'}`}>
                      <p className="font-medium text-slate-800">{n.text}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{n.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <span className="text-xs font-bold bg-blue-50 text-blue-700 px-3.5 py-2 rounded-xl border border-blue-200 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
              <span>UoT Portal Active</span>
            </span>
          </div>
        </header>

        {/* HERO BANNER WITH BRANDING */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-800 to-slate-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden mb-8">
          <div className="relative z-10">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-200">
              Wash Atkay • University of Turbat
            </span>
            <h2 className="text-2xl font-extrabold mt-1">
              Welcome to Tezgam, {currentUser.name}!
            </h2>
            <div className="flex items-center space-x-2 mt-3">
              <div className="w-1 h-4 bg-blue-400 rounded-full"></div>
              <p className="text-sm font-semibold text-blue-100 tracking-wide">
                "Let's Learn Together"
              </p>
            </div>
          </div>
          <Sparkles className="w-40 h-40 text-white/5 absolute -right-6 -bottom-6 pointer-events-none" />
        </div>

        {/* ==========================================
            TAB 1: ALL COURSES
           ========================================== */}
        {activeTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Enrolled Course Modules</h3>
                <p className="text-xs text-slate-500">Manage courses and dynamic student enrollments.</p>
              </div>

              {currentUser.role === 'Teacher' && (
                <button
                  onClick={() => setShowNewCourseModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create New Course</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map(course => (
                <div 
                  key={course.id}
                  onClick={() => setSelectedCourseId(course.id)}
                  className={`bg-white p-6 rounded-2xl border transition cursor-pointer relative shadow-sm hover:shadow-md ${
                    selectedCourseId === course.id ? 'border-blue-600 ring-2 ring-blue-500/20' : 'border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold border border-blue-100">
                      {course.code.substring(0,2)}
                    </div>
                    <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg">
                      {course.code}
                    </span>
                  </div>

                  <h4 className="font-bold text-slate-800 text-base">{course.title}</h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">{course.desc}</p>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
                    <div className="flex items-center space-x-1.5 text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-md">
                      <Users className="w-3.5 h-3.5" />
                      <span>{course.students.length} Total Enrolled</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: ATTENDANCE REGISTER
           ========================================== */}
        {activeTab === 'attendance' && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-800">
                    Attendance Register: {currentCourse.code}
                  </h3>
                  <p className="text-xs text-slate-500">{currentCourse.title} • {currentCourse.students.length} Enrolled</p>
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="date"
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  {currentUser.role === 'Teacher' && (
                    <>
                      <button
                        onClick={exportAttendanceCSV}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition shadow-sm"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Export CSV</span>
                      </button>

                      <label className="bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1.5 cursor-pointer transition shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Import CSV</span>
                        <input type="file" accept=".csv" onChange={handleCSVUpload} className="hidden" />
                      </label>
                    </>
                  )}
                </div>
              </div>

              {/* TABLE VIEW */}
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 uppercase font-semibold">
                      <th className="py-3 px-4">Reg No</th>
                      <th className="py-3 px-4">Student Name</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {currentCourse.students.map(student => {
                      const currentStatus = attendanceRecords[student.id] || 'Present';
                      return (
                        <tr key={student.id} className="hover:bg-slate-50/80">
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-600">{student.regNo}</td>
                          <td className="py-3.5 px-4 font-semibold text-slate-800">{student.name}</td>
                          <td className="py-3.5 px-4 text-slate-500">{student.email}</td>
                          <td className="py-3.5 px-4 text-center">
                            {currentUser.role === 'Teacher' ? (
                              <div className="inline-flex rounded-xl bg-slate-100 p-1 space-x-1 border border-slate-200">
                                {['Present', 'Absent', 'Leave', 'Late'].map(status => (
                                  <button
                                    key={status}
                                    onClick={() => setAttendanceRecords({ ...attendanceRecords, [student.id]: status })}
                                    className={`px-2.5 py-1 rounded-lg font-bold text-[10px] transition ${
                                      currentStatus === status
                                        ? status === 'Present' ? 'bg-emerald-600 text-white' :
                                          status === 'Absent' ? 'bg-red-600 text-white' :
                                          status === 'Leave' ? 'bg-amber-500 text-white' : 'bg-indigo-600 text-white'
                                        : 'text-slate-600 hover:bg-slate-200'
                                    }`}
                                  >
                                    {status}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                                currentStatus === 'Present' ? 'bg-emerald-100 text-emerald-800' :
                                currentStatus === 'Absent' ? 'bg-red-100 text-red-800' :
                                currentStatus === 'Leave' ? 'bg-amber-100 text-amber-800' : 'bg-indigo-100 text-indigo-800'
                              }`}>
                                {currentStatus}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: ASSIGNMENTS & DEADLINES
           ========================================== */}
        {activeTab === 'assignments' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Course Assignments & Submissions</h3>
                <p className="text-xs text-slate-500">Live countdown reminders and automated response collection.</p>
              </div>

              {currentUser.role === 'Teacher' && (
                <button
                  onClick={() => setShowNewAsgModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Assignment</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {assignments.filter(a => a.courseId === selectedCourseId).map(asg => (
                <div key={asg.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 mb-3">
                    <h4 className="text-base font-bold text-slate-800">{asg.title}</h4>
                    <div className="flex items-center space-x-2">
                      {renderCountdown(asg.dueDate)}
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                        Max Marks: {asg.maxMarks}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 mb-6">{asg.description}</p>

                  {/* STUDENT VIEW */}
                  {currentUser.role === 'Student' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Submit Solution URL / Drive PDF Link:
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://drive.google.com/..."
                          value={submissionLink}
                          onChange={(e) => setSubmissionLink(e.target.value)}
                          className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => handleSubmitAssignment(asg.id)}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-xl transition shadow-sm"
                        >
                          Submit Work
                        </button>
                      </div>
                    </div>
                  )}

                  {/* TEACHER VIEW */}
                  {currentUser.role === 'Teacher' && (
                    <div className="border-t border-slate-100 pt-4">
                      <h5 className="text-xs font-bold text-slate-700 mb-3">
                        Student Submissions ({asg.submissions.length})
                      </h5>
                      {asg.submissions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic">No submissions received yet.</p>
                      ) : (
                        <div className="space-y-2">
                          {asg.submissions.map((sub, idx) => (
                            <div key={idx} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                              <div>
                                <span className="font-bold text-slate-800">{sub.studentName}</span>
                                <span className="text-slate-400 ml-2">({sub.submittedAt})</span>
                              </div>
                              <a 
                                href={sub.fileUrl} 
                                target="_blank" 
                                rel="noreferrer"
                                className="text-blue-600 font-semibold hover:underline flex items-center space-x-1"
                              >
                                <span>View Solution</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 4: COURSE NOTES & LECTURES
           ========================================== */}
        {activeTab === 'materials' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Course Study Materials</h3>
                <p className="text-xs text-slate-500">Download lecture slides, syllabus, and revision documents.</p>
              </div>

              {currentUser.role === 'Teacher' && (
                <button
                  onClick={() => setShowNewMatModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Upload Lecture Note</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.filter(m => m.courseId === selectedCourseId).map(mat => (
                <div key={mat.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{mat.title}</h4>
                      <p className="text-[11px] text-slate-400">{mat.type} • {mat.size} • Uploaded {mat.date}</p>
                    </div>
                  </div>

                  <a 
                    href="#download" 
                    onClick={(e) => { e.preventDefault(); alert(`Downloading ${mat.title} to your device...`); }}
                    className="bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 p-2.5 rounded-xl transition border border-slate-200"
                    title="Download to device"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 5: NOTICEBOARD
           ========================================== */}
        {activeTab === 'notices' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Class Announcements & Notices</h3>
                <p className="text-xs text-slate-500">Official course updates broadcasted by faculty.</p>
              </div>

              {currentUser.role === 'Teacher' && (
                <button
                  onClick={() => setShowNewNoticeModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Post Announcement</span>
                </button>
              )}
            </div>

            <div className="space-y-4">
              {notices.filter(n => n.courseId === selectedCourseId).map(notice => (
                <div key={notice.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm border-l-4 border-l-blue-600">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="text-base font-bold text-slate-800">{notice.title}</h4>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                      {notice.date}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">{notice.content}</p>
                  <div className="text-[11px] font-bold text-blue-700">
                    Posted by: {notice.author}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 6: PRESENTATION GROUPS & MARKS
           ========================================== */}
        {activeTab === 'presentations' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-slate-800">Presentation Groups & Marks Evaluation</h3>
                <p className="text-xs text-slate-500">Assign presentation teams, topics, and submit evaluated marks.</p>
              </div>

              {currentUser.role === 'Teacher' && (
                <button
                  onClick={() => setShowNewGroupModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl flex items-center space-x-2 transition shadow-md shadow-blue-600/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Presentation Group</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {presentations.filter(p => p.courseId === selectedCourseId).map(group => (
                <div key={group.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="text-[10px] font-extrabold uppercase bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-md border border-indigo-100">
                        {group.groupNumber}
                      </span>
                      <h4 className="text-base font-bold text-slate-800 mt-2">{group.groupName}</h4>
                    </div>
                    <span className="text-xs font-extrabold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg">
                      Max: {group.maxMarks} Marks
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-600 mb-4">
                    <span className="text-slate-400">Assigned Topic:</span> {group.topic}
                  </p>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 mb-4">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">Team Members:</span>
                    <div className="space-y-1">
                      {group.studentIds.map(sid => {
                        const st = currentCourse.students.find(s => s.id === sid);
                        return (
                          <div key={sid} className="text-xs font-semibold text-slate-700 flex justify-between">
                            <span>• {st ? st.name : 'Enrolled Student'}</span>
                            <span className="text-[10px] font-mono text-slate-400">{st?.regNo}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {group.evaluated ? (
                    <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-emerald-900">Evaluation Submitted</span>
                        <span className="text-lg font-extrabold text-emerald-700">{group.obtainedMarks} / {group.maxMarks}</span>
                      </div>
                      <p className="text-xs text-emerald-800 italic">"{group.feedback}"</p>
                    </div>
                  ) : (
                    currentUser.role === 'Teacher' && (
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        handleEvaluateGroup(group.id, e.target.marks.value, e.target.feedback.value);
                      }} className="border-t border-slate-100 pt-3 space-y-3">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="number"
                            name="marks"
                            max={group.maxMarks}
                            required
                            placeholder={`Marks (out of ${group.maxMarks})`}
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <input
                            type="text"
                            name="feedback"
                            placeholder="Feedback comments..."
                            className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        </div>
                        <button
                          type="submit"
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold py-2 rounded-xl transition shadow-sm"
                        >
                          Submit Presentation Grade
                        </button>
                      </form>
                    )
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ==========================================
          MODAL 1: AUTHENTICATION & SWITCH USER
         ========================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative border border-slate-100">
            <button 
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-xl text-white">
                T
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-slate-800">Tezgam Registration</h3>
                <p className="text-[10px] text-blue-600 font-semibold">University of Turbat Auth Portal</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl mb-6">
              <button
                onClick={() => setAuthRole('Teacher')}
                className={`py-2 text-xs font-bold rounded-lg transition ${authRole === 'Teacher' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
              >
                Teacher Portal
              </button>
              <button
                onClick={() => setAuthRole('Student')}
                className={`py-2 text-xs font-bold rounded-lg transition ${authRole === 'Student' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500'}`}
              >
                Student Portal
              </button>
            </div>

            <button
              onClick={handleGmailAuth}
              className="w-full bg-slate-900 hover:bg-black text-white text-xs font-bold py-3 rounded-xl flex items-center justify-center space-x-2 transition shadow-md mb-4"
            >
              <Mail className="w-4 h-4 text-red-400" />
              <span>Continue with Gmail / UoT Google Auth</span>
            </button>

            <form onSubmit={handleEmailAuthSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g. Dr. Mahnaz Baloch"
                  value={authName}
                  onChange={(e) => setAuthName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-500 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="user@uot.edu.pk"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-3 rounded-xl transition shadow-lg shadow-blue-600/30"
              >
                Sign In / Register Account
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 2: CREATE COURSE
         ========================================== */}
      {showNewCourseModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowNewCourseModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
            <h3 className="font-bold text-base text-slate-800 mb-4">Create New Course</h3>
            <form onSubmit={handleCreateCourse} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Course Code</label>
                <input type="text" placeholder="e.g. CS-405" required value={newCourseCode} onChange={e=>setNewCourseCode(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Course Title</label>
                <input type="text" placeholder="e.g. Artificial Intelligence" required value={newCourseTitle} onChange={e=>setNewCourseTitle(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Department</label>
                <input type="text" value={newCourseDept} onChange={e=>setNewCourseDept(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Description</label>
                <textarea placeholder="Course overview..." value={newCourseDesc} onChange={e=>setNewCourseDesc(e.target.value)} className="w-full border p-2 rounded-xl h-20" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl">Create Course</button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 3: CREATE ASSIGNMENT
         ========================================== */}
      {showNewAsgModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowNewAsgModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
            <h3 className="font-bold text-base text-slate-800 mb-4">Create Course Assignment</h3>
            <form onSubmit={handleCreateAssignment} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Assignment Title</label>
                <input type="text" required placeholder="e.g. Midterm Lab Report" value={asgTitle} onChange={e=>setAsgTitle(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Max Marks</label>
                <input type="number" value={asgMarks} onChange={e=>setAsgMarks(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Due Date & Time</label>
                <input type="datetime-local" required value={asgDueDate} onChange={e=>setAsgDueDate(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Instructions</label>
                <textarea placeholder="Detailed submission guidelines..." value={asgDesc} onChange={e=>setAsgDesc(e.target.value)} className="w-full border p-2 rounded-xl h-20" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl">Publish Assignment</button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 4: UPLOAD MATERIAL
         ========================================== */}
      {showNewMatModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowNewMatModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
            <h3 className="font-bold text-base text-slate-800 mb-4">Upload Course Note</h3>
            <form onSubmit={handleCreateMaterial} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Title</label>
                <input type="text" required placeholder="e.g. Lecture 04 - Firebase Auth" value={matTitle} onChange={e=>setMatTitle(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Document Type</label>
                <select value={matType} onChange={e=>setMatType(e.target.value)} className="w-full border p-2 rounded-xl">
                  <option value="PDF Document">PDF Document</option>
                  <option value="Presentation Slides">Presentation Slides</option>
                  <option value="Zip Code Archive">Zip Code Archive</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl">Upload Material</button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 5: POST NOTICE
         ========================================== */}
      {showNewNoticeModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowNewNoticeModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
            <h3 className="font-bold text-base text-slate-800 mb-4">Broadcast Class Notice</h3>
            <form onSubmit={handleCreateNotice} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Notice Headline</label>
                <input type="text" required placeholder="e.g. Lab Session Rescheduled" value={noticeTitle} onChange={e=>setNoticeTitle(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Announcement Body</label>
                <textarea required placeholder="Notice details..." value={noticeContent} onChange={e=>setNoticeContent(e.target.value)} className="w-full border p-2 rounded-xl h-24" />
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl">Post Notice</button>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL 6: PRESENTATION GROUP
         ========================================== */}
      {showNewGroupModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative">
            <button onClick={() => setShowNewGroupModal(false)} className="absolute top-4 right-4 text-slate-400">✕</button>
            <h3 className="font-bold text-base text-slate-800 mb-4">Create Presentation Team</h3>
            <form onSubmit={handleCreateGroup} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Group Number</label>
                  <input type="text" value={groupNo} onChange={e=>setGroupNo(e.target.value)} className="w-full border p-2 rounded-xl" />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 mb-1">Max Marks</label>
                  <input type="number" value={groupMaxMarks} onChange={e=>setGroupMaxMarks(e.target.value)} className="w-full border p-2 rounded-xl" />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Group Name</label>
                <input type="text" required placeholder="e.g. Turbat Devs" value={groupName} onChange={e=>setGroupName(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>
              <div>
                <label className="block font-semibold text-slate-600 mb-1">Presentation Topic</label>
                <input type="text" required placeholder="e.g. Cloud Security Models" value={groupTopic} onChange={e=>setGroupTopic(e.target.value)} className="w-full border p-2 rounded-xl" />
              </div>

              <div>
                <label className="block font-semibold text-slate-600 mb-1">Select Group Members</label>
                <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1">
                  {currentCourse.students.map(st => (
                    <label key={st.id} className="flex items-center space-x-2 text-xs">
                      <input 
                        type="checkbox"
                        checked={selectedGroupStudents.includes(st.id)}
                        onChange={(e) => {
                          if (e.target.checked) setSelectedGroupStudents([...selectedGroupStudents, st.id]);
                          else setSelectedGroupStudents(selectedGroupStudents.filter(id => id !== st.id));
                        }}
                      />
                      <span>{st.name} ({st.regNo})</span>
                    </label>
                  ))}
                </div>
              </div>

              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-2.5 rounded-xl">Save Presentation Group</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}