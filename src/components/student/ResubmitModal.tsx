import React, { useState } from 'react';
import {
  X,
  RefreshCw,
  UploadCloud,
  FileCheck2,
  AlertCircle,
  Loader2,
  Save,
} from 'lucide-react';
import type { AchievementSubmission } from '../../types/index.ts';
import { updateOrResubmitAchievement, uploadDocumentFile } from '../../services/api.ts';

interface ResubmitModalProps {
  achievement: AchievementSubmission;
  onClose: () => void;
  onSuccess: (updated: AchievementSubmission) => void;
}

export const ResubmitModal: React.FC<ResubmitModalProps> = ({
  achievement,
  onClose,
  onSuccess,
}) => {
  const [title, setTitle] = useState(achievement.title);
  const [description, setDescription] = useState(achievement.description);
  const [organization, setOrganization] = useState(achievement.organization);
  const [projectUrl, setProjectUrl] = useState(achievement.projectUrl || '');
  const [resubmissionNotes, setResubmissionNotes] = useState('');

  // New file upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must not exceed 10MB.');
        return;
      }
      setSelectedFile(file);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !organization.trim()) {
      setError('Title and Organization are required.');
      return;
    }

    setLoading(true);
    try {
      let documentUrl = achievement.documentUrl;
      let documentName = achievement.documentName;
      let documentSize = achievement.documentSize;
      let documentMimeType = achievement.documentMimeType;

      if (selectedFile) {
        setUploadingFile(true);
        const uploaded = await uploadDocumentFile(selectedFile);
        documentUrl = uploaded.documentUrl;
        documentName = uploaded.documentName;
        documentSize = uploaded.documentSize;
        documentMimeType = uploaded.documentMimeType;
        setUploadingFile(false);
      }

      const updated = await updateOrResubmitAchievement(achievement.id, {
        title: title.trim(),
        description: description.trim(),
        organization: organization.trim(),
        projectUrl: projectUrl.trim(),
        documentUrl,
        documentName,
        documentSize,
        documentMimeType,
        resubmissionNotes: resubmissionNotes.trim(),
      });

      onSuccess(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to resubmit achievement.');
    } finally {
      setLoading(false);
      setUploadingFile(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in text-left">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-xl cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              Correct & Resubmit Achievement
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Address reviewer comments and upload verified documentation.
            </p>
          </div>
        </div>

        {/* Previous Feedback Display */}
        {achievement.facultyFeedback && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-900 dark:text-rose-200">
            <div className="font-bold flex items-center gap-1.5 mb-1">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>Feedback from {achievement.reviewedByFacultyName || 'Faculty Reviewer'}:</span>
            </div>
            <p className="italic leading-relaxed pl-5">
              &ldquo;{achievement.facultyFeedback}&rdquo;
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Achievement Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Organization / Issuing Institution
            </label>
            <input
              type="text"
              required
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Detailed Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          {/* Replacement Document Upload */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Replace Supporting Certificate / Document (Optional)
            </label>
            <div className="p-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-center bg-slate-50 dark:bg-slate-800/40">
              <input
                type="file"
                id="resubmit-file"
                accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="resubmit-file"
                className="cursor-pointer flex flex-col items-center gap-1.5"
              >
                <UploadCloud className="w-7 h-7 text-indigo-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  {selectedFile ? selectedFile.name : 'Click to choose updated file (PDF, PNG, JPG, DOCX)'}
                </span>
                <span className="text-[11px] text-slate-400">
                  Max size: 10MB • Current file: {achievement.documentName || 'None'}
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Project or Portfolio URL
            </label>
            <input
              type="url"
              placeholder="https://github.com/username/project"
              value={projectUrl}
              onChange={(e) => setProjectUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Notes for Faculty Reviewer
            </label>
            <input
              type="text"
              placeholder="e.g. Attached corrected certificate showing verifiable registration code."
              value={resubmissionNotes}
              onChange={(e) => setResubmissionNotes(e.target.value)}
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
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-700 hover:to-indigo-700 text-white font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Resubmit for Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
