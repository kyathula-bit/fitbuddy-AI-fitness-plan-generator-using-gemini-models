import React from 'react';
import { Dumbbell, Sparkles, Bookmark, RotateCcw, Zap, SlidersHorizontal } from 'lucide-react';

interface NavbarProps {
  onNewPlan: () => void;
  onOpenSavedPlans: () => void;
  savedPlansCount: number;
  unitSystem: 'metric' | 'imperial';
  onToggleUnitSystem: () => void;
  onOpenPresets: () => void;
  hasActivePlan: boolean;
  onViewActivePlan: () => void;
  activeView: 'create' | 'plan' | 'workout';
  onViewChange: (view: 'create' | 'plan' | 'workout') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewPlan,
  onOpenSavedPlans,
  savedPlansCount,
  unitSystem,
  onToggleUnitSystem,
  onOpenPresets,
  hasActivePlan,
  activeView,
  onViewChange,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div 
          onClick={() => onViewChange(hasActivePlan ? 'plan' : 'create')}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-[1px] shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/35 transition-all">
            <div className="w-full h-full bg-slate-950 rounded-[11px] flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-emerald-400 transform -rotate-12 group-hover:rotate-0 transition-transform duration-300" />
            </div>
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-slate-950 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-heading font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                FitBuddy
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-2.5 h-2.5" />
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block truncate max-w-sm">
              AI-Powered Personalized Fitness Plan Generator
            </p>
          </div>
        </div>

        {/* View Switcher if Plan Exists */}
        {hasActivePlan && (
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-medium">
            <button
              onClick={() => onViewChange('plan')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                activeView === 'plan'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Plan Overview
            </button>
            <button
              onClick={() => onViewChange('workout')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                activeView === 'workout'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Live Workout
            </button>
            <button
              onClick={() => onViewChange('create')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                activeView === 'create'
                  ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Profile / Edit
            </button>
          </nav>
        )}

        {/* Right Tools & Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Unit Toggle */}
          <button
            onClick={onToggleUnitSystem}
            title={`Switch to ${unitSystem === 'metric' ? 'Imperial (lbs, ft)' : 'Metric (kg, cm)'}`}
            className="px-2.5 py-1.5 rounded-lg border border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3 h-3 text-slate-400" />
            <span className="hidden sm:inline">Units:</span>
            <span className="font-semibold text-emerald-400 uppercase">{unitSystem}</span>
          </button>

          {/* Quick Presets */}
          <button
            onClick={onOpenPresets}
            className="px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800/80 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="Browse pre-configured workout splits"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Presets</span>
          </button>

          {/* Saved Plans */}
          <button
            onClick={onOpenSavedPlans}
            className="relative px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-900 hover:bg-slate-800 text-xs font-medium text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
            title="Saved fitness plans"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Saved</span>
            {savedPlansCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center border border-emerald-500/30">
                {savedPlansCount}
              </span>
            )}
          </button>

          {/* New Plan Button */}
          <button
            onClick={onNewPlan}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-semibold text-xs tracking-wide shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Plan</span>
            <span className="sm:hidden">New</span>
          </button>
        </div>
      </div>
    </header>
  );
};
