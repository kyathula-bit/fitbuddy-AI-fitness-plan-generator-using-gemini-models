import React, { useState } from 'react';
import { GeneratedFitnessPlan } from '../types/fitness';
import { exportPlanToMarkdown } from '../utils/fitnessCalculations';
import {
  Sparkles,
  Flame,
  Droplets,
  Bookmark,
  Share2,
  Printer,
  Copy,
  Check,
  Zap,
  Dumbbell,
  Shield,
  Layers,
  ChevronDown,
  ChevronUp,
  User,
  Gauge,
  RefreshCw,
  MessageSquare,
} from 'lucide-react';

interface PlanOverviewHeaderProps {
  plan: GeneratedFitnessPlan;
  onSavePlan: () => void;
  isSaved: boolean;
  onStartActiveWorkout: (dayIndex: number) => void;
  onOpenFeedbackModal?: () => void;
}

export const PlanOverviewHeader: React.FC<PlanOverviewHeaderProps> = ({
  plan,
  onSavePlan,
  isSaved,
  onStartActiveWorkout,
  onOpenFeedbackModal,
}) => {

  const [copied, setCopied] = useState(false);
  const [showSummaryExpanded, setShowSummaryExpanded] = useState(false);

  const { metricsAnalysis, weeklyOverview, nutritionGuidance } = plan;
  const { macroSplit } = metricsAnalysis;

  // Calculate macro percentages
  const proteinCals = macroSplit.proteinGrams * 4;
  const carbsCals = macroSplit.carbsGrams * 4;
  const fatsCals = macroSplit.fatsGrams * 9;
  const totalCals = proteinCals + carbsCals + fatsCals || 2000;

  const proteinPct = Math.round((proteinCals / totalCals) * 100);
  const carbsPct = Math.round((carbsCals / totalCals) * 100);
  const fatsPct = Math.round((fatsCals / totalCals) * 100);

  const handleCopy = () => {
    const text = exportPlanToMarkdown(plan);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Find first non-rest day to suggest starting
  const firstWorkoutDayIndex = plan.schedule.findIndex((d) => !d.isRestDay);

  return (
    <div className="bg-slate-900/80 border-b border-slate-800 backdrop-blur-md pt-8 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {plan.userProfile.name && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
                <User className="w-3.5 h-3.5 text-indigo-400" />
                Athlete: {plan.userProfile.name}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5" />
              Generated with Gemini 3.8 Flash
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700 text-xs font-semibold">
              <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              Intensity:{' '}
              <span className="capitalize text-white font-bold">
                {plan.userProfile.workoutIntensity === 'moderate'
                  ? 'medium'
                  : plan.userProfile.workoutIntensity === 'extreme'
                  ? 'high'
                  : plan.userProfile.workoutIntensity || 'medium'}
              </span>
            </span>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 text-xs font-semibold capitalize">
              Goal: {plan.userProfile.fitnessGoal ? plan.userProfile.fitnessGoal.replace('_', ' ') : 'General Fitness'}
            </span>
            <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold">
              {weeklyOverview.splitName}
            </span>

            <span className="px-3 py-1 rounded-full bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 text-xs font-semibold">
              {plan.userProfile.availableWorkoutDays} Days / Week
            </span>
            <span className="px-3 py-1 rounded-full bg-amber-950/60 text-amber-300 border border-amber-800/60 text-xs font-semibold capitalize">
              {plan.userProfile.availableEquipment.replace('_', ' ')}
            </span>
          </div>


          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            {onOpenFeedbackModal && (
              <button
                onClick={onOpenFeedbackModal}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500/15 to-teal-500/15 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-500/25 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm active:scale-95"
                title="Submit feedback and regenerate workout plan with Gemini AI"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Feedback & Regenerate</span>
              </button>
            )}

            <button
              onClick={onSavePlan}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-all ${
                isSaved
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                  : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-amber-400 text-amber-400' : ''}`} />
              <span>{isSaved ? 'Saved to My Plans' : 'Save Plan'}</span>
            </button>

            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Copy plan formatted as Markdown"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 transition-colors"
              title="Print or Save as PDF"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / PDF</span>
            </button>

            {firstWorkoutDayIndex !== -1 && (
              <button
                onClick={() => onStartActiveWorkout(firstWorkoutDayIndex)}
                className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wide shadow-md shadow-emerald-500/20 flex items-center gap-1.5 transition-all transform active:scale-95"
              >
                <Zap className="w-3.5 h-3.5 fill-slate-950" />
                <span>Start Workout</span>
              </button>
            )}
          </div>
        </div>

        {/* Feedback Applied Banner If Present */}
        {plan.latestFeedbackApplied && (
          <div className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-start justify-between gap-3 text-xs text-emerald-200 shadow-inner">
            <div className="flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-emerald-300">Regenerated with your feedback: </span>
                <span className="italic text-slate-300">"{plan.latestFeedbackApplied}"</span>
              </div>
            </div>
            {onOpenFeedbackModal && (
              <button
                onClick={onOpenFeedbackModal}
                className="text-emerald-400 hover:text-emerald-300 hover:underline text-[11px] font-semibold shrink-0"
              >
                Refine Again
              </button>
            )}
          </div>
        )}

        {/* Title & Tagline */}

        <div>
          <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
            {plan.planTitle}
          </h1>
          <p className="mt-1 text-emerald-400 text-sm sm:text-base font-medium">
            {plan.tagline}
          </p>
        </div>

        {/* Executive Summary Collapse */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                FitBuddy AI Executive Strategy
              </span>
              <p
                className={`text-xs sm:text-sm text-slate-300 leading-relaxed ${
                  !showSummaryExpanded ? 'line-clamp-2' : ''
                }`}
              >
                {plan.executiveSummary}
              </p>
            </div>
            <button
              onClick={() => setShowSummaryExpanded(!showSummaryExpanded)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
            >
              {showSummaryExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Physiological Targets & Macros Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Daily Calorie Target */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 relative overflow-hidden group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400">Daily Target</span>
              <Flame className="w-4 h-4 text-amber-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
                {metricsAnalysis.recommendedDailyCalories}
              </span>
              <span className="text-xs font-medium text-slate-400">kcal/day</span>
            </div>
            <div className="mt-1 text-[11px] text-amber-400 font-medium capitalize">
              {metricsAnalysis.calorieGoalType === 'deficit' && '🔥 Fat Loss Deficit (~500 kcal)'}
              {metricsAnalysis.calorieGoalType === 'surplus' && '⚡ Hypertrophy Clean Surplus (~300 kcal)'}
              {metricsAnalysis.calorieGoalType === 'maintenance' && '⚖️ Maintenance / Recomposition'}
            </div>
          </div>

          {/* Macronutrient Distribution */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400">Target Macros</span>
              <Layers className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-xs text-slate-300 font-bold flex items-center justify-between">
              <span className="text-emerald-400">{macroSplit.proteinGrams}g Protein</span>
              <span className="text-amber-400">{macroSplit.carbsGrams}g Carbs</span>
              <span className="text-rose-400">{macroSplit.fatsGrams}g Fats</span>
            </div>
            {/* Visual ratio bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 flex overflow-hidden mt-2 gap-0.5">
              <div
                style={{ width: `${proteinPct}%` }}
                className="bg-emerald-400 h-full rounded-l-full"
                title={`Protein: ${proteinPct}%`}
              />
              <div
                style={{ width: `${carbsPct}%` }}
                className="bg-amber-400 h-full"
                title={`Carbs: ${carbsPct}%`}
              />
              <div
                style={{ width: `${fatsPct}%` }}
                className="bg-rose-400 h-full rounded-r-full"
                title={`Fats: ${fatsPct}%`}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[10px] text-slate-400">
              <span>{proteinPct}% Prot</span>
              <span>{carbsPct}% Carb</span>
              <span>{fatsPct}% Fat</span>
            </div>
          </div>

          {/* BMI & TDEE Baselines */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400">Metabolic Baselines</span>
              <Shield className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-[11px] text-slate-500 block">BMI ({metricsAnalysis.bmiCategory})</span>
                <span className="font-heading text-lg font-bold text-white">{metricsAnalysis.bmi}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Est. TDEE</span>
                <span className="font-heading text-lg font-bold text-white">{metricsAnalysis.estimatedTdee} <span className="text-[10px] font-normal text-slate-400">kcal</span></span>
              </div>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 truncate">
              BMR Baseline: {metricsAnalysis.estimatedBmr} kcal
            </div>
          </div>

          {/* Daily Hydration & Coaching Quote */}
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-semibold text-slate-400">Daily Hydration</span>
              <Droplets className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="font-heading text-2xl sm:text-3xl font-extrabold text-cyan-400">
                {nutritionGuidance.dailyWaterLiters}
              </span>
              <span className="text-xs font-medium text-slate-400">Liters / day</span>
            </div>
            <div className="mt-1 text-[11px] text-slate-400 italic line-clamp-1" title={plan.coachQuote}>
              "{plan.coachQuote}"
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
