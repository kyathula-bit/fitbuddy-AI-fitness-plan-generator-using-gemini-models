import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json({ limit: '10mb' }));

// Shared server-side Gemini client utility
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey: apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper to call Gemini with retry on transient 503/429
async function generateContentWithRetry(params: any, retries = 2, delayMs = 1200): Promise<any> {
  try {
    return await ai.models.generateContent(params);
  } catch (err: any) {
    const errorStr = err?.message || JSON.stringify(err);
    const isTransient =
      errorStr.includes('503') ||
      errorStr.includes('high demand') ||
      errorStr.includes('RESOURCE_EXHAUSTED') ||
      errorStr.includes('UNAVAILABLE') ||
      errorStr.includes('429');

    if (retries > 0 && isTransient) {
      console.warn(`Gemini transient error (${errorStr.slice(0, 80)}). Retrying in ${delayMs}ms...`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
      return generateContentWithRetry(params, retries - 1, delayMs * 1.5);
    }
    throw err;
  }
}

function calculateBaselines(profile: any) {
  const { age, gender, heightCm, weightKg, activityLevel, fitnessGoal } = profile;

  // BMI = weight(kg) / (height(m))^2
  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let bmiCategory = 'Normal weight';
  if (bmi < 18.5) bmiCategory = 'Underweight';
  else if (bmi < 25) bmiCategory = 'Normal weight';
  else if (bmi < 30) bmiCategory = 'Overweight';
  else bmiCategory = 'Obese';

  // Mifflin-St Jeor formula
  let bmr = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'female') {
    bmr -= 161;
  } else {
    bmr += 5;
  }
  bmr = Math.round(bmr);

  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    athlete: 1.9,
  };
  const multiplier = activityMultipliers[activityLevel] || 1.375;
  const tdee = Math.round(bmr * multiplier);

  let targetCalories = tdee;
  let calorieGoalType: 'deficit' | 'maintenance' | 'surplus' = 'maintenance';

  if (fitnessGoal === 'fat_loss' || fitnessGoal === 'weight_loss') {
    targetCalories = Math.round(tdee - 500); // safe 500 kcal deficit
    calorieGoalType = 'deficit';
  } else if (fitnessGoal === 'muscle_building' || fitnessGoal === 'muscle_gain' || fitnessGoal === 'strength') {
    targetCalories = Math.round(tdee + 300); // clean surplus
    calorieGoalType = 'surplus';
  } else {
    // flexibility, general_fitness, general_health, endurance, athletic_performance: maintenance
    calorieGoalType = 'maintenance';
  }

  // Protein targets based on fitness goal
  let proteinPerKg = 1.8;
  if (fitnessGoal === 'muscle_building' || fitnessGoal === 'muscle_gain' || fitnessGoal === 'strength') {
    proteinPerKg = 2.0;
  } else if (fitnessGoal === 'fat_loss' || fitnessGoal === 'weight_loss') {
    proteinPerKg = 2.2; // preserve lean mass in deficit
  } else if (fitnessGoal === 'flexibility') {
    proteinPerKg = 1.7; // connective tissue repair
  }


  const proteinGrams = Math.round(weightKg * proteinPerKg);
  const proteinCals = proteinGrams * 4;

  // Fats ~25% of calories
  const fatCals = targetCalories * 0.25;
  const fatsGrams = Math.round(fatCals / 9);

  // Remaining calories to carbs
  const carbCals = Math.max(0, targetCalories - (proteinCals + fatCals));
  const carbsGrams = Math.round(carbCals / 4);

  return {
    bmi,
    bmiCategory,
    estimatedBmr: bmr,
    estimatedTdee: tdee,
    recommendedDailyCalories: targetCalories,
    calorieGoalType,
    macroSplit: {
      proteinGrams,
      carbsGrams,
      fatsGrams,
      rationale: `Targeting ${proteinPerKg}g protein per kg of bodyweight to preserve/build muscle, with balanced complex carbohydrates for workout performance and healthy fats for hormonal support.`,
    },
  };
}

