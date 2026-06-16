'use client'

import { useRef } from 'react'
import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

/**
 * Drop-in replacement for useGSAP that skips animations when the user
 * prefers reduced motion. Returns the scope ref to attach to the section.
 *
 * Usage:
 *   const ref = useGSAPSafe(({ isReduced, gsap, ScrollTrigger }) => {
 *     if (isReduced) return
 *     gsap.from('.my-el', { y: 24, duration: 0.5 })
 *   })
 */
export function useGSAPSafe(
  callback: (ctx: { isReduced: boolean; gsap: typeof gsap; ScrollTrigger: typeof ScrollTrigger }) => void | gsap.core.Timeline,
  options?: { scope?: React.RefObject<HTMLElement | null>; dependencies?: unknown[] }
) {
  const internalRef = useRef<HTMLElement>(null)
  const scopeRef = options?.scope ?? internalRef

  useGSAP(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    return callback({ isReduced: reduced, gsap, ScrollTrigger })
  }, { scope: scopeRef, dependencies: options?.dependencies })

  return scopeRef
}
