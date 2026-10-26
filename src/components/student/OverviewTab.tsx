import React from 'react';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Info,
  AlertTriangle,
  UploadCloud,
} from 'lucide-react';
import type {
  StudentProfile,
  SemesterRecord,
  AchievementSubmission,
  PerformanceScoreBreakdown,
} from '../../types/index.ts';

interface OverviewTabProps {
  student: StudentProfile;
  semesters: SemesterRecord[];
  achievements: AchievementSubmission[];
  score: PerformanceScoreBreakdown;
  onNavigateTab: (tab: string) => void;
  onOpenSemesterModal: (semesterNumber: number) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  student,
  semesters,
  achievements,
  score,
  onNavigateTab,
  onOpenSemesterModal,
}) => {
  const recentAchievements = achievements.slice(0, 4);

  // Semesters 1-8 data for chart
  const semesterChartData = [1, 2, 3, 4, 5, 6, 7, 8].map((semNum) => {
    const record = semesters.find((s) => s.semesterNumber === semNum);
    return {
      semester: `Sem ${semNum}`,
      semNum,
      sgpa: record && record.sgpa > 0 ? record.sgpa : null,
      status: record ? record.status : 'none',
    };
  });

  const hasAnyData = semesters.length > 0 || achievements.length > 0;

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 sm:p-8 text-white shadow-xl shadow-indigo-950/20 border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Academic Dashboard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {student.fullName}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm font-medium">
              Roll No: <span className="font-mono text-indigo-300 font-bold">{student.rollNumber}</span> • {student.branch} • Semester {student.currentSemester}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigateTab('upload-achievement')}
              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Achievement</span>
            </button>
            <button
              onClick={() => onNavigateTab('ai-career-guide')}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs border border-white/20 backdrop-blur-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>AI Career Guide</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5 Core Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* CGPA */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Cumulative CGPA</span>
            <BookOpen className="w-4 h-4 text-blue-500" />
          </div>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {score.cgpa !== null ? score.cgpa.toFixed(2) : '—'}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {score.cgpa !== null ? 'Out of 10.0 scale' : 'Not added yet'}
            </p>
          </div>
        </div>

        {/* Total Submissions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Submissions</span>
            <Award className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              {score.totalSubmissions}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Technical & extracurricular
            </p>
          </div>
        </div>

        {/* Verified Submissions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Verified</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">
              {score.verifiedCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Awarded verified points
            </p>
          </div>
        </div>

        {/* Pending Reviews */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-900/60 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-amber-700 dark:text-amber-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending</span>
            <Clock className="w-4 h-4" />
          </div>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600 dark:text-amber-400">
              {score.pendingCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Awaiting faculty review
            </p>
          </div>
        </div>

        {/* Rejected Submissions */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-rose-200 dark:border-rose-900/60 shadow-sm flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-700 dark:text-rose-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Action Needed</span>
            <XCircle className="w-4 h-4" />
          </div>
          <div className="mt-1">
            <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 dark:text-rose-400">
              {score.rejectedCount}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {score.rejectedCount > 0 ? 'Correct & resubmit' : 'Zero rejections'}
            </p>
          </div>
        </div>
      </div>

      {/* Performance Score & SGPA Progression Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Explainable Performance Score Card (1 col) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between space-y-5">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-500" />
                Performance Score
              </h3>
              {score.isProvisional && (
                <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider border border-amber-200 dark:border-amber-800">
                  Provisional
                </span>
              )}
            </div>

            {/* Score Ring Display */}
            <div className="flex items-center gap-5 my-4">
              <div className="relative w-24 h-24 shrink-0 flex items-center justify-center rounded-full bg-gradient-to-tr from-indigo-600 to-blue-500 text-white font-extrabold shadow-lg shadow-indigo-500/25">
                <div className="text-center">
                  <span className="text-3xl">{score.overallScore}</span>
                  <span className="text-[10px] block opacity-80 uppercase -mt-1 font-semibold">/ 100</span>
                </div>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="font-semibold text-slate-900 dark:text-white">
                  CampusTrack Academic Index
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  Weighted evaluation of academic grades, verified achievements, and student skills.
                </p>
              </div>
            </div>

            {/* Breakdown bars */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Academic Performance (50%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {score.academicComponent} / 50
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${(score.academicComponent / 50) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Verified Achievements (30%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {score.verifiedAchievementComponent} / 30
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(score.verifiedAchievementComponent / 30) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-600 dark:text-slate-300 mb-1">
                  <span>Skill Development & Activities (20%)</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {score.skillComponent} / 20
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(score.skillComponent / 20) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-700/50 border border-slate-200/80 dark:border-slate-700 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-start gap-1.5">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
              <span>{score.explanation}</span>
            </div>
          </div>
        </div>

        {/* Semester Progression Chart (2 cols) */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Semester Academic Growth (Sem 1 – Sem 8)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Semester Grade Point Average (SGPA) trend across your college program
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('academic-growth')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Semesters</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Custom SVG / Bar Visualization */}
            <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700">
              <div className="grid grid-cols-8 gap-2 sm:gap-4 items-end h-48 px-2 pb-2">
                {semesterChartData.map((bar) => {
                  const heightPercent = bar.sgpa ? (bar.sgpa / 10) * 100 : 8;
                  const isCurrent = bar.semNum === student.currentSemester;

                  return (
                    <div
                      key={bar.semNum}
                      onClick={() => onOpenSemesterModal(bar.semNum)}
                      className="group flex flex-col items-center h-full justify-end cursor-pointer"
                    >
                      {/* Tooltip on hover */}
                      <div className="text-[10px] font-bold mb-1 opacity-0 group-hover:opacity-100 transition-opacity text-slate-700 dark:text-slate-300">
                        {bar.sgpa ? `${bar.sgpa} SGPA` : 'Add'}
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full rounded-t-xl transition-all duration-300 relative ${
                          bar.sgpa
                            ? 'bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:brightness-110 shadow-sm'
                            : 'bg-slate-100 dark:bg-slate-700/60 border border-dashed border-slate-300 dark:border-slate-600'
                        }`}
                        style={{ height: `${heightPercent}%` }}
                      >
                        {isCurrent && (
                          <span
                            className="absolute -top-2 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white dark:ring-slate-800"
                            title="Current Semester"
                          />
                        )}
                      </div>

                      {/* Label */}
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-2 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                        S{bar.semNum}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-4 px-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-gradient-to-r from-blue-600 to-indigo-500" />
                    <span>Entered SGPA</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-700" />
                    <span>Not added yet</span>
                  </div>
                </div>
                <div className="font-semibold text-slate-700 dark:text-slate-300">
                  Target Benchmark: 8.0 SGPA
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Achievements & Activity */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Award className="w-5 h-5 text-indigo-500" />
              Recent Achievement Submissions
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Certificates, project completions, and extracurricular verifications
            </p>
          </div>

          <button
            onClick={() => onNavigateTab('my-achievements')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All ({achievements.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentAchievements.length === 0 ? (
          <div className="p-8 text-center rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700">
            <Award className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-60" />
            <h4 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
              No Achievements Submitted Yet
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-4">
              Add your certificates, internships, hackathons, or project completions to earn verified achievement points.
            </p>
            <button
              onClick={() => onNavigateTab('upload-achievement')}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Upload First Achievement
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/60">
            {recentAchievements.map((item) => (
              <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      {item.title}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                      {item.category}
                    </span>
                    {item.pointsAwarded > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        +{item.pointsAwarded} pts
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {item.organization} • Completed on {item.completionDate}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {item.status === 'verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5" />
                      Under Review
                    </span>
                  )}
                  {item.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5" />
                      Action Required
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
