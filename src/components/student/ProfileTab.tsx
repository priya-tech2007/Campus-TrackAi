import React, { useState } from 'react';
import {
  User,
  Save,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Tag,
  GraduationCap,
} from 'lucide-react';
import type { StudentProfile } from '../../types/index.ts';
import { updateStudentProfile } from '../../services/api.ts';

interface ProfileTabProps {
  student: StudentProfile;
  onProfileUpdated: (updated: StudentProfile) => void;
}

const COMMON_SKILLS = [
  'Data Structures & Algorithms',
  'Python',
  'Java',
  'C++',
  'React.js',
  'Node.js & Express',
  'SQL / PostgreSQL',
  'Machine Learning',
  'Deep Learning',
  'AWS Cloud',
  'Docker & Kubernetes',
  'Git & GitHub',
  'Cybersecurity',
  'System Design',
];

const COMMON_CAREERS = [
  'Full-Stack Software Engineer',
  'AI / ML Engineer',
  'Data Scientist',
  'Cloud & DevOps Engineer',
  'Cybersecurity Analyst',
  'Embedded Systems / IoT Engineer',
  'Mobile App Developer',
  'Product Manager (Tech)',
];

export const ProfileTab: React.FC<ProfileTabProps> = ({
  student,
  onProfileUpdated,
}) => {
  const [fullName, setFullName] = useState(student.fullName);
  const [branch, setBranch] = useState(student.branch);
  const [currentSemester, setCurrentSemester] = useState(student.currentSemester);
  const [skills, setSkills] = useState<string[]>(student.skills || []);
  const [careerInterests, setCareerInterests] = useState<string[]>(
    student.careerInterests || []
  );

  const [newSkillInput, setNewSkillInput] = useState('');
  const [newCareerInput, setNewCareerInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddSkill = (skillName: string) => {
    const trimmed = skillName.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setNewSkillInput('');
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills(skills.filter((s) => s !== skillName));
  };

  const handleAddCareer = (careerName: string) => {
    const trimmed = careerName.trim();
    if (trimmed && !careerInterests.includes(trimmed)) {
      setCareerInterests([...careerInterests, trimmed]);
    }
    setNewCareerInput('');
  };

  const handleRemoveCareer = (careerName: string) => {
    setCareerInterests(careerInterests.filter((c) => c !== careerName));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const updated = await updateStudentProfile(student.id, {
        fullName: fullName.trim(),
        branch,
        currentSemester: Number(currentSemester),
        skills,
        careerInterests,
      });

      onProfileUpdated(updated);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Failed to update student profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in text-left">
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <User className="w-6 h-6 text-indigo-500" />
          My Student Profile
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your personal details, skill set tags, and target career interests used by Gemini AI.
        </p>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">Profile details updated successfully!</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-600 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Core Identifiers Box */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
            Academic Identification
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                College Roll Number (Stable Identifier)
              </label>
              <input
                type="text"
                disabled
                value={student.rollNumber}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-sm font-mono cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                College Email Address
              </label>
              <input
                type="email"
                disabled
                value={student.collegeEmail}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 text-sm cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Current Semester
              </label>
              <select
                value={currentSemester}
                onChange={(e) => setCurrentSemester(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                  <option key={s} value={s}>
                    Semester {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Branch / Department
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Skills Tag Management */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Technical & Soft Skills
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Skills you currently know and practice (Used by Gemini Career Guide)
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {skills.length} skills
            </span>
          </div>

          {/* Active Skills Chips */}
          <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700">
            {skills.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No skills added yet.</span>
            ) : (
              skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add custom skill input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type a skill (e.g. Next.js, PyTorch) and press Add"
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSkill(newSkillInput);
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddSkill(newSkillInput)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Suggestions */}
          <div>
            <div className="text-[11px] font-semibold text-slate-500 mb-2">
              Popular Suggested Skills (Click to add):
            </div>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SKILLS.filter((s) => !skills.includes(s)).slice(0, 8).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleAddSkill(s)}
                  className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-indigo-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
                >
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Target Career Interests */}
        <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Target Career Interests
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Engineering roles and specializations you are working toward
              </p>
            </div>
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
              {careerInterests.length} roles
            </span>
          </div>

          {/* Active Career Chips */}
          <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-700">
            {careerInterests.length === 0 ? (
              <span className="text-xs text-slate-400 italic">No roles selected yet.</span>
            ) : (
              careerInterests.map((career) => (
                <span
                  key={career}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800"
                >
                  <span>{career}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCareer(career)}
                    className="hover:text-red-500 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Add custom role input */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Quantitative Developer, Blockchain Architect"
              value={newCareerInput}
              onChange={(e) => setNewCareerInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCareer(newCareerInput);
                }
              }}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
            />
            <button
              type="button"
              onClick={() => handleAddCareer(newCareerInput)}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold cursor-pointer"
            >
              Add
            </button>
          </div>

          {/* Suggested Roles */}
          <div className="flex flex-wrap gap-1.5">
            {COMMON_CAREERS.filter((c) => !careerInterests.includes(c)).map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => handleAddCareer(c)}
                className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-100 hover:bg-violet-50 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 cursor-pointer transition-colors"
              >
                + {c}
              </button>
            ))}
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
