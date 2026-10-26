import React, { useState } from 'react';
import { ShieldAlert, Info, X, ExternalLink } from 'lucide-react';
import type { SystemStatus } from '../types/index.ts';

interface PrototypeBannerProps {
  systemStatus: SystemStatus | null;
}

export const PrototypeBanner: React.FC<PrototypeBannerProps> = ({ systemStatus }) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (isDismissed) return null;

  return (
    <>
      <div className="bg-gradient-to-r from-amber-500/15 via-blue-500/10 to-indigo-500/15 border-b border-amber-500/30 dark:border-amber-400/20 px-4 py-2 text-xs transition-colors">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
            <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong className="font-semibold">Academic Evaluation Notice:</strong> Simplified access is active (no passwords/OTPs). Synthetic test data is recommended.
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="text-indigo-700 dark:text-indigo-300 hover:underline font-medium inline-flex items-center gap-1 cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
              Security & Storage Info
            </button>
            <button
              onClick={() => setIsDismissed(true)}
              className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-0.5 rounded cursor-pointer"
              title="Dismiss banner"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative text-left">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-amber-500/15 text-amber-600 dark:text-amber-400 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Academic Prototype Security Architecture
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  CampusTrack AI System Architecture & Evaluation Mode
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-sm text-slate-600 dark:text-slate-300">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60">
                <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Active Data Storage Mode
                </div>
                <p className="text-xs">
                  {systemStatus?.storageMode === 'firebase-firestore'
                    ? 'Connected to Firebase Firestore with server synchronization.'
                    : 'Server-authoritative persistent disk storage (data/campustrack_db.json) with document file uploads enabled.'}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  All profiles, semester marks, achievement submissions, and faculty feedback remain intact across page reloads and browser sessions.
                </p>
              </div>

              <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                <div className="font-semibold">Security & Access Limitations:</div>
                <ul className="list-disc pl-4 space-y-1 text-[11px]">
                  <li>
                    Roll numbers and emails locate profiles without password authentication, as requested for easy academic demonstration.
                  </li>
                  <li>
                    Do NOT upload confidential personal documents or real private student identification onto public unauthenticated deployments.
                  </li>
                  <li>
                    Before production rollout: Firebase Authentication (SSO / institutional email verification) and strict role-based access rules (RBAC) must be activated.
                  </li>
                </ul>
              </div>

              <div className="p-3 bg-indigo-500/10 rounded-xl border border-indigo-500/20 text-xs">
                <div className="font-semibold text-indigo-900 dark:text-indigo-200 mb-1">
                  Gemini AI Status:
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300">
                  {systemStatus?.geminiConfigured
                    ? 'Google Gemini API is configured and ready to generate real-time personalized career roadmaps via secure server-side proxy.'
                    : 'Gemini API key is not yet set in environment. AI career guidance will guide you on how to attach the key in Secrets.'}
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium text-sm hover:opacity-90 transition-opacity cursor-pointer"
              >
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
