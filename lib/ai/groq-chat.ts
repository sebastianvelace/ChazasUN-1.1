const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
// Modelo de texto vigente en Groq. Override con GROQ_CHAT_MODEL.
const DEFAULT_CHAT_MODEL = "llama-3.3-70b-versatile"

export type GroqChatConfig = {
  apiKey: string
  model: string
}

/** Solo servidor. Requiere GROQ_API_KEY y ENABLE_ASSISTANT=true. */
export function getGroqChatConfig(): GroqChatConfig | null {
  if (process.env.ENABLE_ASSISTANT !== "true") return null
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) return null
  const model = process.env.GROQ_CHAT_MODEL?.trim() || DEFAULT_CHAT_MODEL
  return { apiKey, model }
}

/**
 * Completion de texto con roles system/user separados. El separar los roles es
 * parte de la defensa: la instrucción del sistema va en `system` y la pregunta
 * del usuario en `user`, de modo que el modelo distinga instrucción de dato.
 */
export async function groqChatCompletion(opts: {
  apiKey: string
  model: string
  system: string
  user: string
  maxTokens?: number
}): Promise<string> {
  const { apiKey, model, system, user, maxTokens = 512 } = opts
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.2,
      max_tokens: maxTokens,
    }),
  })

  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`Groq HTTP ${res.status}: ${t.slice(0, 200)}`)
  }

  const data = (await res.json()) as {
    choices?: { message?: { content?: string } }[]
  }
  const content = data.choices?.[0]?.message?.content
  if (!content?.trim()) throw new Error("Respuesta vacia de Groq")
  return content.trim()
}
