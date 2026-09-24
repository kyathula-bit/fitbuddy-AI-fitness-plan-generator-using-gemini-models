import React from 'react';
import { GeneratedFitnessPlan } from '../types/fitness';
import {
  Utensils,
  Droplets,
  Flame,
  Zap,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Apple,
} from 'lucide-react';

interface NutritionTabProps {
  plan: GeneratedFitnessPlan;
}

export const NutritionTab: React.FC<NutritionTabProps> = ({ plan }) => {
  const { metricsAnalysis, nutritionGuidance, userProfile } = plan;
  const { macroSplit } = metricsAnalysis;

  return (
    <div className="space-y-6">
      {/* Nutrition Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Calories Card */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Caloric Strategy
            </span>
            <Flame className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-white">
              {metricsAnalysis.recommendedDailyCalories}
            </span>
            <span className="text-xs text-slate-400">kcal/day</span>
          </div>
          <p className="text-xs text-slate-400 capitalize">
            Goal: <span className="text-amber-400 font-semibold">{userProfile.fitnessGoal.replace('_', ' ')}</span> ({metricsAnalysis.calorieGoalType})
          </p>
        </div>

        {/* Protein Target */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Daily Protein Target
            </span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-emerald-400">
              {macroSplit.proteinGrams}g
            </span>
            <span className="text-xs text-slate-400">daily minimum</span>
          </div>
          <p className="text-xs text-slate-400">
            ~{Number((macroSplit.proteinGrams / userProfile.weightKg).toFixed(1))}g per kg of bodyweight
          </p>
        </div>

        {/* Hydration Card */}
        <div className="p-5 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Water & Fluid Intake
            </span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-heading text-3xl font-extrabold text-cyan-400">
              {nutritionGuidance.dailyWaterLiters}
            </span>
            <span className="text-xs text-slate-400">Liters / day</span>
          </div>
          <p className="text-xs text-slate-400">
            Increase by 500ml on intense training days
          </p>
        </div>
      </div>

      {/* Rationale & Macro Split Breakdown */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-emerald-400" />
          <h3 className="font-heading text-lg font-bold text-white">
            Macronutrient Architecture
          </h3>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {macroSplit.rationale}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-bold text-emerald-400 block mb-1">
              Protein ({macroSplit.proteinGrams}g)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides essential amino acids for muscle protein synthesis (MPS) and tissue repair.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-bold text-amber-400 block mb-1">
              Carbohydrates ({macroSplit.carbsGrams}g)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Replenishes muscle glycogen stores to sustain high workout power output and endurance.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <span className="text-[11px] font-bold text-rose-400 block mb-1">
              Healthy Fats ({macroSplit.fatsGrams}g)
            </span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Crucial for testosterone/hormone production, joint lubrication, and fat-soluble vitamin absorption.
            </p>
          </div>
        </div>
      </div>

      {/* Pre & Post Workout Nutrient Timing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-400" />
            <h3 className="font-heading text-base font-bold text-white">
              Pre-Workout Fuel (60–90 min prior)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            {nutritionGuidance.preWorkoutFuel}
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="font-heading text-base font-bold text-white">
              Post-Workout Recovery (Within 45 min)
            </h3>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-950/50 p-4 rounded-2xl border border-slate-800">
            {nutritionGuidance.postWorkoutFuel}
          </p>
        </div>
      </div>

      {/* Sample Daily Meal Template */}
      {nutritionGuidance.sampleMeals && nutritionGuidance.sampleMeals.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-cyan-400" />
              <h3 className="font-heading text-lg font-bold text-white">
                Sample Daily Meal Plan ({userProfile.dietaryPreference.replace('_', ' ')})
              </h3>
            </div>
            <span className="text-xs text-slate-400">Tailored to your calorie & macro targets</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {nutritionGuidance.sampleMeals.map((meal, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                      {meal.mealType}
                    </span>
                    <span className="text-[11px] font-bold text-slate-300">
                      ~{meal.estimatedCalories} kcal
                    </span>
                  </div>
                  <h4 className="font-heading text-sm font-bold text-white mb-1">
                    {meal.title}
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {meal.description}
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Protein</span>
                  <span className="font-bold text-emerald-400">+{meal.proteinGrams}g</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Nutrition Tips */}
      {nutritionGuidance.tips && nutritionGuidance.tips.length > 0 && (
        <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2.5">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Evidence-Based Nutritional Guidelines
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
            {nutritionGuidance.tips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
