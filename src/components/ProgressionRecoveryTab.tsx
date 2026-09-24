import React from 'react';
import { GeneratedFitnessPlan } from '../types/fitness';
import {
  TrendingUp,
  Moon,
  ShieldCheck,
  Quote,
  Sparkles,
  Calendar,
  AlertCircle,
  Activity,
} from 'lucide-react';

interface ProgressionRecoveryTabProps {
  plan: GeneratedFitnessPlan;
}

export const ProgressionRecoveryTab: React.FC<ProgressionRecoveryTabProps> = ({ plan }) => {
  const { progressionPlan, recoveryProtocol, coachQuote } = plan;

  return (
    <div className="space-y-6">
      {/* 4-WEEK PROGRESSION ROADMAP */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-heading text-xl font-bold text-white">
                4-Week Progressive Overload Blueprint
              </h3>
              <p className="text-xs text-slate-400">
                How to systematically stimulate muscle adaptation and prevent plateaus
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold self-start sm:self-auto border border-emerald-500/20">
            Evidence-Based Periodization
          </span>
        </div>

        {/* Master Rule */}
        <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
            Golden Progression Rule
          </span>
          <p className="text-sm font-semibold text-white leading-relaxed">
            {progressionPlan.rule}
          </p>
        </div>

        {/* Phase Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Phase 1: Weeks 1-2 */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-cyan-400">
                Phase 1 (Weeks 1 – 2)
              </span>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </div>
            <h4 className="font-heading text-sm font-bold text-white">
              Pattern Mastery & Baseline Calibration
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {progressionPlan.week1to2Focus}
            </p>
          </div>

          {/* Phase 2: Weeks 3-4 */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400">
                Phase 2 (Weeks 3 – 4)
              </span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <h4 className="font-heading text-sm font-bold text-white">
              Overload & Mechanical Tension
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {progressionPlan.week3to4Focus}
            </p>
          </div>

          {/* Phase 3: Deload */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-400">
                Deload Protocol
              </span>
              <AlertCircle className="w-4 h-4 text-amber-400" />
            </div>
            <h4 className="font-heading text-sm font-bold text-white">
              Systemic Reset & Supercompensation
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {progressionPlan.deloadGuidance}
            </p>
          </div>
        </div>
      </div>

      {/* RECOVERY & INJURY PREVENTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sleep & Circadian Protocol */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2">
            <Moon className="w-5 h-5 text-indigo-400" />
            <h3 className="font-heading text-lg font-bold text-white">
              Sleep & Cellular Restoration
            </h3>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400">Nightly Sleep Window</span>
              <span className="text-sm font-extrabold text-indigo-400">
                {recoveryProtocol.sleepTargetHours}
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {recoveryProtocol.activeRecoveryNotes}
            </p>
          </div>
        </div>

        {/* Joint Health & Injury Prevention */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-400" />
            <h3 className="font-heading text-lg font-bold text-white">
              Injury Prevention & Joint Care
            </h3>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Personalized Safeguards
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {recoveryProtocol.injuryPreventionNotes}
            </p>
          </div>
        </div>
      </div>

      {/* COACH'S INSPIRATIONAL MANTRA */}
      <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 border border-emerald-500/20 text-center relative overflow-hidden">
        <Quote className="w-10 h-10 text-emerald-500/20 mx-auto mb-3" />
        <p className="font-heading text-lg sm:text-xl font-bold text-white max-w-2xl mx-auto italic">
          "{coachQuote}"
        </p>
        <span className="inline-block mt-3 text-xs font-bold uppercase tracking-widest text-emerald-400">
          — FitBuddy AI Coach
        </span>
      </div>
    </div>
  );
};
