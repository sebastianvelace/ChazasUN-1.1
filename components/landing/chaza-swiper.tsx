"use client"

import { useState, useRef, useCallback } from "react"
import { Heart, X, MapPin, Star, Clock, RotateCcw } from "lucide-react"
import { useScrollReveal } from "@/hooks/use-scroll-reveal"

interface Chaza {
  id: number
  name: string
  description: string
  category: string
  location: string
  rating: number
  reviews: number
  image: string
  tags: string[]
  schedule: string
  price: string
}

const mockChazas: Chaza[] = [
  {
    id: 1,
    name: "El Rincon del Tinto",
    description: "El mejor cafe de la Universidad. Tintos a $1.500 y arepas con queso que te hacen el dia. Mas de 5 años endulzando mañanas universitarias.",
    category: "Cafe & Desayunos",
    location: "Edificio de Ingenieria, piso 1",
    rating: 4.8,
    reviews: 142,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=600&fit=crop",
    tags: ["Cafe", "Arepas", "Economico", "Desayunos"],
    schedule: "Lun-Vie 6am-3pm",
    price: "Desde $1.500",
  },
  {
    id: 2,
    name: "Fotocopias Express",
    description: "Impresiones a color y B/N, anillados en 5 minutos. El salvavidas antes de entregar trabajos a ultima hora.",
    category: "Servicios",
    location: "Frente a Biblioteca Central",
    rating: 4.5,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=600&fit=crop",
    tags: ["Impresiones", "Anillados", "Urgente"],
    schedule: "Lun-Sab 7am-7pm",
    price: "Copias desde $80",
  },
  {
    id: 3,
    name: "Don Empanada",
    description: "Empanadas de carne, pollo y hawaiana hechas a mano. Las mas grandes del campus a solo $2.000. ¡Ya son una tradicion!",
    category: "Comida",
    location: "Plazoleta Central",
    rating: 4.9,
    reviews: 231,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=600&fit=crop",
    tags: ["Empanadas", "Almuerzo", "Popular", "Casero"],
    schedule: "Lun-Vie 10am-4pm",
    price: "Desde $2.000",
  },
  {
    id: 4,
    name: "Tech Repair UN",
    description: "Reparamos tu celular o portatil en el campus. Pantallas, baterias y software. Presupuesto gratis y garantia de 30 dias.",
    category: "Tecnologia",
    location: "Edificio de Ciencias, oficina 204",
    rating: 4.6,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=600&fit=crop",
    tags: ["Celulares", "Portatiles", "Garantia"],
    schedule: "Lun-Vie 9am-6pm",
    price: "Diagnostico gratis",
  },
  {
    id: 5,
    name: "Libreria El Saber",
    description: "Libros nuevos y de segunda mano. Conseguimos ese texto que no encuentras en ningun lado. Tambien recibimos libros usados.",
    category: "Libreria",
    location: "Entrada Principal, local 3",
    rating: 4.7,
    reviews: 108,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=600&fit=crop",
    tags: ["Libros", "Textos", "Usados", "Intercambio"],
    schedule: "Lun-Sab 8am-5pm",
    price: "Usados desde $5.000",
  },
]

const SWIPE_THRESHOLD = 80

