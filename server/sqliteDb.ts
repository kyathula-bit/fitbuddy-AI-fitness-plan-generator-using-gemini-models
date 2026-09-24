import initSqlJs, { Database } from 'sql.js';
import fs from 'fs';
import path from 'path';

const DB_FILE_PATH = path.resolve(process.cwd(), 'fitness_database.sqlite');

let dbInstance: Database | null = null;

export async function getSqliteDb(): Promise<Database> {
  if (dbInstance) {
    return dbInstance;
  }

  const SQL = await initSqlJs();

  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      dbInstance = new SQL.Database(fileBuffer);
    } catch (err) {
      console.warn('Could not read existing SQLite file, creating new database:', err);
      dbInstance = new SQL.Database();
    }
  } else {
    dbInstance = new SQL.Database();
  }

  // Initialize SQLite schema
  initSchema(dbInstance);
  saveDatabase(dbInstance);

  return dbInstance;
}

export function saveDatabase(db: Database) {
  try {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_FILE_PATH, buffer);
  } catch (err) {
    console.error('Failed to save SQLite database to disk:', err);
  }
}

function initSchema(db: Database) {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT,
      age INTEGER NOT NULL,
      gender TEXT NOT NULL,
      height_cm REAL NOT NULL,
      weight_kg REAL NOT NULL,
      fitness_goal TEXT NOT NULL,
      activity_level TEXT NOT NULL,
      workout_experience TEXT NOT NULL,
      workout_intensity TEXT NOT NULL,
      preferred_workout_type TEXT NOT NULL,
      available_equipment TEXT NOT NULL,
      workout_duration_minutes INTEGER NOT NULL,
      limitations_or_injuries TEXT,
      dietary_preference TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS workout_plans (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      user_name TEXT,
      plan_title TEXT NOT NULL,
      tagline TEXT,
      executive_summary TEXT,
      workout_intensity TEXT NOT NULL,
      available_workout_days INTEGER NOT NULL,
      workout_duration_minutes INTEGER NOT NULL,
      available_equipment TEXT NOT NULL,
      fitness_goal TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      latest_feedback_applied TEXT,
      plan_json TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS plan_feedback_logs (
      id TEXT PRIMARY KEY,
      plan_id TEXT NOT NULL,
      user_id TEXT,
      feedback_text TEXT NOT NULL,
      modifications_summary TEXT,
      applied_intensity TEXT,
      created_at TEXT NOT NULL,
      FOREIGN KEY (plan_id) REFERENCES workout_plans (id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_workout_plans_user_id ON workout_plans (user_id);
    CREATE INDEX IF NOT EXISTS idx_plan_feedback_plan_id ON plan_feedback_logs (plan_id);
  `);
}

// Database helper operations
export interface UserDbRecord {
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

export interface WorkoutPlanDbRecord {
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
  plan_json: string;
  created_at: string;
  updated_at: string;
}

export interface FeedbackLogDbRecord {
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

export async function upsertUser(user: {
  id?: string;
  name: string;
  email?: string;
  age: number;
  gender: string;
  heightCm: number;
  weightKg: number;
  fitnessGoal: string;
  activityLevel: string;
  workoutExperience: string;
  workoutIntensity: string;
  preferredWorkoutType: string;
  availableEquipment: string;
  workoutDurationMinutes: number;
  limitationsOrInjuries?: string;
  dietaryPreference?: string;
}): Promise<string> {
  const db = await getSqliteDb();
  const userId = user.id || `user_${user.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}_${user.age}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO users (
      id, name, email, age, gender, height_cm, weight_kg,
      fitness_goal, activity_level, workout_experience, workout_intensity,
      preferred_workout_type, available_equipment, workout_duration_minutes,
      limitations_or_injuries, dietary_preference, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      email = excluded.email,
      age = excluded.age,
      gender = excluded.gender,
      height_cm = excluded.height_cm,
      weight_kg = excluded.weight_kg,
      fitness_goal = excluded.fitness_goal,
      activity_level = excluded.activity_level,
      workout_experience = excluded.workout_experience,
      workout_intensity = excluded.workout_intensity,
      preferred_workout_type = excluded.preferred_workout_type,
      available_equipment = excluded.available_equipment,
      workout_duration_minutes = excluded.workout_duration_minutes,
      limitations_or_injuries = excluded.limitations_or_injuries,
      dietary_preference = excluded.dietary_preference,
      updated_at = excluded.updated_at
  `);

  stmt.run([
    userId,
    user.name || 'Anonymous Athlete',
    user.email || '',
    user.age || 25,
    user.gender || 'unspecified',
    user.heightCm || 175,
    user.weightKg || 70,
    user.fitnessGoal || 'general_fitness',
    user.activityLevel || 'moderately_active',
    user.workoutExperience || 'intermediate',
    user.workoutIntensity || 'medium',
    user.preferredWorkoutType || 'strength_hypertrophy',
    user.availableEquipment || 'dumbbells_only',
    user.workoutDurationMinutes || 45,
    user.limitationsOrInjuries || '',
    user.dietaryPreference || 'flexible',
    now,
    now,
  ]);
  stmt.free();
  saveDatabase(db);
  return userId;
}

export async function saveWorkoutPlan(plan: any, userId: string): Promise<void> {
  const db = await getSqliteDb();
  const now = new Date().toISOString();

  // Check if plan already exists to increment version
  let version = 1;
  const existingStmt = db.prepare('SELECT version FROM workout_plans WHERE id = ?');
  existingStmt.bind([plan.id]);
  if (existingStmt.step()) {
    const row = existingStmt.getAsObject();
    version = (Number(row.version) || 1) + 1;
  }
  existingStmt.free();

  const stmt = db.prepare(`
    INSERT INTO workout_plans (
      id, user_id, user_name, plan_title, tagline, executive_summary,
      workout_intensity, available_workout_days, workout_duration_minutes,
      available_equipment, fitness_goal, version, latest_feedback_applied,
      plan_json, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      user_name = excluded.user_name,
      plan_title = excluded.plan_title,
      tagline = excluded.tagline,
      executive_summary = excluded.executive_summary,
      workout_intensity = excluded.workout_intensity,
      available_workout_days = excluded.available_workout_days,
      workout_duration_minutes = excluded.workout_duration_minutes,
      available_equipment = excluded.available_equipment,
      fitness_goal = excluded.fitness_goal,
      version = excluded.version,
      latest_feedback_applied = excluded.latest_feedback_applied,
      plan_json = excluded.plan_json,
      updated_at = excluded.updated_at
  `);

  const profile = plan.userProfile || {};
  stmt.run([
    plan.id,
    userId,
    profile.name || 'Anonymous Athlete',
    plan.planTitle || 'Custom Workout Plan',
    plan.tagline || '',
    plan.executiveSummary || '',
    profile.workoutIntensity || 'medium',
    profile.availableWorkoutDays || 4,
    profile.workoutDurationMinutes || 45,
    profile.availableEquipment || 'dumbbells_only',
    profile.fitnessGoal || 'general_fitness',
    version,
    plan.latestFeedbackApplied || '',
    JSON.stringify(plan),
    plan.createdAt || now,
    now,
  ]);
  stmt.free();
  saveDatabase(db);
}

export async function logPlanFeedback(log: {
  planId: string;
  userId?: string;
  feedbackText: string;
  modificationsSummary?: string;
  appliedIntensity?: string;
}): Promise<void> {
  const db = await getSqliteDb();
  const id = `fdbk_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const now = new Date().toISOString();

  const stmt = db.prepare(`
    INSERT INTO plan_feedback_logs (
      id, plan_id, user_id, feedback_text, modifications_summary,
      applied_intensity, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    id,
    log.planId,
    log.userId || null,
    log.feedbackText,
    log.modificationsSummary || '',
    log.appliedIntensity || '',
    now,
  ]);
  stmt.free();
  saveDatabase(db);
}

export async function getAllUsers(): Promise<UserDbRecord[]> {
  const db = await getSqliteDb();
  const res = db.exec(`
    SELECT u.*, COUNT(p.id) as plan_count
    FROM users u
    LEFT JOIN workout_plans p ON u.id = p.user_id
    GROUP BY u.id
    ORDER BY u.updated_at DESC
  `);

  if (!res || res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as UserDbRecord;
  });
}

export async function getAllWorkoutPlans(): Promise<WorkoutPlanDbRecord[]> {
  const db = await getSqliteDb();
  const res = db.exec(`
    SELECT id, user_id, user_name, plan_title, tagline, executive_summary,
           workout_intensity, available_workout_days, workout_duration_minutes,
           available_equipment, fitness_goal, version, latest_feedback_applied,
           created_at, updated_at
    FROM workout_plans
    ORDER BY updated_at DESC
  `);

  if (!res || res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as WorkoutPlanDbRecord;
  });
}

export async function getWorkoutPlanById(planId: string): Promise<any | null> {
  const db = await getSqliteDb();
  const stmt = db.prepare('SELECT plan_json FROM workout_plans WHERE id = ?');
  stmt.bind([planId]);
  if (stmt.step()) {
    const row = stmt.getAsObject();
    stmt.free();
    try {
      return JSON.parse(row.plan_json as string);
    } catch {
      return null;
    }
  }
  stmt.free();
  return null;
}

export async function getAllFeedbackLogs(): Promise<FeedbackLogDbRecord[]> {
  const db = await getSqliteDb();
  const res = db.exec(`
    SELECT f.*, p.plan_title, u.name as user_name
    FROM plan_feedback_logs f
    LEFT JOIN workout_plans p ON f.plan_id = p.id
    LEFT JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `);

  if (!res || res.length === 0) return [];
  const columns = res[0].columns;
  return res[0].values.map((row) => {
    const obj: any = {};
    columns.forEach((col, idx) => {
      obj[col] = row[idx];
    });
    return obj as FeedbackLogDbRecord;
  });
}

export async function getAdminStats(): Promise<{
  totalUsers: number;
  totalPlans: number;
  totalFeedbackLogs: number;
  avgDurationMinutes: number;
  intensityDistribution: Record<string, number>;
  goalDistribution: Record<string, number>;
  equipmentDistribution: Record<string, number>;
}> {
  const db = await getSqliteDb();

  const userCountRes = db.exec('SELECT COUNT(*) as count FROM users');
  const totalUsers = userCountRes?.[0]?.values?.[0]?.[0] ? Number(userCountRes[0].values[0][0]) : 0;

  const planCountRes = db.exec('SELECT COUNT(*) as count, AVG(workout_duration_minutes) as avg_dur FROM workout_plans');
  const totalPlans = planCountRes?.[0]?.values?.[0]?.[0] ? Number(planCountRes[0].values[0][0]) : 0;
  const avgDurationMinutes = planCountRes?.[0]?.values?.[0]?.[1] ? Math.round(Number(planCountRes[0].values[0][1])) : 45;

  const feedbackCountRes = db.exec('SELECT COUNT(*) as count FROM plan_feedback_logs');
  const totalFeedbackLogs = feedbackCountRes?.[0]?.values?.[0]?.[0] ? Number(feedbackCountRes[0].values[0][0]) : 0;

  // Distributions
  const intensityRes = db.exec('SELECT workout_intensity, COUNT(*) FROM workout_plans GROUP BY workout_intensity');
  const intensityDistribution: Record<string, number> = {};
  intensityRes?.[0]?.values?.forEach(([val, cnt]) => {
    if (val) intensityDistribution[String(val)] = Number(cnt);
  });

  const goalRes = db.exec('SELECT fitness_goal, COUNT(*) FROM workout_plans GROUP BY fitness_goal');
  const goalDistribution: Record<string, number> = {};
  goalRes?.[0]?.values?.forEach(([val, cnt]) => {
    if (val) goalDistribution[String(val)] = Number(cnt);
  });

  const equipRes = db.exec('SELECT available_equipment, COUNT(*) FROM workout_plans GROUP BY available_equipment');
  const equipmentDistribution: Record<string, number> = {};
  equipRes?.[0]?.values?.forEach(([val, cnt]) => {
    if (val) equipmentDistribution[String(val)] = Number(cnt);
  });

  return {
    totalUsers,
    totalPlans,
    totalFeedbackLogs,
    avgDurationMinutes,
    intensityDistribution,
    goalDistribution,
    equipmentDistribution,
  };
}

export async function deleteWorkoutPlan(planId: string): Promise<boolean> {
  const db = await getSqliteDb();
  db.run('DELETE FROM workout_plans WHERE id = ?', [planId]);
  db.run('DELETE FROM plan_feedback_logs WHERE plan_id = ?', [planId]);
  saveDatabase(db);
  return true;
}

export async function seedSampleDataIfEmpty() {
  const db = await getSqliteDb();
  const res = db.exec('SELECT COUNT(*) FROM users');
  const count = res?.[0]?.values?.[0]?.[0] ? Number(res[0].values[0][0]) : 0;

  if (count === 0) {
    const user1Id = await upsertUser({
      name: 'Alex Morgan',
      email: 'alex.morgan@fitbuddy.ai',
      age: 28,
      gender: 'male',
      heightCm: 178,
      weightKg: 75,
      fitnessGoal: 'muscle_gain',
      activityLevel: 'moderately_active',
      workoutExperience: 'intermediate',
      workoutIntensity: 'medium',
      preferredWorkoutType: 'strength_hypertrophy',
      availableEquipment: 'dumbbells_only',
      workoutDurationMinutes: 45,
      limitationsOrInjuries: 'Minor right shoulder tightness on overhead presses',
      dietaryPreference: 'high_protein',
    });

    const user2Id = await upsertUser({
      name: 'Samantha Chen',
      email: 'sam.chen@fitbuddy.ai',
      age: 32,
      gender: 'female',
      heightCm: 165,
      weightKg: 62,
      fitnessGoal: 'weight_loss',
      activityLevel: 'very_active',
      workoutExperience: 'beginner',
      workoutIntensity: 'high',
      preferredWorkoutType: 'hiit',
      availableEquipment: 'home_gym',
      workoutDurationMinutes: 30,
      limitationsOrInjuries: 'Knee sensitivity with deep barbell squats',
      dietaryPreference: 'flexible',
    });

    const user3Id = await upsertUser({
      name: 'Marcus Vance',
      email: 'marcus.v@fitbuddy.ai',
      age: 45,
      gender: 'male',
      heightCm: 182,
      weightKg: 86,
      fitnessGoal: 'flexibility',
      activityLevel: 'lightly_active',
      workoutExperience: 'intermediate',
      workoutIntensity: 'low',
      preferredWorkoutType: 'yoga_mobility',
      availableEquipment: 'bodyweight_only',
      workoutDurationMinutes: 35,
      limitationsOrInjuries: 'Lumbar lower-back stiffness from desk work',
      dietaryPreference: 'vegetarian',
    });

    // Seed plan for Alex
    await saveWorkoutPlan({
      id: 'fitbuddy-starter-sample',
      planTitle: "Alex's 4-Day Hypertrophy & Kinetic Power Split",
      tagline: 'Scientific Upper/Lower Periodization Optimized for Lean Muscle Architecture',
      executiveSummary: 'Constructed specifically for Alex Morgan, a 28-year-old athlete with intermediate training experience focusing on muscle gain at medium intensity.',
      userProfile: {
        name: 'Alex Morgan',
        age: 28,
        gender: 'male',
        heightCm: 178,
        weightKg: 75,
        fitnessGoal: 'muscle_gain',
        workoutIntensity: 'medium',
        availableWorkoutDays: 4,
        workoutDurationMinutes: 45,
        availableEquipment: 'dumbbells_only',
        dietaryPreference: 'high_protein',
      },
      latestFeedbackApplied: 'Replaced jump squats with dumbbell Bulgarian split squats for knee longevity.',
    }, user1Id);

    // Seed feedback log
    await logPlanFeedback({
      planId: 'fitbuddy-starter-sample',
      userId: user1Id,
      feedbackText: 'Replaced jump squats with dumbbell Bulgarian split squats for knee longevity.',
      modificationsSummary: 'Lower-impact joint modification applied successfully.',
      appliedIntensity: 'medium',
    });

    // Seed plan for Samantha
    await saveWorkoutPlan({
      id: 'fitbuddy-sample-shred-32',
      planTitle: "Samantha's 30-Min Rapid Metabolic Shred",
      tagline: 'High-Density Interval Conditioning with Lean Tissue Preservation',
      executiveSummary: 'Constructed specifically for Samantha Chen, a 32-year-old athlete with beginner training experience focusing on weight loss at high intensity.',
      userProfile: {
        name: 'Samantha Chen',
        age: 32,
        gender: 'female',
        heightCm: 165,
        weightKg: 62,
        fitnessGoal: 'weight_loss',
        workoutIntensity: 'high',
        availableWorkoutDays: 4,
        workoutDurationMinutes: 30,
        availableEquipment: 'home_gym',
        dietaryPreference: 'flexible',
      },
      latestFeedbackApplied: 'Reduced rest intervals between supersets from 60s to 40s.',
    }, user2Id);

    await logPlanFeedback({
      planId: 'fitbuddy-sample-shred-32',
      userId: user2Id,
      feedbackText: 'Reduced rest intervals between supersets from 60s to 40s to increase sweat and heart rate.',
      modificationsSummary: 'Cardiovascular density increased.',
      appliedIntensity: 'high',
    });

    console.log('SQLite database initialized and seeded with sample user records and plans.');
  }
}

