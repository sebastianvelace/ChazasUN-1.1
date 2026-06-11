import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { Draggable } from 'gsap/Draggable'
import { Observer } from 'gsap/Observer'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, Draggable, Observer)
}

export { gsap, ScrollTrigger, Draggable, Observer }
export default gsap
