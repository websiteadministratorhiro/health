-- HealthLog アプリ DBスキーマ
-- Supabaseプロジェクト: jdnstdbfyxowjpkimbkk (kakeibo共有枠)
-- すべてのテーブルは hl_ プレフィックスで統一

-- プロフィール（1レコードのみ使用）
CREATE TABLE IF NOT EXISTS hl_profile (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  height_cm numeric(5,1) NOT NULL,
  weight_kg numeric(5,1),
  age integer,
  gender text NOT NULL CHECK (gender IN ('male', 'female')),
  activity_level integer NOT NULL DEFAULT 3 CHECK (activity_level BETWEEN 1 AND 5),
  goal_type text NOT NULL DEFAULT 'ダイエット' CHECK (goal_type IN ('ダイエット', '筋トレ', 'ボディメイク')),
  target_weight_kg numeric(5,1),
  target_months integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 日次レコード（1日1レコード）
CREATE TABLE IF NOT EXISTS hl_daily_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  weight_kg numeric(5,1),
  body_fat_pct numeric(4,1),
  sleep_hours numeric(4,1),
  water_ml integer,
  steps integer,
  mood integer CHECK (mood BETWEEN 1 AND 5),
  condition_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 食事記録
CREATE TABLE IF NOT EXISTS hl_meals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  meal_type text NOT NULL CHECK (meal_type IN ('朝', '昼', '晩', '間食')),
  food_name text NOT NULL,
  calories integer,
  protein_g numeric(6,1),
  fat_g numeric(6,1),
  carbs_g numeric(6,1),
  memo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hl_meals_date ON hl_meals(date);

-- トレーニング記録
CREATE TABLE IF NOT EXISTS hl_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  menu_name text NOT NULL,
  sets integer,
  reps integer,
  weight_kg numeric(6,1),
  duration_min integer,
  memo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hl_workouts_date ON hl_workouts(date);

-- updated_at 自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_hl_profile_updated_at
  BEFORE UPDATE ON hl_profile
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hl_daily_records_updated_at
  BEFORE UPDATE ON hl_daily_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 曜日別トレーニングプラン
CREATE TABLE IF NOT EXISTS hl_workout_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week integer NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=日,1=月,...,6=土
  menu_name text NOT NULL,
  workout_type text NOT NULL CHECK (workout_type IN ('筋トレ', '有酸素')),
  target_sets integer,
  target_reps integer,
  target_weight_kg numeric(6,1),
  target_duration_min integer,
  target_distance_km numeric(5,2),
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_hl_workout_plans_day ON hl_workout_plans(day_of_week);

-- RLSポリシー
ALTER TABLE hl_workout_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON hl_workout_plans FOR ALL USING (true) WITH CHECK (true);
