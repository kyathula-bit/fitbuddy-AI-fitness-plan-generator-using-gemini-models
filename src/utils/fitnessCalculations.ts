import { UserFitnessProfile, GeneratedFitnessPlan } from '../types/fitness';

export const DEFAULT_PROFILE: UserFitnessProfile = {
  name: 'Alex Morgan',
  age: 28,
  gender: 'male',
  heightCm: 178,
  heightUnit: 'cm',
  weightKg: 75,
  weightUnit: 'kg',
  fitnessGoal: 'muscle_building',
  activityLevel: 'moderately_active',
  workoutExperience: 'intermediate',
  workoutIntensity: 'high',
  availableWorkoutDays: 4,
  preferredDays: ['Monday', 'Tuesday', 'Thursday', 'Friday'],
  preferredWorkoutType: 'strength_hypertrophy',
  availableEquipment: 'dumbbells_only',
  workoutDurationMinutes: 45,
  limitationsOrInjuries: '',
  dietaryPreference: 'high_protein',
};


export function cmToFeetInches(cm: number): { feet: number; inches: number } {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

export function feetInchesToCm(feet: number, inches: number): number {
  return Math.round((feet * 12 + inches) * 2.54);
}

export function kgToLbs(kg: number): number {
  return Math.round(kg * 2.20462);
}

export function lbsToKg(lbs: number): number {
  return Math.round(lbs / 2.20462);
}

export function calculateBmi(weightKg: number, heightCm: number): { bmi: number; category: string } {
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));
  let category = 'Normal weight';
  if (bmi < 18.5) category = 'Underweight';
  else if (bmi < 25) category = 'Normal';
  else if (bmi < 30) category = 'Overweight';
  else category = 'Obese';
  return { bmi, category };
}

// Preset plan templates for instant test and inspiration
export interface PresetTemplate {
  id: string;
  name: string;
  badge: string;
  description: string;
  profile: Partial<UserFitnessProfile>;
}

export const PRESET_TEMPLATES: PresetTemplate[] = [
  {
    id: 'weight-loss-burn',
    name: '30-Min Weight Loss Shred',
    badge: 'Weight Loss',
    description: 'High-metabolic conditioning and fat incineration with lean preservation.',
    profile: {
      fitnessGoal: 'weight_loss',
      availableWorkoutDays: 4,
      preferredWorkoutType: 'hiit',
      availableEquipment: 'dumbbells_only',
      workoutDurationMinutes: 30,
      workoutExperience: 'beginner',
      workoutIntensity: 'high',
      dietaryPreference: 'high_protein',
    },
  },
  {
    id: 'hypertrophy-muscle',
    name: '4-Day Muscle Gain Split',
    badge: 'Muscle Gain',
    description: 'Upper/Lower split focused on progressive overload and hypertrophy.',
    profile: {
      fitnessGoal: 'muscle_gain',
      availableWorkoutDays: 4,
      preferredWorkoutType: 'strength_hypertrophy',
      availableEquipment: 'dumbbells_only',
      workoutDurationMinutes: 45,
      workoutExperience: 'intermediate',
      workoutIntensity: 'high',
      dietaryPreference: 'high_protein',
    },
  },
  {
    id: 'flexibility-flow',
    name: 'Full Body Flexibility & Mobility',
    badge: 'Flexibility',
    description: 'Decompress joints, expand dynamic range of motion, and eliminate stiffness.',
    profile: {
      fitnessGoal: 'flexibility',
      availableWorkoutDays: 3,
      preferredWorkoutType: 'yoga_mobility',
      availableEquipment: 'bodyweight_only',
      workoutDurationMinutes: 35,
      workoutExperience: 'beginner',
      workoutIntensity: 'low',
      dietaryPreference: 'flexible',
    },
  },
  {
    id: 'general-fitness-vitality',
    name: 'General Fitness & Longevity',
    badge: 'General Fitness',
    description: 'Balanced functional circuits, cardiovascular stamina, and core balance.',
    profile: {
      fitnessGoal: 'general_fitness',
      availableWorkoutDays: 3,
      preferredWorkoutType: 'functional_cross',
      availableEquipment: 'home_gym',
      workoutDurationMinutes: 40,
      workoutExperience: 'intermediate',
      workoutIntensity: 'moderate',
      dietaryPreference: 'flexible',
    },
  },

];



