"use client"

import { useState, useRef, useCallback } from "react"
import { Heart, X, MapPin, Star, Clock, RotateCcw, Info, Bookmark } from "lucide-react"
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
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&h=700&fit=crop",
    tags: ["Cafe", "Arepas", "Economico", "Desayunos"],
    schedule: "Lun-Vie 6am-3pm",
    price: "$1.500",
  },
  {
    id: 2,
    name: "Fotocopias Express",
    description: "Impresiones a color y B/N, anillados en 5 minutos. El salvavidas antes de entregar trabajos a ultima hora.",
    category: "Servicios",
    location: "Frente a Biblioteca Central",
    rating: 4.5,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=500&h=700&fit=crop",
    tags: ["Impresiones", "Anillados", "Urgente"],
    schedule: "Lun-Sab 7am-7pm",
    price: "$80",
  },
  {
    id: 3,
    name: "Don Empanada",
    description: "Empanadas de carne, pollo y hawaiana hechas a mano. Las mas grandes del campus a solo $2.000. Ya son una tradicion!",
    category: "Comida",
    location: "Plazoleta Central",
    rating: 4.9,
    reviews: 231,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=500&h=700&fit=crop",
    tags: ["Empanadas", "Almuerzo", "Popular", "Casero"],
    schedule: "Lun-Vie 10am-4pm",
    price: "$2.000",
  },
  {
    id: 4,
    name: "Tech Repair UN",
    description: "Reparamos tu celular o portatil en el campus. Pantallas, baterias y software. Presupuesto gratis y garantia de 30 dias.",
    category: "Tecnologia",
    location: "Edificio de Ciencias, oficina 204",
    rating: 4.6,
    reviews: 67,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=500&h=700&fit=crop",
    tags: ["Celulares", "Portatiles", "Garantia"],
    schedule: "Lun-Vie 9am-6pm",
    price: "Gratis",
  },
  {
    id: 5,
    name: "Libreria El Saber",
    description: "Libros nuevos y de segunda mano. Conseguimos ese texto que no encuentras en ningun lado. Tambien recibimos libros usados.",
    category: "Libreria",
    location: "Entrada Principal, local 3",
    rating: 4.7,
    reviews: 108,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&h=700&fit=crop",
    tags: ["Libros", "Textos", "Usados", "Intercambio"],
    schedule: "Lun-Sab 8am-5pm",
    price: "$5.000",
  },
]

const SWIPE_THRESHOLD = 100

