import React, { useState, useEffect } from 'react';
import {
  UserFitnessProfile,
  FitnessGoal,
  ActivityLevel,
  WorkoutExperience,
  WorkoutIntensity,
  PreferredWorkoutType,
  AvailableEquipment,
  DietaryPreference,
  Gender,
} from '../types/fitness';
import {
  calculateBmi,
  cmToFeetInches,
  feetInchesToCm,
  kgToLbs,
  lbsToKg,
  PRESET_TEMPLATES,
  PresetTemplate,
} from '../utils/fitnessCalculations';
import {
  Flame,
  Dumbbell,
  ShieldCheck,
  HeartPulse,
  Activity,
  Award,
  Sparkles,
  Calendar,
  Clock,
  Layers,
  Utensils,
  AlertTriangle,
  ArrowRight,
  Zap,
  User,
  Gauge,
} from 'lucide-react';

interface ProfileFormProps {
  initialProfile: UserFitnessProfile;
  unitSystem: 'metric' | 'imperial';
  onSubmit: (profile: UserFitnessProfile) => void;
  isLoading: boolean;
  onSelectPreset: (preset: PresetTemplate) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  initialProfile,
  unitSystem,
  onSubmit,
  isLoading,
  onSelectPreset,
}) => {
  const [profile, setProfile] = useState<UserFitnessProfile>(initialProfile);

  // Sync state if initialProfile changes (e.g. from preset selection)
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  // Derived BMI & calculations
  const { bmi, category: bmiCategory } = calculateBmi(profile.weightKg, profile.heightCm);

  // Height and weight imperial/metric conversions for display
  const feetInches = cmToFeetInches(profile.heightCm);
  const weightLbs = kgToLbs(profile.weightKg);

  const handleHeightFtChange = (feet: number, inches: number) => {
    const cm = feetInchesToCm(feet, inches);
    setProfile((prev) => ({ ...prev, heightCm: cm, heightUnit: 'ft' }));
  };

  const handleHeightCmChange = (cm: number) => {
    setProfile((prev) => ({ ...prev, heightCm: cm, heightUnit: 'cm' }));
  };

  const handleWeightLbsChange = (lbs: number) => {
    const kg = lbsToKg(lbs);
    setProfile((prev) => ({ ...prev, weightKg: kg, weightUnit: 'lbs' }));
  };

  const handleWeightKgChange = (kg: number) => {
    setProfile((prev) => ({ ...prev, weightKg: kg, weightUnit: 'kg' }));
  };

  const toggleDay = (day: string) => {
    setProfile((prev) => {
      const exists = prev.preferredDays.includes(day);
      let updated: string[];
      if (exists) {
        updated = prev.preferredDays.filter((d) => d !== day);
      } else {
        updated = [...prev.preferredDays, day];
      }
      return {
        ...prev,
        preferredDays: updated,
        availableWorkoutDays: updated.length > 0 ? updated.length : prev.availableWorkoutDays,
      };
    });
  };

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const goalsList: { id: FitnessGoal; label: string; desc: string; icon: React.ReactNode; badge?: string }[] = [
    {
      id: 'weight_loss',
      label: 'Weight Loss & Fat Burn',
      desc: 'Burn excess body fat, stimulate metabolism & preserve lean tone with calibrated deficits',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      badge: 'Popular',
    },
    {
      id: 'muscle_gain',
      label: 'Muscle Gain & Hypertrophy',
      desc: 'Build sculpt, size and functional mass through progressive overload and protein synthesis',
      icon: <Dumbbell className="w-5 h-5 text-emerald-400" />,
      badge: 'High Impact',
    },
    {
      id: 'flexibility',
      label: 'Flexibility & Mobility',
      desc: 'Deep myofascial release, full joint range of motion, posture correction & flexibility flows',
      icon: <Activity className="w-5 h-5 text-teal-400" />,
      badge: 'Recovery',
    },
    {
      id: 'general_fitness',
      label: 'General Fitness & Vitality',
      desc: 'Balanced cardiorespiratory endurance, functional strength, daily energy & longevity',
      icon: <ShieldCheck className="w-5 h-5 text-blue-400" />,
      badge: 'All-Rounder',
    },
    {
      id: 'strength',
      label: 'Pure Strength & Power',
      desc: 'Lift heavier, build neurological force & dense power on primary compound lifts',
      icon: <Award className="w-5 h-5 text-indigo-400" />,
    },
    {
      id: 'endurance',
      label: 'Cardiovascular Stamina',
      desc: 'Boost VO2 max, aerobic threshold, respiratory efficiency & muscular endurance',
      icon: <HeartPulse className="w-5 h-5 text-rose-400" />,
    },
    {
      id: 'athletic_performance',
      label: 'Athletic Conditioning',
      desc: 'Speed, agility, explosive plyometrics & sport-specific functional performance',
      icon: <Zap className="w-5 h-5 text-cyan-400" />,
    },
  ];


  const equipmentList: { id: AvailableEquipment; label: string; desc: string }[] = [
    { id: 'bodyweight_only', label: 'Bodyweight Only', desc: 'No equipment needed; calisthenics & floor work' },
    { id: 'dumbbells_only', label: 'Dumbbells Only', desc: 'Pair of adjustable or fixed dumbbells at home' },
    { id: 'resistance_bands', label: 'Resistance Bands', desc: 'Loop & tube bands with various tensions' },
    { id: 'home_gym', label: 'Home Gym Basics', desc: 'Dumbbells, bench, pull-up bar or kettlebells' },
    { id: 'commercial_gym', label: 'Full Commercial Gym', desc: 'Barbells, cables, machines, squat racks & dumbbells' },
    { id: 'kettlebells', label: 'Kettlebells & Functional', desc: 'Kettlebells and functional mobility tools' },
  ];

  const workoutTypesList: { id: PreferredWorkoutType; label: string; tag: string }[] = [
    { id: 'strength_hypertrophy', label: 'Strength & Hypertrophy Split', tag: 'High Popularity' },
    { id: 'hiit', label: 'High-Intensity Interval Training (HIIT)', tag: 'Fast Fat Burn' },
    { id: 'calisthenics', label: 'Calisthenics & Bodyweight Flow', tag: 'Anywhere' },
    { id: 'functional_cross', label: 'Functional Athletic Hybrid', tag: 'Conditioning' },
    { id: 'powerlifting', label: 'Powerlifting / Heavy Compound', tag: 'Max Strength' },
    { id: 'low_impact', label: 'Low Impact & Joint Protection', tag: 'Safe & Joint-Friendly' },
    { id: 'yoga_mobility', label: 'Mobility & Restorative Strength', tag: 'Flexibility' },
  ];

  const injuryTags = [
    'None',
    'Lower back sensitivity',
    'Knee pain / Patellar issue',
    'Shoulder impingement',
    'Wrist strain',
    'Neck tightness',
  ];

  const applyInjuryTag = (tag: string) => {
    if (tag === 'None') {
      setProfile((prev) => ({ ...prev, limitationsOrInjuries: '' }));
      return;
    }
    setProfile((prev) => {
      const current = prev.limitationsOrInjuries || '';
      if (current.includes(tag)) return prev;
      const combined = current ? `${current}, ${tag}` : tag;
      return { ...prev, limitationsOrInjuries: combined };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(profile);
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Hero Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Powered by Google Gemini AI
        </div>
        <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
          Personalized Fitness Plan Generator
        </h1>
        <p className="mt-2.5 text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
          Tell FitBuddy about your body, goals, equipment, and schedule. Gemini will design an
          evidence-based, day-by-day workout routine and tailored nutrition blueprint.
        </p>
      </div>

      {/* Quick Presets Bar */}
      <div className="mb-8 p-4 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Quick Start Presets
            </h2>
          </div>
          <span className="text-[11px] text-slate-500">Click to instantly populate fields</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {PRESET_TEMPLATES.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className="text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-emerald-500/50 hover:bg-slate-800/60 transition-all group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors">
                  {preset.name}
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-medium">
                  {preset.badge}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 line-clamp-1">{preset.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* SECTION 1: Bio Metrics */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-white font-heading">
                  Physical Profile & Body Metrics
                </h2>
                <p className="text-xs text-slate-400">Baseline measurements used to estimate BMR & TDEE</p>
              </div>
            </div>

            {/* Live BMI badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <span className="text-slate-400">Calculated BMI:</span>
              <span className="font-bold text-emerald-400">{bmi}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                {bmiCategory}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
            {/* User Name */}
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" />
                <span>Your Name</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={profile.name || ''}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  placeholder="e.g. Alex Morgan"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Age (Years)
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="14"
                  max="90"
                  value={profile.age}
                  onChange={(e) =>
                    setProfile({ ...profile, age: Math.max(14, parseInt(e.target.value) || 18) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  required
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">yrs</span>
              </div>
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Gender</label>
              <select
                value={profile.gender}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value as Gender })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="non-binary">Non-binary</option>
                <option value="prefer-not-to-say">Prefer not to say</option>
              </select>
            </div>

            {/* Height */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Height {unitSystem === 'imperial' ? '(ft / in)' : '(cm)'}
              </label>
              {unitSystem === 'imperial' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div className="relative">
                    <input
                      type="number"
                      min="3"
                      max="7"
                      value={feetInches.feet}
                      onChange={(e) =>
                        handleHeightFtChange(parseInt(e.target.value) || 5, feetInches.inches)
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs text-slate-500">ft</span>
                  </div>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="11"
                      value={feetInches.inches}
                      onChange={(e) =>
                        handleHeightFtChange(feetInches.feet, parseInt(e.target.value) || 0)
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="absolute right-2.5 top-2.5 text-xs text-slate-500">in</span>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    min="100"
                    max="240"
                    value={profile.heightCm}
                    onChange={(e) => handleHeightCmChange(parseInt(e.target.value) || 170)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                  <span className="absolute right-3 top-2.5 text-xs text-slate-500">cm</span>
                </div>
              )}
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Weight {unitSystem === 'imperial' ? '(lbs)' : '(kg)'}
              </label>
              <div className="relative">
                {unitSystem === 'imperial' ? (
                  <input
                    type="number"
                    min="70"
                    max="450"
                    value={weightLbs}
                    onChange={(e) => handleWeightLbsChange(parseInt(e.target.value) || 150)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                ) : (
                  <input
                    type="number"
                    min="35"
                    max="220"
                    value={profile.weightKg}
                    onChange={(e) => handleWeightKgChange(parseInt(e.target.value) || 70)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-sm focus:outline-none focus:border-emerald-500"
                    required
                  />
                )}
                <span className="absolute right-3 top-2.5 text-xs text-slate-500">
                  {unitSystem === 'imperial' ? 'lbs' : 'kg'}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* SECTION 2: Primary Fitness Goal */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                What is your primary fitness goal?
              </h2>
              <p className="text-xs text-slate-400">
                Directly dictates rep ranges, volume, progressive overload, and caloric surplus/deficit
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {goalsList.map((g) => {
              const selected = profile.fitnessGoal === g.id;
              return (
                <div
                  key={g.id}
                  onClick={() => setProfile({ ...profile, fitnessGoal: g.id })}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    selected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-md shadow-emerald-500/10'
                      : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 border border-slate-800">{g.icon}</div>
                      {g.badge && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700/80 text-emerald-400">
                          {g.badge}
                        </span>
                      )}
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        selected ? 'border-emerald-400 bg-emerald-400' : 'border-slate-700'
                      }`}
                    >
                      {selected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{g.label}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{g.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: Activity Level, Experience & Intensity */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Activity Level, Experience & Workout Intensity
              </h2>
              <p className="text-xs text-slate-400">
                Determines recovery capacity, starting workout volume, RPE pacing, and exercise complexity
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Activity Level */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Daily Non-Exercise Activity Level
              </label>
              <div className="space-y-2">
                {[
                  { id: 'sedentary', label: 'Sedentary', sub: 'Desk job, little to no regular physical activity' },
                  { id: 'lightly_active', label: 'Lightly Active', sub: 'Light movement, 1-3 days casual activity/week' },
                  { id: 'moderately_active', label: 'Moderately Active', sub: 'On feet during day or 3-5 workout sessions/week' },
                  { id: 'very_active', label: 'Very Active', sub: 'Heavy physical work or hard training 6-7 days/week' },
                  { id: 'athlete', label: 'Extremely Active / Athlete', sub: 'Twice daily training or competitive athletics' },
                ].map((act) => (
                  <label
                    key={act.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      profile.activityLevel === act.id
                        ? 'bg-emerald-950/30 border-emerald-500/80 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="activityLevel"
                      checked={profile.activityLevel === act.id}
                      onChange={() =>
                        setProfile({ ...profile, activityLevel: act.id as ActivityLevel })
                      }
                      className="mt-1 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{act.label}</div>
                      <div className="text-[11px] text-slate-400">{act.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Workout Experience */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Resistance / Workout Experience
              </label>
              <div className="space-y-2">
                {[
                  { id: 'beginner', label: 'Beginner (0 – 6 months)', sub: 'Learning fundamental exercise movement patterns' },
                  { id: 'intermediate', label: 'Intermediate (6 mos – 2 yrs)', sub: 'Familiar with compound lifts & regular progressive overload' },
                  { id: 'advanced', label: 'Advanced (2 – 5 years)', sub: 'Consistent training, understands technique, tempo & intensity' },
                  { id: 'expert', label: 'Expert / Competitive (5+ years)', sub: 'Needs periodized variations & specialized training stimulus' },
                ].map((exp) => (
                  <label
                    key={exp.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      profile.workoutExperience === exp.id
                        ? 'bg-emerald-950/30 border-emerald-500/80 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="workoutExperience"
                      checked={profile.workoutExperience === exp.id}
                      onChange={() =>
                        setProfile({ ...profile, workoutExperience: exp.id as WorkoutExperience })
                      }
                      className="mt-1 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div>
                      <div className="text-xs font-bold text-white">{exp.label}</div>
                      <div className="text-[11px] text-slate-400">{exp.sub}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Target Workout Intensity */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-emerald-400" />
                  Workout Intensity Target
                </span>
                <span className="text-[11px] font-mono text-emerald-400 font-bold uppercase">
                  {profile.workoutIntensity || 'moderate'}
                </span>
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'low' as WorkoutIntensity,
                    label: 'Low Intensity (RPE 5–6)',
                    badge: 'Gentle & Sustainable',
                    badgeColor: 'text-teal-400 bg-teal-950/50 border-teal-800/50',
                    desc: 'Focus on form, movement quality, and safe habit formation with 3-4 reps in reserve.',
                  },
                  {
                    id: 'moderate' as WorkoutIntensity,
                    label: 'Moderate Intensity (RPE 7–8)',
                    badge: 'Balanced & Steady',
                    badgeColor: 'text-emerald-400 bg-emerald-950/50 border-emerald-800/50',
                    desc: 'Optimal progressive overload sweet-spot with 2 reps in reserve for consistent gains.',
                  },
                  {
                    id: 'high' as WorkoutIntensity,
                    label: 'High Intensity (RPE 8.5–9)',
                    badge: 'Demanding & High Drive',
                    badgeColor: 'text-amber-400 bg-amber-950/50 border-amber-800/50',
                    desc: 'Heavy neuromuscular stimulus with 1 rep in reserve, maximizing strength and hypertrophy.',
                  },
                  {
                    id: 'extreme' as WorkoutIntensity,
                    label: 'Extreme Intensity (RPE 9.5–10)',
                    badge: 'Peak Athletic Output',
                    badgeColor: 'text-rose-400 bg-rose-950/50 border-rose-800/50',
                    desc: 'High lactate tolerance, training to technical failure and explosive power thresholds.',
                  },
                ].map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      (profile.workoutIntensity || 'moderate') === item.id
                        ? 'bg-emerald-950/30 border-emerald-500/80 text-white'
                        : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40 text-slate-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="workoutIntensity"
                      checked={(profile.workoutIntensity || 'moderate') === item.id}
                      onChange={() =>
                        setProfile({ ...profile, workoutIntensity: item.id })
                      }
                      className="mt-1 text-emerald-500 focus:ring-emerald-500"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{item.label}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>


        {/* SECTION 4: Schedule, Workout Type & Duration */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Schedule & Preferred Workout Style
              </h2>
              <p className="text-xs text-slate-400">
                Fit workouts seamlessly into your weekly calendar and routine
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Days per week */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-400" />
                  Available Workout Days Per Week
                </label>
                <span className="text-sm font-extrabold text-emerald-400">
                  {profile.availableWorkoutDays} Days / Week
                </span>
              </div>
              <div className="flex items-center gap-2">
                {[2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setProfile({ ...profile, availableWorkoutDays: num })}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all border ${
                      profile.availableWorkoutDays === num
                        ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {num} Days
                  </button>
                ))}
              </div>
            </div>

            {/* Select preferred days */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Specific Preferred Training Days
              </label>
              <div className="flex flex-wrap gap-2">
                {daysOfWeek.map((day) => {
                  const active = profile.preferredDays.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        active
                          ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                      }`}
                    >
                      {day.substring(0, 3)}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Workout Style */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Preferred Workout Style
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {workoutTypesList.map((type) => {
                  const selected = profile.preferredWorkoutType === type.id;
                  return (
                    <div
                      key={type.id}
                      onClick={() =>
                        setProfile({ ...profile, preferredWorkoutType: type.id })
                      }
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? 'bg-cyan-950/40 border-cyan-500 text-white shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/90 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-white">{type.label}</span>
                      </div>
                      <span className="text-[10px] text-cyan-400/90 bg-cyan-500/10 px-1.5 py-0.5 rounded">
                        {type.tag}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Session duration */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Target Session Duration
                </label>
                <span className="text-xs font-bold text-amber-400">
                  {profile.workoutDurationMinutes} Minutes
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[30, 45, 60, 75, 90].map((dur) => (
                  <button
                    key={dur}
                    type="button"
                    onClick={() => setProfile({ ...profile, workoutDurationMinutes: dur })}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      profile.workoutDurationMinutes === dur
                        ? 'bg-amber-500 text-slate-950 border-amber-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    {dur} min
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 5: Equipment, Injuries & Nutrition */}
        <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 backdrop-blur-sm">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-800">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
              5
            </div>
            <div>
              <h2 className="text-base font-bold text-white font-heading">
                Equipment, Joint Care & Nutrition
              </h2>
              <p className="text-xs text-slate-400">
                Tailors exercises to your real equipment and respects physical limitations
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* Available Equipment */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                Available Equipment
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {equipmentList.map((eq) => {
                  const selected = profile.availableEquipment === eq.id;
                  return (
                    <div
                      key={eq.id}
                      onClick={() => setProfile({ ...profile, availableEquipment: eq.id })}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selected
                          ? 'bg-emerald-950/40 border-emerald-500 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold text-white mb-0.5">{eq.label}</div>
                      <div className="text-[11px] text-slate-400">{eq.desc}</div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Health / Joint Limitations */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Injuries, Health Considerations & Limitations (Optional)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {injuryTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => applyInjuryTag(tag)}
                    className="px-2.5 py-1 rounded-lg text-[11px] bg-slate-950 border border-slate-800 hover:border-amber-500/40 text-slate-300 hover:text-white transition-colors"
                  >
                    + {tag}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={profile.limitationsOrInjuries || ''}
                onChange={(e) =>
                  setProfile({ ...profile, limitationsOrInjuries: e.target.value })
                }
                placeholder="e.g. Mild lower back sensitivity, avoid overhead press, clicking left knee"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Dietary Preference */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-2">
                <Utensils className="w-3.5 h-3.5 text-emerald-400" />
                Dietary Preference for Paired Nutrition Plan
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'high_protein', label: 'High Protein (Active)' },
                  { id: 'omnivore', label: 'Standard Omnivore' },
                  { id: 'vegetarian', label: 'Vegetarian' },
                  { id: 'vegan', label: 'Plant-Based / Vegan' },
                  { id: 'pescatarian', label: 'Pescatarian' },
                  { id: 'keto', label: 'Keto / Low-Carb' },
                  { id: 'flexible', label: 'Flexible / Balanced' },
                ].map((diet) => (
                  <button
                    key={diet.id}
                    type="button"
                    onClick={() =>
                      setProfile({ ...profile, dietaryPreference: diet.id as DietaryPreference })
                    }
                    className={`p-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                      profile.dietaryPreference === diet.id
                        ? 'bg-emerald-950/40 border-emerald-500 text-emerald-400'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    {diet.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:via-teal-400 hover:to-cyan-400 text-slate-950 font-heading font-extrabold text-base tracking-wide shadow-xl shadow-emerald-500/25 transition-all transform active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Designing Your Custom Fitness Plan with Google Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate My Personalized Fitness Plan</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>

          {isLoading && (
            <div className="mt-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-center animate-pulse-subtle">
              <p className="text-xs font-medium text-emerald-400">
                FitBuddy is analyzing muscle group biomechanics, calculating target macros, and structuring your progressive overload roadmap...
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
};
