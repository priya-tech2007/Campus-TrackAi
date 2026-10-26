import React, { useState, useEffect } from 'react';
import type {
  StudentProfile,
  FacultyProfile,
  SemesterRecord,
  AchievementSubmission,
  SystemStatus,
} from './types/index.ts';
import { fetchSystemStatus, fetchStudentDetails } from './services/api.ts';
import { Navbar } from './components/Navbar.tsx';
import { PrototypeBanner } from './components/PrototypeBanner.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { StudentEntryModal } from './components/StudentEntryModal.tsx';
import { FacultyEntryModal } from './components/FacultyEntryModal.tsx';
import { StudentDashboard } from './components/student/StudentDashboard.tsx';
import { FacultyDashboard } from './components/faculty/FacultyDashboard.tsx';
import { Loader2 } from 'lucide-react';

export default function App() {
  // Theme state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('campustrack_theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // System status
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);

  // Active session
  const [currentStudent, setCurrentStudent] = useState<StudentProfile | null>(null);
  const [currentFaculty, setCurrentFaculty] = useState<FacultyProfile | null>(null);

  // Student specific data
  const [studentSemesters, setStudentSemesters] = useState<SemesterRecord[]>([]);
  const [studentAchievements, setStudentAchievements] = useState<AchievementSubmission[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals for entry
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showFacultyModal, setShowFacultyModal] = useState(false);

  const handleToggleTheme = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
        localStorage.setItem('campustrack_theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('campustrack_theme', 'light');
      }
      return next;
    });
  };

  // Ensure theme is applied on mount
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load system status & restore session if present
  useEffect(() => {
    fetchSystemStatus()
      .then((status) => setSystemStatus(status))
      .catch(() => {
        // Fallback status if offline
        setSystemStatus({
          firebaseConfigured: true,
          firestoreStatusMessage: 'Active & Persistent (JSON DB / Firestore Ready)',
          geminiConfigured: true,
          geminiModel: 'gemini-2.5-flash',
          storageMode: 'server-persistent',
        });
      });

    const savedStudent = localStorage.getItem('campustrack_active_student');
    const savedFaculty = localStorage.getItem('campustrack_active_faculty');

    if (savedStudent) {
      try {
        const parsed = JSON.parse(savedStudent);
        if (parsed && (parsed.id || parsed.rollNumber)) {
          loadStudentData(parsed);
        } else {
          localStorage.removeItem('campustrack_active_student');
        }
      } catch {
        localStorage.removeItem('campustrack_active_student');
      }
    } else if (savedFaculty) {
      try {
        const parsed = JSON.parse(savedFaculty);
        if (parsed && (parsed.fullName || parsed.facultyName || parsed.email || parsed.facultyEmail)) {
          setCurrentFaculty({
            id: parsed.id || `fac_${Date.now()}`,
            fullName: parsed.fullName || parsed.facultyName || 'Faculty Evaluator',
            email: parsed.email || parsed.facultyEmail || 'faculty@campus.edu',
            department: parsed.department || 'Academic Department',
            createdAt: parsed.createdAt || new Date().toISOString(),
          });
        } else {
          localStorage.removeItem('campustrack_active_faculty');
        }
      } catch {
        localStorage.removeItem('campustrack_active_faculty');
      }
    }
  }, []);

  const loadStudentData = async (student: StudentProfile | null | undefined) => {
    if (!student || (!student.id && !student.rollNumber)) {
      localStorage.removeItem('campustrack_active_student');
      setCurrentStudent(null);
      setDataLoading(false);
      return;
    }

    setDataLoading(true);

    try {
      const targetIdentifier = student.id || student.rollNumber;
      const details = await fetchStudentDetails(targetIdentifier);

      if (details.student) {
        setCurrentStudent(details.student);
        setStudentSemesters(details.semesters || []);
        setStudentAchievements(details.achievements || []);
        localStorage.setItem('campustrack_active_student', JSON.stringify(details.student));
        localStorage.removeItem('campustrack_active_faculty');
      } else {
        // Student was not found in database (e.g. database was reset or ID is stale)
        localStorage.removeItem('campustrack_active_student');
        setCurrentStudent(null);
        setStudentSemesters([]);
        setStudentAchievements([]);
      }
    } catch {
      localStorage.removeItem('campustrack_active_student');
      setCurrentStudent(null);
      setStudentSemesters([]);
      setStudentAchievements([]);
    } finally {
      setDataLoading(false);
    }
  };

  const handleStudentSuccess = (student: StudentProfile) => {
    setShowStudentModal(false);
    loadStudentData(student);
  };

  const handleFacultySuccess = (faculty: FacultyProfile) => {
    setShowFacultyModal(false);
    setCurrentFaculty(faculty);
    setCurrentStudent(null);
    localStorage.setItem('campustrack_active_faculty', JSON.stringify(faculty));
    localStorage.removeItem('campustrack_active_student');
  };

  const handleLogout = () => {
    setCurrentStudent(null);
    setCurrentFaculty(null);
    setStudentSemesters([]);
    setStudentAchievements([]);
    localStorage.removeItem('campustrack_active_student');
    localStorage.removeItem('campustrack_active_faculty');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Top Prototype Security Banner */}
      <PrototypeBanner systemStatus={systemStatus} />

      {/* Main Navigation */}
      <Navbar
        currentStudent={currentStudent}
        currentFaculty={currentFaculty}
        onLogout={handleLogout}
        isDarkMode={isDarkMode}
        onToggleTheme={handleToggleTheme}
        systemStatus={systemStatus}
        onGoHome={handleLogout}
      />

      {/* Content Rendering */}
      {dataLoading ? (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-400" />
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Connecting to Academic Database...
          </p>
        </div>
      ) : currentStudent ? (
        <StudentDashboard
          student={currentStudent}
          semesters={studentSemesters}
          achievements={studentAchievements}
          onUpdateStudent={(updated) => {
            setCurrentStudent(updated);
            localStorage.setItem('campustrack_active_student', JSON.stringify(updated));
          }}
          onSaveSemester={(savedSem) => {
            setStudentSemesters((prev) => {
              const idx = prev.findIndex((s) => s.semesterNumber === savedSem.semesterNumber);
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = savedSem;
                return next;
              }
              return [...prev, savedSem];
            });
          }}
          onAddAchievement={(newAch) => {
            setStudentAchievements((prev) => [newAch, ...prev]);
          }}
          onUpdateAchievement={(updated) => {
            setStudentAchievements((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
          }}
        />
      ) : currentFaculty ? (
        <FacultyDashboard faculty={currentFaculty} />
      ) : (
        <LandingPage
          onSelectStudent={() => setShowStudentModal(true)}
          onSelectFaculty={() => setShowFacultyModal(true)}
        />
      )}

      {/* Student Entry Modal */}
      <StudentEntryModal
        isOpen={showStudentModal}
        onClose={() => setShowStudentModal(false)}
        onSuccess={handleStudentSuccess}
      />

      {/* Faculty Entry Modal */}
      <FacultyEntryModal
        isOpen={showFacultyModal}
        onClose={() => setShowFacultyModal(false)}
        onSuccess={handleFacultySuccess}
      />
    </div>
  );
}
