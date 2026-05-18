import { PlatformHeader } from "@/components/layout"

export default function PlatformLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      <PlatformHeader />
      <main className="flex-1">{children}</main>
    </div>
  )
}
