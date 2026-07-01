import { useCallback, useEffect, useRef, type RefObject } from 'react'

export function useVerticalDayPill(
  containerRef: RefObject<HTMLElement | null>,
  pillRef: RefObject<HTMLElement | null>,
  activeIndex: number,
  itemSelector = '[data-day-tab]',
) {
  const movePill = useCallback(
    (animate: boolean) => {
      const container = containerRef.current
      const pill = pillRef.current
      if (!container || !pill) return

      const tabs = container.querySelectorAll<HTMLElement>(itemSelector)
      const tab = tabs[activeIndex]
      if (!tab) {
        pill.style.opacity = '0'
        return
      }

      if (!animate) {
        const prev = pill.style.transition
        pill.style.transition = 'none'
        pill.style.transform = `translateY(${tab.offsetTop}px)`
        pill.style.height = `${tab.offsetHeight}px`
        pill.style.opacity = '1'
        void pill.offsetHeight
        pill.style.transition = prev
      } else {
        pill.style.transform = `translateY(${tab.offsetTop}px)`
        pill.style.height = `${tab.offsetHeight}px`
        pill.style.opacity = '1'
      }
    },
    [activeIndex, containerRef, itemSelector, pillRef],
  )

  useEffect(() => {
    requestAnimationFrame(() => movePill(false))
  }, [movePill])

  useEffect(() => {
    movePill(true)
  }, [activeIndex, movePill])

  useEffect(() => {
    const onResize = () => movePill(false)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [movePill])
}

export function useAvatarGroupHover(groupRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const group = groupRef.current
    if (!group) return

    const avatars = [...group.querySelectorAll<HTMLElement>('.t-avatar')]
    if (avatars.length === 0) return

    const lift = -4
    const falloff = 0.45
    const scale = 1.06
    const easeIn = 'cubic-bezier(0.22, 1, 0.36, 1)'
    const easeOut = 'cubic-bezier(0.34, 3.85, 0.64, 1)'

    const reset = () => {
      group.style.transitionTimingFunction = easeOut
      avatars.forEach(el => {
        el.style.transitionTimingFunction = easeOut
        el.style.setProperty('--shift', '0px')
        el.style.setProperty('--scale-active', '1')
      })
    }

    const onEnter = (activeIdx: number) => {
      group.style.transitionTimingFunction = easeIn
      avatars.forEach((el, i) => {
        el.style.transitionTimingFunction = easeIn
        const distance = Math.abs(i - activeIdx)
        el.style.setProperty('--shift', `${(lift * Math.pow(falloff, distance)).toFixed(3)}px`)
        el.style.setProperty('--scale-active', i === activeIdx ? String(scale) : '1')
      })
    }

    const handlers = avatars.map((el, i) => {
      const enter = () => onEnter(i)
      el.addEventListener('mouseenter', enter)
      return { el, enter }
    })

    group.addEventListener('mouseleave', reset)

    return () => {
      handlers.forEach(({ el, enter }) => el.removeEventListener('mouseenter', enter))
      group.removeEventListener('mouseleave', reset)
    }
  }, [groupRef])
}

export function useCardTilt(wrapRef: RefObject<HTMLElement | null>, maxTilt = 6) {
  useEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const card = wrap.querySelector<HTMLElement>('.t-tilt-card')
    if (!card) return

    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      const rect = wrap.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const ry = (x - 0.5) * maxTilt * 2
      const rx = (0.5 - y) * maxTilt * 2

      card.style.setProperty('--tilt-rx', `${rx.toFixed(2)}deg`)
      card.style.setProperty('--tilt-ry', `${ry.toFixed(2)}deg`)
      card.style.setProperty('--tilt-gx', `${(x * 100).toFixed(1)}%`)
      card.style.setProperty('--tilt-gy', `${(y * 100).toFixed(1)}%`)
      card.classList.add('is-tilting')
      wrap.classList.add('is-hover')
    }

    const onLeave = () => {
      card.style.setProperty('--tilt-rx', '0deg')
      card.style.setProperty('--tilt-ry', '0deg')
      card.classList.remove('is-tilting')
      wrap.classList.remove('is-hover')
    }

    wrap.addEventListener('pointermove', onMove)
    wrap.addEventListener('pointerleave', onLeave)

    return () => {
      wrap.removeEventListener('pointermove', onMove)
      wrap.removeEventListener('pointerleave', onLeave)
    }
  }, [maxTilt, wrapRef])
}