export function ChazaSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [offset, setOffset] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [likedIds, setLikedIds] = useState<number[]>([])
  const [savedIds, setSavedIds] = useState<number[]>([])
  const [exitDirection, setExitDirection] = useState<"left" | "right" | null>(null)
  const [history, setHistory] = useState<number[]>([])
  const [showInfo, setShowInfo] = useState(false)

  const { ref: sectionRef, isVisible } = useScrollReveal<HTMLElement>({ threshold: 0.15 })

  const startX = useRef(0)
  const startY = useRef(0)
  const currentX = useRef(0)
  const cardRef = useRef<HTMLDivElement>(null)

  const currentChaza = mockChazas[currentIndex]
  const nextChaza = mockChazas[(currentIndex + 1) % mockChazas.length]
  const thirdChaza = mockChazas[(currentIndex + 2) % mockChazas.length]

  const advance = useCallback((direction: "like" | "skip") => {
    setExitDirection(direction === "like" ? "right" : "left")
    if (direction === "like") {
      setLikedIds((prev) => [...prev, currentChaza.id])
    }
    setHistory((prev) => [...prev, currentIndex])
    setShowInfo(false)
    
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % mockChazas.length)
      setOffset(0)
      setExitDirection(null)
    }, 350)
  }, [currentChaza, currentIndex])

  const undo = useCallback(() => {
    if (history.length === 0) return
    const lastIndex = history[history.length - 1]
    setHistory((prev) => prev.slice(0, -1))
    setLikedIds((prev) => prev.filter((id) => id !== mockChazas[lastIndex].id))
    setCurrentIndex(lastIndex)
  }, [history])

  const saveChaza = useCallback(() => {
    if (savedIds.includes(currentChaza.id)) {
      setSavedIds((prev) => prev.filter((id) => id !== currentChaza.id))
    } else {
      setSavedIds((prev) => [...prev, currentChaza.id])
    }
  }, [currentChaza, savedIds])

  // Pointer events for unified mouse + touch handling
  const onPointerDown = (e: React.PointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return
    setIsDragging(true)
    startX.current = e.clientX
    startY.current = e.clientY
    currentX.current = e.clientX
    cardRef.current?.setPointerCapture(e.pointerId)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return
    currentX.current = e.clientX
    const deltaX = currentX.current - startX.current
    setOffset(deltaX)
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

  const rotation = offset / 25
  const likeOpacity = Math.min(Math.max(offset / SWIPE_THRESHOLD, 0), 1)
  const skipOpacity = Math.min(Math.max(-offset / SWIPE_THRESHOLD, 0), 1)

  // Exit animation transform
  const getCardStyle = () => {
    if (exitDirection === "right") {
      return {
        transform: "translateX(120%) rotate(20deg)",
        opacity: 0,
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    }
    if (exitDirection === "left") {
      return {
        transform: "translateX(-120%) rotate(-20deg)",
        opacity: 0,
        transition: "all 0.35s cubic-bezier(0.16, 1, 0.3, 1)",
      }
    }
    return {
      transform: `translateX(${offset}px) rotate(${rotation}deg)`,
      transition: isDragging ? "none" : "transform 0.3s cubic-bezier(.25,.8,.25,1)",
      touchAction: "pan-y" as const,
    }
  }

  return (
    <section 
      ref={sectionRef}
      id="explorar" 
      className="py-20 px-4 bg-white overflow-hidden"
    >
      <div className="mx-auto max-w-lg">
        {/* Header */}
        <div className={`text-center mb-10 scroll-reveal-up ${isVisible ? "visible" : ""}`}>
          <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
            Descubre
          </span>
          <h2 className="font-stencil text-4xl sm:text-5xl text-brand-red mb-3 tracking-wide">
            EXPLORA CHAZAS
          </h2>
          <p className="text-gray-500 max-w-sm mx-auto text-sm leading-relaxed">
            Desliza a la derecha si te interesa, a la izquierda para pasar
          </p>
        </div>

        {/* Card stack container */}
        <div className={`relative w-full max-w-[340px] mx-auto h-[520px] select-none mb-8 scroll-reveal-scale stagger-1 ${isVisible ? "visible" : ""}`}>
          
          {/* Third card (background) */}
          <div
            className="absolute inset-x-4 top-4 bottom-4 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden scale-90 opacity-50"
            aria-hidden="true"
          />

          {/* Second card (next) */}
          <div
            className="absolute inset-x-2 top-2 bottom-2 bg-white rounded-3xl shadow-md border border-gray-100 overflow-hidden scale-95 opacity-80"
            aria-hidden="true"
          >
            <img
              src={nextChaza.image}
              alt=""
              className="w-full h-full object-cover"
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
            {/* Full image background */}
            <div className="absolute inset-0">
              <img
                src={currentChaza.image}
                alt={currentChaza.name}
                className="w-full h-full object-cover pointer-events-none"
                draggable={false}
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-start justify-between z-10">
              {/* Category badge */}
              <span className="bg-brand-red text-white text-xs font-semibold px-3 py-1.5 rounded-full shadow-lg">
                {currentChaza.category}
              </span>

              {/* Rating */}
              <div className="flex items-center gap-1 bg-white/95 px-2.5 py-1.5 rounded-full shadow">
                <Star className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />
                <span className="text-xs font-semibold text-gray-800">{currentChaza.rating}</span>
              </div>
            </div>

            {/* Like indicator overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              style={{ opacity: likeOpacity }}
              aria-hidden="true"
            >
              <div className="border-4 border-green-400 rounded-2xl px-8 py-3 rotate-[-15deg] bg-green-400/20 backdrop-blur-sm shadow-2xl">
                <span className="text-green-400 font-stencil text-4xl tracking-widest drop-shadow-lg">LIKE</span>
              </div>
            </div>

            {/* Skip indicator overlay */}
            <div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              style={{ opacity: skipOpacity }}
              aria-hidden="true"
            >
              <div className="border-4 border-red-400 rounded-2xl px-8 py-3 rotate-[15deg] bg-red-400/20 backdrop-blur-sm shadow-2xl">
                <span className="text-red-400 font-stencil text-4xl tracking-widest drop-shadow-lg">NOPE</span>
              </div>
            </div>

            {/* Bottom content */}
            <div className="absolute bottom-0 left-0 right-0 p-5 z-10">
              <h3 className="font-stencil text-2xl text-white mb-2 tracking-wide drop-shadow-lg">
                {currentChaza.name}
              </h3>

              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-1.5 text-white/80 text-xs">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{currentChaza.location}</span>
                </div>
              </div>

              {/* Expandable info */}
              <div className={`overflow-hidden transition-all duration-300 ${showInfo ? "max-h-40 opacity-100" : "max-h-0 opacity-0"}`}>
                <p className="text-white/90 text-sm leading-relaxed mb-3">
                  {currentChaza.description}
                </p>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-3.5 h-3.5 text-white/70" />
                  <span className="text-white/70 text-xs">{currentChaza.schedule}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {currentChaza.tags.map((tag) => (
                    <span
                      key={tag}
                      className="bg-white/20 text-white px-2.5 py-1 rounded-full text-xs backdrop-blur-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Price badge */}
              <div className="flex items-center justify-between mt-3">
                <span className="bg-white/20 backdrop-blur-sm text-white font-semibold text-sm px-3 py-1 rounded-full">
                  Desde {currentChaza.price}
                </span>
                <button 
                  onClick={(e) => { e.stopPropagation(); setShowInfo(!showInfo); }}
                  className="text-white/70 hover:text-white transition-colors p-1"
                >
                  <Info className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons - Tinder style */}
        <div className={`flex items-center justify-center gap-4 scroll-reveal-up stagger-2 ${isVisible ? "visible" : ""}`}>
          {/* Undo button */}
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="w-12 h-12 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-yellow-500 shadow-lg hover:scale-110 hover:border-yellow-400 hover:shadow-xl transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100 active:scale-95"
            aria-label="Deshacer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          {/* Skip button - Big X */}
          <button
            onClick={() => advance("skip")}
            className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-xl hover:scale-110 hover:border-red-400 hover:bg-red-50 transition-all duration-300 active:scale-95 group"
            aria-label="Pasar"
          >
            <X className="w-8 h-8 text-red-400 group-hover:text-red-500 transition-colors" />
          </button>

          {/* Save/Bookmark button */}
          <button
            onClick={saveChaza}
            className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 active:scale-95 ${
              savedIds.includes(currentChaza.id) 
                ? "border-blue-400 bg-blue-50" 
                : "border-gray-200 hover:border-blue-400"
            }`}
            aria-label="Guardar"
          >
            <Bookmark className={`w-5 h-5 transition-colors ${
              savedIds.includes(currentChaza.id) 
                ? "text-blue-500 fill-blue-500" 
                : "text-blue-400"
            }`} />
          </button>

          {/* Like button - Big Heart */}
          <button
            onClick={() => advance("like")}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl hover:scale-110 hover:shadow-2xl hover:shadow-green-500/30 transition-all duration-300 active:scale-95 group"
            aria-label="Me interesa"
          >
            <Heart className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Info button */}
          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-300 active:scale-95 ${
              showInfo ? "border-purple-400 bg-purple-50" : "border-gray-200 hover:border-purple-400"
            }`}
            aria-label="Mas informacion"
          >
            <Info className={`w-5 h-5 transition-colors ${showInfo ? "text-purple-500" : "text-purple-400"}`} />
          </button>
        </div>

        {/* Progress dots */}
        <div className={`flex justify-center gap-1.5 mt-6 scroll-reveal-up stagger-3 ${isVisible ? "visible" : ""}`}>
          {mockChazas.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === currentIndex 
                  ? "w-8 bg-brand-red" 
                  : i < currentIndex 
                    ? "w-1.5 bg-brand-red/40" 
                    : "w-1.5 bg-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Stats */}
        <div className={`flex items-center justify-center gap-8 mt-6 text-center scroll-reveal-up stagger-4 ${isVisible ? "visible" : ""}`}>
          {likedIds.length > 0 && (
            <div className="animate-fade-in-up">
              <p className="font-stencil text-2xl text-green-500">{likedIds.length}</p>
              <p className="text-gray-400 text-xs">Likes</p>
            </div>
          )}
          {savedIds.length > 0 && (
            <div className="animate-fade-in-up">
              <p className="font-stencil text-2xl text-blue-500">{savedIds.length}</p>
              <p className="text-gray-400 text-xs">Guardadas</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <p className={`text-center text-gray-300 text-xs mt-6 scroll-reveal-up stagger-5 ${isVisible ? "visible" : ""}`}>
          Arrastra la tarjeta o usa los botones
        </p>
      </div>
    </section>
  )
}
