import { useEffect } from 'react'
import { SCHOOLS } from '../data/schools'

export function useTheme(dreamSchoolId) {
  useEffect(() => {
    const school = SCHOOLS.find(s => s.id === dreamSchoolId) || SCHOOLS.find(s => s.id === 'undecided')
    if (!school) return
    const root = document.documentElement
    root.style.setProperty('--color-primary', school.primaryColor)
    root.style.setProperty('--color-secondary', school.secondaryColor)
    root.style.setProperty('--color-text-on-primary', school.textOnPrimary || '#FFFFFF')
  }, [dreamSchoolId])
}
