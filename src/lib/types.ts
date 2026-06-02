export type Gender = 'male' | 'female'
export type GoalType = 'ダイエット' | '筋トレ' | 'ボディメイク'
export type MealType = '朝' | '昼' | '晩' | '間食'
export type WorkoutType = '筋トレ' | '有酸素'

export interface HlProfile {
  id: string
  height_cm: number
  weight_kg: number | null
  age: number | null
  gender: Gender
  activity_level: number // 1〜5
  goal_type: GoalType
  target_weight_kg: number | null
  target_months: number | null
  created_at: string
  updated_at: string
}

export interface HlDailyRecord {
  id: string
  date: string
  weight_kg: number | null
  body_fat_pct: number | null
  sleep_hours: number | null
  water_ml: number | null
  steps: number | null
  mood: number | null
  condition_notes: string | null
  created_at: string
  updated_at: string
}

export interface HlMeal {
  id: string
  date: string
  meal_type: MealType
  food_name: string
  calories: number | null
  protein_g: number | null
  fat_g: number | null
  carbs_g: number | null
  memo: string | null
  created_at: string
}

export interface HlWorkout {
  id: string
  date: string
  menu_name: string
  sets: number | null
  reps: number | null
  weight_kg: number | null
  duration_min: number | null
  memo: string | null
  created_at: string
}

export interface DayData {
  record: HlDailyRecord | null
  meals: HlMeal[]
  workouts: HlWorkout[]
}

export interface HlWorkoutPlan {
  id: string
  day_of_week: number
  menu_name: string
  workout_type: WorkoutType
  target_sets: number | null
  target_reps: number | null
  target_weight_kg: number | null
  target_duration_min: number | null
  target_distance_km: number | null
  order_index: number
  created_at: string
}

export interface JsonInputData {
  date: string
  weight_kg?: number
  body_fat_pct?: number
  sleep_hours?: number
  water_ml?: number
  steps?: number
  mood?: number
  condition_notes?: string
  meals?: {
    meal_type: MealType
    food_name: string
    calories?: number
    protein_g?: number
    fat_g?: number
    carbs_g?: number
    memo?: string
  }[]
  workouts?: {
    menu_name: string
    sets?: number
    reps?: number
    weight_kg?: number
    duration_min?: number
    memo?: string
  }[]
}
