import React, { useState } from 'react';
import { GeneratedFitnessPlan, SampleMeal, HealthySnackIdea } from '../types/fitness';
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
  Sunrise,
  SunMedium,
  Moon,
  Copy,
  Check,
  ShoppingBag,
  Heart,
  ChevronRight,
} from 'lucide-react';

interface NutritionTabProps {
  plan: GeneratedFitnessPlan;
}

type MealFilterCategory = 'all' | 'breakfast' | 'lunch' | 'dinner' | 'snack';

export const NutritionTab: React.FC<NutritionTabProps> = ({ plan }) => {
  const { metricsAnalysis, nutritionGuidance, userProfile } = plan;
  const { macroSplit } = metricsAnalysis;

  const [activeFilter, setActiveFilter] = useState<MealFilterCategory>('all');
  const [completedMeals, setCompletedMeals] = useState<Record<string, boolean>>({});
  const [copiedPlan, setCopiedPlan] = useState(false);
  const [showGroceryList, setShowGroceryList] = useState(false);

  // Group or identify meal categories
  const sampleMeals = nutritionGuidance.sampleMeals || [];
  const healthySnacks = nutritionGuidance.healthySnackIdeas || [];

  // Helper to determine meal type category
  const categorizeMeal = (mealType: string): MealFilterCategory => {
    const lower = mealType.toLowerCase();
    if (lower.includes('breakfast') || lower.includes('morning')) return 'breakfast';
    if (lower.includes('lunch') || lower.includes('midday')) return 'lunch';
    if (lower.includes('dinner') || lower.includes('evening') || lower.includes('supper')) return 'dinner';
    if (lower.includes('snack') || lower.includes('shake') || lower.includes('bite')) return 'snack';
    return 'all';
  };

  const filteredMeals = sampleMeals.filter((m) => {
    if (activeFilter === 'all') return true;
    return categorizeMeal(m.mealType) === activeFilter;
  });

  const getMealTheme = (mealType: string) => {
    const cat = categorizeMeal(mealType);
    switch (cat) {
      case 'breakfast':
        return {
          icon: <Sunrise className="w-4 h-4 text-amber-400" />,
          accent: 'border-amber-500/30 bg-amber-500/10 text-amber-300',
          dotColor: 'bg-amber-400',
          titleColor: 'text-amber-400',
          badgeText: 'Morning Fuel',
        };
      case 'lunch':
        return {
          icon: <SunMedium className="w-4 h-4 text-emerald-400" />,
          accent: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300',
          dotColor: 'bg-emerald-400',
          titleColor: 'text-emerald-400',
          badgeText: 'Midday Power',
        };
      case 'dinner':
        return {
          icon: <Moon className="w-4 h-4 text-indigo-400" />,
          accent: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-300',
          dotColor: 'bg-indigo-400',
          titleColor: 'text-indigo-400',
          badgeText: 'Evening Repair',
        };
      case 'snack':
      default:
        return {
          icon: <Apple className="w-4 h-4 text-teal-400" />,
          accent: 'border-teal-500/30 bg-teal-500/10 text-teal-300',
          dotColor: 'bg-teal-400',
          titleColor: 'text-teal-400',
          badgeText: 'Healthy Snack',
        };
    }
  };

  const toggleMealComplete = (key: string) => {
    setCompletedMeals((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Extract all ingredients for grocery shopping list
  const allIngredients = Array.from(
    new Set([
      ...sampleMeals.flatMap((m) => m.ingredients || []),
      ...healthySnacks.flatMap((s) => s.ingredients || []),
    ])
  ).filter(Boolean);

  const handleCopyMealPlan = () => {
    let text = `📋 ${plan.userProfile.name ? plan.userProfile.name + "'s" : 'Daily'} FitBuddy Nutrition Plan\n`;
    text += `🎯 Calorie Target: ${metricsAnalysis.recommendedDailyCalories} kcal | Protein: ${macroSplit.proteinGrams}g | Water: ${nutritionGuidance.dailyWaterLiters}L\n\n`;

    text += `--- 🌅 BREAKFAST ---\n`;
    const breakfast = sampleMeals.find((m) => categorizeMeal(m.mealType) === 'breakfast');
    if (breakfast) {
      text += `${breakfast.title} (~${breakfast.estimatedCalories} kcal, ${breakfast.proteinGrams}g protein)\n`;
      text += `${breakfast.description}\n\n`;
    }

    text += `--- ☀️ LUNCH ---\n`;
    const lunch = sampleMeals.find((m) => categorizeMeal(m.mealType) === 'lunch');
    if (lunch) {
      text += `${lunch.title} (~${lunch.estimatedCalories} kcal, ${lunch.proteinGrams}g protein)\n`;
      text += `${lunch.description}\n\n`;
    }

    text += `--- 🌙 DINNER ---\n`;
    const dinner = sampleMeals.find((m) => categorizeMeal(m.mealType) === 'dinner');
    if (dinner) {
      text += `${dinner.title} (~${dinner.estimatedCalories} kcal, ${dinner.proteinGrams}g protein)\n`;
      text += `${dinner.description}\n\n`;
    }

    text += `--- 🍎 HEALTHY SNACKS ---\n`;
    if (healthySnacks.length > 0) {
      healthySnacks.forEach((s) => {
        text += `• ${s.title} (~${s.calories} kcal, ${s.proteinGrams}g protein): ${s.description}\n`;
      });
    } else {
      const snacks = sampleMeals.filter((m) => categorizeMeal(m.mealType) === 'snack');
      snacks.forEach((s) => {
        text += `• ${s.title} (~${s.estimatedCalories} kcal, ${s.proteinGrams}g protein): ${s.description}\n`;
      });
    }

    navigator.clipboard.writeText(text);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);
  };

  return (
    <div className="space-y-8">
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-400" />
            <h3 className="font-heading text-lg font-bold text-white">
              Macronutrient Architecture
            </h3>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-mono">
            {userProfile.dietaryPreference ? userProfile.dietaryPreference.replace('_', ' ') : 'Flexible'}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          {macroSplit.rationale}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-emerald-400">Protein</span>
              <span className="font-mono text-xs font-bold text-white">{macroSplit.proteinGrams}g</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides essential amino acids for muscle protein synthesis (MPS) and tissue repair.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-amber-400">Carbohydrates</span>
              <span className="font-mono text-xs font-bold text-white">{macroSplit.carbsGrams}g</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Replenishes muscle glycogen stores to sustain high workout power output and endurance.
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-rose-400">Healthy Fats</span>
              <span className="font-mono text-xs font-bold text-white">{macroSplit.fatsGrams}g</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Crucial for hormone production, joint lubrication, and fat-soluble vitamin absorption.
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

      {/* Core Meal & Snack Architecture Section */}
      <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-6">
        {/* Section Header with Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-400" />
              <h3 className="font-heading text-xl font-bold text-white">
                Daily Meal & Nutrition Blueprint
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Curated breakfast, lunch, dinner, and healthy snack ideas calibrated to your goals
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {allIngredients.length > 0 && (
              <button
                type="button"
                onClick={() => setShowGroceryList(!showGroceryList)}
                className="px-3 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-cyan-400" />
                <span>{showGroceryList ? 'Hide Grocery Items' : 'Grocery Quick-List'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleCopyMealPlan}
              className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copiedPlan ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Daily Menu</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Collapsible Grocery List View */}
        {showGroceryList && allIngredients.length > 0 && (
          <div className="p-4 rounded-2xl bg-slate-950/80 border border-cyan-900/40 space-y-3 animate-fadeIn">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                  Key Meal & Snack Ingredients ({allIngredients.length} Items)
                </h4>
              </div>
              <span className="text-[11px] text-slate-500">Auto-extracted from your recipes</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {allIngredients.map((item, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium flex items-center gap-1.5"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Meal Category Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          {[
            { id: 'all' as MealFilterCategory, label: 'All Meals & Snacks', count: sampleMeals.length },
            { id: 'breakfast' as MealFilterCategory, label: '🌅 Breakfast', count: sampleMeals.filter(m => categorizeMeal(m.mealType) === 'breakfast').length },
            { id: 'lunch' as MealFilterCategory, label: '☀️ Lunch', count: sampleMeals.filter(m => categorizeMeal(m.mealType) === 'lunch').length },
            { id: 'dinner' as MealFilterCategory, label: '🌙 Dinner', count: sampleMeals.filter(m => categorizeMeal(m.mealType) === 'dinner').length },
            { id: 'snack' as MealFilterCategory, label: '🍎 Healthy Snacks', count: sampleMeals.filter(m => categorizeMeal(m.mealType) === 'snack').length + healthySnacks.length },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeFilter === tab.id
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-bold'
                  : 'bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    activeFilter === tab.id
                      ? 'bg-slate-950/20 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Primary Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMeals.map((meal, idx) => {
            const theme = getMealTheme(meal.mealType);
            const isCompleted = !!completedMeals[`meal-${idx}`];

            return (
              <div
                key={idx}
                className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                  isCompleted
                    ? 'bg-emerald-950/20 border-emerald-500/40'
                    : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Top Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`p-1.5 rounded-xl border flex items-center justify-center ${theme.accent}`}>
                        {theme.icon}
                      </span>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {meal.mealType}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {theme.badgeText}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {meal.prepTimeMinutes && (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800 font-mono">
                          <Clock className="w-3 h-3 text-amber-400" />
                          {meal.prepTimeMinutes}m prep
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleMealComplete(`meal-${idx}`)}
                        className={`p-1.5 rounded-lg border text-xs transition-colors ${
                          isCompleted
                            ? 'bg-emerald-500 text-slate-950 border-emerald-400'
                            : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-emerald-400'
                        }`}
                        title={isCompleted ? 'Mark uncompleted' : 'Mark meal prepped/eaten'}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h4 className="font-heading text-base font-bold text-white mb-1.5 flex items-center gap-2">
                      {meal.title}
                    </h4>
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      {meal.description}
                    </p>
                  </div>

                  {/* Key Ingredients Chips */}
                  {meal.ingredients && meal.ingredients.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                        Key Ingredients
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {meal.ingredients.map((ing, iIdx) => (
                          <span
                            key={iIdx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-900/90 text-slate-300 border border-slate-800"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Benefits Callout */}
                  {meal.keyBenefits && (
                    <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800/60 text-xs text-slate-400 flex items-start gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                      <span className="text-[11px] leading-snug">
                        <strong className="text-slate-300 font-semibold">Physiology note: </strong>
                        {meal.keyBenefits}
                      </span>
                    </div>
                  )}
                </div>

                {/* Macro Split Footer */}
                <div className="pt-3.5 mt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-300 font-bold border border-slate-800 text-[11px] font-mono">
                      ~{meal.estimatedCalories} kcal
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 font-bold border border-emerald-800/50 text-[11px] font-mono">
                      +{meal.proteinGrams}g Protein
                    </span>
                  </div>

                  {(meal.carbsGrams !== undefined || meal.fatsGrams !== undefined) && (
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      {meal.carbsGrams !== undefined && <span>{meal.carbsGrams}g Carbs</span>}
                      {meal.fatsGrams !== undefined && <span>{meal.fatsGrams}g Fats</span>}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dedicated Curated Healthy Snack Ideas Section */}
      {(activeFilter === 'all' || activeFilter === 'snack') && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Apple className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                  Healthy Snack Ideas & Quick Fuel
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                    High Protein & Sustained Energy
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Guilt-free snacking options engineered to crush hunger without ruining your caloric deficit or macro goals
                </p>
              </div>
            </div>
            <span className="text-xs text-slate-500 self-start sm:self-center font-mono">
              3–5 min prep time
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(healthySnacks.length > 0
              ? healthySnacks
              : [
                  {
                    title: 'Crisp Apple with Almond Butter & Cinnamon',
                    description: 'One crisp apple sliced with 2 tablespoons of natural unsweetened almond butter.',
                    calories: 220,
                    proteinGrams: 7,
                    carbsGrams: 28,
                    fatsGrams: 14,
                    category: 'Sweet & Energy Boost',
                    prepTimeMinutes: 3,
                    ingredients: ['Honeycrisp Apple', 'Almond Butter', 'Ceylon Cinnamon'],
                    whyItWorks: 'Apple pectin fiber combined with healthy fats stabilizes blood sugar spikes and boosts satiety.',
                  },
                  {
                    title: 'Steamed Edamame with Himalayan Salt',
                    description: 'Warm steamed edamame pods tossed with pink sea salt and toasted pumpkin seeds.',
                    calories: 195,
                    proteinGrams: 17,
                    carbsGrams: 12,
                    fatsGrams: 9,
                    category: 'Savory & High Protein',
                    prepTimeMinutes: 4,
                    ingredients: ['Edamame', 'Pumpkin Seeds', 'Sea Salt'],
                    whyItWorks: 'Complete plant protein with magnesium to prevent exercise cramps and enhance blood flow.',
                  },
                  {
                    title: 'Hard-Boiled Eggs with Guacamole',
                    description: 'Two pasture-raised hard-boiled eggs cut in half and topped with fresh guacamole and red pepper flakes.',
                    calories: 215,
                    proteinGrams: 14,
                    carbsGrams: 4,
                    fatsGrams: 16,
                    category: 'Savory & Keto-Friendly',
                    prepTimeMinutes: 2,
                    ingredients: ['Eggs', 'Fresh Guacamole', 'Red Pepper Flakes'],
                    whyItWorks: 'Choline and lutein from pastured yolks support neurological focus and cellular integrity.',
                  },
                  {
                    title: 'No-Bake Cacao Chia Protein Bites',
                    description: 'Hand-rolled energy bites with oats, raw cacao, protein powder, and chia seeds.',
                    calories: 180,
                    proteinGrams: 12,
                    carbsGrams: 19,
                    fatsGrams: 6,
                    category: 'Pre-Workout / Grab & Go',
                    prepTimeMinutes: 5,
                    ingredients: ['Rolled Oats', 'Cacao Powder', 'Chia Seeds', 'Protein'],
                    whyItWorks: 'Quick glycogen delivery with theobromine from raw cacao for clean cardiovascular drive.',
                  },
                ]
            ).map((snack, sIdx) => {
              const isDone = !!completedMeals[`snack-${sIdx}`];

              return (
                <div
                  key={sIdx}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    isDone
                      ? 'bg-teal-950/20 border-teal-500/40'
                      : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20">
                        {snack.category || 'Healthy Snack'}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleMealComplete(`snack-${sIdx}`)}
                        className={`p-1 rounded-md text-xs transition-colors ${
                          isDone
                            ? 'bg-teal-500 text-slate-950'
                            : 'text-slate-500 hover:text-teal-400'
                        }`}
                        title="Mark snack prepared"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h4 className="font-heading text-sm font-bold text-white leading-snug">
                      {snack.title}
                    </h4>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {snack.description}
                    </p>

                    {/* Snack Ingredients */}
                    {snack.ingredients && snack.ingredients.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {snack.ingredients.map((ing, i) => (
                          <span
                            key={i}
                            className="text-[10px] px-1.5 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800"
                          >
                            {ing}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Why it works callout */}
                    {snack.whyItWorks && (
                      <p className="text-[11px] text-slate-500 italic leading-snug pt-1 border-t border-slate-800/60">
                        💡 {snack.whyItWorks}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-400 font-mono text-[11px]">
                      ~{snack.calories} kcal
                    </span>
                    <span className="font-bold text-teal-400 font-mono text-[11px]">
                      +{snack.proteinGrams}g Protein
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Evidence-Based Nutritional Guidelines */}
      {nutritionGuidance.tips && nutritionGuidance.tips.length > 0 && (
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            Evidence-Based Nutritional Guidelines & Coaching Rules
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
            {nutritionGuidance.tips.map((tip, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 bg-slate-950/50 p-3 rounded-2xl border border-slate-800/70"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span className="leading-relaxed">{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
