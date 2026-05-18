interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-10 text-center sm:text-left">
      {eyebrow && (
        <span className="inline-block bg-brand-red/10 text-brand-red text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full mb-4">
          {eyebrow}
        </span>
      )}
      <h1 className="font-stencil text-4xl sm:text-5xl text-brand-red tracking-wide mb-3">{title}</h1>
      {description && <p className="text-gray-500 max-w-2xl leading-relaxed">{description}</p>}
    </header>
  )
}
