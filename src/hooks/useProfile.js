import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DEV_BYPASS_AUTH } from '../context/AuthContext'

// Dev-only mock profile used when auth is bypassed (no backend).
const MOCK_PROFILE = {
  id: 'dev-user',
  name: 'Dev Athlete',
  dreamSchoolId: 'unc',
  position: 'Defense',
  gradYear: new Date().getFullYear() + 2,
  parentMode: false,
}

export function useProfile(userId) {
  const [profile, setProfile] = useState(DEV_BYPASS_AUTH ? MOCK_PROFILE : null)
  const [loading, setLoading] = useState(!DEV_BYPASS_AUTH)
  const [error, setError] = useState(null)

  const fetchProfile = useCallback(async () => {
    if (DEV_BYPASS_AUTH) { setProfile(MOCK_PROFILE); setLoading(false); return }
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
    if (DEV_BYPASS_AUTH) {
      setProfile(prev => ({ ...(prev ?? MOCK_PROFILE), ...updates }))
      return { data: null, error: null }
    }
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
