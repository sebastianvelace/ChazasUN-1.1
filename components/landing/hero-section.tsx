"use client"

import { SquiggleIcon } from "./squiggle-icon"

export function HeroSection() {
  return (
    <section id="inicio" className="relative py-12 sm:py-20 px-4">
      <div className="mx-auto max-w-4xl">
        {/* Main Hero Card */}
        <div className="relative bg-brand-cream rounded-3xl shadow-2xl overflow-hidden animate-fade-in-up">
          {/* Decorative squiggles */}
          <div className="absolute top-4 left-4 opacity-20">
            <SquiggleIcon width={120} height={60} className="text-brand-red" />
          </div>
          <div className="absolute bottom-4 right-4 opacity-20 rotate-180">
            <SquiggleIcon width={120} height={60} className="text-brand-red" />
          </div>

          <div className="relative z-10 flex flex-col items-center py-12 sm:py-20 px-6 sm:px-12">
            {/* Silhouette with text */}
            <div className="relative mb-8">
              <svg
                viewBox="0 0 300 380"
                className="w-64 sm:w-80 h-auto"
                aria-hidden="true"
              >
                <defs>
                  <clipPath id="silhouette-clip">
                    {/* Stylized head silhouette path */}
                    <path d="M150,20 
                      C200,20 240,50 250,100 
                      C260,150 260,200 250,250 
                      C245,280 230,310 200,340 
                      C180,360 160,370 150,370 
                      C140,370 120,360 100,340 
                      C70,310 55,280 50,250 
                      C40,200 40,150 50,100 
                      C60,50 100,20 150,20 Z
                      M80,180 C60,200 55,230 65,260 C50,240 45,210 60,180 Z
                      M220,180 C240,200 245,230 235,260 C250,240 255,210 240,180 Z" />
                  </clipPath>
                </defs>
                
                {/* White silhouette background */}
                <path 
                  d="M150,20 
                    C200,20 240,50 250,100 
                    C260,150 260,200 250,250 
                    C245,280 230,310 200,340 
                    C180,360 160,370 150,370 
                    C140,370 120,360 100,340 
                    C70,310 55,280 50,250 
                    C40,200 40,150 50,100 
                    C60,50 100,20 150,20 Z"
                  fill="white"
                  stroke="#A31E1E"
                  strokeWidth="3"
                />
                
                {/* Ear details */}
                <ellipse cx="45" cy="200" rx="20" ry="35" fill="white" stroke="#A31E1E" strokeWidth="2" />
                <ellipse cx="255" cy="200" rx="20" ry="35" fill="white" stroke="#A31E1E" strokeWidth="2" />
                
                {/* Text inside silhouette */}
                <text 
                  x="150" 
                  y="170" 
                  textAnchor="middle" 
                  className="font-stencil"
                  style={{ 
                    fontFamily: 'var(--font-stencil), "Black Ops One", Impact, sans-serif',
                    fontSize: '42px',
                    fontWeight: 'bold'
                  }}
                  fill="#A31E1E"
                >
                  CHAZAS
                </text>
                <text 
                  x="150" 
                  y="230" 
                  textAnchor="middle" 
                  className="font-stencil"
                  style={{ 
                    fontFamily: 'var(--font-stencil), "Black Ops One", Impact, sans-serif',
                    fontSize: '48px',
                    fontWeight: 'bold'
                  }}
                  fill="#A31E1E"
                >
                  UN
                </text>
              </svg>
            </div>

            {/* Tagline */}
            <p className="text-center text-brand-red-dark text-lg sm:text-xl max-w-md mb-8 leading-relaxed opacity-0 animate-fade-in-up stagger-1">
              El marketplace de la comunidad universitaria. Compra, vende e intercambia con tus compañeros.
            </p>

            {/* CTA Button */}
            <a
              href="#registro"
              className="font-stencil text-lg sm:text-xl bg-brand-red text-brand-cream px-8 sm:px-12 py-4 rounded-full border-2 border-brand-red hover:bg-transparent hover:text-brand-red transition-all duration-300 transform hover:scale-105 shadow-lg opacity-0 animate-fade-in-up stagger-2"
            >
              ¡ÚNETE AHORA!
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
