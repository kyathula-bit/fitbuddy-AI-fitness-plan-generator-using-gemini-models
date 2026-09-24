export type Gender = 'male' | 'female' | 'non-binary' | 'prefer-not-to-say';

export type FitnessGoal =
  | 'weight_loss'
  | 'muscle_gain'
  | 'flexibility'
  | 'general_fitness'
  | 'fat_loss'
  | 'muscle_building'
  | 'strength'
  | 'endurance'
  | 'toning_mobility'
  | 'general_health'
  | 'athletic_performance';


export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'athlete';

export type WorkoutExperience =
  | 'beginner'
  | 'intermediate'
  | 'advanced'
  | 'expert';

export type PreferredWorkoutType =
  | 'strength_hypertrophy'
  | 'hiit'
  | 'calisthenics'
  | 'cardio_circuits'
  | 'functional_cross'
  | 'yoga_mobility'
  | 'powerlifting'
  | 'low_impact';

export type AvailableEquipment =
  | 'bodyweight_only'
  | 'dumbbells_only'
  | 'resistance_bands'
  | 'home_gym'
  | 'commercial_gym'
  | 'kettlebells';

export type DietaryPreference =
  | 'omnivore'
  | 'high_protein'
  | 'vegetarian'
  | 'vegan'
  | 'pescatarian'
  | 'keto'
  | 'flexible';

export type WorkoutIntensity = 'low' | 'medium' | 'high' | 'moderate' | 'extreme';


export interface UserFitnessProfile {
  name?: string;
  age: number;
  gender: Gender;
  heightCm: number;
  heightUnit: 'cm' | 'ft';
  weightKg: number;
  weightUnit: 'kg' | 'lbs';
  fitnessGoal: FitnessGoal;
  activityLevel: ActivityLevel;
  workoutExperience: WorkoutExperience;
  workoutIntensity: WorkoutIntensity;
  availableWorkoutDays: number;
  preferredDays: string[];
  preferredWorkoutType: PreferredWorkoutType;
  availableEquipment: AvailableEquipment;
  workoutDurationMinutes: number;
  limitationsOrInjuries?: string;
  dietaryPreference: DietaryPreference;
}


export interface ExerciseItem {
  id: string;
  name: string;
  targetMuscles: string[];
  sets: number;
  reps: string;
  restSeconds: number;
  tempo?: string;
  formCues: string[];
  equipmentRequired: string;
  substitutionAlternative: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions?: string;
}

export interface WarmupCooldownItem {
  name: string;
  targetArea: string;
  durationOrReps: string;
  instructions: string;
}

export interface DayWorkoutPlan {
  dayNumber: number;
  dayName: string;
  focus: string;
  isRestDay: boolean;
  restDayActivity?: string;
  estimatedDurationMinutes: number;
  warmup: {
    durationMinutes: number;
    items: WarmupCooldownItem[];
  };
  exercises: ExerciseItem[];
  cooldown: {
    durationMinutes: number;
    items: WarmupCooldownItem[];
  };
}

export interface SampleMeal {
  mealType: string;
  title: string;
  description: string;
  estimatedCalories: number;
  proteinGrams: number;
  carbsGrams?: number;
  fatsGrams?: number;
  prepTimeMinutes?: number;
  ingredients?: string[];
  keyBenefits?: string;
}

export interface HealthySnackIdea {
  title: string;
  description: string;
  calories: number;
  proteinGrams: number;
  carbsGrams?: number;
  fatsGrams?: number;
  category?: string;
  prepTimeMinutes?: number;
  ingredients?: string[];
  whyItWorks?: string;
}


export interface GeneratedFitnessPlan {
  id: string;
  createdAt: string;
  planTitle: string;
  tagline: string;
  userProfile: UserFitnessProfile;
  metricsAnalysis: {
    bmi: number;
    bmiCategory: string;
    estimatedBmr: number;
    estimatedTdee: number;
    recommendedDailyCalories: number;
    calorieGoalType: 'deficit' | 'maintenance' | 'surplus';
    macroSplit: {
      proteinGrams: number;
      carbsGrams: number;
      fatsGrams: number;
      rationale: string;
    };
  };
  executiveSummary: string;
  weeklyOverview: {
    splitName: string;
    daysCount: number;
    frequencyNote: string;
    intensityLevel: string;
  };
  schedule: DayWorkoutPlan[];
  progressionPlan: {
    rule: string;
    week1to2Focus: string;
    week3to4Focus: string;
    deloadGuidance: string;
  };
  nutritionGuidance: {
    dailyWaterLiters: number;
    preWorkoutFuel: string;
    postWorkoutFuel: string;
    sampleMeals: SampleMeal[];
    healthySnackIdeas?: HealthySnackIdea[];
    tips: string[];
  };

  recoveryProtocol: {
    sleepTargetHours: string;
    activeRecoveryNotes: string;
    injuryPreventionNotes: string;
  };
  coachQuote: string;
  latestFeedbackApplied?: string;
  feedbackHistory?: {
    feedback: string;
    timestamp: string;
  }[];
}


export interface WorkoutSessionProgress {
  planId: string;
  dayNumber: number;
  completedExercises: Record<string, boolean>; // exerciseId -> completed
  completedSets: Record<string, number>; // exerciseId -> sets done
  startedAt?: string;
  finishedAt?: string;
  totalTimeSpentSeconds?: number;
}
