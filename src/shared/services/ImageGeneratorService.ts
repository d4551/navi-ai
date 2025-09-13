import { logger } from "@/shared/utils/logger";

interface ImageGenOptions {
  size?: string;
  n?: number;
  apiKey?: string;
  model?: string;
  cache?: boolean;
  provider?: "openai";
}

const imageCache = new Map<string, string[]>();

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

  prompt: string,
  options: ImageGenOptions = {},
): Promise<string[]> {
  const {
    apiKey = process.env.OPENAI_API_KEY || options.apiKey || "",
    cache = true,
  } = options;

  const cacheKey = `${model}:${size}:${n}:${prompt}`;
  if (cache && imageCache.has(cacheKey)) {
    return imageCache.get(cacheKey)!;
  }

  if (!apiKey) {
    throw new Error("OpenAI API key not configured");
  }

  const body = {
    model,
    prompt,
    n,
    size,
  };

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };

    try {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

        logger.warn("Image API rate limited, retrying", { attempt });
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Image generation failed: ${res.status} ${errText}`);
      }

      const data = await res.json();
      const images: string[] = data.data.map(
      );

      if (cache) {
        imageCache.set(cacheKey, images);
      }

      return images;
    } catch (error) {
      logger.error("callImageGenerator error", error);
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
  }

  throw new Error("Image generation failed");
}

  imageCache.clear();
}
