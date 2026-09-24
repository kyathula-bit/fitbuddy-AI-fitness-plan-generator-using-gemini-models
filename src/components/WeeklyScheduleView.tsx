import React, { useState } from 'react';
import { DayWorkoutPlan, ExerciseItem } from '../types/fitness';
import {
  Dumbbell,
  Clock,
  Sparkles,
  Flame,
  Activity,
  Zap,
  Info,
  CheckCircle2,
  Coffee,
  Heart,
  ChevronRight,
  Shield,
  HelpCircle,
} from 'lucide-react';

interface WeeklyScheduleViewProps {
  schedule: DayWorkoutPlan[];
  onSelectExerciseForGuide: (exercise: ExerciseItem) => void;
  onStartActiveWorkout: (dayIndex: number) => void;
  onOpenFeedbackModal?: () => void;
}

export const WeeklyScheduleView: React.FC<WeeklyScheduleViewProps> = ({
  schedule,
  onSelectExerciseForGuide,
  onStartActiveWorkout,
  onOpenFeedbackModal,
}) => {

  const [activeDayIndex, setActiveDayIndex] = useState(0);

  const currentDay = schedule[activeDayIndex] || schedule[0];

  return (
    <div className="space-y-6">
      {/* Day Selector Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {schedule.map((day, idx) => {
          const isSelected = activeDayIndex === idx;
          return (
            <button
              key={day.dayNumber}
              onClick={() => setActiveDayIndex(idx)}
              className={`flex-shrink-0 px-4 py-3 rounded-2xl border text-left transition-all min-w-[130px] ${
                isSelected
                  ? 'bg-emerald-950/60 border-emerald-500 shadow-lg shadow-emerald-500/10 text-white'
                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[11px] font-bold uppercase tracking-wider">
                  Day {day.dayNumber}
                </span>
                {day.isRestDay ? (
                  <Coffee className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Dumbbell className="w-3.5 h-3.5 text-emerald-400" />
                )}
              </div>
              <div className="text-xs font-bold text-white truncate max-w-[110px]">
                {day.isRestDay ? 'Rest / Recovery' : day.focus}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">
                {day.isRestDay ? 'Active Rest' : `${day.exercises.length} Exercises • ${day.estimatedDurationMinutes}m`}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Main Card */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm space-y-8">
        {/* Day Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Day {currentDay.dayNumber} Routine
              </span>
              <span className="text-xs text-slate-400">
                {currentDay.isRestDay ? 'Recovery & Mobility' : `${currentDay.estimatedDurationMinutes} Minutes Session`}
              </span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-white">
              {currentDay.dayName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Focus: <span className="text-emerald-400 font-semibold">{currentDay.focus}</span>
            </p>
          </div>

          {!currentDay.isRestDay && (
            <button
              onClick={() => onStartActiveWorkout(activeDayIndex)}
              className="px-5 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-extrabold text-xs tracking-wider uppercase shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-95"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>Launch Live Workout Tracker</span>
            </button>
          )}
        </div>

        {/* REST DAY DISPLAY */}
        {currentDay.isRestDay ? (
          <div className="py-12 px-6 rounded-2xl bg-slate-950/60 border border-slate-800 text-center max-w-xl mx-auto space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Coffee className="w-7 h-7" />
            </div>
            <h3 className="font-heading text-xl font-bold text-white">
              Strategic Rest & Muscular Supercompensation
            </h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              {currentDay.restDayActivity ||
                'Muscle fibers repair and grow during rest periods. Focus on hydration, hitting your daily protein target, and gentle movement like a 30-minute nature walk or light foam rolling.'}
            </p>
            <div className="pt-2 flex flex-wrap justify-center gap-3 text-xs text-slate-300">
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                🚶‍♂️ 7,000–10,000 Steps Easy Walk
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                🧘‍♀️ 15 Min Full Body Mobility
              </span>
              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800">
                💧 High Hydration Day
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* WARM-UP SECTION */}
            {currentDay.warmup && currentDay.warmup.items.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Dynamic Warm-Up ({currentDay.warmup.durationMinutes} Minutes)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">Joint lubrication & core activation</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentDay.warmup.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-semibold">
                          {item.durationOrReps}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{item.instructions}</div>
                      <div className="text-[10px] text-slate-500">Target: {item.targetArea}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MAIN EXERCISES LIST */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Dumbbell className="w-4 h-4 text-emerald-400" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Primary Resistance Exercises ({currentDay.exercises.length} Movements)
                  </h3>
                </div>
                <span className="text-[11px] text-slate-500">Strict form & progressive overload</span>
              </div>

              <div className="space-y-3.5">
                {currentDay.exercises.map((ex, idx) => (
                  <div
                    key={ex.id || idx}
                    className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/90 hover:border-slate-700 transition-all space-y-4 group"
                  >
                    {/* Top Row: Exercise Name + Badges */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-xl bg-emerald-500/10 text-emerald-400 font-extrabold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                          {idx + 1}
                        </span>
                        <div>
                          <h4 className="font-heading text-base sm:text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                            {ex.name}
                          </h4>
                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            {ex.targetMuscles.map((muscle) => (
                              <span
                                key={muscle}
                                className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-medium"
                              >
                                {muscle}
                              </span>
                            ))}
                            <span className="px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400 text-[10px]">
                              {ex.equipmentRequired}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action / Guide Button */}
                      <button
                        onClick={() => onSelectExerciseForGuide(ex)}
                        className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-emerald-500/10 border border-slate-800 hover:border-emerald-500/40 text-xs font-medium text-slate-300 hover:text-emerald-400 transition-all flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Form Guide & Bio</span>
                      </button>
                    </div>

                    {/* Middle Row: Prescription Matrix */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 text-center">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                          Working Sets
                        </span>
                        <span className="font-heading text-sm font-extrabold text-white">
                          {ex.sets} Sets
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                          Rep Range
                        </span>
                        <span className="font-heading text-sm font-extrabold text-emerald-400">
                          {ex.reps}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                          Rest Between Sets
                        </span>
                        <span className="font-heading text-sm font-extrabold text-amber-400">
                          {ex.restSeconds}s
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block font-semibold">
                          Tempo
                        </span>
                        <span className="font-heading text-sm font-extrabold text-cyan-400">
                          {ex.tempo || 'Controlled'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Row: Form Cues & Substitution */}
                    <div className="space-y-2 pt-1">
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-300">
                        {ex.formCues.map((cue, cIdx) => (
                          <span key={cIdx} className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            <span>{cue}</span>
                          </span>
                        ))}
                      </div>

                      {ex.substitutionAlternative && (
                        <div className="text-[11px] text-slate-400 flex items-center gap-1.5 bg-slate-900/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
                          <span className="text-slate-500 font-semibold">Alternative Option:</span>
                          <span className="text-slate-300">{ex.substitutionAlternative}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* COOL-DOWN & MOBILITY */}
            {currentDay.cooldown && currentDay.cooldown.items.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Heart className="w-4 h-4 text-rose-400" />
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Cool-Down & Parasympathetic Reset ({currentDay.cooldown.durationMinutes} Minutes)
                    </h3>
                  </div>
                  <span className="text-[11px] text-slate-500">Lower cortisol & stretch fascial tissue</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {currentDay.cooldown.items.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-300 font-semibold">
                          {item.durationOrReps}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">{item.instructions}</div>
                      <div className="text-[10px] text-slate-500">Target Area: {item.targetArea}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Feedback & Regeneration Callout */}
            {onOpenFeedbackModal && (
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3 text-left">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Need adjustments to this routine?</h4>
                    <p className="text-[11px] text-slate-400">
                      Swap exercises, alter intensity, adjust session length, or tailor around injuries with Gemini AI.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onOpenFeedbackModal}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 hover:border-emerald-500/50 border border-slate-700 text-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-all shrink-0 active:scale-95 shadow-sm"
                >
                  <span>Submit Feedback & Regenerate</span>
                  <ChevronRight className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>

  );
};