export function ChazaSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [likedIds, setLikedIds] = useState<number[]>([])
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)
  const [history, setHistory] = useState<number[]>([])

  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.2 })

  const startX = useRef(0)
  const currentX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const currentChaza = mockChazas[currentIndex]
  const nextChaza = mockChazas[(currentIndex + 1) % mockChazas.length]

  const advance = useCallback((direction: "like" | "skip") => {
    setExitDirection(direction === "like" ? "right" : "left")
    if (direction === "like") {
      setLikedIds((prev) => [...prev, currentChaza.id])
    }
    setHistory((prev) => [...prev, currentIndex])
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockChazas.length)
      setOffset(0)
      setExitDirection(null)
    }, 400)
  }, [currentChaza, currentIndex])

  const undo = useCallback(() => {
    if (history.length === 0) return
    const lastIndex = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setLikedIds((prev) => prev.filter((id) => id !== mockChazas[lastIndex].id))
    setCurrentIndex(lastIndex)
  }, [history])

  // Pointer events for unified mouse + touch handling
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    setIsDragging(true)
    startX.current = e.clientX
    currentX.current = e.clientX
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    currentX.current = e.clientX
    setOffset(currentX.current - startX.current)
  }

  const onPointerUp = () => {
    if (!isDragging) return
    setIsDragging(false)
    const delta = currentX.current - startX.current
    if (delta > SWIPE_THRESHOLD) {
      advance("like")
    } else if (delta < -SWIPE_THRESHOLD) {
      advance("skip")
    } else {
      setOffset(0)
    }
  }

  const rotation = offset / 20
  const likeOpacity = Math.min(Math.max(offset / SWIPE_THRESHOLD, 0), 1)
  const skipOpacity = Math.min(Math.max(-offset / SWIPE_THRESHOLD, 0), 1)

  // Exit animation transform
  const getCardStyle = () => {
    if (exitDirection === "right") {
      return {
        transform: "translateX(150%) rotate(30deg)",
        opacity: 0,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    }
    if (exitDirection === "left") {
      return {
        transform: "translateX(-150%) rotate(-30deg)",
        opacity: 0,
        transition: "all 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    }
    return {
      transform: `translateX(${offset}px) rotate(${rotation}deg)`,
      transition: isDragging ? "none" : "transform 0.35s cubic-bezier(.25,.8,.25,1)",
      touchAction: "none" as const,
    }
  }

  return (
    <section 
      ref={sectionRef}
      id="explorar" 
      className="py-20 px-4 bg-white overflow-hidden"
    >
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div 
          className={`text-center mb-14 scroll-reveal-up ${isVisible ? "visible" : ""}`}
        >
          <h2 className="font-stencil text-4xl sm:text-5xl text-brand-red mb-3 tracking-wide">
            EXPLORA LAS CHAZAS
          </h2>
          <p className="text-gray-500 max-w-md mx-auto text-base leading-relaxed">
            Desliza a la derecha si te interesa, a la izquierda si no. Descubre lo que tu campus tiene para ofrecerte.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12">

          {/* Card stack */}
          <div 
            className={`relative w-80 sm:w-96 h-[580px] select-none scroll-reveal-left stagger-2 ${isVisible ? "visible" : ""}`}
          >
            {/* Background card (next) */}
            <div
              className="absolute inset-0 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden scale-95 opacity-70"
              aria-hidden="true"
            >
              <img
                src={nextChaza.image}
                alt=""
                className="w-full h-64 object-cover"
                draggable={false}
              />
            </div>

            {/* Main draggable card */}
            <div
              ref={cardRef}
              className="absolute inset-0 bg-white rounded-3xl shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-gray-100"
              style={getCardStyle()}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
            >
              {/* Image area */}
              <div className="relative h-64 overflow-hidden bg-gray-100">
                <img
                  src={currentChaza.image}
                  alt={currentChaza.name}
                  className="w-full h-full object-cover pointer-events-none transition-transform duration-500 hover:scale-105"
                  draggable={false}
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

                {/* Category badge */}
                <span className="absolute top-4 left-4 bg-brand-red text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                  {currentChaza.category}
                </span>

                {/* Rating */}
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 px-2.5 py-1.5 rounded-full shadow">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs font-semibold text-gray-800">{currentChaza.rating}</span>
                  <span className="text-xs text-gray-400">({currentChaza.reviews})</span>
                </div>

                {/* Like indicator */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-3xl pointer-events-none"
                  style={{ 
                    opacity: likeOpacity,
                    transition: "opacity 0.15s ease"
                  }}
                  aria-hidden="true"
                >
                  <div className="border-4 border-green-500 rounded-2xl px-6 py-2 rotate-[-20deg] bg-white/80 shadow-lg">
                    <span className="text-green-500 font-stencil text-3xl tracking-widest">QUIERO</span>
                  </div>
                </div>

                {/* Skip indicator */}
                <div
                  className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-3xl pointer-events-none"
                  style={{ 
                    opacity: skipOpacity,
                    transition: "opacity 0.15s ease"
                  }}
                  aria-hidden="true"
                >
                  <div className="border-4 border-brand-red rounded-2xl px-6 py-2 rotate-[20deg] bg-white/80 shadow-lg">
                    <span className="text-brand-red font-stencil text-3xl tracking-widest">PASO</span>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-stencil text-2xl text-brand-red mb-2 tracking-wide">
                  {currentChaza.name}
                </h3>

                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{currentChaza.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{currentChaza.schedule}</span>
                  </div>
                </div>

                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {currentChaza.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {currentChaza.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full text-xs hover:bg-brand-red/10 hover:text-brand-red transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <span className="text-brand-red font-semibold text-sm">
                    {currentChaza.price}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons + info column */}
          <div 
            className={`flex flex-col items-center gap-6 scroll-reveal-right stagger-3 ${isVisible ? "visible" : ""}`}
          >
            {/* Undo button */}
            <button
              onClick={undo}
              disabled={history.length === 0}
              className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
              aria-label="Deshacer"
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Skip button */}
            <button
              onClick={() => advance("skip")}
              className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg hover:border-brand-red hover:scale-110 transition-all active:scale-95"
              aria-label="Pasar"
            >
              <X className="w-7 h-7 text-gray-400" />
            </button>

            {/* Card counter */}
            <div className="flex gap-2">
              {mockChazas.map((_, i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-500 ${
                    i === currentIndex ? "w-8 bg-brand-red" : "w-2 bg-gray-200"
                  }`}
                />
              ))}
            </div>

            {/* Like button */}
            <button
              onClick={() => advance("like")}
              className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-lg hover:bg-brand-red-dark hover:scale-110 transition-all active:scale-95 hover:shadow-xl"
              aria-label="Me interesa"
            >
              <Heart className="w-7 h-7 text-white" />
            </button>

            {/* Liked count */}
            <div className="text-center">
              {likedIds.length > 0 && (
                <p className="text-gray-400 text-xs animate-fade-in-up">
                  <span className="text-brand-red font-semibold text-lg">{likedIds.length}</span>
                  <br />guardadas
                </p>
              )}
            </div>

            {/* Keyboard hint */}
            <p className="text-gray-300 text-xs text-center mt-2 max-w-[140px] leading-relaxed">
              Arrastra la tarjeta o usa los botones
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
