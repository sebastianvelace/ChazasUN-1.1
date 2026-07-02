interface PageHeaderProps {
  eyebrow?: string
  title: string
  description?: string
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <header className="mb-8 text-center sm:mb-10 sm:text-left">
      {eyebrow && (
        <span className="mb-4 inline-block rounded-full bg-brand-red/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-brand-red">
          {eyebrow}
        </span>
      )}
      <h1 className="mb-3 font-stencil text-4xl tracking-wide text-brand-red sm:text-5xl">{title}</h1>
      {description && (
        <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground sm:mx-0">
          {description}
        </p>
      )}
    </header>
  )
}
