import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Plus,
  Trash2,
  Calculator,
  Save,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import type { SemesterRecord, StudentProfile, SubjectItem } from '../../types/index.ts';
import { saveSemesterRecord } from '../../services/api.ts';

interface SemesterEditModalProps {
  student: StudentProfile;
  semesterNumber: number;
  initialRecord: SemesterRecord | null;
  onClose: () => void;
  onSave: (record: SemesterRecord) => void;
}

const GRADE_POINTS: Record<string, number> = {
  O: 10,
  'A+': 9,
  A: 8,
  'B+': 7,
  B: 6,
  C: 5,
  P: 4,
  F: 0,
};

export const SemesterEditModal: React.FC<SemesterEditModalProps> = ({
  student,
  semesterNumber,
  initialRecord,
  onClose,
  onSave,
}) => {
  const [sgpa, setSgpa] = useState<string>(
    initialRecord && initialRecord.sgpa > 0 ? String(initialRecord.sgpa) : ''
  );
  const [subjects, setSubjects] = useState<SubjectItem[]>(
    initialRecord?.subjects && initialRecord.subjects.length > 0
      ? initialRecord.subjects
      : [
          {
            id: 'sub_1',
            code: `CS${semesterNumber}01`,
            name: '',
            credits: 4,
            grade: 'A',
            marks: 80,
          },
        ]
  );
  const [remarks, setRemarks] = useState(initialRecord?.remarks || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSubjectRow = () => {
    const nextIdx = subjects.length + 1;
    setSubjects([
      ...subjects,
      {
        id: `sub_${Date.now()}_${nextIdx}`,
        code: `CS${semesterNumber}0${nextIdx}`,
        name: '',
        credits: 3,
        grade: 'A',
        marks: 75,
      },
    ]);
  };

  const removeSubjectRow = (id: string) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((s) => s.id !== id));
  };

  const updateSubjectField = (
    id: string,
    field: keyof SubjectItem,
    value: any
  ) => {
    setSubjects(
      subjects.map((sub) => {
        if (sub.id === id) {
          return { ...sub, [field]: value };
        }
        return sub;
      })
    );
  };

  // Auto calculate SGPA from subjects
  const calculateSgpaFromSubjects = () => {
    let totalCredits = 0;
    let weightedPoints = 0;

    for (const sub of subjects) {
      const cr = Number(sub.credits) || 0;
      const pts = GRADE_POINTS[sub.grade] ?? 8;
      totalCredits += cr;
      weightedPoints += cr * pts;
    }

    if (totalCredits === 0) {
      setError('Please provide valid credits for subjects.');
      return;
    }

    const calculated = (weightedPoints / totalCredits).toFixed(2);
    setSgpa(calculated);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedSgpa = Number(sgpa);
    if (isNaN(parsedSgpa) || parsedSgpa < 0 || parsedSgpa > 10) {
      setError('SGPA must be a valid number between 0.00 and 10.00.');
      return;
    }

    // Filter valid subjects
    const validSubjects = subjects.filter((s) => s.name.trim().length > 0);

    setLoading(true);
    try {
      const saved = await saveSemesterRecord({
        studentId: student.id,
        rollNumber: student.rollNumber,
        semesterNumber,
        sgpa: parsedSgpa,
        subjects: validSubjects.length > 0 ? validSubjects : subjects,
        remarks,
      });

      onSave(saved);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save semester record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Semester {semesterNumber} Academic Record
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Student: {student.fullName} ({student.rollNumber}) • {student.branch}
            </p>
          </div>
        </div>

        {/* Verification Status Warning */}
        <div className="mb-6 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-1">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Unverified Student Input</span>
          </div>
          <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90 leading-relaxed">
            Grades and SGPA entered here are labeled as &ldquo;Student Entry — Unverified&rdquo; until confirmed during faculty review. Real grade cards should not be falsified.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/60 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* SGPA Input and Auto-Calculate */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-white">
                  Semester Grade Point Average (SGPA)
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scale of 0.00 to 10.00 (e.g. 8.45)
                </p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  placeholder="8.50"
                  value={sgpa}
                  onChange={(e) => setSgpa(e.target.value)}
                  className="w-28 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-base font-bold font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500 text-center"
                />

                <button
                  type="button"
                  onClick={calculateSgpaFromSubjects}
                  className="px-3 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-semibold hover:bg-indigo-100 flex items-center gap-1.5 cursor-pointer"
                  title="Compute SGPA weighted by subject credits and grades"
                >
                  <Calculator className="w-3.5 h-3.5" />
                  <span>Calc</span>
                </button>
              </div>
            </div>
          </div>

          {/* Subject Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Subjects & Grades
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Add course codes, subject titles, and your letter grade.
                </p>
              </div>

              <button
                type="button"
                onClick={addSubjectRow}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Subject</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {subjects.map((sub, index) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 grid grid-cols-12 gap-2 items-center text-xs"
                >
                  <div className="col-span-3 sm:col-span-2">
                    <input
                      type="text"
                      placeholder="Code"
                      value={sub.code}
                      onChange={(e) => updateSubjectField(sub.id, 'code', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white uppercase font-mono text-center"
                    />
                  </div>

                  <div className="col-span-9 sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Subject Name (e.g. Operating Systems)"
                      value={sub.name}
                      onChange={(e) => updateSubjectField(sub.id, 'name', e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <select
                      value={sub.credits}
                      onChange={(e) => updateSubjectField(sub.id, 'credits', Number(e.target.value))}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-center"
                      title="Credits"
                    >
                      {[1, 2, 3, 4, 5].map((c) => (
                        <option key={c} value={c}>
                          {c} Cr
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-2">
                    <select
                      value={sub.grade}
                      onChange={(e) => updateSubjectField(sub.id, 'grade', e.target.value)}
                      className="w-full px-2 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-center"
                      title="Letter Grade"
                    >
                      {Object.keys(GRADE_POINTS).map((g) => (
                        <option key={g} value={g}>
                          {g} ({GRADE_POINTS[g]} pts)
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-4 sm:col-span-1 flex justify-center">
                    <button
                      type="button"
                      disabled={subjects.length <= 1}
                      onClick={() => removeSubjectRow(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer disabled:opacity-30"
                      title="Remove Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Semester Remarks / Achievements (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Dean's List, Mini-Project Completed, No Backlogs"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Semester Record</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
