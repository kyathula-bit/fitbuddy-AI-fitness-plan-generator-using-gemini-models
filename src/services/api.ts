import { UserFitnessProfile, GeneratedFitnessPlan, ExerciseItem } from '../types/fitness';

export async function generateFitnessPlanApi(
  profile: UserFitnessProfile,
  feedback?: string,
  currentPlan?: GeneratedFitnessPlan
): Promise<GeneratedFitnessPlan> {
  const response = await fetch('/api/fitness-plan/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, feedback, currentPlan }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  return response.json();
}

export async function regenerateFitnessPlanApi(
  profile: UserFitnessProfile,
  feedback: string,
  currentPlan?: GeneratedFitnessPlan
): Promise<GeneratedFitnessPlan> {
  const response = await fetch('/api/fitness-plan/regenerate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ profile, feedback, currentPlan }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server error (${response.status})`);
  }

  return response.json();
}

export async function askCoachApi(

  question: string,
  currentPlan?: GeneratedFitnessPlan,
  exerciseContext?: ExerciseItem
): Promise<string> {
  const response = await fetch('/api/fitness-plan/coach-advice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question, currentPlan, exerciseContext }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to get coach response (${response.status})`);
  }

  const data = await response.json();
  return data.reply;
}

export interface ExerciseDeepDive {
  setup: string;
  executionSteps: string[];
  commonMistakes: string[];
  breathingTechnique: string;
  progressionTips: string;
}

export async function getExerciseDetailsApi(
  exerciseName: string,
  targetMuscles: string[],
  equipment: string
): Promise<ExerciseDeepDive> {
  const response = await fetch('/api/fitness-plan/exercise-details', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ exerciseName, targetMuscles, equipment }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to fetch exercise details (${response.status})`);
  }

  return response.json();
}
