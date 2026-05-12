"use client"

import { useState } from "react"
import { Heart, X, MapPin, Star, ChevronLeft, ChevronRight } from "lucide-react"

interface Chaza {
  id: number
  name: string
  description: string
  category: string
  location: string
  rating: number
  image: string
  tags: string[]
}

const mockChazas: Chaza[] = [
  {
    id: 1,
    name: "El Rincón del Tinto",
    description: "El mejor café de la Universidad. Tintos a $1.500 y arepas con queso que te hacen el día.",
    category: "Comida",
    location: "Edificio de Ingeniería",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=500&fit=crop",
    tags: ["Café", "Desayunos", "Económico"]
  },
  {
    id: 2,
    name: "Fotocopias Express",
    description: "Impresiones a color y B/N. Anillados en 5 minutos. El salvavidas antes de entregar trabajos.",
    category: "Servicios",
    location: "Frente a Biblioteca",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=500&fit=crop",
    tags: ["Impresiones", "Anillados", "Rápido"]
  },
  {
    id: 3,
    name: "Don Empanada",
    description: "Empanadas de carne, pollo y hawaiana. Las más grandes del campus a solo $2.000.",
    category: "Comida",
    location: "Plazoleta Central",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&h=500&fit=crop",
    tags: ["Empanadas", "Almuerzo", "Popular"]
  },
  {
    id: 4,
    name: "Tech Repair UN",
    description: "Reparamos tu celular o portátil. Pantallas, baterías y software. Garantía de 30 días.",
    category: "Servicios",
    location: "Edificio de Ciencias",
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400&h=500&fit=crop",
    tags: ["Tecnología", "Reparaciones", "Garantía"]
  },
  {
    id: 5,
    name: "Librería El Saber",
    description: "Libros nuevos y usados. Conseguimos ese texto que no encuentras en ningún lado.",
    category: "Tienda",
    location: "Entrada Principal",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=500&fit=crop",
    tags: ["Libros", "Textos", "Usado"]
  }
]

export function ChazaSwiper() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<"left" | "right" | null>(null)
  const [liked, setLiked] = useState<number[]>([])

  const currentChaza = mockChazas[currentIndex]

  const handleSwipe = (swipeDirection: "left" | "right") => {
    setDirection(swipeDirection)
    
    if (swipeDirection === "right") {
      setLiked([...liked, currentChaza.id])
    }
    
    setTimeout(() => {
      setDirection(null)
      setCurrentIndex((prev) => (prev + 1) % mockChazas.length)
    }, 300)
  }

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + mockChazas.length) % mockChazas.length)
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockChazas.length)
  }

  return (
    <section id="explorar" className="py-16 px-4 bg-white">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="font-stencil text-3xl sm:text-4xl text-brand-red mb-4">
            EXPLORA LAS CHAZAS
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Desliza para descubrir las mejores chazas del campus. Dale like a tus favoritas.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-8">
          {/* Card Stack */}
          <div className="relative w-full max-w-sm h-[520px]">
            {/* Background cards for depth effect */}
            <div className="absolute inset-0 bg-gray-100 rounded-3xl transform translate-x-4 translate-y-4 opacity-50" />
            <div className="absolute inset-0 bg-gray-200 rounded-3xl transform translate-x-2 translate-y-2 opacity-70" />
            
            {/* Main Card */}
            <div 
              className={`relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden transition-transform duration-300 ${
                direction === "left" ? "-translate-x-full rotate-[-20deg] opacity-0" : ""
              } ${
                direction === "right" ? "translate-x-full rotate-[20deg] opacity-0" : ""
              }`}
            >
              {/* Image */}
              <div className="relative h-64 bg-gray-200">
                <img 
                  src={currentChaza.image} 
                  alt={currentChaza.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 left-4">
                  <span className="bg-brand-red text-white px-3 py-1 rounded-full text-sm font-medium">
                    {currentChaza.category}
                  </span>
                </div>
                <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium">{currentChaza.rating}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="font-stencil text-2xl text-brand-red mb-2">
                  {currentChaza.name}
                </h3>
                
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                  <MapPin className="w-4 h-4" />
                  <span>{currentChaza.location}</span>
                </div>
                
                <p className="text-gray-600 text-sm leading-relaxed mb-4">
                  {currentChaza.description}
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {currentChaza.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Navigation arrows */}
            <button 
              onClick={handlePrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-12 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-brand-red transition-colors hidden sm:flex"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button 
              onClick={handleNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-12 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-400 hover:text-brand-red transition-colors hidden sm:flex"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex lg:flex-col gap-6">
            <button
              onClick={() => handleSwipe("left")}
              className="w-16 h-16 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg hover:border-gray-400 hover:scale-110 transition-all"
              aria-label="No me interesa"
            >
              <X className="w-8 h-8 text-gray-400" />
            </button>
            <button
              onClick={() => handleSwipe("right")}
              className="w-16 h-16 rounded-full bg-brand-red flex items-center justify-center shadow-lg hover:bg-brand-red-dark hover:scale-110 transition-all"
              aria-label="Me gusta"
            >
              <Heart className="w-8 h-8 text-white" />
            </button>
          </div>
        </div>

        {/* Counter */}
        <div className="text-center mt-8">
          <span className="text-gray-400 text-sm">
            {currentIndex + 1} / {mockChazas.length} chazas
          </span>
          {liked.length > 0 && (
            <span className="text-brand-red text-sm ml-4">
              {liked.length} favoritas
            </span>
          )}
        </div>
      </div>
    </section>
  )
}
