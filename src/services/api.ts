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

// ==========================================
// ADMIN DASHBOARD & SQLITE API CLIENT
// ==========================================

export interface AdminStats {
  totalUsers: number;
  totalPlans: number;
  totalFeedbackLogs: number;
  avgDurationMinutes: number;
  intensityDistribution: Record<string, number>;
  goalDistribution: Record<string, number>;
  equipmentDistribution: Record<string, number>;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email?: string;
  age: number;
  gender: string;
  height_cm: number;
  weight_kg: number;
  fitness_goal: string;
  activity_level: string;
  workout_experience: string;
  workout_intensity: string;
  preferred_workout_type: string;
  available_equipment: string;
  workout_duration_minutes: number;
  limitations_or_injuries?: string;
  dietary_preference?: string;
  created_at: string;
  updated_at: string;
  plan_count?: number;
}

export interface AdminPlanRecord {
  id: string;
  user_id: string;
  user_name: string;
  plan_title: string;
  tagline: string;
  executive_summary: string;
  workout_intensity: string;
  available_workout_days: number;
  workout_duration_minutes: number;
  available_equipment: string;
  fitness_goal: string;
  version: number;
  latest_feedback_applied?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminFeedbackRecord {
  id: string;
  plan_id: string;
  user_id: string;
  feedback_text: string;
  modifications_summary?: string;
  applied_intensity?: string;
  created_at: string;
  plan_title?: string;
  user_name?: string;
}

export interface SqliteSchemaInfo {
  databaseEngine: string;
  databaseFile: string;
  orm: string;
  tables: Array<{
    name: string;
    description: string;
    recordCount: number;
    columns: string[];
  }>;
  sqlalchemyModelFile: string;
  connectionString: string;
}

export async function fetchAdminStatsApi(): Promise<AdminStats> {
  const res = await fetch('/api/admin/stats');
  if (!res.ok) throw new Error('Failed to fetch admin statistics');
  return res.json();
}

export async function fetchAdminUsersApi(): Promise<{ users: AdminUserRecord[]; total: number }> {
  const res = await fetch('/api/admin/users');
  if (!res.ok) throw new Error('Failed to fetch users');
  return res.json();
}

export async function fetchAdminPlansApi(): Promise<{ plans: AdminPlanRecord[]; total: number }> {
  const res = await fetch('/api/admin/plans');
  if (!res.ok) throw new Error('Failed to fetch plans');
  return res.json();
}

export async function fetchAdminPlanByIdApi(id: string): Promise<GeneratedFitnessPlan> {
  const res = await fetch(`/api/admin/plans/${id}`);
  if (!res.ok) throw new Error('Failed to fetch plan details');
  return res.json();
}

export async function deleteAdminPlanApi(id: string): Promise<void> {
  const res = await fetch(`/api/admin/plans/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete workout plan');
}

export async function fetchAdminFeedbackApi(): Promise<{ logs: AdminFeedbackRecord[]; total: number }> {
  const res = await fetch('/api/admin/feedback');
  if (!res.ok) throw new Error('Failed to fetch feedback logs');
  return res.json();
}

export async function fetchSqliteInfoApi(): Promise<SqliteSchemaInfo> {
  const res = await fetch('/api/admin/sqlite-info');
  if (!res.ok) throw new Error('Failed to fetch SQLite schema info');
  return res.json();
}

