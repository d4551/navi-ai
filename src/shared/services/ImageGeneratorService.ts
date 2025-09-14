import { logger } from '@/shared/utils/logger'

interface ImageGenOptions {
  size?: string
  n?: number
  apiKey?: string
  model?: string
  cache?: boolean
  provider?: 'openai'
}

const imageCache = new Map<string, string[]>()

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * callImageGenerator
 * ------------------
 * Generate images from text prompts using external providers.
 * Currently supports OpenAI's DALL·E endpoint.
 */
export async function callImageGenerator(prompt: string, options: ImageGenOptions = {}): Promise<string[]> {
  const {
    size = '512x512',
    n = 1,
    apiKey = process.env.OPENAI_API_KEY || options.apiKey || '',
    model = 'gpt-image-1',
    cache = true,
  } = options

  const cacheKey = `${model}:${size}:${n}:${prompt}`
  if (cache && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!
  }

  if (!apiKey) {
    throw new Error('OpenAI API key not configured')
  }

  const body = {
    model,
    prompt,
    n,
    size,
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  }

  const maxRetries = 3
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const res = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
      })

      if (res.status === 429) {
        const retryAfter = Number(res.headers.get('retry-after') || '1')
        logger.warn('Image API rate limited, retrying', { attempt })
        await delay((attempt + 1) * retryAfter * 1000)
        continue
      }

      if (!res.ok) {
        const errText = await res.text()
        throw new Error(`Image generation failed: ${res.status} ${errText}`)
      }

      const data = await res.json()
      const images: string[] = data.data.map((item: any) =>
        item.url || `data:image/png;base64,${item.b64_json}`
      )

      if (cache) {
        imageCache.set(cacheKey, images)
      }

      return images
    } catch (error) {
      logger.error('callImageGenerator error', error)
      if (attempt === maxRetries - 1) {
        throw error instanceof Error ? error : new Error(String(error))
      }
      await delay((attempt + 1) * 1000)
    }
  }

  throw new Error('Image generation failed')
}

export function clearImageCache() {
  imageCache.clear()
}
