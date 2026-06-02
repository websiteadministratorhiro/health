import type { GoalType, Gender } from './types'

const ACTIVITY_COEFFICIENTS: Record<number, number> = {
  1: 1.2,
  2: 1.375,
  3: 1.55,
  4: 1.725,
  5: 1.9,
}

export function calcBMR(weight: number, height: number, age: number, gender: Gender): number {
  if (gender === 'male') {
    return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  }
  return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age
}

export function calcTDEE(bmr: number, activityLevel: number): number {
  return bmr * (ACTIVITY_COEFFICIENTS[activityLevel] ?? 1.55)
}

export function calcBMI(weight: number, heightCm: number): number {
  const heightM = heightCm / 100
  return weight / (heightM * heightM)
}

export function calcLeanBodyMass(weight: number, bodyFatPct: number): number {
  return weight * (1 - bodyFatPct / 100)
}

const PFC_RATIOS: Record<GoalType, { protein: number; fat: number; carb: number }> = {
  'ダイエット': { protein: 0.30, fat: 0.25, carb: 0.45 },
  '筋トレ': { protein: 0.35, fat: 0.25, carb: 0.40 },
  '維持': { protein: 0.20, fat: 0.25, carb: 0.55 },
}

export function calcTargetPFC(targetCalories: number, goalType: GoalType) {
  const ratio = PFC_RATIOS[goalType]
  return {
    protein_g: Math.round((targetCalories * ratio.protein) / 4),
    fat_g: Math.round((targetCalories * ratio.fat) / 9),
    carbs_g: Math.round((targetCalories * ratio.carb) / 4),
  }
}

export function calcTargetCalories(tdee: number, goalType: GoalType): number {
  if (goalType === 'ダイエット') return tdee - 500
  if (goalType === '筋トレ') return tdee + 300
  return tdee
}

export function calcDailyDeficit(
  currentWeight: number,
  goalWeight: number,
  months: number
): number {
  const days = months * 30
  return ((currentWeight - goalWeight) * 7200) / days
}

export function calcTotalCalories(meals: { calories: number | null }[]): number {
  return meals.reduce((sum, m) => sum + (m.calories ?? 0), 0)
}

export function calcTotalPFC(meals: { protein_g: number | null; fat_g: number | null; carbs_g: number | null }[]) {
  return {
    protein_g: meals.reduce((sum, m) => sum + (m.protein_g ?? 0), 0),
    fat_g: meals.reduce((sum, m) => sum + (m.fat_g ?? 0), 0),
    carbs_g: meals.reduce((sum, m) => sum + (m.carbs_g ?? 0), 0),
  }
}

export function calcWorkoutCalories(workouts: { sets: number | null; reps: number | null; weight_kg: number | null; duration_min: number | null }[]): number {
  return workouts.reduce((sum, w) => {
    // 有酸素系は duration_min × 7kcal で概算
    if (w.duration_min && !w.sets) {
      return sum + w.duration_min * 7
    }
    const sets = w.sets ?? 0
    const reps = w.reps ?? 0
    const weight = w.weight_kg ?? 0
    return sum + sets * reps * weight * 0.1
  }, 0)
}

export function bmiCategory(bmi: number): string {
  if (bmi < 18.5) return '低体重'
  if (bmi < 25) return '普通'
  if (bmi < 30) return '過体重'
  return '肥満'
}
