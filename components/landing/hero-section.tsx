"use client"

import { SquiggleIcon } from "./squiggle-icon"
import { Store, Users, Zap } from "lucide-react"

export function HeroSection() {
  return (
    <section id="inicio" className="relative py-16 sm:py-24 px-4">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          {/* Left Content */}
          <div className="flex-1 text-center lg:text-left">
            {/* Logo Title */}
            <div className="flex items-center justify-center lg:justify-start gap-4 mb-6">
              <SquiggleIcon width={50} height={25} className="text-brand-red" />
              <h1 className="font-stencil text-5xl sm:text-6xl lg:text-7xl text-brand-red">
                CHAZAS UN
              </h1>
            </div>

            {/* Tagline */}
            <p className="text-xl sm:text-2xl text-gray-700 mb-6 leading-relaxed animate-fade-in-up">
              El marketplace de la comunidad universitaria de la Universidad Nacional.
            </p>

            {/* Description */}
            <p className="text-gray-500 text-lg mb-8 max-w-xl mx-auto lg:mx-0 animate-fade-in-up stagger-1">
              Descubre las mejores chazas del campus: comida, servicios, libros y mucho más. 
              Conecta con emprendedores estudiantes y encuentra todo lo que necesitas sin salir de la U.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start animate-fade-in-up stagger-2">
              <a
                href="#explorar"
                className="font-stencil text-lg bg-brand-red text-white px-8 py-4 rounded-full hover:bg-brand-red-dark transition-all transform hover:scale-105 shadow-lg text-center"
              >
                EXPLORAR CHAZAS
              </a>
              <a
                href="#registro"
                className="font-stencil text-lg border-2 border-brand-red text-brand-red px-8 py-4 rounded-full hover:bg-brand-red hover:text-white transition-all text-center"
              >
                REGISTRAR MI CHAZA
              </a>
            </div>
          </div>

          {/* Right Content - Feature Cards */}
          <div className="flex-1 w-full max-w-md">
            <div className="grid gap-4 animate-fade-in-up stagger-3">
              {/* Feature 1 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                  <Store className="w-6 h-6 text-brand-red" />
                </div>
                <div>
                  <h3 className="font-stencil text-lg text-brand-red mb-1">+50 CHAZAS</h3>
                  <p className="text-gray-500 text-sm">Encuentra comida, servicios, libros y más en un solo lugar.</p>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-brand-red" />
                </div>
                <div>
                  <h3 className="font-stencil text-lg text-brand-red mb-1">COMUNIDAD UN</h3>
                  <p className="text-gray-500 text-sm">Apoya a emprendedores estudiantes de tu propia universidad.</p>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-red/10 flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-brand-red" />
                </div>
                <div>
                  <h3 className="font-stencil text-lg text-brand-red mb-1">RÁPIDO Y FÁCIL</h3>
                  <p className="text-gray-500 text-sm">Desliza, descubre y contacta en segundos desde tu celular.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
