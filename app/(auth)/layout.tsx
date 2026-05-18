import Link from "next/link"
import { SquiggleIcon } from "@/components/landing/squiggle-icon"

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="py-6 px-4">
        <Link href="/" className="flex items-center justify-center gap-3">
          <SquiggleIcon width={48} height={24} className="text-brand-red" />
          <span className="font-stencil text-2xl text-brand-red tracking-wider">CHAZAS UN</span>
        </Link>
      </header>
      <main className="flex-1 flex items-center justify-center px-4 pb-12">{children}</main>
    </div>
  )
}