// Web Audio API beep chime for rest timer completion
export function playChime(frequency = 587.33, durationSeconds = 0.3) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(frequency * 1.5, ctx.currentTime + durationSeconds);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSeconds);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + durationSeconds);
  } catch (e) {
    // Audio might be blocked by browser policy until interaction
  }
}

// Format plan as shareable plain text / Markdown
export function exportPlanToMarkdown(plan: GeneratedFitnessPlan): string {
  let md = `# ${plan.planTitle}\n`;
  md += `*${plan.tagline}*\n\n`;
  md += `**Generated with Google Gemini via FitBuddy** | ${new Date(plan.createdAt).toLocaleDateString()}\n\n`;
  md += `## Overview\n`;
  md += `${plan.executiveSummary}\n\n`;

  md += `### Physiological Targets\n`;
  md += `- **Daily Calories:** ${plan.metricsAnalysis.recommendedDailyCalories} kcal (${plan.metricsAnalysis.calorieGoalType})\n`;
  md += `- **Protein:** ${plan.metricsAnalysis.macroSplit.proteinGrams}g\n`;
  md += `- **Carbs:** ${plan.metricsAnalysis.macroSplit.carbsGrams}g\n`;
  md += `- **Fats:** ${plan.metricsAnalysis.macroSplit.fatsGrams}g\n`;
  md += `- **Daily Water:** ${plan.nutritionGuidance.dailyWaterLiters}L\n\n`;

  md += `## Weekly Schedule (${plan.weeklyOverview.splitName})\n\n`;

  plan.schedule.forEach((day) => {
    md += `### ${day.dayName} (${day.focus})\n`;
    if (day.isRestDay) {
      md += `*Rest / Active Recovery*: ${day.restDayActivity || 'Gentle walking or stretching.'}\n\n`;
      return;
    }

    md += `*Estimated Duration:* ${day.estimatedDurationMinutes} minutes\n\n`;
    md += `**Warm-up (${day.warmup.durationMinutes} min):**\n`;
    day.warmup.items.forEach((w) => {
      md += `- ${w.name} (${w.durationOrReps}): ${w.instructions}\n`;
    });
    md += `\n**Exercises:**\n`;
    day.exercises.forEach((ex, idx) => {
      md += `${idx + 1}. **${ex.name}**\n`;
      md += `   - Target: ${ex.targetMuscles.join(', ')}\n`;
      md += `   - Sets & Reps: ${ex.sets} sets × ${ex.reps} (Rest: ${ex.restSeconds}s)\n`;
      if (ex.tempo) md += `   - Tempo: ${ex.tempo}\n`;
      md += `   - Form Cues: ${ex.formCues.join('; ')}\n`;
      md += `   - Alternative: ${ex.substitutionAlternative}\n`;
    });
    md += `\n**Cool-down (${day.cooldown.durationMinutes} min):**\n`;
    day.cooldown.items.forEach((c) => {
      md += `- ${c.name} (${c.durationOrReps}): ${c.instructions}\n`;
    });
    md += `\n---\n\n`;
  });

  md += `## 4-Week Progression Rule\n`;
  md += `- ${plan.progressionPlan.rule}\n`;
  md += `- Weeks 1-2: ${plan.progressionPlan.week1to2Focus}\n`;
  md += `- Weeks 3-4: ${plan.progressionPlan.week3to4Focus}\n`;
  md += `- Deload Guidance: ${plan.progressionPlan.deloadGuidance}\n\n`;

  md += `## Coach's Words\n> "${plan.coachQuote}"\n`;

  return md;
}
