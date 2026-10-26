import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  AlertCircle,
  Loader2,
  Building,
  Calendar,
  User,
  Award,
} from 'lucide-react';
import type { AchievementSubmission, FacultyProfile } from '../../types/index.ts';
import { reviewAchievement } from '../../services/api.ts';

interface FacultyReviewModalProps {
  achievement: AchievementSubmission;
  faculty: FacultyProfile;
  onClose: () => void;
  onSuccess: (updated: AchievementSubmission) => void;
}

export const FacultyReviewModal: React.FC<FacultyReviewModalProps> = ({
  achievement,
  faculty,
  onClose,
  onSuccess,
}) => {
  const [feedback, setFeedback] = useState(achievement.facultyFeedback || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleDecision = async (status: 'verified' | 'rejected') => {
    if (loading) return; // Prevent repeated clicks
    setError(null);
    setSuccessMessage(null);

    if (status === 'rejected' && !feedback.trim()) {
      setError(
        'Faculty feedback is required when rejecting an achievement submission. Please explain what is missing or incorrect.'
      );
      return;
    }

    setLoading(true);
    try {
      const reviewerName = faculty.fullName || (faculty as any).name || 'Faculty Evaluator';
      const reviewerEmail = faculty.email || (faculty as any).reviewerEmail || 'faculty@campus.edu';

      const updated = await reviewAchievement(achievement.id, {
        status,
        facultyName: reviewerName,
        facultyEmail: reviewerEmail,
        feedback: feedback.trim(),
      });

      if (status === 'verified') {
        setSuccessMessage(`Achievement successfully verified! +${updated.pointsAwarded || 15} points awarded.`);
      } else {
        setSuccessMessage('Achievement marked as rejected. Feedback has been sent to the student.');
      }

      // Allow 800ms for user to see the success confirmation before closing
      setTimeout(() => {
        onSuccess(updated);
      }, 700);
    } catch (err: any) {
      setError(err.message || 'Failed to submit faculty review decision.');
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

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Inspect & Verify Achievement
              </h3>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {achievement.category}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Reviewer: {faculty.fullName} ({faculty.email})
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
            <span className="font-semibold">{successMessage}</span>
          </div>
        )}

        <div className="space-y-6">
          {/* Student Info Bar */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Student</span>
              <span className="font-bold text-slate-900 dark:text-white">
                {achievement.studentName}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Roll Number</span>
              <span className="font-bold font-mono text-indigo-600 dark:text-indigo-400">
                {achievement.rollNumber}
              </span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Department / Branch</span>
              <span className="font-bold text-slate-900 dark:text-white truncate block">
                {achievement.branch}
              </span>
            </div>
          </div>

          {/* Submission Details */}
          <div className="space-y-3">
            <div>
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Achievement Title:
              </div>
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                {achievement.title}
              </h4>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5">
                <Building className="w-4 h-4 text-slate-400" />
                <span>Issuing Org: <strong>{achievement.organization}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Date: <strong>{achievement.completionDate}</strong></span>
              </div>
            </div>

            {achievement.description && (
              <div>
                <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                  Description:
                </div>
                <p className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 text-xs text-slate-700 dark:text-slate-300 leading-relaxed border border-slate-200/60 dark:border-slate-700/60">
                  {achievement.description}
                </p>
              </div>
            )}

            {achievement.isResubmission && achievement.resubmissionNotes && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
                <span className="font-bold">Student Resubmission Note: </span>
                <span>{achievement.resubmissionNotes}</span>
              </div>
            )}
          </div>

          {/* Document & URL Inspection */}
          <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center justify-between">
              <span>Supporting Evidence / Proof</span>
              <span className="text-[11px] text-slate-500">Inspect before deciding</span>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {achievement.documentUrl ? (
                <a
                  href={achievement.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-2 transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  <span>Inspect Supporting Document ({achievement.documentName || 'Certificate'})</span>
                  <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                </a>
              ) : (
                <div className="text-xs text-slate-500 dark:text-slate-400 italic">
                  No certificate file was uploaded with this submission.
                </div>
              )}

              {achievement.projectUrl && (
                <a
                  href={achievement.projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-semibold inline-flex items-center gap-2 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 text-blue-500" />
                  <span>Open Project URL</span>
                </a>
              )}
            </div>
          </div>

          {/* Feedback Input (Mandatory on rejection) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Faculty Feedback & Evaluator Comments
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2">
              Mandatory if rejecting. Give clear, constructive feedback so the student can rectify their proof.
            </p>
            <textarea
              rows={3}
              placeholder="e.g. Certificate verified successfully! OR: The uploaded screenshot does not show your candidate name or issuing date. Please re-upload official document."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Decision Buttons */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <div className="w-full sm:w-auto flex items-center gap-3">
              {/* Reject button */}
              <button
                type="button"
                onClick={() => handleDecision('rejected')}
                disabled={loading}
                className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs shadow-md shadow-rose-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <XCircle className="w-4 h-4" />
                )}
                <span>Reject with Feedback</span>
              </button>

              {/* Verify button */}
              <button
                type="button"
                onClick={() => handleDecision('verified')}
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Verify & Award Points</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
