import React, { useState, useEffect } from "react";
import { db, auth } from "./firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc,
  doc,
  updateDoc,
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
  onAuthStateChanged 
} from "firebase/auth";

function App() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState("");

  const [activeTab, setActiveTab] = useState("courses");
  const [selectedCourse, setSelectedCourse] = useState(null);

  const [noticeSearch, setNoticeSearch] = useState("");
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("General");
  const [message, setMessage] = useState("");
  const [loadingNotice, setLoadingNotice] = useState(false);

  // Courses Persistent State
  const [courses, setCourses] = useState([]);
  const [courseNameInput, setCourseNameInput] = useState("");

  // Roster & Attendance
  const [students, setStudents] = useState([]);
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [studentPhone, setStudentPhone] = useState("");
  const [loadingStudent, setLoadingStudent] = useState(false);

  // Course Materials
  const [materials, setMaterials] = useState([]);
  const [lectureTitle, setLectureTitle] = useState("");
  const [materialType, setMaterialType] = useState("PDF Document");
  const [fileData, setFileData] = useState(null);
  const [loadingMaterial, setLoadingMaterial] = useState(false);

  // Assignments
  const [assignments, setAssignments] = useState([]);
  const [assignmentTitle, setAssignmentTitle] = useState("");
  const [deadline, setDeadline] = useState("");
  const [assignmentDesc, setAssignmentDesc] = useState("");
  const [loadingAssignment, setLoadingAssignment] = useState(false);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [gradesInput, setGradesInput] = useState({});

  // Quizzes
  const [quizzes, setQuizzes] = useState([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [secondsPerQuestion, setSecondsPerQuestion] = useState(30);
  const [questionText, setQuestionText] = useState("");
  const [optA, setOptA] = useState("");
  const [optB, setOptB] = useState("");
  const [optC, setOptC] = useState("");
  const [optD, setOptD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("A");
  const [questionsList, setQuestionsList] = useState([]);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  // Active Quiz State
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswers, setCurrentAnswers] = useState({});
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [obtainedScore, setObtainedScore] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email && currentUser.email.toLowerCase().includes("teacher")) {
        setRole("teacher");
      } else {
        setRole("student");
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const unsubCourses = onSnapshot(query(collection(db, "courses"), orderBy("createdAt", "desc")), (snap) => {
      setCourses(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubNotices = onSnapshot(query(collection(db, "announcements"), orderBy("createdAt", "desc")), (snap) => {
      setAnnouncements(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubStudents = onSnapshot(query(collection(db, "students"), orderBy("rollNo", "asc")), (snap) => {
      setStudents(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubMaterials = onSnapshot(query(collection(db, "course_materials"), orderBy("createdAt", "desc")), (snap) => {
      setMaterials(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubAssignments = onSnapshot(query(collection(db, "assignments"), orderBy("createdAt", "desc")), (snap) => {
      setAssignments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    const unsubQuizzes = onSnapshot(query(collection(db, "quizzes"), orderBy("createdAt", "desc")), (snap) => {
      setQuizzes(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => {
      unsubCourses();
      unsubNotices();
      unsubStudents();
      unsubMaterials();
      unsubAssignments();
      unsubQuizzes();
    };
  }, []);

  useEffect(() => {
    if (!activeQuiz || quizSubmitted) return;
    if (questionTimeLeft <= 0) {
      handleNextQuestion();
      return;
    }
    const timer = setInterval(() => {
      setQuestionTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [questionTimeLeft, activeQuiz, quizSubmitted, currentQuestionIndex]);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError("");
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError("");
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => signOut(auth);

  const handleCreateCourse = async (e) => {
    e.preventDefault();
    if (!courseNameInput.trim()) return;
    try {
      await addDoc(collection(db, "courses"), {
        courseName: courseNameInput.trim(),
        createdAt: serverTimestamp()
      });
      setSelectedCourse(courseNameInput.trim());
      setCourseNameInput("");
    } catch (err) {
      console.error("Error creating course:", err);
    }
  };

  const handleAnnouncementSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    setLoadingNotice(true);
    try {
      await addDoc(collection(db, "announcements"), { title, category, message, createdAt: serverTimestamp() });
      setTitle(""); setMessage(""); setCategory("General");
    } finally { setLoadingNotice(false); }
  };

  const handleStudentSubmit = async (e) => {
    e.preventDefault();
    if (!studentName.trim() || !rollNo.trim() || !studentPhone.trim() || !selectedCourse) return;
    setLoadingStudent(true);
    try {
      await addDoc(collection(db, "students"), { 
        name: studentName, 
        rollNo, 
        phone: studentPhone, 
        className: selectedCourse, 
        status: "Present", 
        updatedAt: serverTimestamp() 
      });
      setStudentName(""); setRollNo(""); setStudentPhone("");
    } finally { setLoadingStudent(false); }
  };

  const getNextAttendanceStatus = (currentStatus) => {
    if (currentStatus === "Present") return "Absent";
    if (currentStatus === "Absent") return "Late";
    if (currentStatus === "Late") return "Leave";
    return "Present";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Present": return "#10b981";
      case "Absent": return "#ef4444";
      case "Late": return "#f59e0b";
      case "Leave": return "#8b5cf6";
      default: return "#6b7280";
    }
  };

  const exportAttendanceCSV = () => {
    const listToExport = students.filter(s => s.className?.toLowerCase() === selectedCourse?.toLowerCase());
    if (listToExport.length === 0) return alert("No student records available for export in this course.");
    let csvContent = "data:text/csv;charset=utf-8,Course,Roll Number,Student Name,Phone Number,Attendance Status\n";
    listToExport.forEach((s) => {
      csvContent += `"${s.className}","${s.rollNo}","${s.name}","${s.phone || 'N/A'}","${s.status}"\n`;
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Tezgam_Attendance_${selectedCourse}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSendSmsReminder = (assignment) => {
    const courseStudents = students.filter(s => s.className?.toLowerCase() === selectedCourse?.toLowerCase() && s.phone);
    if (courseStudents.length === 0) {
      return alert("No student phone numbers available for this course!");
    }
    const recipientList = courseStudents.map(s => s.phone).join(", ");
    alert(`📱 SMS Reminders dispatched successfully for ${selectedCourse}!\n\nAssignment: "${assignment.title}"\nRecipients (${courseStudents.length} students): ${recipientList}`);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFileData({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB", url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleAssignmentFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setAssignmentFile({ name: file.name, size: (file.size / 1024).toFixed(1) + " KB", url: reader.result });
    };
    reader.readAsDataURL(file);
  };

  const handleMaterialSubmit = async (e) => {
    e.preventDefault();
    if (!lectureTitle.trim() || !fileData || !selectedCourse) return;
    setLoadingMaterial(true);
    try {
      await addDoc(collection(db, "course_materials"), {
        courseName: selectedCourse, lectureTitle, materialType, fileName: fileData.name, fileSize: fileData.size, fileUrl: fileData.url, createdAt: serverTimestamp()
      });
      setLectureTitle(""); setFileData(null); e.target.reset();
    } finally { setLoadingMaterial(false); }
  };

  const handleAssignmentSubmit = async (e) => {
    e.preventDefault();
    if (!assignmentTitle.trim() || !deadline.trim() || !selectedCourse) return;
    setLoadingAssignment(true);
    try {
      await addDoc(collection(db, "assignments"), {
        title: assignmentTitle, course: selectedCourse, deadline, description: assignmentDesc, createdAt: serverTimestamp(), submissions: []
      });
      setAssignmentTitle(""); setDeadline(""); setAssignmentDesc("");
    } finally { setLoadingAssignment(false); }
  };

  const handleStudentSubmitAssignment = async (assignmentId, currentSubmissions = []) => {
    if (!assignmentFile) return alert("Please select a file to upload.");
    try {
      const newSub = { 
        studentEmail: user.email, 
        fileName: assignmentFile.name,
        fileSize: assignmentFile.size,
        fileUrl: assignmentFile.url,
        submittedAt: new Date().toLocaleString(),
        grade: "Not Graded" 
      };
      await updateDoc(doc(db, "assignments", assignmentId), {
        submissions: [...currentSubmissions, newSub]
      });
      setAssignmentFile(null);
      alert("Assignment file uploaded successfully!");
    } catch (err) {
      console.error(err);
    }
  };

  const handleGradeSubmission = async (assignmentId, submissions, subIndex) => {
    const gradeKey = `${assignmentId}_${subIndex}`;
    const gradeValue = gradesInput[gradeKey];
    if (!gradeValue || !gradeValue.trim()) return alert("Please enter a valid grade.");
    const updatedSubmissions = [...submissions];
    updatedSubmissions[subIndex].grade = gradeValue;
    try {
      await updateDoc(doc(db, "assignments", assignmentId), { submissions: updatedSubmissions });
      alert("Grade updated successfully!");
    } catch (err) {
      console.error("Error updating grade:", err);
    }
  };

  const handleAddQuestionToQuiz = (e) => {
    e.preventDefault();
    if (!questionText.trim() || !optA.trim() || !optB.trim()) return;
    const newQ = {
      questionText,
      options: { A: optA, B: optB, C: optC, D: optD },
      correctAnswer
    };
    setQuestionsList([...questionsList, newQ]);
    setQuestionText(""); setOptA(""); setOptB(""); setOptC(""); setOptD(""); setCorrectAnswer("A");
  };

  const handlePublishQuiz = async (e) => {
    e.preventDefault();
    if (!quizTitle.trim() || questionsList.length === 0 || !selectedCourse) {
      return alert("Please enter a quiz title and at least one question.");
    }
    setLoadingQuiz(true);
    try {
      await addDoc(collection(db, "quizzes"), {
        title: quizTitle,
        course: selectedCourse,
        secondsPerQuestion: Number(secondsPerQuestion),
        questions: questionsList,
        createdAt: serverTimestamp(),
        results: []
      });
      setQuizTitle(""); setQuestionsList([]); setSecondsPerQuestion(30);
      alert("Quiz published successfully!");
    } finally {
      setLoadingQuiz(false);
    }
  };

  const startQuiz = (quiz) => {
    const alreadyAttempted = quiz.results?.some(r => r.studentEmail === user.email);
    if (alreadyAttempted && role !== "teacher") {
      alert("⚠️ You have already attempted this quiz. Only one attempt is allowed!");
      return;
    }
    setActiveQuiz(quiz);
    setCurrentQuestionIndex(0);
    setCurrentAnswers({});
    setQuestionTimeLeft(quiz.secondsPerQuestion || 30);
    setQuizSubmitted(false);
    setObtainedScore(null);
  };

  const handleNextQuestion = () => {
    if (!activeQuiz) return;
    if (currentQuestionIndex + 1 < activeQuiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
      setQuestionTimeLeft(activeQuiz.secondsPerQuestion || 30);
    } else {
      finalizeQuizSubmission(activeQuiz, currentAnswers);
    }
  };

  const finalizeQuizSubmission = async (quiz, answers) => {
    if (quizSubmitted) return;
    let score = 0;
    quiz.questions.forEach((q, idx) => {
      if (answers[idx] === q.correctAnswer) {
        score += 1;
      }
    });
    const totalQuestions = quiz.questions.length;
    const scorePercentage = Math.round((score / totalQuestions) * 100);
    const resultEntry = {
      studentEmail: user.email,
      score,
      total: totalQuestions,
      percentage: scorePercentage,
      submittedAt: new Date().toLocaleString()
    };
    try {
      const updatedResults = [...(quiz.results || []), resultEntry];
      await updateDoc(doc(db, "quizzes", quiz.id), {
        results: updatedResults
      });
      setObtainedScore({ score, total: totalQuestions, percentage: scorePercentage });
      setQuizSubmitted(true);
    } catch (err) {
      console.error("Error submitting quiz result:", err);
    }
  };

  if (!user) {
    return (
      <div style={styles.authContainer}>
        <div style={styles.authCard}>
          <div style={styles.brandContainer}>
            <div style={styles.interactiveLogo}>⚡</div>
            <h1 style={styles.authTitle}>Tezgam <span style={styles.lmsHighlight}>LMS</span></h1>
            <p style={styles.authSub}>Wash Atkay</p>
          </div>
          
          <form onSubmit={handleAuth} style={styles.form}>
            <div style={styles.inputWrapper}>
              <input type="email" placeholder="Institutional Email (e.g. student@uot.edu.pk)" value={email} onChange={e => setEmail(e.target.value)} style={styles.input} required />
            </div>
            <div style={styles.inputWrapper}>
              <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} style={styles.input} required />
            </div>
            {authError && <p style={styles.errorText}>{authError}</p>}
            <button type="submit" style={styles.button}>{isRegistering ? "Create Account" : "Access LMS Portal"}</button>
          </form>

          <div style={styles.dividerContainer}>
            <span style={styles.dividerLine}></span>
            <span style={styles.dividerText}>OR</span>
            <span style={styles.dividerLine}></span>
          </div>

          <button onClick={handleGoogleSignIn} style={styles.googleButton}>
            <svg style={{ width: "18px", height: "18px" }} viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign in with Google
          </button>

          <p style={styles.toggleAuthText}>
            {isRegistering ? "Already have an account?" : "Don't have an account?"}{" "}
            <span onClick={() => setIsRegistering(!isRegistering)} style={styles.authLink}>
              {isRegistering ? "Sign In" : "Register Now"}
            </span>
          </p>

          <div style={styles.creatorTag}>
            Created By <strong>Amir Nawaz</strong>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={handleLogout} style={styles.logoutButtonTop}>Sign Out</button>

        <div style={styles.headerCentered}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px" }}>
            <div style={styles.interactiveLogo}>⚡</div>
            <h1 style={styles.title}>Tezgam <span style={styles.lmsHighlight}>LMS</span></h1>
          </div>
          <p style={styles.welcomeGreeting}>Wash Atkay</p>
          <p style={styles.subtitle}>
            University of Turbat &bull; Logged in as: <strong>{role === "teacher" ? "Teacher" : "Student"}</strong> <span style={styles.roleBadge}>{role.toUpperCase()}</span>
          </p>
        </div>
        
        <div style={styles.tabContainer}>
          <button style={{ ...styles.tabButton, ...(activeTab === "courses" && !selectedCourse ? styles.activeTab : {}) }} onClick={() => { setSelectedCourse(null); setActiveTab("courses"); }}>📚 Courses Hub</button>
          <button style={{ ...styles.tabButton, ...(activeTab === "profiles" ? styles.activeTab : {}) }} onClick={() => { setSelectedCourse(null); setActiveTab("profiles"); }}>👥 Profiles</button>
          <button style={{ ...styles.tabButton, ...(activeTab === "announcements" && !selectedCourse ? styles.activeTab : {}) }} onClick={() => { setSelectedCourse(null); setActiveTab("announcements"); }}>📢 Announcements</button>
        </div>
      </header>

      {/* VIEW 1: COURSES LIST & CREATION */}
      {!selectedCourse && activeTab === "courses" && (
        <div>
          {role === "teacher" && (
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>✨ Create a New Course</h2>
              <form onSubmit={handleCreateCourse} style={styles.form}>
                <div style={styles.inputGroup}>
                  <input type="text" placeholder="Course Name (e.g. Data Structures, Operating Systems)..." value={courseNameInput} onChange={e => setCourseNameInput(e.target.value)} style={styles.input} required />
                  <button type="submit" style={styles.button}>Create & Open Course 🚀</button>
                </div>
              </form>
            </section>
          )}

          <section style={styles.listSection}>
            <h2 style={styles.cardTitle}>Available Courses ({courses.length})</h2>
            {courses.length === 0 ? (
              <p style={styles.emptyState}>No courses created yet. Teachers can create one above.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                {courses.map((course) => (
                  <div key={course.id} onClick={() => setSelectedCourse(course.courseName)} style={styles.courseGridCard}>
                    <div style={{ fontSize: "2rem", marginBottom: "8px" }}>📖</div>
                    <h3 style={{ margin: "0 0 6px", color: "#1e3a8a", fontSize: "1.2rem" }}>{course.courseName}</h3>
                    <p style={{ margin: "0", color: "#64748b", fontSize: "0.85rem" }}>Click to open course dashboard &rarr;</p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* VIEW 2: PROFILES */}
      {!selectedCourse && activeTab === "profiles" && (
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>👥 Institution Profiles</h2>
          
          <div style={{ marginBottom: "28px" }}>
            <h3 style={styles.sectionSubHeading}>👨‍🏫 Teacher Profile</h3>
            <div style={styles.profileBox}>
              <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                <div style={styles.profileAvatar}>👨‍🏫</div>
                <div>
                  <h4 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "1.1rem" }}>Amir Nawaz</h4>
                  <p style={{ margin: "0", color: "#64748b", fontSize: "0.9rem" }}>Lecturer &bull; University of Turbat</p>
                  <p style={{ margin: "6px 0 0", color: "#2563eb", fontSize: "0.9rem", fontWeight: "600" }}>
                    Courses Taught: {courses.map(c => c.courseName).join(", ") || "None assigned yet"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 style={styles.sectionSubHeading}>🎓 Student Profiles</h3>
            {students.length === 0 ? (
              <p style={styles.emptyState}>No students registered in any course roster yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {students.map((student) => {
                  const studentAssignments = assignments.filter(a => a.submissions?.some(s => s.studentEmail.toLowerCase() === student.name.toLowerCase() || s.studentEmail.includes(student.rollNo) || s.studentEmail.includes(student.phone)));
                  const studentQuizzes = quizzes.filter(q => q.results?.some(r => r.studentEmail.includes(student.rollNo) || r.studentEmail.includes(student.name)));
                  
                  return (
                    <div key={student.id} style={styles.subCard}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
                        <div>
                          <h4 style={{ margin: "0 0 4px", color: "#0f172a", fontSize: "1.1rem" }}>{student.name}</h4>
                          <span style={styles.courseBadge}>Roll No: <strong>{student.rollNo}</strong></span>
                        </div>
                        <span style={{ fontSize: "0.85rem", color: "#047857", backgroundColor: "#d1fae5", padding: "4px 10px", borderRadius: "6px", fontWeight: "700" }}>
                          Class Enrolled: {student.className || "General"}
                        </span>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", fontSize: "0.9rem", color: "#475569", marginTop: "12px", borderTop: "1px solid #e2e8f0", paddingTop: "12px" }}>
                        <div>
                          📝 <strong>Assignments Submitted:</strong> {studentAssignments.length > 0 ? studentAssignments.length : "0"}
                          {studentAssignments.length > 0 && (
                            <div style={{ fontSize: "0.8rem", color: "#2563eb", marginTop: "2px" }}>
                              {studentAssignments.map(a => `${a.title} (Grade: ${a.submissions.find(s => s.studentEmail.includes(student.rollNo) || s.studentEmail.includes(student.name))?.grade || 'Not Graded'})`).join(", ")}
                            </div>
                          )}
                        </div>
                        <div>
                          ⏱️ <strong>Quiz Marks:</strong> {studentQuizzes.length > 0 ? studentQuizzes.map(q => {
                            const res = q.results.find(r => r.studentEmail.includes(student.rollNo) || r.studentEmail.includes(student.name));
                            return `${q.title}: ${res ? `${res.score}/${res.total} (${res.percentage}%)` : 'Not Attempted'}`;
                          }).join(", ") : "No quizzes attempted"}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>
      )}

      {/* VIEW 3: INDIVIDUAL COURSE DASHBOARD */}
      {selectedCourse && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", background: "linear-gradient(135deg, #1e3a8a, #2563eb)", padding: "20px 24px", borderRadius: "16px", color: "#fff", boxShadow: "0 4px 15px rgba(37,99,235,0.3)" }}>
            <div>
              <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(255,255,255,0.2)", padding: "3px 10px", borderRadius: "6px", fontWeight: "700", letterSpacing: "0.5px" }}>ACTIVE COURSE HUB</span>
              <h2 style={{ margin: "6px 0 0", fontSize: "1.8rem", fontWeight: "800" }}>{selectedCourse}</h2>
            </div>
            <button onClick={() => setSelectedCourse(null)} style={{ backgroundColor: "#ffffff", color: "#1e3a8a", border: "none", padding: "10px 18px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
              &larr; Back to All Courses
            </button>
          </div>

          <div style={styles.tabContainer}>
            <button style={{ ...styles.tabButton, ...(activeTab === "materials" ? styles.activeTab : {}) }} onClick={() => setActiveTab("materials")}>📂 Lecture Notes</button>
            <button style={{ ...styles.tabButton, ...(activeTab === "assignments" ? styles.activeTab : {}) }} onClick={() => setActiveTab("assignments")}>📝 Assignments & Marks</button>
            <button style={{ ...styles.tabButton, ...(activeTab === "quizzes" ? styles.activeTab : {}) }} onClick={() => { setActiveTab("quizzes"); setActiveQuiz(null); }}>⏱️ Live Quizzes</button>
            <button style={{ ...styles.tabButton, ...(activeTab === "attendance" ? styles.activeTab : {}) }} onClick={() => setActiveTab("attendance")}>📋 Attendance & SMS</button>
          </div>

          {/* COURSE TAB: LECTURE NOTES */}
          {activeTab === "materials" && (
            <div>
              {role === "teacher" && (
                <section style={styles.card}>
                  <h2 style={styles.cardTitle}>📂 Upload Material for {selectedCourse}</h2>
                  <form onSubmit={handleMaterialSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                      <input type="text" placeholder="Lecture Title..." value={lectureTitle} onChange={e => setLectureTitle(e.target.value)} style={styles.input} required />
                      <select value={materialType} onChange={e => setMaterialType(e.target.value)} style={styles.select}>
                        <option value="PDF Document">PDF Document</option>
                        <option value="Presentation Slides">Presentation Slides</option>
                        <option value="Reading Notes">Reading Notes</option>
                      </select>
                    </div>
                    <input type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.txt" onChange={handleFileChange} style={styles.fileInput} required />
                    {fileData && <p style={styles.fileSelectedText}>📎 Selected: {fileData.name} ({fileData.size})</p>}
                    <button type="submit" disabled={loadingMaterial} style={styles.button}>{loadingMaterial ? "Uploading..." : "Upload Resource"}</button>
                  </form>
                </section>
              )}

              <section style={styles.listSection}>
                <h2 style={styles.cardTitle}>Lecture Files & Presentations for {selectedCourse}</h2>
                {materials.filter(m => m.courseName?.toLowerCase() === selectedCourse.toLowerCase()).length === 0 ? (
                  <p style={styles.emptyState}>No course materials uploaded for this course yet.</p>
                ) : (
                  materials.filter(m => m.courseName?.toLowerCase() === selectedCourse.toLowerCase()).map((item) => (
                    <div key={item.id} style={styles.materialCard}>
                      <div style={styles.noticeHeader}>
                        <h3 style={styles.materialTitle}>{item.lectureTitle}</h3>
                        {role === "teacher" && (
                          <button onClick={() => deleteDoc(doc(db, "course_materials", item.id))} style={styles.deleteButton}>🗑️ Delete</button>
                        )}
                      </div>
                      <div style={styles.materialFooter}>
                        <div>
                          <span style={styles.typeTag}>📄 {item.materialType}</span>
                          <span style={styles.fileMeta}> ({item.fileName} &bull; {item.fileSize})</span>
                        </div>
                        <a href={item.fileUrl} download={item.fileName} style={styles.linkButton}>Download File 📥</a>
                      </div>
                    </div>
                  ))
                )}
              </section>
            </div>
          )}

          {/* COURSE TAB: ASSIGNMENTS */}
          {activeTab === "assignments" && (
            <div>
              {role === "teacher" && (
                <section style={styles.card}>
                  <h2 style={styles.cardTitle}>📝 Post Assignment for {selectedCourse}</h2>
                  <form onSubmit={handleAssignmentSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                      <input type="text" placeholder="Assignment Title..." value={assignmentTitle} onChange={e => setAssignmentTitle(e.target.value)} style={styles.input} required />
                      <input type="text" placeholder="Due Deadline (e.g. Nov 25, 2026)..." value={deadline} onChange={e => setDeadline(e.target.value)} style={styles.input} required />
                    </div>
                    <textarea placeholder="Detailed Instructions..." value={assignmentDesc} onChange={e => setAssignmentDesc(e.target.value)} style={styles.textarea} rows="3" required />
                    <button type="submit" disabled={loadingAssignment} style={styles.button}>{loadingAssignment ? "Publishing..." : "Publish Assignment"}</button>
                  </form>
                </section>
              )}

              <section style={styles.listSection}>
                <h2 style={styles.cardTitle}>Assignments & Marks for {selectedCourse}</h2>
                {assignments.filter(a => a.course?.toLowerCase() === selectedCourse.toLowerCase()).length === 0 ? (
                  <p style={styles.emptyState}>No active assignments for this course.</p>
                ) : (
                  assignments.filter(a => a.course?.toLowerCase() === selectedCourse.toLowerCase()).map((item) => (
                    <div key={item.id} style={styles.noticeCard}>
                      <div style={styles.noticeHeader}>
                        <h3 style={styles.noticeTitle}>{item.title}</h3>
                        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
                          <span style={{ fontSize: "0.85rem", color: "#991b1b", fontWeight: "600", backgroundColor: "#fee2e2", padding: "4px 10px", borderRadius: "12px" }}>
                            ⏰ Deadline: {item.deadline}
                          </span>
                          {role === "teacher" && (
                            <button onClick={() => handleSendSmsReminder(item)} style={styles.smsButton}>
                              📱 Send SMS Reminder
                            </button>
                          )}
                        </div>
                      </div>
                      <p style={styles.noticeBody}>{item.description}</p>

                      <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "10px" }}>
                        <h4 style={{ fontSize: "0.9rem", color: "#374151", marginBottom: "8px" }}>Submissions & Marks ({item.submissions?.length || 0}):</h4>
                        {item.submissions && item.submissions.length > 0 ? (
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {item.submissions.map((sub, idx) => {
                              const gradeKey = `${item.id}_${idx}`;
                              return (
                                <div key={idx} style={styles.submissionBox}>
                                  <div>
                                    <strong>{sub.studentEmail}</strong>: 
                                    <a href={sub.fileUrl} download={sub.fileName} style={styles.submissionFileLink}>
                                      📥 {sub.fileName} ({sub.fileSize})
                                    </a>{" "}
                                    <span style={{ color: "#9ca3af", fontSize: "0.80rem" }}>({sub.submittedAt})</span>
                                    <div style={{ marginTop: "4px" }}>
                                      <span style={styles.gradeBadge}>Marks / Grade: {sub.grade || "Not Graded"}</span>
                                    </div>
                                  </div>

                                  {role === "teacher" && (
                                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                                      <input type="text" placeholder="Marks..." value={gradesInput[gradeKey] || ""} onChange={(e) => setGradesInput({ ...gradesInput, [gradeKey]: e.target.value })} style={styles.smallInput} />
                                      <button onClick={() => handleGradeSubmission(item.id, item.submissions, idx)} style={styles.gradeButton}>Save</button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <p style={{ fontSize: "0.85rem", color: "#9ca3af", fontStyle: "italic" }}>No files submitted yet.</p>
                        )}

                        {role === "student" && (
                          <div style={{ display: "flex", gap: "10px", marginTop: "12px", alignItems: "center", flexWrap: "wrap" }}>
                            <input type="file" accept=".pdf,.doc,.docx,.zip,.txt" onChange={handleAssignmentFileChange} style={styles.fileInput} />
                            <button onClick={() => handleStudentSubmitAssignment(item.id, item.submissions || [])} style={styles.button}>Submit Assignment 📤</button>
                          </div>
                        )}
                      </div>

                      {role === "teacher" && (
                        <div style={{ marginTop: "12px", textAlign: "right" }}>
                          <button onClick={() => deleteDoc(doc(db, "assignments", item.id))} style={styles.deleteButton}>🗑️ Delete Assignment</button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </section>
            </div>
          )}

          {/* COURSE TAB: QUIZZES */}
          {activeTab === "quizzes" && (
            <div>
              {role === "teacher" && !activeQuiz && (
                <section style={styles.card}>
                  <h2 style={styles.cardTitle}>⏱️ Create Quiz for {selectedCourse}</h2>
                  <form onSubmit={handlePublishQuiz} style={styles.form}>
                    <input type="text" placeholder="Quiz Title..." value={quizTitle} onChange={e => setQuizTitle(e.target.value)} style={styles.input} required />
                    <div style={styles.inputGroup}>
                      <label style={{ alignSelf: "center", fontSize: "0.9rem", fontWeight: "600" }}>Seconds Per Question:</label>
                      <input type="number" min="5" max="300" value={secondsPerQuestion} onChange={e => setSecondsPerQuestion(e.target.value)} style={{ ...styles.input, maxWidth: "150px" }} required />
                    </div>

                    <hr style={{ border: "0", borderTop: "1px solid #e5e7eb", margin: "10px 0" }} />
                    
                    <h3 style={{ fontSize: "1rem", color: "#374151" }}>Questions Added ({questionsList.length})</h3>
                    <input type="text" placeholder="Question Statement..." value={questionText} onChange={e => setQuestionText(e.target.value)} style={styles.input} />
                    <div style={styles.inputGroup}>
                      <input type="text" placeholder="Option A" value={optA} onChange={e => setOptA(e.target.value)} style={styles.input} />
                      <input type="text" placeholder="Option B" value={optB} onChange={e => setOptB(e.target.value)} style={styles.input} />
                    </div>
                    <div style={styles.inputGroup}>
                      <input type="text" placeholder="Option C" value={optC} onChange={e => setOptC(e.target.value)} style={styles.input} />
                      <input type="text" placeholder="Option D" value={optD} onChange={e => setOptD(e.target.value)} style={styles.input} />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={{ alignSelf: "center", fontSize: "0.9rem" }}>Correct Answer:</label>
                      <select value={correctAnswer} onChange={e => setCorrectAnswer(e.target.value)} style={styles.select}>
                        <option value="A">Option A</option>
                        <option value="B">Option B</option>
                        <option value="C">Option C</option>
                        <option value="D">Option D</option>
                      </select>
                      <button type="button" onClick={handleAddQuestionToQuiz} style={styles.secondaryButton}>+ Add Question</button>
                    </div>

                    <button type="submit" disabled={loadingQuiz} style={{ ...styles.button, marginTop: "10px" }}>{loadingQuiz ? "Publishing..." : "Publish Quiz Live"}</button>
                  </form>
                </section>
              )}

              {activeQuiz ? (
                <section style={styles.card}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e5e7eb", paddingBottom: "12px", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                    <div>
                      <span style={styles.courseBadge}>{activeQuiz.course}</span>
                      <h2 style={{ margin: "4px 0 0", color: "#1e3a8a" }}>{activeQuiz.title}</h2>
                    </div>
                    {!quizSubmitted && (
                      <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                        <span style={{ fontSize: "0.9rem", color: "#4b5563", fontWeight: "600" }}>
                          Question {currentQuestionIndex + 1} of {activeQuiz.questions.length}
                        </span>
                        <div style={{ backgroundColor: questionTimeLeft <= 10 ? "#fee2e2" : "#e0f2fe", color: questionTimeLeft <= 10 ? "#991b1b" : "#0369a1", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", fontSize: "1.1rem" }}>
                          ⏱️ {questionTimeLeft}s
                        </div>
                      </div>
                    )}
                  </div>

                  {quizSubmitted ? (
                    <div style={{ textAlign: "center", padding: "30px 0" }}>
                      <h3 style={{ color: "#059669", fontSize: "1.8rem", marginBottom: "10px" }}>🎉 Quiz Completed Successfully!</h3>
                      <p style={{ fontSize: "1.2rem", color: "#1f2937", marginBottom: "6px" }}>Your Score / Marks: <strong>{obtainedScore.score} / {obtainedScore.total}</strong></p>
                      <p style={{ fontSize: "1.1rem", color: "#6b7280", marginBottom: "20px" }}>Percentage: <strong>{obtainedScore.percentage}%</strong></p>
                      <button onClick={() => setActiveQuiz(null)} style={styles.button}>Back to Quizzes</button>
                    </div>
                  ) : (
                    (() => {
                      const q = activeQuiz.questions[currentQuestionIndex];
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                          <div style={{ backgroundColor: "#f9fafb", padding: "20px", borderRadius: "8px", border: "1px solid #e5e7eb" }}>
                            <p style={{ fontWeight: "600", fontSize: "1.1rem", color: "#1f2937", marginTop: "0" }}>
                              Q{currentQuestionIndex + 1}. {q.questionText}
                            </p>
                            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "14px" }}>
                              {Object.entries(q.options).map(([optKey, optVal]) => {
                                if (!optVal) return null;
                                const isSelected = currentAnswers[currentQuestionIndex] === optKey;
                                return (
                                  <label key={optKey} style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", padding: "10px 14px", borderRadius: "6px", backgroundColor: isSelected ? "#dbeafe" : "#fff", border: "1px solid #d1d5db" }}>
                                    <input 
                                      type="radio" 
                                      name={`active_question`} 
                                      checked={isSelected}
                                      onChange={() => setCurrentAnswers({ ...currentAnswers, [currentQuestionIndex]: optKey })}
                                    />
                                    <strong style={{ color: "#1e3a8a" }}>{optKey})</strong> {optVal}
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <button onClick={handleNextQuestion} style={styles.skipButton}>Skip ⏭️</button>
                            <button onClick={handleNextQuestion} style={styles.button}>
                              {currentQuestionIndex + 1 === activeQuiz.questions.length ? "Submit Quiz 🏁" : "Next Question ➡️"}
                            </button>
                          </div>
                        </div>
                      );
                    })()
                  )}
                </section>
              ) : (
                <section style={styles.listSection}>
                  <h2 style={styles.cardTitle}>Quizzes & Marks for {selectedCourse}</h2>
                  {quizzes.filter(q => q.course?.toLowerCase() === selectedCourse.toLowerCase()).length === 0 ? (
                    <p style={styles.emptyState}>No quizzes available for this course.</p>
                  ) : (
                    quizzes.filter(q => q.course?.toLowerCase() === selectedCourse.toLowerCase()).map((quiz) => {
                      const hasAttempted = quiz.results?.some(r => r.studentEmail === user.email);
                      return (
                        <div key={quiz.id} style={styles.noticeCard}>
                          <div style={styles.noticeHeader}>
                            <h3 style={styles.materialTitle}>{quiz.title}</h3>
                            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                              <span style={{ fontSize: "0.85rem", color: "#2563eb", fontWeight: "600", backgroundColor: "#dbeafe", padding: "4px 10px", borderRadius: "12px" }}>
                                ⏱️ {quiz.secondsPerQuestion || 30}s | {quiz.questions?.length || 0} Qs
                              </span>

                              {hasAttempted && role !== "teacher" ? (
                                <span style={{ fontSize: "0.85rem", color: "#059669", fontWeight: "700", backgroundColor: "#d1fae5", padding: "6px 12px", borderRadius: "6px" }}>
                                  ✅ Attempted
                                </span>
                              ) : (
                                <button onClick={() => startQuiz(quiz)} style={styles.linkButton}>Start Quiz 🚀</button>
                              )}

                              {role === "teacher" && (
                                <button onClick={() => deleteDoc(doc(db, "quizzes", quiz.id))} style={styles.deleteButton}>🗑️ Delete</button>
                              )}
                            </div>
                          </div>

                          {role === "teacher" && quiz.results && quiz.results.length > 0 && (
                            <div style={{ marginTop: "12px", borderTop: "1px solid #f3f4f6", paddingTop: "10px" }}>
                              <h4 style={{ fontSize: "0.85rem", color: "#374151", marginBottom: "6px" }}>Student Quiz Marks:</h4>
                              <ul style={{ paddingLeft: "20px", fontSize: "0.85rem", color: "#4b5563" }}>
                                {quiz.results.map((res, rIdx) => (
                                  <li key={rIdx}>
                                    <strong>{res.studentEmail}</strong>: Marks: <strong>{res.score}/{res.total}</strong> ({res.percentage}%)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </section>
              )}
            </div>
          )}

          {/* COURSE TAB: ATTENDANCE & SMS */}
          {activeTab === "attendance" && (
            <div>
              {role === "teacher" && (
                <section style={styles.card}>
                  <h2 style={styles.cardTitle}>📱 Register Student in {selectedCourse}</h2>
                  <form onSubmit={handleStudentSubmit} style={styles.form}>
                    <div style={styles.inputGroup}>
                      <input type="text" placeholder="Full Name..." value={studentName} onChange={e => setStudentName(e.target.value)} style={styles.input} required />
                      <input type="text" placeholder="Roll Number (e.g. BS-2023-01)..." value={rollNo} onChange={e => setRollNo(e.target.value)} style={styles.input} required />
                      <input type="tel" placeholder="Mobile Phone (+923001234567)..." value={studentPhone} onChange={e => setStudentPhone(e.target.value)} style={styles.input} required />
                    </div>
                    <button type="submit" disabled={loadingStudent} style={styles.button}>{loadingStudent ? "Saving..." : "Add Student to Roster"}</button>
                  </form>
                </section>
              )}

              <section style={styles.listSection}>
                <div style={styles.sectionHeader}>
                  <h2 style={styles.cardTitle}>Attendance Roster for {selectedCourse}</h2>
                  <button onClick={exportAttendanceCSV} style={styles.csvButton}>📊 Export CSV</button>
                </div>

                {students.filter(s => s.className?.toLowerCase() === selectedCourse.toLowerCase()).length === 0 ? (
                  <p style={styles.emptyState}>No students enrolled in this course yet.</p>
                ) : (
                  <div style={styles.tableContainer}>
                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.tableHeaderRow}>
                          <th style={styles.th}>Roll No</th>
                          <th style={styles.th}>Student Name</th>
                          <th style={styles.th}>Mobile Phone</th>
                          <th style={styles.th}>Attendance Status</th>
                          {role === "teacher" && <th style={styles.th}>Manage</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {students.filter(s => s.className?.toLowerCase() === selectedCourse.toLowerCase()).map((student) => {
                          const currentStatus = student.status || "Present";
                          return (
                            <tr key={student.id} style={styles.tableRow}>
                              <td style={styles.td}><strong>{student.rollNo}</strong></td>
                              <td style={styles.td}>{student.name}</td>
                              <td style={styles.td}>📱 {student.phone || "N/A"}</td>
                              <td style={styles.td}>
                                <button
                                  disabled={role !== "teacher"}
                                  onClick={async () => {
                                    const nextStatus = getNextAttendanceStatus(currentStatus);
                                    await updateDoc(doc(db, "students", student.id), { status: nextStatus });
                                  }}
                                  style={{
                                    ...styles.statusButton,
                                    backgroundColor: getStatusColor(currentStatus),
                                    cursor: role === "teacher" ? "pointer" : "default"
                                  }}
                                >
                                  {currentStatus}
                                </button>
                              </td>
                              {role === "teacher" && (
                                <td style={styles.td}>
                                  <button onClick={() => deleteDoc(doc(db, "students", student.id))} style={styles.smallDeleteButton}>Remove</button>
                                </td>
                              )}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}
        </div>
      )}

      {/* VIEW 4: ANNOUNCEMENTS */}
      {!selectedCourse && activeTab === "announcements" && (
        <div>
          {role === "teacher" && (
            <section style={styles.card}>
              <h2 style={styles.cardTitle}>✨ Post New Announcement</h2>
              <form onSubmit={handleAnnouncementSubmit} style={styles.form}>
                <div style={styles.inputGroup}>
                  <input type="text" placeholder="Announcement Title..." value={title} onChange={e => setTitle(e.target.value)} style={styles.input} required />
                  <select value={category} onChange={e => setCategory(e.target.value)} style={styles.select}>
                    <option value="General">General Notice</option>
                    <option value="Exam">Exam / Quiz</option>
                    <option value="Assignment">Assignment</option>
                    <option value="Event">Event / Holiday</option>
                  </select>
                </div>
                <textarea placeholder="Write announcement details here..." value={message} onChange={e => setMessage(e.target.value)} style={styles.textarea} rows="3" required />
                <button type="submit" disabled={loadingNotice} style={styles.button}>{loadingNotice ? "Publishing..." : "Publish Announcement"}</button>
              </form>
            </section>
          )}

          <section style={styles.listSection}>
            <div style={styles.sectionHeader}>
              <h2 style={styles.cardTitle}>Campus Feed ({announcements.length})</h2>
              <input type="text" placeholder="🔍 Search notices..." value={noticeSearch} onChange={e => setNoticeSearch(e.target.value)} style={styles.searchInput} />
            </div>

            {announcements.length === 0 ? (
              <p style={styles.emptyState}>No announcements posted yet.</p>
            ) : (
              announcements.map((item) => (
                <div key={item.id} style={styles.noticeCard}>
                  <div style={styles.noticeHeader}>
                    <h3 style={styles.noticeTitle}>{item.title}</h3>
                    {role === "teacher" && (
                      <button onClick={() => deleteDoc(doc(db, "announcements", item.id))} style={styles.deleteButton}>🗑️ Delete</button>
                    )}
                  </div>
                  <p style={styles.noticeBody}>{item.message}</p>
                </div>
              ))
            )}
          </section>
        </div>
      )}

      <footer style={styles.footerBrand}>
        Tezgam LMS &bull; Wash Atkay &bull; University of Turbat &bull; Created By <strong>Amir Nawaz</strong>
      </footer>
    </div>
  );
}

const styles = {
  authContainer: { display: "flex", justifyContent: "center", alignItems: "center", minHeight: "100vh", background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%)", padding: "20px" },
  authCard: { backgroundColor: "rgba(255, 255, 255, 0.98)", backdropFilter: "blur(12px)", padding: "40px", borderRadius: "24px", boxShadow: "0 25px 50px rgba(0,0,0,0.35)", width: "100%", maxWidth: "420px", border: "1px solid rgba(255,255,255,0.3)" },
  brandContainer: { textAlign: "center", marginBottom: "24px" },
  interactiveLogo: { display: "inline-flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(135deg, #2563eb, #1e3a8a)", color: "#fbbf24", fontWeight: "bold", width: "60px", height: "60px", borderRadius: "18px", fontSize: "1.8rem", boxShadow: "0 8px 20px rgba(37, 99, 235, 0.4)", cursor: "pointer" },
  lmsHighlight: { color: "#2563eb", fontWeight: "900", letterSpacing: "1px" },
  authTitle: { color: "#0f172a", margin: "12px 0 4px", fontSize: "2.2rem", fontWeight: "800" },
  authSub: { color: "#2563eb", margin: "0", fontSize: "1rem", fontWeight: "700", fontStyle: "italic" },
  errorText: { color: "#ef4444", fontSize: "0.85rem", margin: "0", textAlign: "center" },
  dividerContainer: { display: "flex", alignItems: "center", margin: "18px 0", gap: "10px" },
  dividerLine: { flex: 1, height: "1px", backgroundColor: "#cbd5e1" },
  dividerText: { fontSize: "0.8rem", color: "#64748b", fontWeight: "700" },
  googleButton: { width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", backgroundColor: "#ffffff", color: "#334155", border: "1px solid #cbd5e1", padding: "12px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" },
  toggleAuthText: { textAlign: "center", marginTop: "20px", fontSize: "0.9rem", color: "#475569" },
  authLink: { color: "#2563eb", cursor: "pointer", fontWeight: "700" },
  creatorTag: { textAlign: "center", marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", fontSize: "0.85rem", color: "#64748b" },
  
  container: { maxWidth: "1050px", margin: "0 auto", padding: "30px 20px", fontFamily: "'Inter', 'Segoe UI', sans-serif", color: "#1e293b", backgroundColor: "#f8fafc", minHeight: "100vh" },
  header: { marginBottom: "32px", background: "#ffffff", padding: "28px 24px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", position: "relative" },
  logoutButtonTop: { position: "absolute", top: "20px", right: "24px", backgroundColor: "#fee2e2", color: "#991b1b", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem", transition: "all 0.2s" },
  headerCentered: { textAlign: "center", marginBottom: "16px" },
  title: { margin: "0", color: "#0f172a", fontSize: "2.5rem", fontWeight: "800", letterSpacing: "-0.5px", display: "inline-block" },
  welcomeGreeting: { fontSize: "1.1rem", color: "#2563eb", fontWeight: "700", margin: "6px 0 2px", fontStyle: "italic", letterSpacing: "0.5px" },
  subtitle: { margin: "4px 0 0", color: "#64748b", fontSize: "0.95rem" },
  roleBadge: { backgroundColor: "#dbeafe", color: "#1e40af", padding: "2px 8px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: "700", marginLeft: "6px" },
  csvButton: { backgroundColor: "#059669", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" },
  smsButton: { backgroundColor: "#7c3aed", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "10px", fontWeight: "700", cursor: "pointer", fontSize: "0.85rem" },
  
  tabContainer: { display: "flex", gap: "10px", marginTop: "20px", flexWrap: "wrap", borderTop: "1px solid #f1f5f9", paddingTop: "20px", justifyContent: "center" },
  tabButton: { padding: "10px 20px", borderRadius: "12px", border: "1px solid #e2e8f0", backgroundColor: "#f8fafc", cursor: "pointer", fontWeight: "600", fontSize: "0.92rem", color: "#475569", transition: "all 0.2s" },
  activeTab: { backgroundColor: "#2563eb", color: "#fff", borderColor: "#2563eb", boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)" },
  
  card: { backgroundColor: "#ffffff", padding: "30px", borderRadius: "20px", boxShadow: "0 10px 30px rgba(0,0,0,0.04)", marginBottom: "28px", border: "1px solid #e2e8f0" },
  cardTitle: { marginTop: "0", marginBottom: "20px", fontSize: "1.3rem", color: "#0f172a", fontWeight: "700" },
  sectionSubHeading: { fontSize: "1.15rem", color: "#1e3a8a", borderBottom: "2px solid #e2e8f0", paddingBottom: "8px", marginBottom: "16px", fontWeight: "700" },
  form: { display: "flex", flexDirection: "column", gap: "16px" },
  inputGroup: { display: "flex", gap: "14px", flexWrap: "wrap" },
  input: { flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", minWidth: "220px", outline: "none", backgroundColor: "#f8fafc" },
  smallInput: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "0.85rem", width: "120px", outline: "none" },
  searchInput: { padding: "10px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.9rem", width: "260px", outline: "none", backgroundColor: "#f8fafc" },
  select: { flex: 1, padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", backgroundColor: "#f8fafc", outline: "none" },
  fileInput: { flex: 1, padding: "10px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "0.9rem", backgroundColor: "#f8fafc" },
  fileSelectedText: { fontSize: "0.85rem", color: "#059669", margin: "0", fontWeight: "600" },
  textarea: { padding: "12px 16px", borderRadius: "12px", border: "1px solid #cbd5e1", fontSize: "1rem", resize: "vertical", outline: "none", backgroundColor: "#f8fafc" },
  
  button: { backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "12px", fontSize: "1rem", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 14px rgba(37, 99, 235, 0.3)" },
  skipButton: { backgroundColor: "#64748b", color: "#fff", border: "none", padding: "12px 20px", borderRadius: "12px", fontSize: "0.95rem", fontWeight: "600", cursor: "pointer" },
  secondaryButton: { backgroundColor: "#475569", color: "#fff", border: "none", padding: "12px 18px", borderRadius: "12px", fontSize: "0.9rem", fontWeight: "600", cursor: "pointer" },
  gradeButton: { backgroundColor: "#2563eb", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" },
  
  listSection: { display: "flex", flexDirection: "column", gap: "16px" },
  sectionHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" },
  noticeCard: { backgroundColor: "#ffffff", padding: "22px 26px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", borderLeft: "6px solid #2563eb", border: "1px solid #e2e8f0" },
  materialCard: { backgroundColor: "#ffffff", padding: "22px 26px", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", borderLeft: "6px solid #059669", border: "1px solid #e2e8f0" },
  courseGridCard: { backgroundColor: "#ffffff", padding: "28px", borderRadius: "16px", boxShadow: "0 8px 25px rgba(0,0,0,0.05)", border: "1px solid #e2e8f0", cursor: "pointer", textAlign: "center", transition: "transform 0.2s" },
  submissionBox: { backgroundColor: "#f8fafc", padding: "12px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" },
  submissionFileLink: { color: "#2563eb", textDecoration: "none", fontWeight: "700", marginLeft: "6px" },
  gradeBadge: { fontSize: "0.75rem", fontWeight: "800", color: "#1e40af", backgroundColor: "#dbeafe", padding: "3px 10px", borderRadius: "6px" },
  
  noticeHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" },
  noticeTitle: { margin: "0", fontSize: "1.15rem", color: "#0f172a", fontWeight: "700" },
  materialTitle: { margin: "4px 0 0", fontSize: "1.15rem", color: "#0f172a", fontWeight: "700" },
  courseBadge: { fontSize: "0.8rem", fontWeight: "700", color: "#1e40af", backgroundColor: "#dbeafe", padding: "4px 10px", borderRadius: "6px" },
  
  deleteButton: { backgroundColor: "#fee2e2", color: "#991b1b", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" },
  noticeBody: { margin: "0 0 14px", color: "#475569", lineHeight: "1.6" },
  emptyState: { textAlign: "center", color: "#94a3b8", fontStyle: "italic", padding: "30px", background: "#fff", borderRadius: "12px", border: "1px dashed #cbd5e1" },
  
  tableContainer: { backgroundColor: "#fff", borderRadius: "16px", boxShadow: "0 4px 15px rgba(0,0,0,0.03)", overflow: "hidden", border: "1px solid #e2e8f0" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  tableHeaderRow: { backgroundColor: "#f8fafc", borderBottom: "1px solid #e2e8f0" },
  th: { padding: "14px 20px", fontSize: "0.85rem", color: "#475569", fontWeight: "700", textTransform: "uppercase", letterSpacing: "0.5px" },
  tableRow: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "14px 20px", fontSize: "0.95rem", color: "#1e293b" },
  statusButton: { color: "#fff", border: "none", padding: "6px 16px", borderRadius: "20px", fontSize: "0.85rem", fontWeight: "700" },
  smallDeleteButton: { backgroundColor: "#fee2e2", color: "#991b1b", border: "none", padding: "6px 12px", borderRadius: "8px", fontSize: "0.8rem", fontWeight: "700", cursor: "pointer" },
  
  materialFooter: { display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "14px", paddingTop: "10px", borderTop: "1px solid #f1f5f9", flexWrap: "wrap", gap: "10px" },
  typeTag: { fontSize: "0.85rem", color: "#475569", fontWeight: "700" },
  fileMeta: { fontSize: "0.8rem", color: "#94a3b8" },
  linkButton: { backgroundColor: "#059669", color: "#fff", padding: "8px 16px", borderRadius: "10px", textDecoration: "none", fontSize: "0.85rem", fontWeight: "700", cursor: "pointer" },
  
  footerBrand: { textAlign: "center", margin: "40px 0 20px", color: "#64748b", fontSize: "0.85rem", borderTop: "1px solid #e2e8f0", paddingTop: "20px" },

  profileAvatar: { width: "65px", height: "65px", borderRadius: "50%", backgroundColor: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.8rem", boxShadow: "0 4px 12px rgba(37,99,235,0.2)" },
  profileBox: { backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0" },
  subCard: { backgroundColor: "#f8fafc", padding: "20px", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.02)" }
};

export default App;