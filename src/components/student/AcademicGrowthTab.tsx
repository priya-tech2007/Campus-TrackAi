import React, { useState } from 'react';
import {
  TrendingUp,
  Plus,
  BookOpen,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Edit3,
  Sparkles,
} from 'lucide-react';
import type { SemesterRecord, StudentProfile } from '../../types/index.ts';
import { SemesterEditModal } from './SemesterEditModal.tsx';

interface AcademicGrowthTabProps {
  student: StudentProfile;
  semesters: SemesterRecord[];
  onSaveSemester: (record: SemesterRecord) => void;
  activeSemesterModal: number | null;
  onCloseSemesterModal: () => void;
  onOpenSemesterModal: (semesterNumber: number) => void;
}

export const AcademicGrowthTab: React.FC<AcademicGrowthTabProps> = ({
  student,
  semesters,
  onSaveSemester,
  activeSemesterModal,
  onCloseSemesterModal,
  onOpenSemesterModal,
}) => {
  // Sort semesters 1 to 8
  const semesterNumbers = [1, 2, 3, 4, 5, 6, 7, 8];

  // Helper to compute trend vs previous semester
  const getTrend = (currentSemNum: number) => {
    if (currentSemNum === 1) return null;
    const current = semesters.find((s) => s.semesterNumber === currentSemNum && s.sgpa > 0);
    const prev = semesters.find((s) => s.semesterNumber === currentSemNum - 1 && s.sgpa > 0);

    if (!current || !prev) return null;
    const diff = Number((current.sgpa - prev.sgpa).toFixed(2));
    return diff;
  };

  // Helper to calculate cumulative CGPA up to a given semester
  const getCumulativeCgpaUpTo = (semNum: number) => {
    const prior = semesters.filter((s) => s.semesterNumber <= semNum && s.sgpa > 0);
    if (prior.length === 0) return null;
    const sum = prior.reduce((acc, curr) => acc + curr.sgpa, 0);
    return Number((sum / prior.length).toFixed(2));
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-indigo-500" />
            Academic Growth Tracking
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage your SGPA, subjects, credits, and performance trajectory across Semesters 1 through 8.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>Student results are labeled Unverified until faculty confirmation.</span>
        </div>
      </div>

      {/* Semester Progression Visualizer */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-4 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-blue-500" />
          SGPA Growth Trajectory (Semesters 1 - 8)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {semesterNumbers.map((num) => {
            const sem = semesters.find((s) => s.semesterNumber === num);
            const trend = getTrend(num);
            const isCurrent = num === student.currentSemester;

            return (
              <div
                key={num}
                onClick={() => onOpenSemesterModal(num)}
                className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                  sem && sem.sgpa > 0
                    ? 'bg-indigo-50/50 dark:bg-slate-700/60 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-dashed border-slate-300 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-400 text-amber-950 uppercase tracking-wider">
                    Current
                  </span>
                )}

                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Sem {num}</span>
                  {sem && sem.status === 'verified' ? (
                    <span title="Faculty Confirmed">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                  ) : sem && sem.sgpa > 0 ? (
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">Draft</span>
                  ) : null}
                </div>

                <div className="my-1">
                  <div className="text-xl font-extrabold text-slate-900 dark:text-white">
                    {sem && sem.sgpa > 0 ? sem.sgpa.toFixed(2) : '—'}
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    {sem && sem.sgpa > 0 ? `${sem.subjects?.length || 0} subjects` : 'Not added'}
                  </div>
                </div>

                {trend !== null ? (
                  <div
                    className={`mt-2 flex items-center gap-1 text-[10px] font-bold ${
                      trend > 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : trend < 0
                        ? 'text-rose-600 dark:text-rose-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {trend > 0 ? (
                      <ArrowUpRight className="w-3 h-3" />
                    ) : trend < 0 ? (
                      <ArrowDownRight className="w-3 h-3" />
                    ) : (
                      <Minus className="w-3 h-3" />
                    )}
                    <span>{trend > 0 ? `+${trend}` : trend}</span>
                  </div>
                ) : (
                  <div className="mt-2 text-[10px] text-slate-400 dark:text-slate-500">
                    {num === 1 ? 'Base Sem' : 'No prior data'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 8 Semester Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {semesterNumbers.map((num) => {
          const sem = semesters.find((s) => s.semesterNumber === num);
          const hasRecord = sem && sem.sgpa > 0;
          const cumulativeCgpa = getCumulativeCgpaUpTo(num);
          const trend = getTrend(num);
          const isCurrent = num === student.currentSemester;

          return (
            <div
              key={num}
              className={`rounded-3xl p-6 border transition-all duration-200 flex flex-col justify-between ${
                hasRecord
                  ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md'
                  : 'bg-slate-50/70 dark:bg-slate-800/60 border-slate-200/80 dark:border-slate-800 opacity-90'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold text-sm flex items-center justify-center">
                      {num}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">
                        Semester {num}
                      </h4>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                          Active Semester
                        </span>
                      )}
                    </div>
                  </div>

                  {hasRecord && (
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                        sem?.status === 'verified'
                          ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                          : 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                      }`}
                    >
                      {sem?.status === 'verified' ? 'Faculty Verified' : 'Student Entry'}
                    </span>
                  )}
                </div>

                {/* SGPA & CGPA display */}
                <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 dark:text-slate-400">Semester SGPA</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white font-mono">
                      {hasRecord ? sem!.sgpa.toFixed(2) : 'Not added yet'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60 dark:border-slate-800">
                    <span className="text-slate-500 dark:text-slate-400">Cumulative CGPA</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                      {cumulativeCgpa !== null ? cumulativeCgpa.toFixed(2) : '—'}
                    </span>
                  </div>
                </div>

                {/* Details list */}
                {hasRecord ? (
                  <div className="space-y-2 mb-4 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Recorded Subjects:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {sem!.subjects?.length || 0} subjects
                      </span>
                    </div>

                    {trend !== null && (
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Vs Previous Sem:</span>
                        <span
                          className={`font-semibold flex items-center gap-0.5 ${
                            trend > 0
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : trend < 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-600 dark:text-slate-400'
                          }`}
                        >
                          {trend > 0 ? `+${trend} improvement` : trend < 0 ? `${trend} change` : 'Equal'}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 my-4 leading-normal">
                    No academic records entered yet for this semester. Click below to add subjects and SGPA.
                  </p>
                )}
              </div>

              <button
                onClick={() => onOpenSemesterModal(num)}
                className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  hasRecord
                    ? 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                }`}
              >
                {hasRecord ? (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>View & Edit Semester</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3.5 h-3.5" />
                    <span>Enter Semester Marks</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Semester Edit / View Modal */}
      {activeSemesterModal !== null && (
        <SemesterEditModal
          student={student}
          semesterNumber={activeSemesterModal}
          initialRecord={semesters.find((s) => s.semesterNumber === activeSemesterModal) || null}
          onClose={onCloseSemesterModal}
          onSave={onSaveSemester}
        />
      )}
    </div>
  );
};
