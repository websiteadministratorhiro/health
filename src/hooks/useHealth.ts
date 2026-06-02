'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/src/lib/supabase'
import type { HlProfile, HlDailyRecord, HlMeal, HlWorkout, DayData, JsonInputData } from '@/src/lib/types'

export function useProfile() {
  const [profile, setProfile] = useState<HlProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('hl_profile')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    setProfile(data)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const saveProfile = async (values: Omit<HlProfile, 'id' | 'created_at' | 'updated_at'>) => {
    if (profile) {
      const { error } = await supabase
        .from('hl_profile')
        .update({ ...values, updated_at: new Date().toISOString() })
        .eq('id', profile.id)
      if (!error) await fetchProfile()
      return error
    } else {
      const { error } = await supabase.from('hl_profile').insert(values)
      if (!error) await fetchProfile()
      return error
    }
  }

  return { profile, loading, saveProfile, refetch: fetchProfile }
}

export function useDayData(date: string) {
  const [data, setData] = useState<DayData>({ record: null, meals: [], workouts: [] })
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setLoading(true)
    const [recordRes, mealsRes, workoutsRes] = await Promise.all([
      supabase.from('hl_daily_records').select('*').eq('date', date).maybeSingle(),
      supabase.from('hl_meals').select('*').eq('date', date).order('created_at'),
      supabase.from('hl_workouts').select('*').eq('date', date).order('created_at'),
    ])
    setData({
      record: recordRes.data,
      meals: mealsRes.data ?? [],
      workouts: workoutsRes.data ?? [],
    })
    setLoading(false)
  }, [date])

  useEffect(() => { fetchData() }, [fetchData])

  return { data, loading, refetch: fetchData }
}

export function useTrendData(days: number) {
  const [records, setRecords] = useState<HlDailyRecord[]>([])
  const [meals, setMeals] = useState<HlMeal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      setLoading(true)
      const from = new Date()
      from.setDate(from.getDate() - days)
      const fromStr = from.toISOString().split('T')[0]
      const [recordsRes, mealsRes] = await Promise.all([
        supabase.from('hl_daily_records').select('*').gte('date', fromStr).order('date'),
        supabase.from('hl_meals').select('*').gte('date', fromStr).order('date'),
      ])
      setRecords(recordsRes.data ?? [])
      setMeals(mealsRes.data ?? [])
      setLoading(false)
    }
    fetch()
  }, [days])

  return { records, meals, loading }
}

export async function saveJsonData(input: JsonInputData): Promise<string | null> {
  const { date, meals, workouts, ...recordFields } = input

  const { data: existing } = await supabase
    .from('hl_daily_records')
    .select('id')
    .eq('date', date)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('hl_daily_records')
      .update({ ...recordFields, updated_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return error.message
  } else {
    const { error } = await supabase.from('hl_daily_records').insert({ date, ...recordFields })
    if (error) return error.message
  }

  if (meals && meals.length > 0) {
    await supabase.from('hl_meals').delete().eq('date', date)
    const { error } = await supabase.from('hl_meals').insert(meals.map(m => ({ ...m, date })))
    if (error) return error.message
  }

  if (workouts && workouts.length > 0) {
    await supabase.from('hl_workouts').delete().eq('date', date)
    const { error } = await supabase.from('hl_workouts').insert(workouts.map(w => ({ ...w, date })))
    if (error) return error.message
  }

  return null
}
