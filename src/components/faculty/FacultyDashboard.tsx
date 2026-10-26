import React, { useState, useEffect } from 'react';
import {
  Users,
  Award,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  Filter,
  FileText,
  ExternalLink,
  ShieldAlert,
  Loader2,
  BookOpen,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Mail,
  GraduationCap,
  AlertCircle,
} from 'lucide-react';
import type {
  FacultyProfile,
  AchievementSubmission,
  StudentProfile,
  AchievementCategory,
} from '../../types/index.ts';
import { fetchAchievements, fetchAllStudents, fetchStudentDetails, verifyAchievement } from '../../services/api.ts';
import { FacultyReviewModal } from './FacultyReviewModal.tsx';

interface FacultyDashboardProps {
  faculty: FacultyProfile;
}

const CATEGORIES: Array<'all' | AchievementCategory> = [
  'all',
  'Projects',
  'Internships',
  'Hackathons',
  'Certifications',
  'Course Completion Certificates',
  'Extracurricular Activities',
  'Other Academic Achievements',
];

const BRANCHES = [
  'all',
  'Computer Science & Engineering',
  'Information Technology',
  'Artificial Intelligence & Data Science',
  'Electronics & Communication Engineering',
  'Electrical & Electronics Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
];

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ faculty }) => {
  const [achievements, setAchievements] = useState<AchievementSubmission[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active view tab: defaults to 'students' so registered students are immediately visible
  const [activeView, setActiveView] = useState<'students' | 'queue'>('students');

  // Search & Filter state for Students
  const [studentSearch, setStudentSearch] = useState('');
  const [studentBranchFilter, setStudentBranchFilter] = useState('all');
  const [studentSemesterFilter, setStudentSemesterFilter] = useState('all');

  // Search & Filter state for Review Queue
  const [queueSearch, setQueueSearch] = useState('');
  const [queueStatusFilter, setQueueStatusFilter] = useState<'all' | 'pending' | 'verified' | 'rejected'>('all');
  const [queueCategoryFilter, setQueueCategoryFilter] = useState<string>('all');

  // Inspect Modal
  const [inspectingItem, setInspectingItem] = useState<AchievementSubmission | null>(null);

  // Direct row verification & alert notices
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Selected Student Modal for Semester Inspection
  const [selectedStudentForInspection, setSelectedStudentForInspection] = useState<any | null>(null);
  const [studentDetailsLoading, setStudentDetailsLoading] = useState(false);
  const [inspectedStudentData, setInspectedStudentData] = useState<any | null>(null);

  const handleDirectVerify = async (item: AchievementSubmission) => {
    if (verifyingId) return; // Prevent concurrent requests
    setVerifyingId(item.id);
    setFeedbackNotice(null);

    try {
      const updated = await verifyAchievement(item.id, {
        fullName: faculty.fullName || (faculty as any).name || 'Faculty Evaluator',
        email: faculty.email || (faculty as any).reviewerEmail || 'faculty@campus.edu',
      });

      // Update local achievements list immediately with the confirmed record from database
      setAchievements((prev) =>
        prev.map((a) => (a.id === updated.id ? updated : a))
      );

      // Refresh students roster counts in background
      fetchAllStudents().then((stdList) => {
        if (stdList) setStudents(stdList);
      });

      setFeedbackNotice({
        type: 'success',
        message: `Certificate "${item.title}" successfully verified (+${updated.pointsAwarded || 15} pts) for ${item.studentName}!`,
      });
    } catch (err: any) {
      setFeedbackNotice({
        type: 'error',
        message: err.message || 'Failed to verify certificate. Please try again.',
      });
    } finally {
      setVerifyingId(null);
    }
  };

  const loadData = async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const [achList, stdList] = await Promise.all([
        fetchAchievements(),
        fetchAllStudents(),
      ]);
      setAchievements(achList || []);
      setStudents(stdList || []);
    } catch {
      // Graceful empty states if network request fails
      setAchievements([]);
      setStudents([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenStudentDetails = async (std: any) => {
    setSelectedStudentForInspection(std);
    setStudentDetailsLoading(true);
    try {
      const details = await fetchStudentDetails(std.id);
      if (details && details.student) {
        setInspectedStudentData(details);
      } else {
        setInspectedStudentData({
          student: std,
          semesters: [],
          achievements: [],
        });
      }
    } catch {
      setInspectedStudentData({
        student: std,
        semesters: [],
        achievements: [],
      });
    } finally {
      setStudentDetailsLoading(false);
    }
  };

  // Metrics
  const pendingCount = achievements.filter((a) => a.status === 'pending').length;
  const verifiedCount = achievements.filter((a) => a.status === 'verified').length;
  const rejectedCount = achievements.filter((a) => a.status === 'rejected').length;

  // Filtered Students list
  const filteredStudents = students.filter((std) => {
    if (studentSearch.trim()) {
      const q = studentSearch.toLowerCase();
      const matchName = (std.fullName || '').toLowerCase().includes(q);
      const matchRoll = (std.rollNumber || '').toLowerCase().includes(q);
      const matchEmail = (std.collegeEmail || '').toLowerCase().includes(q);
      const matchBranch = (std.branch || '').toLowerCase().includes(q);
      if (!matchName && !matchRoll && !matchEmail && !matchBranch) return false;
    }

    if (studentBranchFilter !== 'all' && std.branch !== studentBranchFilter) {
      return false;
    }

    if (studentSemesterFilter !== 'all' && String(std.currentSemester) !== studentSemesterFilter) {
      return false;
    }

    return true;
  });

  // Filtered Achievements list for Queue
  const filteredAchievements = achievements.filter((item) => {
    if (queueSearch.trim()) {
      const q = queueSearch.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchStudent = (item.studentName || '').toLowerCase().includes(q);
      const matchRoll = (item.rollNumber || '').toLowerCase().includes(q);
      const matchOrg = (item.organization || '').toLowerCase().includes(q);
      if (!matchTitle && !matchStudent && !matchRoll && !matchOrg) return false;
    }

    if (queueStatusFilter !== 'all' && item.status !== queueStatusFilter) return false;
    if (queueCategoryFilter !== 'all' && item.category !== queueCategoryFilter) return false;

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8 animate-fade-in text-left">
      {/* Faculty Greeting & Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 p-6 sm:p-8 text-white border border-emerald-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider border border-emerald-500/30">
              <Users className="w-3.5 h-3.5" />
              <span>Faculty Evaluation Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome, {faculty.fullName}
            </h1>
            <p className="text-emerald-200/80 text-xs sm:text-sm font-medium">
              Reviewer Email: <span className="font-mono text-white font-bold">{faculty.email}</span> • {faculty.department || 'Faculty Member'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-2 border border-white/20 backdrop-blur-sm cursor-pointer disabled:opacity-50"
              title="Refresh database records"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              <span>{refreshing ? 'Syncing...' : 'Sync Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Verification / Action Feedback Banner */}
      {feedbackNotice && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
            feedbackNotice.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackNotice.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
            )}
            <span className="font-semibold">{feedbackNotice.message}</span>
          </div>
          <button
            onClick={() => setFeedbackNotice(null)}
            className="text-xs font-bold underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Registered Students Card */}
        <div
          onClick={() => setActiveView('students')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeView === 'students'
              ? 'bg-indigo-50/50 dark:bg-slate-800 border-indigo-500 dark:border-indigo-400 ring-2 ring-indigo-500/20 shadow-sm'
              : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
          }`}
        >
          <div className="flex items-center justify-between text-indigo-700 dark:text-indigo-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Registered Students</span>
            <Users className="w-4 h-4 text-indigo-500" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {students.length}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Click to view student list
            </p>
          </div>
        </div>

        {/* Pending Review Card */}
        <div
          onClick={() => setActiveView('queue')}
          className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
            activeView === 'queue' && queueStatusFilter === 'pending'
              ? 'bg-amber-50/50 dark:bg-slate-800 border-amber-500 dark:border-amber-400 ring-2 ring-amber-500/20 shadow-sm'
              : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/60 hover:border-amber-300'
          }`}
        >
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Pending Review</span>
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {pendingCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Awaiting faculty verification
            </p>
          </div>
        </div>

        {/* Verified Card */}
        <div
          onClick={() => {
            setActiveView('queue');
            setQueueStatusFilter('verified');
          }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/60 shadow-sm flex flex-col justify-between cursor-pointer hover:border-emerald-300"
        >
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Verified</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {verifiedCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Confirmed achievements
            </p>
          </div>
        </div>

        {/* Rejected Card */}
        <div
          onClick={() => {
            setActiveView('queue');
            setQueueStatusFilter('rejected');
          }}
          className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 shadow-sm flex flex-col justify-between cursor-pointer hover:border-rose-300"
        >
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div>
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {rejectedCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Feedback provided for correction
            </p>
          </div>
        </div>
      </div>

      {/* Prominent Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveView('students')}
          className={`pb-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeView === 'students'
              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>Student Directory & Academic Roster</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300">
            {students.length}
          </span>
        </button>

        <button
          onClick={() => setActiveView('queue')}
          className={`pb-3 px-5 text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeView === 'queue'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400 dark:border-emerald-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Achievement Review Queue</span>
          <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
            {pendingCount}
          </span>
        </button>
      </div>

      {/* VIEW 1: STUDENT DIRECTORY & ACADEMIC ROSTER */}
      {activeView === 'students' && (
        <div className="space-y-6">
          {/* Search & Filters for Students */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search registered students by name, roll number, or email..."
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Branch and Semester filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Branch:</span>
                <select
                  value={studentBranchFilter}
                  onChange={(e) => setStudentBranchFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white max-w-[180px] truncate"
                >
                  <option value="all">All Branches</option>
                  {BRANCHES.slice(1).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Semester:</span>
                <select
                  value={studentSemesterFilter}
                  onChange={(e) => setStudentSemesterFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <option key={s} value={String(s)}>
                      Semester {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Students Table */}
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading student directory...</p>
            </div>
          ) : students.length === 0 ? (
            /* Clear Empty State when zero students are in database */
            <div className="p-16 text-center rounded-3xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-500 mx-auto mb-4 flex items-center justify-center">
                <Users className="w-8 h-8 opacity-70" />
              </div>
              <h3 className="font-extrabold text-slate-900 dark:text-white text-lg">
                No students registered yet
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 leading-relaxed">
                When a student enters their name, roll number, college email, branch, and semester in the Student Portal, their profile and academic records will appear here in real time.
              </p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No students match your filter
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Try searching with a different name, roll number, or clearing the branch filter.
              </p>
              <button
                onClick={() => {
                  setStudentSearch('');
                  setStudentBranchFilter('all');
                  setStudentSemesterFilter('all');
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Roll Number</th>
                      <th className="py-3.5 px-4">Student Name & Contact</th>
                      <th className="py-3.5 px-4">Branch & Semester</th>
                      <th className="py-3.5 px-4 text-center">CGPA</th>
                      <th className="py-3.5 px-4 text-center">Submissions</th>
                      <th className="py-3.5 px-4 text-right">Academic Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredStudents.map((std) => (
                      <tr key={std.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-3.5 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400">
                          {std.rollNumber}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white text-sm">
                            {std.fullName}
                          </div>
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                            <Mail className="w-3 h-3 text-slate-400" />
                            <span>{std.collegeEmail}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div className="font-medium text-slate-800 dark:text-slate-200">{std.branch}</div>
                          <div className="text-[11px] text-slate-400">Semester {std.currentSemester}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-900 dark:text-white text-sm">
                          {std.cgpa !== null ? std.cgpa.toFixed(2) : '—'}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">
                            {std.verifiedAchievements || 0} verified
                          </span>
                          <span className="text-slate-400 text-[10px] block">
                            ({std.pendingAchievements || 0} pending)
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenStudentDetails(std)}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/60 cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                          >
                            <BookOpen className="w-3.5 h-3.5" />
                            <span>Inspect Growth</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: ACHIEVEMENT REVIEW QUEUE */}
      {activeView === 'queue' && (
        <div className="space-y-6">
          {/* Search & Filters for Queue */}
          <div className="p-4 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search achievements by student name, roll number, title, or institution..."
                value={queueSearch}
                onChange={(e) => setQueueSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Status:</span>
                <select
                  value={queueStatusFilter}
                  onChange={(e) => setQueueStatusFilter(e.target.value as any)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="verified">Verified</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Category:</span>
                <select
                  value={queueCategoryFilter}
                  onChange={(e) => setQueueCategoryFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? 'All Categories' : cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Submissions Table / Cards */}
          {loading ? (
            <div className="p-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 dark:text-slate-400">Loading student submissions...</p>
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700 shadow-sm">
              <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
                No Submissions in Review Queue
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {achievements.length === 0
                  ? 'No students have submitted achievements yet. Uploaded certificates will appear here for verification.'
                  : 'No submissions match your active filter. Try resetting search or status filters.'}
              </p>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 font-bold border-b border-slate-200 dark:border-slate-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3.5 px-4">Student</th>
                      <th className="py-3.5 px-4">Title & Category</th>
                      <th className="py-3.5 px-4">Issuing Organization</th>
                      <th className="py-3.5 px-4">Supporting Proof</th>
                      <th className="py-3.5 px-4 text-center">Status</th>
                      <th className="py-3.5 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700/60">
                    {filteredAchievements.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-700/50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white">
                            {item.studentName}
                          </div>
                          <div className="font-mono text-[11px] text-indigo-600 dark:text-indigo-400 font-bold">
                            {item.rollNumber}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                            {item.branch}
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 dark:text-white max-w-xs line-clamp-1">
                            {item.title}
                          </div>
                          <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            {item.category}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                          <div>{item.organization}</div>
                          <div className="text-[10px] text-slate-400">{item.completionDate}</div>
                        </td>

                        <td className="py-3.5 px-4">
                          {item.documentUrl ? (
                            <a
                              href={item.documentUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] hover:underline"
                            >
                              <FileText className="w-3.5 h-3.5" />
                              <span>View Doc</span>
                            </a>
                          ) : (
                            <span className="text-[11px] text-slate-400 italic">No file</span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          {item.status === 'verified' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
                              <CheckCircle2 className="w-3 h-3" />
                              Verified (+{item.pointsAwarded} pts)
                            </span>
                          )}
                          {item.status === 'pending' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                              <Clock className="w-3 h-3" />
                              Pending
                            </span>
                          )}
                          {item.status === 'rejected' && (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300">
                              <XCircle className="w-3 h-3" />
                              Rejected
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === 'pending' && (
                              <button
                                type="button"
                                onClick={() => handleDirectVerify(item)}
                                disabled={verifyingId === item.id}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
                                title="Directly verify certificate and award points"
                              >
                                {verifyingId === item.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                )}
                                <span>Verify</span>
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => setInspectingItem(item)}
                              className="px-3 py-1.5 rounded-xl bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 dark:hover:bg-slate-600 text-white font-bold text-xs transition-colors cursor-pointer inline-flex items-center gap-1"
                              title="Inspect details, preview document, or reject with feedback"
                            >
                              <span>{item.status === 'pending' ? 'Inspect / Reject' : 'Inspect'}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Faculty Review Modal */}
      {inspectingItem && (
        <FacultyReviewModal
          achievement={inspectingItem}
          faculty={faculty}
          onClose={() => setInspectingItem(null)}
          onSuccess={(updated) => {
            setAchievements((prev) =>
              prev.map((a) => (a.id === updated.id ? updated : a))
            );
            fetchAllStudents().then((stdList) => {
              if (stdList) setStudents(stdList);
            });
            setFeedbackNotice({
              type: 'success',
              message:
                updated.status === 'verified'
                  ? `Certificate "${updated.title}" successfully verified (+${updated.pointsAwarded || 15} pts)!`
                  : `Certificate "${updated.title}" marked as rejected with feedback sent to student.`,
            });
            setInspectingItem(null);
          }}
        />
      )}

      {/* Inspected Student Details Drawer/Modal */}
      {selectedStudentForInspection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setSelectedStudentForInspection(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl cursor-pointer"
            >
              <XCircle className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedStudentForInspection.fullName} ({selectedStudentForInspection.rollNumber})
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {selectedStudentForInspection.branch} • Semester {selectedStudentForInspection.currentSemester} • {selectedStudentForInspection.collegeEmail}
                </p>
              </div>
            </div>

            {studentDetailsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin text-indigo-500 mx-auto" />
              </div>
            ) : inspectedStudentData ? (
              <div className="space-y-6">
                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3">
                    Semester SGPA Progression
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
                      const sem = inspectedStudentData.semesters?.find(
                        (s: any) => s.semesterNumber === semNum
                      );
                      return (
                        <div
                          key={semNum}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                        >
                          <div className="text-slate-500 dark:text-slate-400 text-[10px]">Sem {semNum}</div>
                          <div className="text-base font-extrabold text-slate-900 dark:text-white font-mono">
                            {sem && sem.sgpa > 0 ? sem.sgpa.toFixed(2) : '—'}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {sem && sem.subjects?.length ? `${sem.subjects.length} subjects` : 'Not added'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-2">
                    Achievements Submitted ({inspectedStudentData.achievements?.length || 0})
                  </h4>
                  {inspectedStudentData.achievements?.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 text-center">
                      No achievements submitted yet by this student.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {inspectedStudentData.achievements?.map((ach: any) => (
                        <div
                          key={ach.id}
                          className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white">
                              {ach.title}
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">
                              {ach.category} • {ach.organization}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                ach.status === 'verified'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : ach.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {ach.status}
                            </span>
                            <button
                              type="button"
                              onClick={() => setInspectingItem(ach)}
                              className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[10px] hover:bg-slate-300 dark:hover:bg-slate-600 cursor-pointer"
                            >
                              Review
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
