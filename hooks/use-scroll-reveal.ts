"use client"

import { useEffect, useRef, useState, useCallback } from "react"

interface UseScrollRevealOptions {
  threshold?: number
  rootMargin?: string
  triggerOnce?: boolean
}

export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: UseScrollRevealOptions = {}
) {
  const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", triggerOnce = true } = options
  const ref = useRef<T>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          if (triggerOnce) {
            observer.unobserve(element)
          }
        } else if (!triggerOnce) {
          setIsVisible(false)
        }
      },
      { threshold, rootMargin }
    )

    observer.observe(element)

    // Si la seccion ya esta en pantalla al montar, revelar de inmediato.
    const rect = element.getBoundingClientRect()
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight
    if (rect.top < viewportHeight && rect.bottom > 0) {
      setIsVisible(true)
    }

    return () => {
      observer.unobserve(element)
    }
  }, [threshold, rootMargin, triggerOnce])

  return { ref, isVisible }
}

// Hook for multiple elements with stagger
export function useScrollRevealMultiple(count: number, options: UseScrollRevealOptions = {}) {
  const [visibleItems, setVisibleItems] = useState<boolean[]>(Array(count).fill(false))
  const refs = useRef<(HTMLElement | null)[]>([])

  const setRef = useCallback((index: number) => (el: HTMLElement | null) => {
    refs.current[index] = el
  }, [])

  useEffect(() => {
    const { threshold = 0.1, rootMargin = "0px 0px -50px 0px", triggerOnce = true } = options

    const observers: IntersectionObserver[] = []

    refs.current.forEach((element, index) => {
      if (!element) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleItems((prev) => {
              const next = [...prev]
              next[index] = true
              return next
            })
            if (triggerOnce) {
              observer.unobserve(element)
            }
          } else if (!triggerOnce) {
            setVisibleItems((prev) => {
              const next = [...prev]
              next[index] = false
              return next
            })
          }
        },
        { threshold, rootMargin }
      )

      observer.observe(element)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer, index) => {
        const element = refs.current[index]
        if (element) observer.unobserve(element)
      })
    }
  }, [count, options])

  return { setRef, visibleItems }
}
