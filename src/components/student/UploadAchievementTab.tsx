import React, { useState } from 'react';
import {
  UploadCloud,
  FileCheck2,
  FileText,
  X,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Award,
  Link,
  Calendar,
  Building,
} from 'lucide-react';
import type { StudentProfile, AchievementCategory, AchievementSubmission } from '../../types/index.ts';
import { submitAchievement, uploadDocumentFile } from '../../services/api.ts';

interface UploadAchievementTabProps {
  student: StudentProfile;
  onSuccess: (newAchievement: AchievementSubmission) => void;
  onNavigateTab: (tab: string) => void;
}

const CATEGORIES: AchievementCategory[] = [
  'Projects',
  'Internships',
  'Hackathons',
  'Certifications',
  'Course Completion Certificates',
  'Extracurricular Activities',
  'Other Academic Achievements',
];

export const UploadAchievementTab: React.FC<UploadAchievementTabProps> = ({
  student,
  onSuccess,
  onNavigateTab,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<AchievementCategory>('Certifications');
  const [organization, setOrganization] = useState('');
  const [completionDate, setCompletionDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [description, setDescription] = useState('');
  const [projectUrl, setProjectUrl] = useState('');

  // File state
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleFileSelect = (selected: File) => {
    // 10MB limit
    if (selected.size > 10 * 1024 * 1024) {
      setError('Document file size must not exceed 10MB.');
      return;
    }

    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.doc', '.docx'];
    const nameLower = selected.name.toLowerCase();
    const isAllowed = allowedExtensions.some((ext) => nameLower.endsWith(ext));

    if (!isAllowed) {
      setError('Supported file formats are PDF, PNG, JPG, DOC, and DOCX.');
      return;
    }

    setError(null);
    setFile(selected);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!title.trim()) {
      setError('Please provide an Achievement Title.');
      return;
    }
    if (!organization.trim()) {
      setError('Please provide the Issuing Organization or Institution.');
      return;
    }
    if (!completionDate) {
      setError('Please select a Completion Date.');
      return;
    }

    setUploading(true);
    try {
      let documentUrl = '';
      let documentName = '';
      let documentSize = 0;
      let documentMimeType = '';

      if (file) {
        const uploadResult = await uploadDocumentFile(file);
        documentUrl = uploadResult.documentUrl;
        documentName = uploadResult.documentName;
        documentSize = uploadResult.documentSize;
        documentMimeType = uploadResult.documentMimeType;
      }

      const newSubmission = await submitAchievement({
        studentId: student.id,
        rollNumber: student.rollNumber,
        studentName: student.fullName,
        branch: student.branch,
        title: title.trim(),
        category,
        description: description.trim(),
        organization: organization.trim(),
        completionDate,
        documentUrl,
        documentName,
        documentSize,
        documentMimeType,
        projectUrl: projectUrl.trim(),
      });

      setSuccessMessage(
        `"${newSubmission.title}" submitted successfully! It is now Pending Faculty Review.`
      );
      onSuccess(newSubmission);

      // Reset form
      setTitle('');
      setOrganization('');
      setDescription('');
      setProjectUrl('');
      setFile(null);
    } catch (err: any) {
      setError(err.message || 'Failed to submit achievement.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <UploadCloud className="w-6 h-6 text-indigo-500" />
          Submit Academic or Technical Achievement
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Upload certificate proofs, project documentation, or hackathon participation for faculty verification.
        </p>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span className="font-semibold">{successMessage}</span>
          </div>
          <button
            onClick={() => onNavigateTab('my-achievements')}
            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold cursor-pointer shrink-0"
          >
            View Submissions
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-700 dark:text-red-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Achievement Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Certified Solutions Architect Associate / 1st Place Smart India Hackathon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AchievementCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Organization / Institution *
              </label>
              <div className="relative">
                <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Amazon Web Services / IEEE / Google"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Date & Project URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Completion / Issuance Date *
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  required
                  value={completionDate}
                  onChange={(e) => setCompletionDate(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Project or Repository URL (Optional)
              </label>
              <div className="relative">
                <Link className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={projectUrl}
                  onChange={(e) => setProjectUrl(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description & Learning Outcomes
            </label>
            <textarea
              rows={3}
              placeholder="Summarize key responsibilities, technologies utilized, credential IDs, or ranking details."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Supporting Document Upload */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Supporting Document / Certificate Proof
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              className={`p-6 border-2 border-dashed rounded-2xl text-center transition-colors ${
                isDragging
                  ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20'
                  : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40'
              }`}
            >
              {file ? (
                <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="flex items-center gap-3">
                    <FileCheck2 className="w-8 h-8 text-emerald-500" />
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 dark:text-white">
                        {file.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {(file.size / 1024).toFixed(1)} KB • {file.type || 'Document'}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <>
                  <input
                    type="file"
                    id="achievement-doc-input"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                  <label
                    htmlFor="achievement-doc-input"
                    className="cursor-pointer flex flex-col items-center gap-2"
                  >
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Click to browse or drag and drop supporting certificate
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Accepted: PDF, PNG, JPG, DOC, DOCX (Max: 10MB)
                    </div>
                  </label>
                </>
              )}
            </div>
          </div>

          {/* Points disclaimer */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-indigo-500" />
              <span>Verification Policy & Points Scale:</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Submissions receive a <strong>Pending</strong> status until reviewed by a faculty member. Verified Internships award +25 pts; Hackathons award +20 pts; Projects & Certifications award +15 pts. Pending or rejected documents award 0 points.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting to Verification Queue...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Submit for Faculty Review</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
