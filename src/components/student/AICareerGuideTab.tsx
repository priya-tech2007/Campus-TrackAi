import React, { useState } from 'react';
import {
  Sparkles,
  Briefcase,
  Code2,
  BookOpen,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Target,
  ArrowRight,
  ShieldAlert,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import type {
  StudentProfile,
  SemesterRecord,
  AchievementSubmission,
  AICareerRoadmap,
} from '../../types/index.ts';
import { generateAICareerGuide } from '../../services/api.ts';

interface AICareerGuideTabProps {
  student: StudentProfile;
  semesters: SemesterRecord[];
  achievements: AchievementSubmission[];
  onNavigateTab: (tab: string) => void;
}

export const AICareerGuideTab: React.FC<AICareerGuideTabProps> = ({
  student,
  semesters,
  achievements,
  onNavigateTab,
}) => {
  const [roadmap, setRoadmap] = useState<AICareerRoadmap | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const verifiedAchievements = achievements.filter((a) => a.status === 'verified');
  const validSemesters = semesters.filter((s) => s.sgpa > 0);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const result = await generateAICareerGuide({
        student,
        semesters: validSemesters,
        verifiedAchievements,
      });
      setRoadmap(result);
    } catch (err: any) {
      setError(
        err.message ||
          'Failed to connect to Google Gemini API. Please make sure GEMINI_API_KEY is configured in your project secrets.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in text-left">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-violet-900 via-indigo-950 to-slate-900 text-white border border-indigo-800/40 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-bold uppercase tracking-wider border border-violet-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Gemini 3.8 Flash Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              AI Academic & Career Roadmap
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Personalized guidance tailored specifically to your branch ({student.branch}), current Semester {student.currentSemester}, verified milestones, and technical goals.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-indigo-600 to-blue-600 hover:brightness-110 text-white font-bold text-sm shadow-lg shadow-violet-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 transition-all shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Profile & Synthesizing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{roadmap ? 'Regenerate Guidance' : 'Generate Career Plan'}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Profile Context Briefing */}
      <div className="p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Target className="w-4 h-4 text-indigo-500" />
            <span>Profile Data Used for AI Analysis</span>
          </h3>
          <button
            onClick={() => onNavigateTab('my-profile')}
            className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold cursor-pointer"
          >
            Edit Skills & Interests
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
            <div className="text-slate-500 dark:text-slate-400 mb-0.5">Academic Trajectory</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {validSemesters.length > 0
                ? `${validSemesters.length} Semesters Entered`
                : 'No marks entered yet'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
            <div className="text-slate-500 dark:text-slate-400 mb-0.5">Verified Achievements</div>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {verifiedAchievements.length} verified submissions
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
            <div className="text-slate-500 dark:text-slate-400 mb-0.5">Registered Skills</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {student.skills?.length ? student.skills.join(', ') : 'None listed (Add in Profile)'}
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
            <div className="text-slate-500 dark:text-slate-400 mb-0.5">Target Career Goal</div>
            <div className="font-bold text-slate-800 dark:text-slate-200 truncate">
              {student.careerInterests?.length
                ? student.careerInterests.join(', ')
                : 'General Engineering'}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <span>AI Service Notice</span>
            </div>
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs cursor-pointer shadow-sm disabled:opacity-50"
            >
              Retry Request
            </button>
          </div>
          <p className="leading-relaxed">{error}</p>
          <div className="p-3 rounded-xl bg-white/70 dark:bg-slate-900/70 border border-amber-200 dark:border-amber-800/80 text-[11px] text-slate-700 dark:text-slate-300">
            <strong>Troubleshooting Tip:</strong> If the model is experiencing temporary traffic spikes, retrying in a few moments will succeed. Verify that <code>GEMINI_API_KEY</code> is active in the AI Studio Secrets panel.
          </div>
        </div>
      )}

      {/* Roadmap Output */}
      {roadmap ? (
        <div className="space-y-6">
          {/* Target Profile Specialization */}
          <div className="p-6 rounded-3xl bg-indigo-50/70 dark:bg-slate-800 border border-indigo-200 dark:border-indigo-900/80">
            <div className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 mb-1">
              Target Career Specialization Profile
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
              {roadmap.targetCareerProfile}
            </h3>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skills to Improve */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Code2 className="w-5 h-5 text-blue-500" />
                Target Skills to Build & Improve
              </h3>

              <div className="space-y-3">
                {roadmap.skillsToImprove?.map((item, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.skill}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          item.priority === 'High'
                            ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {item.priority} Priority
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.rationale}
                    </p>
                    <div className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold pt-1 border-t border-slate-200/60 dark:border-slate-800">
                      Recommended Focus: {item.recommendedLearning}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended Projects */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-amber-500" />
                Portfolio Projects to Build
              </h3>

              <div className="space-y-3">
                {roadmap.recommendedProjects?.map((proj, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white text-sm">
                        {proj.title}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-semibold text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200">
                        {proj.difficulty}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                      {proj.description}
                    </p>

                    <div className="flex flex-wrap gap-1 py-1">
                      {proj.techStack?.map((t, tIdx) => (
                        <span
                          key={tIdx}
                          className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-mono text-[10px]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                      Why Recruiters Value It: {proj.whyRelevant}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Internship & Placement Preparation Milestones */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Internship Preparation */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-emerald-500" />
                Internship Strategy (Semester {student.currentSemester})
              </h3>

              <div className="space-y-3">
                {roadmap.internshipPrep?.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{step.action}</span>
                      <span className="text-[10px] text-slate-500 font-normal">
                        {step.timeline}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-300">{step.keyAdvice}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Placement Milestones */}
            <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-500" />
                Campus Placement Milestones
              </h3>

              <div className="space-y-3">
                {roadmap.placementRoadmap?.map((mile, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-700 text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                      <span>{mile.milestone}</span>
                      <span className="px-2 py-0.5 rounded-md bg-violet-100 dark:bg-violet-950 text-violet-800 dark:text-violet-300 font-semibold text-[10px]">
                        {mile.targetSemester}
                      </span>
                    </div>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 dark:text-slate-300 text-[11px]">
                      {mile.checklist?.map((c, cIdx) => (
                        <li key={cIdx}>{c}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mandatory AI Disclaimer */}
          <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 text-center flex items-center justify-center gap-2">
            <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
            <span>{roadmap.disclaimer}</span>
          </div>
        </div>
      ) : (
        <div className="p-12 text-center rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
          <Sparkles className="w-12 h-12 text-indigo-400 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            Ready to Generate Your Personalized Career Roadmap
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            Click the button above to have Gemini AI analyze your {student.branch} curriculum, current semester SGPA trajectory, and technical achievements.
          </p>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-md shadow-indigo-600/20 inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generating Roadmap...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Generate Guidance Now</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
