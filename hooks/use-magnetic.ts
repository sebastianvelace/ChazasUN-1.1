'use client'
import { useRef, useCallback, MutableRefObject } from 'react'

interface MagneticOptions {
  strength?: number    // Intensidad del efecto (default: 0.4)
  ease?: number        // Ease de retorno (default: 0.15)
  maxDistance?: number // Distancia máxima de atracción en px (default: 60)
}

function animateTo(
  el: HTMLElement,
  targetX: number,
  targetY: number,
  duration: number,
  easeOut = false
) {
  const start = performance.now()
  const fromX = parseFloat(el.dataset.magX ?? '0')
  const fromY = parseFloat(el.dataset.magY ?? '0')

  function tick(now: number) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)

    let t: number
    if (easeOut) {
      // Elastic-like ease out
      const c4 = (2 * Math.PI) / 3
      t =
        progress === 0
          ? 0
          : progress === 1
          ? 1
          : Math.pow(2, -10 * progress) * Math.sin((progress * 10 - 0.75) * c4) + 1
    } else {
      // power2.out
      t = 1 - Math.pow(1 - progress, 2)
    }

    const x = fromX + (targetX - fromX) * t
    const y = fromY + (targetY - fromY) * t

    el.dataset.magX = String(x)
    el.dataset.magY = String(y)
    el.style.transform = `translate(${x}px, ${y}px)`

    if (progress < 1) {
      el.dataset.magRaf = String(requestAnimationFrame(tick))
    } else {
      delete el.dataset.magRaf
    }
  }

  // Cancel any running animation
  if (el.dataset.magRaf) {
    cancelAnimationFrame(Number(el.dataset.magRaf))
  }

  el.dataset.magRaf = String(requestAnimationFrame(tick))
}

export function useMagnetic(options: MagneticOptions = {}) {
  const { strength = 0.4, maxDistance = 60 } = options
  const ref = useRef<HTMLElement | null>(null)

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      const el = ref.current
      if (!el) return

      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2

      const distX = e.clientX - centerX
      const distY = e.clientY - centerY
      const distance = Math.sqrt(distX ** 2 + distY ** 2)

      if (distance < maxDistance) {
        animateTo(el, distX * strength, distY * strength, 300, false)
      }
    },
    [strength, maxDistance]
  )

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    animateTo(el, 0, 0, 500, true)
  }, [])

  const handleMouseEnter = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.addEventListener('mousemove', handleMouseMove)
  }, [handleMouseMove])

  const magneticRef = useCallback(
    (node: HTMLElement | null) => {
      const current = ref.current
      if (current) {
        current.removeEventListener('mouseenter', handleMouseEnter)
        current.removeEventListener('mouseleave', handleMouseLeave)
        current.removeEventListener('mousemove', handleMouseMove)
        if (current.dataset.magRaf) {
          cancelAnimationFrame(Number(current.dataset.magRaf))
        }
      }

      ;(ref as MutableRefObject<HTMLElement | null>).current = node

      if (node) {
        // Only on desktop — skip touch-only devices and reduced-motion users
        if (
          window.matchMedia('(hover: hover)').matches &&
          !window.matchMedia('(prefers-reduced-motion: reduce)').matches
        ) {
          node.addEventListener('mouseenter', handleMouseEnter)
          node.addEventListener('mouseleave', handleMouseLeave)
        }
      }
    },
    [handleMouseEnter, handleMouseLeave, handleMouseMove]
  )

  return magneticRef
}
