import React, { useState, useEffect } from 'react';
import {
  UserFitnessProfile,
  GeneratedFitnessPlan,
  ExerciseItem,
} from './types/fitness';
import { DEFAULT_PROFILE, PresetTemplate } from './utils/fitnessCalculations';
import { STARTER_SAMPLE_PLAN } from './data/defaultPlan';
import { generateFitnessPlanApi, regenerateFitnessPlanApi } from './services/api';

import { Navbar } from './components/Navbar';
import { ProfileForm } from './components/ProfileForm';
import { PlanOverviewHeader } from './components/PlanOverviewHeader';
import { WeeklyScheduleView } from './components/WeeklyScheduleView';
import { ActiveWorkoutSession } from './components/ActiveWorkoutSession';
import { NutritionTab } from './components/NutritionTab';
import { ProgressionRecoveryTab } from './components/ProgressionRecoveryTab';
import { ExerciseModal } from './components/ExerciseModal';
import { AiCoachDrawer } from './components/AiCoachDrawer';
import { SavedPlansModal } from './components/SavedPlansModal';
import { PresetsModal } from './components/PresetsModal';
import { FeedbackRegenerateModal } from './components/FeedbackRegenerateModal';


import {
  Calendar,
  Utensils,
  TrendingUp,
  Sparkles,
  MessageSquare,
  AlertCircle,
  Zap,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react';

export default function App() {
  const [profile, setProfile] = useState<UserFitnessProfile>(DEFAULT_PROFILE);
  const [currentPlan, setCurrentPlan] = useState<GeneratedFitnessPlan | null>(null);
  const [savedPlans, setSavedPlans] = useState<GeneratedFitnessPlan[]>([]);
  const [activeView, setActiveView] = useState<'create' | 'plan' | 'workout'>('plan');
  const [planSubTab, setPlanSubTab] = useState<'schedule' | 'nutrition' | 'progression'>('schedule');
  const [activeWorkoutDayIndex, setActiveWorkoutDayIndex] = useState(0);

  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Modals
  const [isSavedModalOpen, setIsSavedModalOpen] = useState(false);
  const [isPresetsModalOpen, setIsPresetsModalOpen] = useState(false);
  const [isCoachDrawerOpen, setIsCoachDrawerOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedExerciseForGuide, setSelectedExerciseForGuide] = useState<ExerciseItem | null>(null);
  const [coachExerciseContext, setCoachExerciseContext] = useState<ExerciseItem | null>(null);


  // Initialize from LocalStorage
  useEffect(() => {
    try {
      const storedPlans = localStorage.getItem('fitbuddy_saved_plans');
      if (storedPlans) {
        const parsed = JSON.parse(storedPlans);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSavedPlans(parsed);
          setCurrentPlan(parsed[0]);
          setProfile(parsed[0].userProfile || DEFAULT_PROFILE);
          return;
        }
      }

      // Default initial plan
      setCurrentPlan(STARTER_SAMPLE_PLAN);
      setSavedPlans([STARTER_SAMPLE_PLAN]);
    } catch (e) {
      console.error('Failed to load saved plans:', e);
      setCurrentPlan(STARTER_SAMPLE_PLAN);
    }
  }, []);

  // Save to LocalStorage whenever savedPlans updates
  const persistSavedPlans = (plans: GeneratedFitnessPlan[]) => {
    setSavedPlans(plans);
    try {
      localStorage.setItem('fitbuddy_saved_plans', JSON.stringify(plans));
    } catch (e) {
      console.error('Failed to write to localStorage:', e);
    }
  };

  const showToast = (message: string) => {
    setSuccessToast(message);
    setTimeout(() => setSuccessToast(null), 3500);
  };

  // Generate Plan Handler
  const handleGeneratePlan = async (submittedProfile: UserFitnessProfile) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const generatedPlan = await generateFitnessPlanApi(submittedProfile);
      setCurrentPlan(generatedPlan);
      setProfile(submittedProfile);
      setActiveView('plan');
      setPlanSubTab('schedule');

      // Auto-save to list
      const updated = [generatedPlan, ...savedPlans.filter((p) => p.id !== generatedPlan.id)];
      persistSavedPlans(updated);

      showToast('🎉 Your personalized Gemini fitness plan is ready!');
    } catch (error: any) {
      console.error('Plan generation failed:', error);
      setErrorMessage(
        error.message || 'Failed to generate plan. Please verify inputs and check server connection.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Regenerate Plan with User Feedback Handler
  const handleRegeneratePlan = async (
    feedback: string,
    adjustedProfile?: Partial<UserFitnessProfile>
  ) => {
    if (!currentPlan) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const updatedProfile: UserFitnessProfile = {
        ...currentPlan.userProfile,
        ...(adjustedProfile || {}),
      };

      const regeneratedPlan = await regenerateFitnessPlanApi(
        updatedProfile,
        feedback,
        currentPlan
      );

      setCurrentPlan(regeneratedPlan);
      setProfile(updatedProfile);
      setIsFeedbackModalOpen(false);
      setActiveView('plan');
      setPlanSubTab('schedule');

      // Auto-save updated plan to collection
      const updated = [regeneratedPlan, ...savedPlans.filter((p) => p.id !== regeneratedPlan.id)];
      persistSavedPlans(updated);

      showToast('✨ Plan successfully regenerated with your feedback!');
    } catch (error: any) {
      console.error('Plan regeneration failed:', error);
      setErrorMessage(
        error.message || 'Failed to regenerate plan. Please check inputs and try again.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleUnitSystem = () => {

    setUnitSystem((prev) => (prev === 'metric' ? 'imperial' : 'metric'));
  };

  const handleSaveCurrentPlan = () => {
    if (!currentPlan) return;
    const exists = savedPlans.some((p) => p.id === currentPlan.id);
    if (!exists) {
      persistSavedPlans([currentPlan, ...savedPlans]);
      showToast('Plan saved to your collection!');
    } else {
      showToast('Plan already in your collection.');
    }
  };

  const handleDeleteSavedPlan = (planId: string) => {
    const updated = savedPlans.filter((p) => p.id !== planId);
    persistSavedPlans(updated);
    if (currentPlan?.id === planId) {
      setCurrentPlan(updated.length > 0 ? updated[0] : null);
      if (updated.length === 0) {
        setActiveView('create');
      }
    }
  };

  const handleSelectPreset = (preset: PresetTemplate) => {
    setProfile((prev) => ({
      ...prev,
      ...preset.profile,
    }));
    setActiveView('create');
    showToast(`Loaded ${preset.name} settings. Review and hit Generate!`);
  };

  const handleStartActiveWorkout = (dayIndex: number) => {
    setActiveWorkoutDayIndex(dayIndex);
    setActiveView('workout');
  };

  const handleAskCoachAboutExercise = (exercise: ExerciseItem) => {
    setCoachExerciseContext(exercise);
    setIsCoachDrawerOpen(true);
  };

  const isCurrentPlanSaved = !!(currentPlan && savedPlans.some((p) => p.id === currentPlan.id));

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation */}
      <Navbar
        onNewPlan={() => setActiveView('create')}
        onOpenSavedPlans={() => setIsSavedModalOpen(true)}
        savedPlansCount={savedPlans.length}
        unitSystem={unitSystem}
        onToggleUnitSystem={handleToggleUnitSystem}
        onOpenPresets={() => setIsPresetsModalOpen(true)}
        hasActivePlan={!!currentPlan}
        onViewActivePlan={() => setActiveView('plan')}
        activeView={activeView}
        onViewChange={setActiveView}
      />

      {/* Floating Success Toast */}
      {successToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 p-4 rounded-2xl bg-emerald-950 border border-emerald-500 text-emerald-300 text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 pb-16">
        {/* Error notification banner if any */}
        {errorMessage && (
          <div className="max-w-4xl mx-auto mt-4 px-4">
            <div className="p-4 rounded-2xl bg-rose-950/70 border border-rose-500/50 text-rose-200 text-xs sm:text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-bold block">Generation Error</span>
                <p className="mt-0.5 text-xs text-rose-300">{errorMessage}</p>
              </div>
              <button
                onClick={() => setErrorMessage(null)}
                className="text-xs font-bold text-rose-400 hover:text-white"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {/* VIEW 1: Profile Intake & Wizard */}
        {activeView === 'create' && (
          <ProfileForm
            initialProfile={profile}
            unitSystem={unitSystem}
            onSubmit={handleGeneratePlan}
            isLoading={isLoading}
            onSelectPreset={handleSelectPreset}
          />
        )}

        {/* VIEW 2: Generated Fitness Plan Dashboard */}
        {activeView === 'plan' && currentPlan && (
          <div className="space-y-6">
            {/* Plan Header Hero */}
            <PlanOverviewHeader
              plan={currentPlan}
              onSavePlan={handleSaveCurrentPlan}
              isSaved={isCurrentPlanSaved}
              onStartActiveWorkout={handleStartActiveWorkout}
              onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
            />

            {/* Sub-tab Navigation */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <button
                  onClick={() => setPlanSubTab('schedule')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    planSubTab === 'schedule'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Workout Schedule & Exercises</span>
                </button>

                <button
                  onClick={() => setPlanSubTab('nutrition')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    planSubTab === 'nutrition'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <Utensils className="w-4 h-4" />
                  <span>Nutrition & Fueling Protocol</span>
                </button>

                <button
                  onClick={() => setPlanSubTab('progression')}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                    planSubTab === 'progression'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Progression & Recovery</span>
                </button>
              </div>

              {/* Sub-tab Content */}
              <div className="pt-6">
                {planSubTab === 'schedule' && (
                  <WeeklyScheduleView
                    schedule={currentPlan.schedule}
                    onSelectExerciseForGuide={(ex) => setSelectedExerciseForGuide(ex)}
                    onStartActiveWorkout={handleStartActiveWorkout}
                    onOpenFeedbackModal={() => setIsFeedbackModalOpen(true)}
                  />
                )}

                {planSubTab === 'nutrition' && <NutritionTab plan={currentPlan} />}

                {planSubTab === 'progression' && (
                  <ProgressionRecoveryTab plan={currentPlan} />
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: Active Live Workout Session */}
        {activeView === 'workout' && currentPlan && (
          <ActiveWorkoutSession
            dayPlan={currentPlan.schedule[activeWorkoutDayIndex] || currentPlan.schedule[0]}
            onFinishWorkout={() => setActiveView('plan')}
            onSelectExerciseGuide={(ex) => setSelectedExerciseForGuide(ex)}
            onClose={() => setActiveView('plan')}
          />
        )}
      </main>

      {/* FLOATING ACTION BUTTON: AI Fitness Coach */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => {
            setCoachExerciseContext(null);
            setIsCoachDrawerOpen(true);
          }}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-heading font-extrabold text-xs tracking-wide shadow-2xl shadow-emerald-500/35 transition-all transform hover:scale-105 active:scale-95"
        >
          <div className="w-6 h-6 rounded-full bg-slate-950/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
          </div>
          <span className="hidden sm:inline">Ask FitBuddy Coach</span>
          <span className="sm:hidden">Coach</span>
        </button>
      </div>

      {/* MODALS */}
      <FeedbackRegenerateModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        currentPlan={currentPlan}
        onRegenerate={handleRegeneratePlan}
        isLoading={isLoading}
      />

      <ExerciseModal
        exercise={selectedExerciseForGuide}
        onClose={() => setSelectedExerciseForGuide(null)}
        onAskCoachAboutExercise={handleAskCoachAboutExercise}
      />


      <AiCoachDrawer
        isOpen={isCoachDrawerOpen}
        onClose={() => setIsCoachDrawerOpen(false)}
        currentPlan={currentPlan || undefined}
        exerciseContext={coachExerciseContext}
        onClearExerciseContext={() => setCoachExerciseContext(null)}
      />

      <SavedPlansModal
        isOpen={isSavedModalOpen}
        onClose={() => setIsSavedModalOpen(false)}
        savedPlans={savedPlans}
        activePlanId={currentPlan?.id}
        onSelectPlan={(plan) => {
          setCurrentPlan(plan);
          setActiveView('plan');
        }}
        onDeletePlan={handleDeleteSavedPlan}
      />

      <PresetsModal
        isOpen={isPresetsModalOpen}
        onClose={() => setIsPresetsModalOpen(false)}
        onSelectPreset={handleSelectPreset}
      />
    </div>
  );
}