// Generate Personalized Fitness Plan API
app.post(['/api/fitness-plan/generate', '/api/fitness-plan/regenerate'], async (req, res) => {
  try {
    const profile = req.body.profile || req.body;
    const feedback = typeof req.body.feedback === 'string' ? req.body.feedback.trim() : '';
    const currentPlan = req.body.currentPlan || null;

    if (!profile || !profile.age || !profile.heightCm || !profile.weightKg) {
      return res.status(400).json({ error: 'Missing required user profile fields.' });
    }

    const baselines = calculateBaselines(profile);

    const prompt = `
You are FitBuddy, a world-class elite certified personal trainer (CSCS) and sports nutritionist.
Generate an in-depth, completely customized, professional fitness and workout plan tailored to the user profile below.

USER PROFILE:
- Athlete Name: ${profile.name || 'Athlete'}
- Age: ${profile.age} years old
- Gender: ${profile.gender}
- Height: ${profile.heightCm} cm (${profile.heightUnit === 'ft' ? 'Imperial preference' : 'Metric'})
- Weight: ${profile.weightKg} kg (${profile.weightUnit === 'lbs' ? 'Imperial preference' : 'Metric'})
- Fitness Goal: ${profile.fitnessGoal}
- Activity Level: ${profile.activityLevel}
- Workout Experience: ${profile.workoutExperience}
- Workout Intensity: ${profile.workoutIntensity || 'moderate'} (low: RPE 5-6 sustainable, moderate: RPE 7-8 progressive sweet spot, high: RPE 8.5-9 heavy power, extreme: RPE 9.5-10 technical failure)
- Available Workout Days: ${profile.availableWorkoutDays} days per week
- Preferred Specific Days: ${Array.isArray(profile.preferredDays) && profile.preferredDays.length > 0 ? profile.preferredDays.join(', ') : 'Flexible'}
- Preferred Workout Type: ${profile.preferredWorkoutType}
- Available Equipment: ${profile.availableEquipment}
- Target Workout Session Duration: ${profile.workoutDurationMinutes || 45} minutes
- Injury / Health Limitations: ${profile.limitationsOrInjuries || 'None reported'}
- Dietary Preference: ${profile.dietaryPreference || 'Flexible / Omnivore'}

COMPUTED PHYSIOLOGICAL BASELINES:
- BMI: ${baselines.bmi} (${baselines.bmiCategory})
- Estimated BMR: ${baselines.estimatedBmr} kcal
- Estimated TDEE: ${baselines.estimatedTdee} kcal
- Calorie Target: ${baselines.recommendedDailyCalories} kcal (${baselines.calorieGoalType})
- Target Macros: ${baselines.macroSplit.proteinGrams}g Protein, ${baselines.macroSplit.carbsGrams}g Carbs, ${baselines.macroSplit.fatsGrams}g Fats
${
  feedback
    ? `
CRITICAL ATHLETE FEEDBACK FOR PLAN REGENERATION:
The user reviewed their current plan (${currentPlan?.planTitle || 'Current Plan'}) and submitted this specific feedback for regeneration:
"${feedback}"

MANDATORY INSTRUCTIONS FOR REGENERATING BASED ON FEEDBACK:
1. Directly modify and adapt the workout programming to resolve the user's feedback.
2. If they report discomfort or pain in certain areas (e.g. knees, lower back, shoulders), substitute with low-impact or pain-free alternative exercises and emphasize corrective cues.
3. If they asked to alter session length, intensity, or target specific body parts (e.g. "more arms and core", "shorter 30m workouts"), adjust exercise selection and volume accordingly.
4. In the executiveSummary and tagline, explicitly mention how you adapted the plan to their feedback.
`
    : ''
}
INSTRUCTIONS:
1. Personalize the plan title: ${profile.name ? `Incorporate the athlete's name "${profile.name}" into the planTitle (e.g. "${profile.name}'s Kinetic Hypertrophy Split").` : ''}
2. Strictly calibrate exercise sets, rep schemes, rest durations, and RPE cues to their selected workout intensity: "${profile.workoutIntensity || 'moderate'}".
3. Tailor the programming strictly to their fitness goal:
   - "weight_loss" / "fat_loss": Prescribe high-density compound circuits, supersets, metabolic conditioning, 10–15 reps with short rest intervals (45–60s), and a calibrated deficit.
   - "muscle_gain" / "muscle_building": Prescribe hypertrophy-focused progressive overload, mechanical tension, 8–12 reps with controlled eccentrics (3-1-1-0 tempo), 60–90s rest, and a caloric surplus.
   - "flexibility": Prescribe dynamic joint mobility flows, active end-range strength, PNF stretching holds, thoracic spine decompression, deep hip openers, and restorative breathing protocols.
   - "general_fitness" / "general_health": Prescribe a well-rounded balance of full-body functional compound movements, core stabilization, aerobic conditioning intervals, and posture alignment.
4. Strictly obey the available equipment constraint (${profile.availableEquipment}). If "bodyweight_only", DO NOT prescribe dumbbells or barbells. If "dumbbells_only", only use dumbbells and bodyweight.
5. Account carefully for any limitations: "${profile.limitationsOrInjuries || 'None'}". Provide safe joint angles, proper cues, and low-impact modifications if needed.
6. Construct exactly ${profile.availableWorkoutDays} workout days (plus clearly marked rest/active recovery days to complete a full 7-day schedule).
7. For each workout day:
   - Dynamic Warm-up (3-4 items with durations/reps, instructions)
   - 4 to 6 main exercises suited to the session duration (${profile.workoutDurationMinutes || 45} mins).
   - For each exercise: Exact sets, target rep range or time, rest interval (in seconds), tempo (e.g., "3-0-1-0"), clear actionable form cues, safety tips, equipment required, and a practical alternative/substitution.
   - Cooldown & Mobility (3-4 targeted stretches with hold times).
8. Progressive overload strategy: provide concrete steps for weeks 1-4.
9. Tailor nutrition guidance to their dietary preference (${profile.dietaryPreference}) and calorie goal (${baselines.recommendedDailyCalories} kcal). Provide 3-4 realistic sample meals with protein counts.
10. Return valid JSON strictly matching the provided schema.
`;




    let parsedPlan: any = null;

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          systemInstruction:
            'You are FitBuddy, an elite certified exercise physiologist and nutritionist providing evidence-based, inspiring, safe, and actionable workout and fitness plans.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              planTitle: { type: Type.STRING },
              tagline: { type: Type.STRING },
              executiveSummary: { type: Type.STRING },
              weeklyOverview: {
                type: Type.OBJECT,
                properties: {
                  splitName: { type: Type.STRING },
                  daysCount: { type: Type.INTEGER },
                  frequencyNote: { type: Type.STRING },
                  intensityLevel: { type: Type.STRING },
                },
                required: ['splitName', 'daysCount', 'frequencyNote', 'intensityLevel'],
              },
              schedule: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayNumber: { type: Type.INTEGER },
                    dayName: { type: Type.STRING },
                    focus: { type: Type.STRING },
                    isRestDay: { type: Type.BOOLEAN },
                    restDayActivity: { type: Type.STRING },
                    estimatedDurationMinutes: { type: Type.INTEGER },
                    warmup: {
                      type: Type.OBJECT,
                      properties: {
                        durationMinutes: { type: Type.INTEGER },
                        items: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              targetArea: { type: Type.STRING },
                              durationOrReps: { type: Type.STRING },
                              instructions: { type: Type.STRING },
                            },
                            required: ['name', 'targetArea', 'durationOrReps', 'instructions'],
                          },
                        },
                      },
                      required: ['durationMinutes', 'items'],
                    },
                    exercises: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          name: { type: Type.STRING },
                          targetMuscles: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          sets: { type: Type.INTEGER },
                          reps: { type: Type.STRING },
                          restSeconds: { type: Type.INTEGER },
                          tempo: { type: Type.STRING },
                          formCues: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                          equipmentRequired: { type: Type.STRING },
                          substitutionAlternative: { type: Type.STRING },
                          difficulty: { type: Type.STRING },
                          instructions: { type: Type.STRING },
                        },
                        required: [
                          'id',
                          'name',
                          'targetMuscles',
                          'sets',
                          'reps',
                          'restSeconds',
                          'formCues',
                          'equipmentRequired',
                          'substitutionAlternative',
                          'difficulty',
                        ],
                      },
                    },
                    cooldown: {
                      type: Type.OBJECT,
                      properties: {
                        durationMinutes: { type: Type.INTEGER },
                        items: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              name: { type: Type.STRING },
                              targetArea: { type: Type.STRING },
                              durationOrReps: { type: Type.STRING },
                              instructions: { type: Type.STRING },
                            },
                            required: ['name', 'targetArea', 'durationOrReps', 'instructions'],
                          },
                        },
                      },
                      required: ['durationMinutes', 'items'],
                    },
                  },
                  required: [
                    'dayNumber',
                    'dayName',
                    'focus',
                    'isRestDay',
                    'estimatedDurationMinutes',
                    'warmup',
                    'exercises',
                    'cooldown',
                  ],
                },
              },
              progressionPlan: {
                type: Type.OBJECT,
                properties: {
                  rule: { type: Type.STRING },
                  week1to2Focus: { type: Type.STRING },
                  week3to4Focus: { type: Type.STRING },
                  deloadGuidance: { type: Type.STRING },
                },
                required: ['rule', 'week1to2Focus', 'week3to4Focus', 'deloadGuidance'],
              },
              nutritionGuidance: {
                type: Type.OBJECT,
                properties: {
                  dailyWaterLiters: { type: Type.NUMBER },
                  preWorkoutFuel: { type: Type.STRING },
                  postWorkoutFuel: { type: Type.STRING },
                  sampleMeals: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        mealType: { type: Type.STRING },
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        estimatedCalories: { type: Type.INTEGER },
                        proteinGrams: { type: Type.INTEGER },
                      },
                      required: ['mealType', 'title', 'description', 'estimatedCalories', 'proteinGrams'],
                    },
                  },
                  tips: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                },
                required: ['dailyWaterLiters', 'preWorkoutFuel', 'postWorkoutFuel', 'sampleMeals', 'tips'],
              },
              recoveryProtocol: {
                type: Type.OBJECT,
                properties: {
                  sleepTargetHours: { type: Type.STRING },
                  activeRecoveryNotes: { type: Type.STRING },
                  injuryPreventionNotes: { type: Type.STRING },
                },
                required: ['sleepTargetHours', 'activeRecoveryNotes', 'injuryPreventionNotes'],
              },
              coachQuote: { type: Type.STRING },
            },
            required: [
              'planTitle',
              'tagline',
              'executiveSummary',
              'weeklyOverview',
              'schedule',
              'progressionPlan',
              'nutritionGuidance',
              'recoveryProtocol',
              'coachQuote',
            ],
          },
        },
      });

      parsedPlan = JSON.parse(response.text || '{}');
    } catch (apiErr: any) {
      console.warn('Gemini generateContent error; falling back to dynamic plan synthesizer:', apiErr?.message);
      // Construct dynamic customized fallback plan tailored to user inputs
      const goalTitles: Record<string, string> = {
        weight_loss: 'Metabolic Weight Loss & Fat Incineration',
        muscle_gain: 'Hypertrophy Power & Muscle Architecture',
        flexibility: 'Full-Body Flexibility, Mobility & Joint Decompression',
        general_fitness: 'Total-Body General Fitness & Longevity',
        fat_loss: 'Metabolic Fat Incinerator & Conditioning',
        muscle_building: 'Hypertrophy Power & Muscle Architecture',
        strength: 'Pure Kinetic Strength & Force Split',
        toning_mobility: 'Functional Tone, Core & Joint Mobility',
        endurance: 'Cardiovascular Stamina & Aerobic Engine',
        athletic_performance: 'Elite Athletic Power & Speed Hybrid',
        general_health: 'Longevity, Vitality & Structural Health',
      };

      const daysCount = profile.availableWorkoutDays || 4;
      const equip = (profile.availableEquipment || 'dumbbells_only').replace('_', ' ');
      const isFlexibility = profile.fitnessGoal === 'flexibility';

      const scheduleDays = [];
      for (let i = 1; i <= 7; i++) {
        const isRest = i > daysCount;
        if (isRest) {
          scheduleDays.push({
            dayNumber: i,
            dayName: `Day ${i}: Strategic Rest & Parasympathetic Reset`,
            focus: 'Tissue Repair & Mobility',
            isRestDay: true,
            restDayActivity: '30-40 min light outdoor walking in Zone 2 + full body dynamic mobility and hydration.',
            estimatedDurationMinutes: 0,
            warmup: { durationMinutes: 0, items: [] },
            exercises: [],
            cooldown: { durationMinutes: 0, items: [] },
          });
        } else if (isFlexibility) {
          scheduleDays.push({
            dayNumber: i,
            dayName: `Day ${i}: ${i % 2 === 1 ? 'Posterior Chain & Spinal Mobility Flow' : 'Hips, Pelvic Floor & Thoracic Openers'}`,
            focus: i % 2 === 1 ? 'Hamstrings, Calves, Thoracic Spine & Decompression' : 'Hip Flexors, Glutes, Scapulae & Chest Expansion',
            isRestDay: false,
            estimatedDurationMinutes: profile.workoutDurationMinutes || 35,
            warmup: {
              durationMinutes: 5,
              items: [
                {
                  name: 'Cat-Cow Spinal Waves',
                  targetArea: 'Spine & Core',
                  durationOrReps: '10 cycles',
                  instructions: 'Slowly inhale arching back, exhale rounding spine fully.',
                },
                {
                  name: 'Scapular Wall Slides',
                  targetArea: 'Rotator Cuff & Mid-Back',
                  durationOrReps: '8 controlled reps',
                  instructions: 'Keep elbows and wrists flat against wall while sliding upward.',
                },
              ],
            },
            exercises: [
              {
                id: `ex-${i}-1`,
                name: "World's Greatest Stretch & Thoracic Reach",
                targetMuscles: ['Hip Flexors', 'Thoracic Spine', 'Hamstrings'],
                sets: 3,
                reps: '6 – 8 reps per side',
                restSeconds: 45,
                tempo: '3-2-2-0',
                formCues: ['Lunge deeply, drop elbow toward front instep, rotate arm vertically toward ceiling.'],
                equipmentRequired: 'Yoga Mat / Bodyweight',
                substitutionAlternative: 'Lizard pose with gentle pulse',
                difficulty: 'beginner',
              },
              {
                id: `ex-${i}-2`,
                name: '90/90 Hip Internal/External Rotation Transitions',
                targetMuscles: ['Glute Medius', 'Hip Capsule', 'Piriformis'],
                sets: 3,
                reps: '10 switches with 3s hold',
                restSeconds: 45,
                tempo: '3-3-1-0',
                formCues: ['Sit tall without hands if possible, rotate both knees smoothly across center.'],
                equipmentRequired: 'Yoga Mat / Bodyweight',
                substitutionAlternative: 'Pigeon stretch on yoga block',
                difficulty: 'intermediate',
              },
              {
                id: `ex-${i}-3`,
                name: 'Loaded Jefferson Curls / Romanian Mobility Hinge',
                targetMuscles: ['Spinal Erectors', 'Hamstrings', 'Posterior Fascia'],
                sets: 3,
                reps: '8 slow reps',
                restSeconds: 60,
                tempo: '4-2-2-0',
                formCues: ['Segmentally roll vertebrae by vertebrae downward, relaxing neck at bottom.'],
                equipmentRequired: equip.includes('bodyweight') ? 'Bodyweight' : 'Light Dumbbell (5-10kg)',
                substitutionAlternative: 'Seated forward fold with strap',
                difficulty: 'intermediate',
              },
              {
                id: `ex-${i}-4`,
                name: 'Couch Stretch with PNF Isometric Glute Squeeze',
                targetMuscles: ['Psoas', 'Rectus Femoris', 'Hip Capsule'],
                sets: 3,
                reps: '45s hold per leg',
                restSeconds: 45,
                tempo: 'Static Hold',
                formCues: ['Back knee close to wall/couch, engage glute firmly to drive hip forward.'],
                equipmentRequired: 'Wall or Chair / Mat',
                substitutionAlternative: 'Half-kneeling hip flexor reach',
                difficulty: 'beginner',
              },
            ],
            cooldown: {
              durationMinutes: 5,
              items: [
                {
                  name: 'Supine Spinal Twist & Diaphragmatic Breathing',
                  targetArea: 'Lower Spine & Obliques',
                  durationOrReps: '60s per side',
                  instructions: 'Extend arms in T-shape, drop knees to one side, inhale for 4s, exhale for 6s.',
                },
                {
                  name: 'Supported Corpse Pose / Legs-Up-The-Wall',
                  targetArea: 'Systemic Nervous System',
                  durationOrReps: '2 minutes',
                  instructions: 'Rest feet on wall or chair, close eyes, release all muscular tension.',
                },
              ],
            },
          });
        } else {

          scheduleDays.push({
            dayNumber: i,
            dayName: `Day ${i}: ${i % 2 === 1 ? 'Upper Body Kinetic Force' : 'Lower Body & Core Hypertrophy'}`,
            focus: i % 2 === 1 ? 'Chest, Back, Shoulders & Arms' : 'Quadriceps, Hamstrings, Glutes & Core',
            isRestDay: false,
            estimatedDurationMinutes: profile.workoutDurationMinutes || 45,
            warmup: {
              durationMinutes: 6,
              items: [
                {
                  name: 'Dynamic Joint Rotations & Arm Swings',
                  targetArea: 'Scapulae & Rotator Cuff',
                  durationOrReps: '10 reps each direction',
                  instructions: 'Controlled full range of motion circles.',
                },
                {
                  name: 'Inchworm to Plank Walkout',
                  targetArea: 'Core & Hamstrings',
                  durationOrReps: '6 reps',
                  instructions: 'Hinge forward, walk hands out to high plank, engage glutes, walk back.',
                },
              ],
            },
            exercises: [
              {
                id: `ex-${i}-1`,
                name: i % 2 === 1 ? `${equip.includes('bodyweight') ? 'Tempo Push-Ups' : 'Dumbbell Bench Press'}` : `${equip.includes('bodyweight') ? 'Air Squats with 3s Pause' : 'Goblet Squats'}`,
                targetMuscles: i % 2 === 1 ? ['Pectoralis Major', 'Triceps', 'Anterior Delts'] : ['Quadriceps', 'Glutes'],
                sets: 4,
                reps: '8 – 12 reps',
                restSeconds: 75,
                tempo: '3-0-1-0',
                formCues: ['Maintain braced core', 'Controlled 3-second descent', 'Drive up smoothly with intent'],
                equipmentRequired: equip,
                substitutionAlternative: 'Floor press or pause push-ups',
                difficulty: 'intermediate',
              },
              {
                id: `ex-${i}-2`,
                name: i % 2 === 1 ? `${equip.includes('bodyweight') ? 'Inverted Table Rows / Doorway Rows' : 'Bent-Over Dumbbell Rows'}` : `${equip.includes('bodyweight') ? 'Single-Leg Romanian Deadlift' : 'Dumbbell Romanian Deadlift'}`,
                targetMuscles: i % 2 === 1 ? ['Latissimus Dorsi', 'Rhomboids', 'Biceps'] : ['Hamstrings', 'Glutes'],
                sets: 4,
                reps: '10 – 12 reps',
                restSeconds: 75,
                tempo: '2-1-1-1',
                formCues: ['Hinge at the hips with flat spine', 'Pull with elbows, not hands', 'Hold squeeze at peak'],
                equipmentRequired: equip,
                substitutionAlternative: 'Band pull-aparts or supermans',
                difficulty: 'intermediate',
              },
              {
                id: `ex-${i}-3`,
                name: i % 2 === 1 ? `${equip.includes('bodyweight') ? 'Pike Push-Ups' : 'Overhead Dumbbell Press'}` : `${equip.includes('bodyweight') ? 'Walking Lunges' : 'Dumbbell Bulgarian Split Squats'}`,
                targetMuscles: i % 2 === 1 ? ['Deltoids', 'Triceps'] : ['Quadriceps', 'Glute Medius'],
                sets: 3,
                reps: '10 – 12 reps',
                restSeconds: 60,
                tempo: '2-0-1-0',
                formCues: ['Avoid arching lower back', 'Keep elbows at 45 degrees', 'Press smoothly overhead'],
                equipmentRequired: equip,
                substitutionAlternative: 'Lateral shoulder raises or reverse lunges',
                difficulty: 'intermediate',
              },
              {
                id: `ex-${i}-4`,
                name: i % 2 === 1 ? 'Close-Grip Push-Ups / Diamond Press' : 'Hanging Knee Raises / Deadbugs',
                targetMuscles: i % 2 === 1 ? ['Triceps', 'Chest'] : ['Rectus Abdominis', 'Transverse Core'],
                sets: 3,
                reps: '12 – 15 reps',
                restSeconds: 60,
                tempo: '2-0-1-0',
                formCues: ['Keep elbows tucked', 'Full range of motion', 'Breathe out on exertion'],
                equipmentRequired: 'Bodyweight / Mat',
                substitutionAlternative: 'Plank shoulder taps',
                difficulty: 'intermediate',
              },
            ],
            cooldown: {
              durationMinutes: 5,
              items: [
                {
                  name: 'Child Pose with Deep Breathing',
                  targetArea: 'Spine & Lats',
                  durationOrReps: '60s hold',
                  instructions: 'Sink hips back onto heels, reach fingertips forward.',
                },
                {
                  name: 'Hip Flexor / Quad Stretch',
                  targetArea: 'Hip Flexors',
                  durationOrReps: '40s per side',
                  instructions: 'Kneel upright, gently tuck pelvis under until stretch is felt.',
                },
              ],
            },
          });
        }
      }

      const athletePrefix = profile.name ? `${profile.name}'s ` : '';
      const intensityLabels: Record<string, string> = {
        low: 'Low Intensity • RPE 5–6 (Sustainable & Form-focused)',
        moderate: 'Moderate Intensity • RPE 7–8 (Progressive Overload)',
        high: 'High Intensity • RPE 8.5–9 (Heavy Drive & Power)',
        extreme: 'Extreme Intensity • RPE 9.5–10 (Peak Athletic Threshold)',
      };

      parsedPlan = {
        planTitle: `${athletePrefix}${goalTitles[profile.fitnessGoal] || 'Customized Kinetic Fitness Plan'}`,
        tagline: `Evidence-based ${daysCount}-Day ${equip} Routine (${profile.workoutIntensity || 'moderate'} intensity) Tailored by FitBuddy AI`,
        executiveSummary: `Constructed specifically for ${profile.name ? profile.name + ', a ' : 'a '}${profile.age}-year-old athlete with ${profile.workoutExperience} training experience focusing on ${profile.fitnessGoal.replace('_', ' ')} at ${profile.workoutIntensity || 'moderate'} intensity. Prescribes evidence-based progressive overload, volume calibration, and structured nutrition to accelerate results safely.`,
        weeklyOverview: {
          splitName: `${daysCount}-Day ${profile.preferredWorkoutType.replace('_', ' ').toUpperCase()} Split`,
          daysCount: daysCount,
          frequencyNote: `${daysCount} training days with dedicated recovery intervals.`,
          intensityLevel: intensityLabels[profile.workoutIntensity || 'moderate'] || 'RPE 7.5 – 8.5 (1 to 2 reps in reserve)',
        },

        schedule: scheduleDays,
        progressionPlan: {
          rule: 'Double Progression Rule: Once you can complete all target sets and reps with textbook form, add 2.5kg (or 1-2 reps for bodyweight) the following week.',
          week1to2Focus: 'Dial in movement patterns, master tempos, and establish consistent baseline weights.',
          week3to4Focus: 'Progressively increase load or density while maintaining strict joint alignment.',
          deloadGuidance: 'Reduce volume by 40% every 5th or 6th week to facilitate neural and connective tissue repair.',
        },
        nutritionGuidance: {
          dailyWaterLiters: 3.0,
          preWorkoutFuel: 'Easily digestible carbohydrates (e.g. banana, oatmeal) with 20g protein 60 minutes before training.',
          postWorkoutFuel: 'High-protein meal with complex carbs and electrolytes within 45 minutes of workout completion.',
          sampleMeals: [
            {
              mealType: 'Breakfast',
              title: 'Protein Oatmeal with Berries & Nuts',
              description: 'Rolled oats cooked with protein powder, chia seeds, and fresh berries.',
              estimatedCalories: 520,
              proteinGrams: 38,
            },
            {
              mealType: 'Lunch',
              title: 'Grilled Protein Rice & Veggie Bowl',
              description: 'Lean chicken, tofu, or fish with jasmine rice, avocado, and steamed broccoli.',
              estimatedCalories: 680,
              proteinGrams: 46,
            },
            {
              mealType: 'Dinner',
              title: 'Roasted Salmon or Tempeh with Sweet Potato',
              description: 'Herb-seasoned protein with roasted sweet potatoes and asparagus.',
              estimatedCalories: 620,
              proteinGrams: 42,
            },
          ],
          tips: [
            'Target 1.6 to 2.2 grams of protein per kilogram of bodyweight.',
            'Maintain consistent hydration throughout the day, not just during training.',
            'Aim for 7 to 8.5 hours of quality sleep to optimize muscle protein synthesis.',
          ],
        },
        recoveryProtocol: {
          sleepTargetHours: '7.5 – 8.5 hours',
          activeRecoveryNotes: 'Incorporate 7,000 to 10,000 daily steps and 15 minutes of gentle mobility.',
          injuryPreventionNotes: `Warm up thoroughly. Respect joint feedback: ${profile.limitationsOrInjuries || 'Train within pain-free active ranges.'}`,
        },
        coachQuote: 'Excellence is not an accident—it is the direct result of consistent, focused execution repeated day after day.',
      };
    }


    // Combine generated output with computed baseline metrics and ID
    const prevFeedbackHistory = Array.isArray(currentPlan?.feedbackHistory)
      ? currentPlan.feedbackHistory
      : [];
    const feedbackHistory = feedback
      ? [...prevFeedbackHistory, { feedback, timestamp: new Date().toISOString() }]
      : prevFeedbackHistory;

    const fullPlan = {
      id: `fitbuddy-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      ...parsedPlan,
      userProfile: profile,
      metricsAnalysis: baselines,
      latestFeedbackApplied: feedback || currentPlan?.latestFeedbackApplied || undefined,
      feedbackHistory: feedbackHistory.length > 0 ? feedbackHistory : undefined,
    };


    return res.json(fullPlan);
  } catch (error: any) {
    console.error('Error generating fitness plan:', error);
    return res.status(500).json({
      error: error.message || 'Failed to generate fitness plan. Please check inputs and try again.',
    });
  }
});

// Interactive AI Coach advice / customization endpoint
app.post('/api/fitness-plan/coach-advice', async (req, res) => {
  try {
    const { question, currentPlan, exerciseContext } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required.' });
    }

    const contextBrief = currentPlan
      ? `Current Plan: ${currentPlan.planTitle}, Goal: ${currentPlan.userProfile?.fitnessGoal}, Equipment: ${currentPlan.userProfile?.availableEquipment}, Limitations: ${currentPlan.userProfile?.limitationsOrInjuries || 'None'}`
      : 'General fitness context';

    const exerciseDetail = exerciseContext ? `\nFocused on Exercise: ${JSON.stringify(exerciseContext)}` : '';

    const prompt = `
You are the FitBuddy AI Personal Coach.
Context:
${contextBrief}
${exerciseDetail}

User question / request:
"${question}"

Provide a concise, encouraging, and technically precise answer. If the user is asking to swap an exercise, explain the alternative, why it fits, and how to perform it safely. If asking about form, give 3 bullet cues. Keep response under 200 words.
`;

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      return res.json({ reply: response.text });
    } catch (apiErr) {
      // Smart sports-science coaching fallback if upstream is busy
      let fallback = `Great question! When training with your current focus, remember: 1) Master the eccentric (lowering) tempo under control; 2) Maintain core bracing and neutral spine on all compound movements; 3) Apply progressive overload incrementally by adding either 1 rep or modest weight once you can perform all sets with textbook form.`;
      if (question.toLowerCase().includes('swap') || question.toLowerCase().includes('alternative')) {
        fallback = `You can substitute this movement with a biomechanically equivalent exercise using your available equipment. Focus on matching the primary muscle group and joint angle (e.g. dumbbell floor press instead of bench press, or goblet squats instead of barbell squats). Keep sets and rep targets consistent!`;
      } else if (question.toLowerCase().includes('sore') || question.toLowerCase().includes('rest')) {
        fallback = `Delayed Onset Muscle Soreness (DOMS) is normal, especially during new routines. If soreness is mild, light active recovery (a 30-min walk, gentle mobility) promotes blood flow and recovery. If sharp joint pain occurs, rest that area and prioritize sleep and hydration!`;
      }
      return res.json({ reply: fallback });
    }
  } catch (error: any) {
    console.error('Error in coach advice:', error);
    return res.status(500).json({ error: error.message || 'Failed to get coach advice.' });
  }
});

// Exercise Form Deep-Dive endpoint
app.post('/api/fitness-plan/exercise-details', async (req, res) => {
  try {
    const { exerciseName, targetMuscles, equipment } = req.body;
    if (!exerciseName) {
      return res.status(400).json({ error: 'Exercise name is required.' });
    }

    const prompt = `
