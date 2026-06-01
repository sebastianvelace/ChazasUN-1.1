export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  body: string[]
  image: string
  author: string
  date: string
  readTime: string
  category: string
}

/** Articulos estaticos (misma fuente que la seccion landing). */
export const blogPosts: BlogPost[] = [
  {
    id: 1,
    slug: "tips-iniciar-chaza-universidad",
    title: "5 tips para iniciar tu chaza en la Universidad",
    excerpt:
      "Consejos practicos para estudiantes emprendedores que quieren comenzar su negocio dentro del campus universitario.",
    body: [
      "Empezar una chaza en la universidad es una forma poderosa de generar ingresos y de conocer a otros estudiantes. La clave es partir de algo que sepas hacer bien o que te apasione.",
      "Define horarios claros: el campus tiene picos entre clases. Ajusta tu oferta al tiempo que realmente puedes atender.",
      "Promociona en grupos de WhatsApp y en espacios permitidos; respeta normas del edificio y mantén tu puesto ordenado.",
      "Cuida precios accesibles para estudiantes y piensa en una carta corta al inicio; puedes ampliar cuando tengas demanda.",
      "Por ultimo, pide feedback a tus primeros clientes y mejora cada semana. ChazasUN te ayuda a que mas gente te encuentre en el mapa.",
    ],
    image: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&h=500&fit=crop&q=80",
    author: "Maria Lopez",
    date: "15 Mar 2024",
    readTime: "5 min",
    category: "Emprendimiento",
  },
  {
    id: 2,
    slug: "mejores-chazas-comida-estudiantes",
    title: "Las mejores chazas de comida segun los estudiantes",
    excerpt:
      "Ranking de las chazas mas populares basado en las reseñas de la comunidad. Descubre donde comen los estudiantes.",
    body: [
      "La comida en el campus mueve comunidad: desde empanadas hasta jugos y opciones mas saludables. Lo que mas valora la gente es sabor, precio justo y rapidez.",
      "En este articulo reunimos patrones que aparecen en conversaciones con estudiantes: llegar temprano a los picos de almuerzo y ofrecer combos simples suele funcionar.",
      "Si tienes chaza, suma fotos claras de tu carta en redes y mantén visible tu horario. Asi los clientes saben cuando encontrarte.",
    ],
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&h=500&fit=crop&q=80",
    author: "Carlos Ruiz",
    date: "10 Mar 2024",
    readTime: "4 min",
    category: "Recomendaciones",
  },
  {
    id: 3,
    slug: "historia-chazas-universidad-nacional",
    title: "Historia de las chazas en la Universidad Nacional",
    excerpt:
      "Un recorrido por la tradicion de los pequeños negocios estudiantiles que han sido parte de la vida universitaria por decadas.",
    body: [
      "Las chazas han acompañado la vida universitaria como espacios informales de encuentro y emprendimiento. Historias orales cuentan como pequeños puestos sostienen a quienes estudian y trabajan al mismo tiempo.",
      "Hoy la tecnologia permite mapear esos puestos y darles visibilidad sin perder el espiritu comunitario. Documentar oferta y precios ayuda a nuevas generaciones.",
      "Conservar la memoria de estas practicas refuerza el valor del trabajo estudiantil y de la economia del campus.",
    ],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&h=500&fit=crop&q=80",
    author: "Ana Martinez",
    date: "5 Mar 2024",
    readTime: "7 min",
    category: "Historia",
  },
  {
    id: 4,
    slug: "ahorrar-dinero-comprando-chazas",
    title: "Como ahorrar dinero comprando en chazas",
    excerpt:
      "Guia practica para estudiantes sobre como maximizar tu presupuesto aprovechando los precios de las chazas del campus.",
    body: [
      "Comparar precios entre puestos cercanos y armar una lista semanal evita compras impulsivas. Muchas chazas ofrecen promos en horarios valle.",
      "Lleva efectivo pequeño y, si puedes, combina compras con amigos para negociar volumenes donde aplique.",
      "Usa ChazasUN para ver opciones en el mapa antes de salir de clase; asi eliges caminos y horarios mas eficientes.",
    ],
    image: "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&h=500&fit=crop&q=80",
    author: "Juan Perez",
    date: "1 Mar 2024",
    readTime: "3 min",
    category: "Tips",
  },
]

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((p) => p.slug === slug)
}

export function getAllBlogSlugs(): { slug: string }[] {
  return blogPosts.map((p) => ({ slug: p.slug }))
}
