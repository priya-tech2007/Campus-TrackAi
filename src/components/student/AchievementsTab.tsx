import React, { useState } from 'react';
import {
  Award,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  ExternalLink,
  RefreshCw,
  Eye,
  AlertCircle,
  Calendar,
  Building,
  PlusCircle,
  Sparkles,
} from 'lucide-react';
import type {
  AchievementSubmission,
  StudentProfile,
  AchievementCategory,
  VerificationStatus,
} from '../../types/index.ts';
import { ResubmitModal } from './ResubmitModal.tsx';

interface AchievementsTabProps {
  student: StudentProfile;
  achievements: AchievementSubmission[];
  onNavigateTab: (tab: string) => void;
  onAchievementUpdated: (updated: AchievementSubmission) => void;
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

export const AchievementsTab: React.FC<AchievementsTabProps> = ({
  student,
  achievements,
  onNavigateTab,
  onAchievementUpdated,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'portfolio'>('all');
  const [resubmittingItem, setResubmittingItem] = useState<AchievementSubmission | null>(null);
  const [inspectingItem, setInspectingItem] = useState<AchievementSubmission | null>(null);

  // Filter achievements
  const filtered = achievements.filter((item) => {
    if (viewMode === 'portfolio' && item.status !== 'verified') return false;
    if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
    if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;
    return true;
  });

  const verifiedOnly = achievements.filter((a) => a.status === 'verified');
  const totalVerifiedPoints = verifiedOnly.reduce((acc, curr) => acc + (curr.pointsAwarded || 10), 0);

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Award className="w-6 h-6 text-indigo-500" />
            My Achievements & Portfolio
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track certificate proofs, review statuses, and verified academic points.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewMode('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                viewMode === 'all'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              All Submissions ({achievements.length})
            </button>
            <button
              onClick={() => setViewMode('portfolio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                viewMode === 'portfolio'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Portfolio ({verifiedOnly.length})</span>
            </button>
          </div>

          <button
            onClick={() => onNavigateTab('upload-achievement')}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Submit New</span>
          </button>
        </div>
      </div>

      {/* Portfolio Banner (when in portfolio mode) */}
      {viewMode === 'portfolio' && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 text-white border border-emerald-800/40 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Verified Student Portfolio
              </div>
              <h3 className="text-xl font-bold">
                {student.fullName}&apos;s Official Credentials
              </h3>
              <p className="text-xs text-emerald-200/80">
                Roll No: {student.rollNumber} • {student.branch} • All achievements below have been confirmed by faculty.
              </p>
            </div>

            <div className="text-right sm:border-l sm:border-emerald-800/60 sm:pl-6">
              <div className="text-2xl font-extrabold text-emerald-400 font-mono">
                {totalVerifiedPoints} pts
              </div>
              <div className="text-[11px] text-emerald-200/70">
                Total Verified Achievement Points
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <Filter className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 shrink-0">
            Category:
          </span>
          <div className="flex gap-1.5 shrink-0">
            {CATEGORIES.slice(0, 5).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter */}
        {viewMode === 'all' && (
          <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1 rounded-xl text-xs font-medium border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Review</option>
              <option value="verified">Verified</option>
              <option value="rejected">Action Required (Rejected)</option>
            </select>
          </div>
        )}
      </div>

      {/* Achievements List */}
      {filtered.length === 0 ? (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-700">
          <Award className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 dark:text-slate-200 text-base">
            No Submissions Found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-5">
            {viewMode === 'portfolio'
              ? 'No achievements have been verified yet. Check pending reviews or submit documents for verification.'
              : 'You have not submitted achievements under this filter yet. Submit internships, hackathons, or project certificates.'}
          </p>
          <button
            onClick={() => onNavigateTab('upload-achievement')}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Upload Achievement Now</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((item) => (
            <div
              key={item.id}
              className={`rounded-3xl p-6 border transition-all flex flex-col justify-between ${
                item.status === 'verified'
                  ? 'bg-white dark:bg-slate-800 border-emerald-200 dark:border-emerald-900/60 shadow-sm'
                  : item.status === 'rejected'
                  ? 'bg-rose-50/30 dark:bg-slate-800 border-rose-200 dark:border-rose-900/60 shadow-sm'
                  : 'bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/60 shadow-sm'
              }`}
            >
              <div>
                {/* Header status badge & category */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                    {item.category}
                  </span>

                  {item.status === 'verified' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Verified (+{item.pointsAwarded} pts)
                    </span>
                  )}
                  {item.status === 'pending' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <Clock className="w-3.5 h-3.5" />
                      Pending Faculty Review
                    </span>
                  )}
                  {item.status === 'rejected' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      <XCircle className="w-3.5 h-3.5" />
                      Rejected (Feedback Given)
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-3 mb-4 leading-relaxed">
                  {item.description || 'No detailed description provided.'}
                </p>

                {/* Organization & Date */}
                <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-xs text-slate-600 dark:text-slate-400 mb-4">
                  <div className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{item.organization}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{item.completionDate}</span>
                  </div>
                </div>

                {/* Faculty Feedback Box (if rejected or reviewed) */}
                {item.facultyFeedback && (
                  <div
                    className={`p-3.5 rounded-xl text-xs mb-4 ${
                      item.status === 'rejected'
                        ? 'bg-rose-100/70 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 border border-emerald-200 dark:border-emerald-800'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1.5 mb-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>
                        Faculty Review ({item.reviewedByFacultyName || 'Faculty Reviewer'}):
                      </span>
                    </div>
                    <p className="italic text-[11px] leading-relaxed">
                      &ldquo;{item.facultyFeedback}&rdquo;
                    </p>
                  </div>
                )}
              </div>

              {/* Action buttons footer */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  {item.documentUrl ? (
                    <a
                      href={item.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-500" />
                      <span>View Proof</span>
                    </a>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">No file attached</span>
                  )}

                  {item.projectUrl && (
                    <a
                      href={item.projectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                      <span>Project URL</span>
                    </a>
                  )}
                </div>

                {item.status === 'rejected' && (
                  <button
                    onClick={() => setResubmittingItem(item)}
                    className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Correct & Resubmit</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Resubmit Modal */}
      {resubmittingItem && (
        <ResubmitModal
          achievement={resubmittingItem}
          onClose={() => setResubmittingItem(null)}
          onSuccess={(updated) => {
            onAchievementUpdated(updated);
            setResubmittingItem(null);
          }}
        />
      )}
    </div>
  );
};
