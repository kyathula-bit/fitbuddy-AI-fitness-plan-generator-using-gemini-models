import React, { useState, useEffect, useRef } from 'react';
import { DayWorkoutPlan, ExerciseItem } from '../types/fitness';
import { playChime } from '../utils/fitnessCalculations';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Clock,
  Sparkles,
  Trophy,
  Dumbbell,
  ArrowRight,
  Volume2,
  X,
  Zap,
} from 'lucide-react';

interface ActiveWorkoutSessionProps {
  dayPlan: DayWorkoutPlan;
  onFinishWorkout: () => void;
  onSelectExerciseGuide: (exercise: ExerciseItem) => void;
  onClose: () => void;
}

export const ActiveWorkoutSession: React.FC<ActiveWorkoutSessionProps> = ({
  dayPlan,
  onFinishWorkout,
  onSelectExerciseGuide,
  onClose,
}) => {
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0);
  const [completedSets, setCompletedSets] = useState<Record<number, number[]>>({}); // exerciseIdx -> array of completed set numbers [1, 2]
  const [workoutElapsedSeconds, setWorkoutElapsedSeconds] = useState(0);
  const [isWorkoutPaused, setIsWorkoutPaused] = useState(false);

  // Rest Timer state
  const [restSecondsRemaining, setRestSecondsRemaining] = useState<number | null>(null);
  const [initialRestDuration, setInitialRestDuration] = useState(60);
  const [isRestTimerActive, setIsRestTimerActive] = useState(false);
  const [isFinishedModalOpen, setIsFinishedModalOpen] = useState(false);

  const currentExercise = dayPlan.exercises[currentExerciseIdx] || dayPlan.exercises[0];

  // Workout stopwatch timer
  useEffect(() => {
    if (isWorkoutPaused || isFinishedModalOpen) return;
    const interval = setInterval(() => {
      setWorkoutElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isWorkoutPaused, isFinishedModalOpen]);

  // Rest countdown timer
  useEffect(() => {
    if (!isRestTimerActive || restSecondsRemaining === null) return;

    if (restSecondsRemaining <= 0) {
      setIsRestTimerActive(false);
      setRestSecondsRemaining(null);
      playChime(659.25, 0.4); // pleasant high chime
      return;
    }

    const timer = setInterval(() => {
      setRestSecondsRemaining((prev) => (prev !== null ? prev - 1 : null));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRestTimerActive, restSecondsRemaining]);

  const startRestTimer = (seconds: number) => {
    setInitialRestDuration(seconds);
    setRestSecondsRemaining(seconds);
    setIsRestTimerActive(true);
  };

  const handleToggleSet = (setNumber: number) => {
    const existing = completedSets[currentExerciseIdx] || [];
    const isCompleted = existing.includes(setNumber);
    let updated: number[];
    if (isCompleted) {
      updated = existing.filter((s) => s !== setNumber);
    } else {
      updated = [...existing, setNumber];
      // Automatically trigger rest timer if not the last set of the last exercise
      const rest = currentExercise.restSeconds || 60;
      startRestTimer(rest);
    }
    setCompletedSets((prev) => ({
      ...prev,
      [currentExerciseIdx]: updated,
    }));
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Check overall completion
  const totalExercises = dayPlan.exercises.length;
  const completedExercisesCount = dayPlan.exercises.filter((_, idx) => {
    const setsDone = completedSets[idx]?.length || 0;
    return setsDone >= dayPlan.exercises[idx].sets;
  }).length;
  const progressPct = Math.round((completedExercisesCount / totalExercises) * 100);

  const handleFinish = () => {
    setIsFinishedModalOpen(true);
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between p-4 rounded-2xl bg-slate-900 border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Exit workout tracker"
          >
            <X className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
                Live Workout Mode
              </span>
            </div>
            <h2 className="font-heading text-lg font-bold text-white truncate max-w-xs sm:max-w-md">
              {dayPlan.dayName}
            </h2>
          </div>
        </div>

        {/* Stopwatch & Finish Button */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-xs font-mono font-bold text-white">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>{formatTime(workoutElapsedSeconds)}</span>
          </div>

          <button
            onClick={handleFinish}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-bold tracking-wide transition-all shadow-md shadow-emerald-500/20"
          >
            Complete Session
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs font-semibold text-slate-400">
          <span>
            Exercise {currentExerciseIdx + 1} of {totalExercises}
          </span>
          <span className="text-emerald-400">{progressPct}% Completed</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
          <div
            style={{ width: `${progressPct}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300 rounded-full"
          />
        </div>
      </div>

      {/* MAIN EXERCISE ACTIVE CARD */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 backdrop-blur-md space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase">
                Active Movement #{currentExerciseIdx + 1}
              </span>
              <span className="text-xs text-slate-400">
                Equipment: {currentExercise.equipmentRequired}
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-white">
              {currentExercise.name}
            </h1>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {currentExercise.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium"
                >
                  {muscle}
                </span>
              ))}
            </div>
          </div>

          <button
            onClick={() => onSelectExerciseGuide(currentExercise)}
            className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white flex items-center gap-2 border border-slate-700 transition-colors"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Form Guide & Bio</span>
          </button>
        </div>

        {/* Prescription Details */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
          <div>
            <span className="text-[11px] text-slate-500 block uppercase font-bold">Target Reps</span>
            <span className="font-heading text-lg sm:text-xl font-extrabold text-emerald-400">
              {currentExercise.reps}
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block uppercase font-bold">Planned Rest</span>
            <span className="font-heading text-lg sm:text-xl font-extrabold text-amber-400">
              {currentExercise.restSeconds}s
            </span>
          </div>
          <div>
            <span className="text-[11px] text-slate-500 block uppercase font-bold">Tempo</span>
            <span className="font-heading text-lg sm:text-xl font-extrabold text-cyan-400">
              {currentExercise.tempo || '2-0-1-0'}
            </span>
          </div>
        </div>

        {/* Interactive Set Tracker */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Tap Set to Check Off & Trigger Rest Timer
            </span>
            <span className="text-xs text-slate-400">
              {(completedSets[currentExerciseIdx] || []).length} / {currentExercise.sets} sets done
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {Array.from({ length: currentExercise.sets }).map((_, i) => {
              const setNum = i + 1;
              const isDone = (completedSets[currentExerciseIdx] || []).includes(setNum);
              return (
                <button
                  key={setNum}
                  onClick={() => handleToggleSet(setNum)}
                  className={`p-4 rounded-2xl border text-center transition-all transform active:scale-95 ${
                    isDone
                      ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-md shadow-emerald-500/15'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  <div className="text-xs font-medium uppercase mb-1">Set {setNum}</div>
                  <div className="flex items-center justify-center gap-1.5 font-bold text-sm">
                    {isDone ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span className="text-white">Done</span>
                      </>
                    ) : (
                      <span className="text-slate-300">{currentExercise.reps} reps</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* REST TIMER DISPLAY */}
        <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Rest Interval Timer
              </span>
            </div>
            {restSecondsRemaining !== null && (
              <span className="text-xs font-mono font-bold text-amber-400">
                {restSecondsRemaining}s remaining
              </span>
            )}
          </div>

          {/* Quick presets & countdown */}
          <div className="flex flex-wrap items-center gap-2">
            {[30, 45, 60, 90, 120].map((secs) => (
              <button
                key={secs}
                onClick={() => startRestTimer(secs)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                  restSecondsRemaining === secs && isRestTimerActive
                    ? 'bg-amber-500 text-slate-950 border-amber-400'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                {secs}s
              </button>
            ))}

            {isRestTimerActive ? (
              <button
                onClick={() => setIsRestTimerActive(false)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 flex items-center gap-1.5 ml-auto"
              >
                <Pause className="w-3.5 h-3.5" /> Pause
              </button>
            ) : restSecondsRemaining !== null ? (
              <button
                onClick={() => setIsRestTimerActive(true)}
                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 ml-auto"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" /> Resume
              </button>
            ) : null}

            {restSecondsRemaining !== null && (
              <button
                onClick={() => {
                  setIsRestTimerActive(false);
                  setRestSecondsRemaining(null);
                }}
                className="px-2.5 py-1.5 rounded-xl bg-slate-900 text-slate-400 hover:text-white text-xs border border-slate-800"
              >
                Reset
              </button>
            )}
          </div>

          {/* Progress bar for rest timer */}
          {restSecondsRemaining !== null && (
            <div className="w-full h-1.5 rounded-full bg-slate-900 overflow-hidden">
              <div
                style={{
                  width: `${(restSecondsRemaining / initialRestDuration) * 100}%`,
                }}
                className="h-full bg-amber-400 transition-all duration-1000"
              />
            </div>
          )}
        </div>

        {/* Form Cues Reminder */}
        <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80 space-y-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Coach Form Reminders
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {currentExercise.formCues.map((cue, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                <span>{cue}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Previous / Next Movement Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => setCurrentExerciseIdx((prev) => Math.max(0, prev - 1))}
            disabled={currentExerciseIdx === 0}
            className="px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-xs font-bold text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous Exercise</span>
          </button>

          {currentExerciseIdx < totalExercises - 1 ? (
            <button
              onClick={() => setCurrentExerciseIdx((prev) => Math.min(totalExercises - 1, prev + 1))}
              className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-2 transition-colors border border-slate-700"
            >
              <span>Next Exercise</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleFinish}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 text-xs font-extrabold flex items-center gap-2 shadow-lg shadow-emerald-500/25"
            >
              <Trophy className="w-4 h-4" />
              <span>Finish Workout!</span>
            </button>
          )}
        </div>
      </div>

      {/* Exercise Overview List */}
      <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Today's Exercise Sequence
        </h3>
        <div className="space-y-1.5">
          {dayPlan.exercises.map((ex, idx) => {
            const isCurrent = idx === currentExerciseIdx;
            const doneSets = completedSets[idx]?.length || 0;
            const isComplete = doneSets >= ex.sets;

            return (
              <div
                key={ex.id || idx}
                onClick={() => setCurrentExerciseIdx(idx)}
                className={`p-3 rounded-xl border cursor-pointer flex items-center justify-between transition-all ${
                  isCurrent
                    ? 'bg-emerald-950/40 border-emerald-500 text-white'
                    : 'bg-slate-950/40 border-slate-800/80 hover:bg-slate-800/40 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isComplete
                        ? 'bg-emerald-400 text-slate-950'
                        : isCurrent
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isComplete ? '✓' : idx + 1}
                  </span>
                  <span className="text-xs font-semibold text-slate-200">{ex.name}</span>
                </div>
                <div className="text-xs font-mono text-slate-400">
                  {doneSets} / {ex.sets} sets
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Celebratory Completion Modal */}
      {isFinishedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
          <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 max-w-md w-full text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto">
              <Trophy className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Session Complete!
              </span>
              <h3 className="font-heading text-2xl font-extrabold text-white">
                Outstanding Effort!
              </h3>
              <p className="text-xs text-slate-400">
                You crushed today's routine for <span className="text-white font-semibold">{dayPlan.dayName}</span>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 grid grid-cols-2 gap-3 text-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Total Active Time</span>
                <span className="font-heading text-lg font-bold text-white">
                  {formatTime(workoutElapsedSeconds)}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 block">Exercises Completed</span>
                <span className="font-heading text-lg font-bold text-emerald-400">
                  {completedExercisesCount} / {totalExercises}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  setIsFinishedModalOpen(false);
                  onFinishWorkout();
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs tracking-wider uppercase transition-all"
              >
                Back to Plan Overview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
