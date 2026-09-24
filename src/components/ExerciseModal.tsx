import React, { useState, useEffect } from 'react';
import { ExerciseItem } from '../types/fitness';
import { getExerciseDetailsApi, ExerciseDeepDive } from '../services/api';
import {
  X,
  Sparkles,
  CheckCircle2,
  AlertOctagon,
  Wind,
  TrendingUp,
  Dumbbell,
  HelpCircle,
} from 'lucide-react';

interface ExerciseModalProps {
  exercise: ExerciseItem | null;
  onClose: () => void;
  onAskCoachAboutExercise: (exercise: ExerciseItem) => void;
}

export const ExerciseModal: React.FC<ExerciseModalProps> = ({
  exercise,
  onClose,
  onAskCoachAboutExercise,
}) => {
  const [loading, setLoading] = useState(false);
  const [deepDive, setDeepDive] = useState<ExerciseDeepDive | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!exercise) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    getExerciseDetailsApi(exercise.name, exercise.targetMuscles, exercise.equipmentRequired)
      .then((data) => {
        if (isMounted) {
          setDeepDive(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError('Could not fetch real-time biomechanics guide.');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [exercise]);

  if (!exercise) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[90vh] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-800 bg-slate-950/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider">
                Biomechanics & Form Guide
              </span>
              <span className="text-xs text-slate-400 capitalize">
                • {exercise.difficulty} Level
              </span>
            </div>
            <h2 className="font-heading text-2xl font-bold text-white flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-emerald-400" />
              {exercise.name}
            </h2>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {exercise.targetMuscles.map((muscle) => (
                <span
                  key={muscle}
                  className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-medium"
                >
                  {muscle}
                </span>
              ))}
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[11px] font-medium">
                Equipment: {exercise.equipmentRequired}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats Pill */}
          <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
            <div>
              <span className="text-[11px] text-slate-500 block">Target Sets × Reps</span>
              <span className="text-sm font-extrabold text-white">
                {exercise.sets} × {exercise.reps}
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Rest Period</span>
              <span className="text-sm font-extrabold text-amber-400">
                {exercise.restSeconds} seconds
              </span>
            </div>
            <div>
              <span className="text-[11px] text-slate-500 block">Tempo Guidance</span>
              <span className="text-sm font-extrabold text-cyan-400">
                {exercise.tempo || '2-0-1-0'}
              </span>
            </div>
          </div>

          {/* Form Cues provided in plan */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Essential Form Cues
            </h3>
            <ul className="space-y-1.5">
              {exercise.formCues.map((cue, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-xs sm:text-sm text-slate-300 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/80"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-2 shrink-0" />
                  <span>{cue}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Loading or Gemini Biomechanics breakdown */}
          {loading ? (
            <div className="p-8 text-center space-y-3 bg-slate-950/40 rounded-2xl border border-slate-800/80">
              <div className="w-7 h-7 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400 font-medium">
                Fetching Gemini AI biomechanics analysis, setup instructions, and breathing mechanics...
              </p>
            </div>
          ) : deepDive ? (
            <div className="space-y-5">
              {/* Setup */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-1">
                  1. Setup & Starting Position
                </h4>
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  {deepDive.setup}
                </p>
              </div>

              {/* Execution Steps */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  2. Step-by-Step Execution
                </h4>
                <div className="space-y-2">
                  {deepDive.executionSteps.map((step, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-3 p-3 rounded-xl bg-slate-950/50 border border-slate-800 text-xs sm:text-sm text-slate-200"
                    >
                      <span className="w-5 h-5 rounded-full bg-cyan-500/10 text-cyan-400 font-bold text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
                  <AlertOctagon className="w-4 h-4 text-amber-400" />
                  3. Common Mistakes to Avoid
                </h4>
                <ul className="space-y-1.5">
                  {deepDive.commonMistakes.map((mistake, idx) => (
                    <li
                      key={idx}
                      className="text-xs sm:text-sm text-slate-300 bg-amber-950/20 border border-amber-900/40 p-2.5 rounded-xl flex items-start gap-2"
                    >
                      <span className="text-amber-400 font-bold shrink-0">✕</span>
                      <span>{mistake}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Breathing & Progression */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <Wind className="w-4 h-4 text-teal-400" />
                    Breathing Pattern
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {deepDive.breathingTechnique}
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-300 mb-1 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Progression / Alternative
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {exercise.substitutionAlternative}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-400">
              {exercise.instructions || 'Perform with controlled tempo and full range of motion.'}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between">
          <button
            onClick={() => {
              onClose();
              onAskCoachAboutExercise(exercise);
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-emerald-400" />
            <span>Ask FitBuddy Coach about this Exercise</span>
          </button>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-colors"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
