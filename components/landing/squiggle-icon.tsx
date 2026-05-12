interface SquiggleIconProps {
  className?: string
  width?: number
  height?: number
}

export function SquiggleIcon({ className = "", width = 100, height = 50 }: SquiggleIconProps) {
  return (
    <svg 
      viewBox="0 0 100 50" 
      width={width} 
      height={height} 
      className={className}
      aria-hidden="true"
    >
      <path 
        d="M0,25 Q15,5 30,25 T60,25 T90,25 Q95,25 100,30" 
        stroke="currentColor" 
        strokeWidth="10" 
        fill="none" 
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
