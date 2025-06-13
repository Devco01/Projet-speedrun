import { useState, useEffect } from 'react'

function useLocalStorage<T>(key: string, initialValue: T) {
  // État pour stocker notre valeur
  const [storedValue, setStoredValue] = useState<T>(initialValue)
  const [isLoaded, setIsLoaded] = useState(false)

  // Récupérer de localStorage côté client uniquement
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(key)
      if (item) {
        setStoredValue(JSON.parse(item))
      }
    } catch (error) {
      console.log(`Erreur lecture localStorage pour ${key}:`, error)
    } finally {
      setIsLoaded(true)
    }
  }, [key])

  // Fonction pour sauvegarder dans localStorage
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Permet les callbacks comme setState
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      // Sauvegarder côté client seulement
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.log(`Erreur sauvegarde localStorage pour ${key}:`, error)
    }
  }

  // Fonction pour supprimer de localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.log(`Erreur suppression localStorage pour ${key}:`, error)
    }
  }

  return [storedValue, setValue, removeValue, isLoaded] as const
}

export default useLocalStorage 