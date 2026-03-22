import { useState, useEffect, useCallback } from 'react'

// Generic fetch hook
export function useFetch(fetchFn, deps = []) {
  const [data,    setData]    = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetchFn()
      setData(res.data)
    } catch (err) {
      setError(err.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }, deps) // eslint-disable-line

  useEffect(() => { load() }, [load])

  return { data, loading, error, refetch: load }
}

// Mutation hook (PUT/POST)
export function useMutation(mutateFn) {
  const [saving,  setSaving]  = useState(false)
  const [success, setSuccess] = useState(false)
  const [error,   setError]   = useState(null)

  const mutate = async (payload) => {
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const res = await mutateFn(payload)
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
      return res.data
    } catch (err) {
      setError(err.response?.data?.error || err.message)
      throw err
    } finally {
      setSaving(false)
    }
  }

  return { mutate, saving, success, error }
}
