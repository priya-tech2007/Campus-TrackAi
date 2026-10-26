import React from 'react';
import {
  GraduationCap,
  Users,
  Award,
  Sparkles,
  TrendingUp,
  FileCheck2,
  ArrowRight,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';

interface LandingPageProps {
  onSelectStudent: () => void;
  onSelectFaculty: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onSelectStudent,
  onSelectFaculty,
}) => {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-between">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 w-full">
        <div className="text-center max-w-3xl mx-auto space-y-6">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Academic Growth &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600">
              Achievement
            </span>{' '}
            Management
          </h1>

          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto">
            A comprehensive, AI-assisted platform for college students to record semester progress, verify technical achievements, and receive personalized career preparation roadmaps.
          </p>
        </div>

        {/* 2 Clear Options: Student vs Faculty */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Option 1: Student */}
          <div className="relative group bg-white dark:bg-slate-800/90 rounded-3xl p-8 border-2 border-indigo-100 dark:border-slate-700/80 hover:border-indigo-500 dark:hover:border-indigo-400 shadow-xl shadow-indigo-500/5 hover:shadow-indigo-500/15 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 mb-2">
                Student Access
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Student Portal
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Log in or register with your Roll Number & College Email. Track Semesters 1 to 8 SGPA, upload achievement proofs, and get AI career guidance.
              </p>

              <div className="space-y-2 mb-8 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>No passwords or OTPs required for prototype entry</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Semester SGPA / CGPA growth tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Gemini AI Career & Placement Roadmap</span>
                </div>
              </div>
            </div>

            <button
              onClick={onSelectStudent}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
            >
              <span>Continue as Student</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Option 2: Faculty */}
          <div className="relative group bg-white dark:bg-slate-800/90 rounded-3xl p-8 border-2 border-emerald-100 dark:border-slate-700/80 hover:border-emerald-500 dark:hover:border-emerald-400 shadow-xl shadow-emerald-500/5 hover:shadow-emerald-500/15 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users className="w-7 h-7" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 mb-2">
                Faculty Evaluator
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                Faculty Portal
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 mb-6 leading-relaxed">
                Log in with your Faculty Name & Email. Review pending student achievements, inspect uploaded certificates, verify or reject with feedback.
              </p>

              <div className="space-y-2 mb-8 text-xs text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Inspect uploaded certificates & project links</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Verify or reject with required constructive feedback</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Monitor student batch academic progress & CGPA</span>
                </div>
              </div>
            </div>

            <button
              onClick={onSelectFaculty}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 group-hover:gap-3 transition-all cursor-pointer"
            >
              <span>Continue as Faculty</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Semesters 1–8 Tracking
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Interactive semester cards, SGPA calculators, subject grades, and progression trend graphs.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center mb-3">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Document Uploads
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Submit proof for 7 categories: Internships, Hackathons, Certifications, and Projects.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
              <Award className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Explainable Score (100)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              Transparent formula: 50% Academic CGPA + 30% Verified Achievements + 20% Skills.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-1">
              Gemini Career Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-normal">
              AI-driven skill recommendations, tailored project ideas, and placement milestones.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