As FitBuddy's biomechanics coach, provide an in-depth breakdown for "${exerciseName}" using equipment: ${equipment || 'standard'}.
Muscles targeted: ${targetMuscles ? targetMuscles.join(', ') : 'primary'}.

Return JSON with:
- setup: string
- executionSteps: string[] (3-5 steps)
- commonMistakes: string[] (2-3 mistakes to avoid)
- breathingTechnique: string
- progressionTips: string
`;

    try {
      const response = await generateContentWithRetry({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              setup: { type: Type.STRING },
              executionSteps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              commonMistakes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
              breathingTechnique: { type: Type.STRING },
              progressionTips: { type: Type.STRING },
            },
            required: ['setup', 'executionSteps', 'commonMistakes', 'breathingTechnique', 'progressionTips'],
          },
        },
      });

      return res.json(JSON.parse(response.text || '{}'));
    } catch (apiErr) {
      // Biomechanics fallback
      return res.json({
        setup: `Set your foundation: establish a shoulder-width stance, pack your lats, pull shoulder blades back and down, and brace your abdominal core as if preparing for a cough.`,
        executionSteps: [
          `Initiate movement by controlling the eccentric phase with a 3-second descent.`,
          `Pause briefly for 1 second at the bottom position without losing muscular tension.`,
          `Drive through your prime movers dynamically to return to the starting position without locking out joints abruptly.`,
          `Maintain continuous tension on the target musculature throughout the entire set.`,
        ],
        commonMistakes: [
          `Allowing momentum to replace deliberate muscular contraction.`,
          `Breaking spinal alignment or hyperextending the lower back.`,
          `Rushing through the eccentric phase.`,
        ],
        breathingTechnique: `Inhale diaphragmatically into your belly during the eccentric (lowering) phase, brace your core, and exhale forcefully through pursed lips on the concentric exertion.`,
        progressionTips: `Focus first on adding reps up to the target ceiling before increasing load. Once you achieve all sets cleanly, add 2.5kg or incorporate 2-second isometric pauses.`,
      });
    }
  } catch (error: any) {
    console.error('Error fetching exercise details:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch exercise details.' });
  }
});


// Setup Vite dev server or serve production build
async function setupServer() {
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FitBuddy server listening on port ${PORT}`);
  });
}

setupServer();
