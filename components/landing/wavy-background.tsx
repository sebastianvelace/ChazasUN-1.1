"use client"

export function WavyBackground() {
  return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      <svg 
        className="w-full h-full animate-wave" 
        viewBox="0 0 800 600" 
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Checkerboard pattern */}
          <pattern id="checker" width="80" height="80" patternUnits="userSpaceOnUse">
            <rect width="40" height="40" fill="#F5EBDC" />
            <rect x="40" width="40" height="40" fill="#A31E1E" />
            <rect y="40" width="40" height="40" fill="#A31E1E" />
            <rect x="40" y="40" width="40" height="40" fill="#F5EBDC" />
          </pattern>
          
          {/* Turbulence filter for wavy distortion */}
          <filter id="wavy" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence 
              type="turbulence" 
              baseFrequency="0.008" 
              numOctaves="3" 
              seed="15"
              result="turbulence"
            />
            <feDisplacementMap 
              in="SourceGraphic" 
              in2="turbulence" 
              scale="35" 
              xChannelSelector="R" 
              yChannelSelector="G"
            />
          </filter>
        </defs>
        
        {/* Apply pattern with wavy filter */}
        <rect 
          width="100%" 
          height="100%" 
          fill="url(#checker)" 
          filter="url(#wavy)"
        />
      </svg>
      
      {/* Subtle overlay for better text readability */}
      <div className="absolute inset-0 bg-brand-cream/30" />
    </div>
  )
}
