'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { triggerOnce = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    // Si ya está en pantalla al montar, revelar de inmediato
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < viewportHeight && rect.bottom > 0) {
      setIsVisible(true)
      return
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setIsVisible(true)
      return
    }

    const trigger = ScrollTrigger.create({
      trigger: element,
      start: 'top 88%',
      onEnter: () => setIsVisible(true),
      onLeaveBack: triggerOnce ? undefined : () => setIsVisible(false),
      once: triggerOnce,
    })

    return () => trigger.kill()
  }, [triggerOnce])

  return { ref, isVisible }
}

export function useScrollRevealMultiple(count: number, options: UseScrollRevealOptions = {}) {
  const { triggerOnce = true } = options
  const [visibleItems, setVisibleItems] = useState<boolean[]>(Array(count).fill(false))
  const refs = useRef<(HTMLElement | null)[]>([])

  const setRef = useCallback(
    (index: number) => (el: HTMLElement | null) => {
      refs.current[index] = el
    },
    []
  )

  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setVisibleItems(Array(count).fill(true))
      return
    }

    const triggers: ReturnType<typeof ScrollTrigger.create>[] = []

    refs.current.forEach((element, index) => {
      if (!element) return

      // Si ya está visible al montar
      const rect = element.getBoundingClientRect()
      const vh = window.innerHeight || document.documentElement.clientHeight
      if (rect.top < vh && rect.bottom > 0) {
        setVisibleItems((prev) => {
          const next = [...prev]
          next[index] = true
          return next
        })
        return
      }

      const trigger = ScrollTrigger.create({
        trigger: element,
        start: 'top 88%',
        onEnter: () => {
          setVisibleItems((prev) => {
            const next = [...prev]
            next[index] = true
            return next
          })
        },
        onLeaveBack: triggerOnce
          ? undefined
          : () => {
              setVisibleItems((prev) => {
                const next = [...prev]
                next[index] = false
                return next
              })
            },
        once: triggerOnce,
      })

      triggers.push(trigger)
    })

    return () => triggers.forEach((t) => t.kill())
  }, [count, triggerOnce])

  return { setRef, visibleItems }
}
