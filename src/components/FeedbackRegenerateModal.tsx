import React, { useState } from 'react';
import {
  GeneratedFitnessPlan,
  UserFitnessProfile,
  WorkoutIntensity,
  AvailableEquipment,
} from '../types/fitness';
import {
  RefreshCw,
  Sparkles,
  X,
  MessageSquare,
  Flame,
  Dumbbell,
  Clock,
  Gauge,
  Sliders,
  CheckCircle2,
  AlertCircle,
  History,
  ArrowRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface FeedbackRegenerateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: GeneratedFitnessPlan | null;
  onRegenerate: (
    feedback: string,
    adjustedProfile?: Partial<UserFitnessProfile>
  ) => Promise<void>;
  isLoading: boolean;
}

export const FeedbackRegenerateModal: React.FC<FeedbackRegenerateModalProps> = ({
  isOpen,
  onClose,
  currentPlan,
  onRegenerate,
  isLoading,
}) => {
  if (!isOpen || !currentPlan) return null;

  const [feedbackText, setFeedbackText] = useState('');
  const [showAdvancedTweaks, setShowAdvancedTweaks] = useState(false);
  const normalizedIntensity: WorkoutIntensity =
    currentPlan.userProfile.workoutIntensity === 'moderate'
      ? 'medium'
      : currentPlan.userProfile.workoutIntensity === 'extreme'
      ? 'high'
      : currentPlan.userProfile.workoutIntensity || 'medium';

  const [adjustedIntensity, setAdjustedIntensity] = useState<WorkoutIntensity>(normalizedIntensity);
  const [adjustedDuration, setAdjustedDuration] = useState<number>(
    currentPlan.userProfile.workoutDurationMinutes || 45
  );

  const [adjustedDays, setAdjustedDays] = useState<number>(
    currentPlan.userProfile.availableWorkoutDays || 4
  );
  const [adjustedEquipment, setAdjustedEquipment] = useState<AvailableEquipment>(
    currentPlan.userProfile.availableEquipment || 'dumbbells_only'
  );

  const quickFeedbackChips = [
    { label: '🦵 Less knee stress & joint-friendly', text: 'Please replace high-impact or deep knee-bending movements with knee-friendly, low-impact alternatives.' },
    { label: '⏱️ Shorter sessions (30 mins)', text: 'Workouts take too long. Please condense sessions to 30 minutes with high-density supersets and shorter rests.' },
    { label: '💪 More upper body & arms', text: 'I want greater emphasis on arms (biceps/triceps), shoulders, and chest development.' },
    { label: '🔥 More cardio & fat burn', text: 'Incorporate more metabolic conditioning, heart-rate intervals, and active calorie burn.' },
    { label: '⚡ Increase difficulty & volume', text: 'The exercises feel too easy. Please ramp up the volume, challenge, and intensity level.' },
    { label: '🧘 Lower intensity & more mobility', text: 'I feel overly fatigued. Please reduce systemic fatigue, scale down RPE, and add more dynamic mobility and stretching.' },
    { label: '🏋️‍♂️ More core & abdominal focus', text: 'Add targeted core, oblique, and abdominal stability finishers to the end of each session.' },
    { label: '🏠 Zero equipment / strictly bodyweight', text: 'I do not have access to any weights. Please adjust all exercises to 100% bodyweight calisthenics.' },
  ];

  const handleChipClick = (chipText: string) => {
    if (!feedbackText.trim()) {
      setFeedbackText(chipText);
    } else if (!feedbackText.includes(chipText)) {
      setFeedbackText(`${feedbackText.trim()}\n• ${chipText}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() && !showAdvancedTweaks) return;

    const adjustedProfile: Partial<UserFitnessProfile> = {
      workoutIntensity: adjustedIntensity,
      workoutDurationMinutes: adjustedDuration,
      availableWorkoutDays: adjustedDays,
      availableEquipment: adjustedEquipment,
    };

    const finalFeedback = feedbackText.trim() || 'Regenerate plan with updated profile parameters.';
    await onRegenerate(finalFeedback, adjustedProfile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
        {/* Header Accent Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shadow-inner">
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Submit Feedback & Regenerate
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Gemini AI
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Share what’s working or what needs adjusting to rebuild your plan
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Plan Mini Card */}
        <div className="px-6 py-3.5 bg-slate-950/50 border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Current Plan:</span>
            <span className="font-semibold text-white">{currentPlan.planTitle}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-400">
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
              {currentPlan.userProfile.availableWorkoutDays}d/wk
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[11px]">
              {currentPlan.userProfile.workoutDurationMinutes || 45}m
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-emerald-400 capitalize font-mono text-[11px]">
              {currentPlan.userProfile.workoutIntensity === 'moderate'
                ? 'medium'
                : currentPlan.userProfile.workoutIntensity === 'extreme'
                ? 'high'
                : currentPlan.userProfile.workoutIntensity || 'medium'}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick 1-Tap Feedback Suggestions */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Quick Feedback Suggestions (Tap to add)
              </span>
              <span className="text-[11px] text-slate-500">Tap one or more</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {quickFeedbackChips.map((chip, idx) => (
                <button
                  type="button"
                  key={idx}
                  onClick={() => handleChipClick(chip.text)}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-800/80 hover:border-slate-700 text-slate-300 text-xs transition-all text-left flex items-center gap-1.5 active:scale-95 disabled:opacity-50"
                >
                  <span>{chip.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Feedback Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>Your Specific Feedback & Adjustment Requests</span>
              <span className="text-rose-400">*</span>
            </label>
            <textarea
              rows={4}
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              placeholder="e.g., 'Workouts feel too exhausting on Day 3. Can we reduce sets from 4 to 3, swap out jump squats for reverse lunges, and add 5 minutes of core work at the end?'"
              disabled={isLoading}
              required
              className="w-full px-4 py-3 rounded-2xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600 resize-none transition-colors"
            />
            <p className="mt-1.5 text-[11px] text-slate-500">
              Be as specific as you like—FitBuddy’s Gemini engine recalibrates volume, joint angles, rest intervals, and exercise selection to fit your feedback.
            </p>
          </div>

          {/* Collapsible Advanced Profile Adjustments */}
          <div className="border border-slate-800/80 rounded-2xl overflow-hidden bg-slate-950/30">
            <button
              type="button"
              onClick={() => setShowAdvancedTweaks(!showAdvancedTweaks)}
              className="w-full px-4 py-3 text-left flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/40 transition-colors"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                Optional: Tweak Profile Parameters (Intensity, Equipment, Time)
              </span>
              <span className="text-[11px] text-emerald-400 font-mono">
                {showAdvancedTweaks ? 'Hide Options ▲' : 'Show Options ▼'}
              </span>
            </button>

            {showAdvancedTweaks && (
              <div className="p-4 pt-2 border-t border-slate-800/60 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Workout Intensity */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                    <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                    Target Intensity
                  </label>
                  <select
                    value={
                      adjustedIntensity === 'moderate'
                        ? 'medium'
                        : adjustedIntensity === 'extreme'
                        ? 'high'
                        : adjustedIntensity || 'medium'
                    }
                    onChange={(e) => setAdjustedIntensity(e.target.value as WorkoutIntensity)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="low">Low (RPE 5–6, Gentle & Sustainable)</option>
                    <option value="medium">Medium (RPE 7–8, Balanced & Progressive)</option>
                    <option value="high">High (RPE 8.5–9+, Heavy Drive & Power)</option>
                  </select>
                </div>


                {/* Session Duration */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Session Duration
                  </label>
                  <select
                    value={adjustedDuration}
                    onChange={(e) => setAdjustedDuration(parseInt(e.target.value))}
                    disabled={isLoading}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value={20}>20 Minutes (Express)</option>
                    <option value={30}>30 Minutes (Concise)</option>
                    <option value={45}>45 Minutes (Standard)</option>
                    <option value={60}>60 Minutes (Comprehensive)</option>
                    <option value={75}>75 Minutes (Extended)</option>
                  </select>
                </div>

                {/* Days per week */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    Days Per Week
                  </label>
                  <select
                    value={adjustedDays}
                    onChange={(e) => setAdjustedDays(parseInt(e.target.value))}
                    disabled={isLoading}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value={2}>2 Days / Week</option>
                    <option value={3}>3 Days / Week</option>
                    <option value={4}>4 Days / Week</option>
                    <option value={5}>5 Days / Week</option>
                    <option value={6}>6 Days / Week</option>
                  </select>
                </div>

                {/* Equipment */}
                <div>
                  <label className="block text-slate-400 font-medium mb-1.5 flex items-center gap-1">
                    <Dumbbell className="w-3.5 h-3.5 text-indigo-400" />
                    Equipment Available
                  </label>
                  <select
                    value={adjustedEquipment}
                    onChange={(e) => setAdjustedEquipment(e.target.value as AvailableEquipment)}
                    disabled={isLoading}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-emerald-500"
                  >
                    <option value="bodyweight_only">Bodyweight Only</option>
                    <option value="dumbbells_only">Dumbbells Only</option>
                    <option value="resistance_bands">Resistance Bands</option>
                    <option value="home_gym">Home Gym Setup</option>
                    <option value="commercial_gym">Commercial Gym</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Past Feedback History If Present */}
          {currentPlan.feedbackHistory && currentPlan.feedbackHistory.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-slate-800/60 text-xs">
              <div className="flex items-center gap-1.5 text-slate-400 font-semibold mb-2">
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Previously Applied Feedback</span>
              </div>
              <div className="space-y-1.5 max-h-24 overflow-y-auto pr-1">
                {currentPlan.feedbackHistory.map((item, idx) => (
                  <div
                    key={idx}
                    className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800/80 text-[11px] text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="flex-1 italic">"{item.feedback}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Modal Footer / Submit */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-xs font-semibold transition-colors disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading || (!feedbackText.trim() && !showAdvancedTweaks)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Regenerating with Gemini...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Regenerate Workout Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
