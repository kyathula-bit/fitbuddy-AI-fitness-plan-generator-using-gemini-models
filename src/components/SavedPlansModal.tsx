import React from 'react';
import { GeneratedFitnessPlan } from '../types/fitness';
import {
  Bookmark,
  X,
  Trash2,
  Calendar,
  Dumbbell,
  ArrowRight,
  ExternalLink,
  Flame,
} from 'lucide-react';

interface SavedPlansModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedPlans: GeneratedFitnessPlan[];
  activePlanId?: string;
  onSelectPlan: (plan: GeneratedFitnessPlan) => void;
  onDeletePlan: (planId: string) => void;
}

export const SavedPlansModal: React.FC<SavedPlansModalProps> = ({
  isOpen,
  onClose,
  savedPlans,
  activePlanId,
  onSelectPlan,
  onDeletePlan,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-heading text-xl font-bold text-white">Saved Fitness Plans</h2>
              <p className="text-xs text-slate-400">
                {savedPlans.length} {savedPlans.length === 1 ? 'plan' : 'plans'} saved in your browser
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of plans */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {savedPlans.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <Dumbbell className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No saved plans yet</p>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Generate a custom plan and click the "Save Plan" button to store it here for offline access.
              </p>
            </div>
          ) : (
            savedPlans.map((plan) => {
              const isActive = plan.id === activePlanId;
              return (
                <div
                  key={plan.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isActive
                      ? 'bg-emerald-950/30 border-emerald-500/80 shadow-md'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-base font-bold text-white">
                          {plan.planTitle}
                        </h3>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-emerald-400 font-medium">{plan.tagline}</p>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeletePlan(plan.id);
                      }}
                      className="p-2 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors"
                      title="Delete plan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    {plan.userProfile?.fitnessGoal && (
                      <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[11px] font-semibold text-emerald-400 capitalize">
                        {plan.userProfile.fitnessGoal.replace('_', ' ')}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                      {plan.weeklyOverview.splitName}
                    </span>
                    <span className="flex items-center gap-1">
                      <Flame className="w-3.5 h-3.5 text-amber-400" />
                      {plan.metricsAnalysis.recommendedDailyCalories} kcal
                    </span>
                    <span className="text-[11px] text-slate-500 ml-auto">
                      {new Date(plan.createdAt).toLocaleDateString()}
                    </span>
                  </div>


                  <div className="pt-3 flex justify-end">
                    <button
                      onClick={() => {
                        onSelectPlan(plan);
                        onClose();
                      }}
                      className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500 hover:text-slate-950 text-xs font-bold text-slate-200 transition-all flex items-center gap-1.5"
                    >
                      <span>{isActive ? 'Continue Current Plan' : 'Load This Plan'}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
