import { cn } from "@/lib/utils"

interface PageContainerProps {
  children: React.ReactNode
  className?: string
  size?: "md" | "lg" | "full"
}

const sizeClasses = {
  md: "max-w-3xl",
  lg: "max-w-6xl",
  full: "max-w-7xl",
}

export function PageContainer({ children, className, size = "lg" }: PageContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8 py-10 sm:py-14", sizeClasses[size], className)}>
      {children}
    </div>
  )
}
