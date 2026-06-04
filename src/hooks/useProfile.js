import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export function useProfile(userId) {
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    if (error && error.code !== 'PGRST116') {
      setError(error)
    } else {
      setProfile(data)
    }
    setLoading(false)
  }, [userId])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const updateProfile = useCallback(async (updates) => {
    if (!userId) return { error: new Error('No user') }
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: userId, ...updates, updatedAt: new Date().toISOString() })
      .select()
      .single()
    if (!error) setProfile(data)
    return { data, error }
  }, [userId])

  return { profile, loading, error, updateProfile, refetch: fetchProfile }
}
