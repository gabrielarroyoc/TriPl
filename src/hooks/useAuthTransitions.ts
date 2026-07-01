import { useCallback, useEffect, useRef } from 'react'

function getMotionMs(name: string, fallback: number) {
  const value = parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name))
  return Number.isFinite(value) ? value : fallback
}

export function useTextSwap(text: string) {
  const ref = useRef<HTMLSpanElement>(null)
  const prevText = useRef(text)

  useEffect(() => {
    const el = ref.current
    if (!el || prevText.current === text) return

    const dur = getMotionMs('--text-swap-dur', 150)

    el.classList.add('is-exit')
    const timer = window.setTimeout(() => {
      el.textContent = text
      el.classList.remove('is-exit')
      el.classList.add('is-enter-start')
      void el.offsetHeight
      el.classList.remove('is-enter-start')
    }, dur)

    prevText.current = text
    return () => window.clearTimeout(timer)
  }, [text])

  return ref
}

export function useStaggerReveal(active: string | boolean) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const block = ref.current
    if (!block) return

    block.classList.remove('is-hiding', 'is-shown')
    void block.offsetHeight
    block.classList.add('is-shown')

    return () => {
      block.classList.add('is-hiding')
      block.classList.remove('is-shown')
    }
  }, [active])

  return ref
}

export function useInputErrorShake(hasError: boolean) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const fieldRef = useRef<HTMLInputElement>(null)
  const revertTimer = useRef<number | null>(null)

  const triggerShake = useCallback(() => {
    const wrap = wrapRef.current
    const field = fieldRef.current
    if (!wrap || !field) return

    wrap.classList.add('is-error')
    field.classList.add('is-error')
    field.classList.remove('is-shaking')
    void field.offsetWidth
    field.classList.add('is-shaking')

    const shakeMs = getMotionMs('--shake-dur-a', 80) * 2 + getMotionMs('--shake-dur-b', 60) * 2
    window.setTimeout(() => field.classList.remove('is-shaking'), shakeMs + 20)

    if (revertTimer.current) window.clearTimeout(revertTimer.current)
    const hold = getMotionMs('--revert-hold', 3000)
    revertTimer.current = window.setTimeout(() => {
      wrap.classList.remove('is-error')
      field.classList.remove('is-error')
      revertTimer.current = null
    }, shakeMs + hold)
  }, [])

  useEffect(() => {
    if (hasError) triggerShake()
  }, [hasError, triggerShake])

  const clearError = useCallback(() => {
    if (revertTimer.current) {
      window.clearTimeout(revertTimer.current)
      revertTimer.current = null
    }
    wrapRef.current?.classList.remove('is-error')
    fieldRef.current?.classList.remove('is-error')
  }, [])

  return { wrapRef, fieldRef, clearError, triggerShake }
}

export function shakeFormFields(container: HTMLElement | null) {
  if (!container) return

  const fields = container.querySelectorAll<HTMLElement>('.t-input-field.is-error, .t-input-wrap.is-error .t-input-field')
  fields.forEach(field => {
    field.classList.remove('is-shaking')
    void field.offsetWidth
    field.classList.add('is-shaking')
    const shakeMs = getMotionMs('--shake-dur-a', 80) * 2 + getMotionMs('--shake-dur-b', 60) * 2
    window.setTimeout(() => field.classList.remove('is-shaking'), shakeMs + 20)
  })
}
