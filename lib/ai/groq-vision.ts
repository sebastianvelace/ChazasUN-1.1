const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
const DEFAULT_VISION_MODEL = "llama-3.2-90b-vision-preview"

export type GroqMenuVisionConfig = {
  apiKey: string
  model: string
}

/** Solo servidor. Requiere GROQ_API_KEY y ENABLE_MENU_VISION=true */
export function getGroqMenuVisionConfig(): GroqMenuVisionConfig | null {
  if (process.env.ENABLE_MENU_VISION !== "true") return null
  const apiKey = process.env.GROQ_API_KEY?.trim()
  if (!apiKey) return null
  const model = process.env.GROQ_VISION_MODEL?.trim() || DEFAULT_VISION_MODEL
  return { apiKey, model }
}

export async function groqChatCompletionVision(opts: {
  apiKey: string
  model: string
  prompt: string
  imageBase64: string
  imageMime: string
}): Promise<string> {
  const { apiKey, model, prompt, imageBase64, imageMime } = opts
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: {
                url: `data:${imageMime};base64,${imageBase64}`,
              },
            },
          ],
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
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
  return content
}
