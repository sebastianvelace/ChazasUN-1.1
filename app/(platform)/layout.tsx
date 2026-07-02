import { PlatformHeader, BottomNav } from "@/components/layout"

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col bg-white">
      <PlatformHeader />
      <main className="flex-1 pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
      <BottomNav />
    </div>
  )
}
