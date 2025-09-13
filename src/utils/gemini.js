import { GoogleGenerativeAI } from "@google/generative-ai";

export default class GeminiService {
    this.apiKey = apiKey;
    this.model = model;
    this.client = new GoogleGenerativeAI(apiKey);

    // simple in-memory cache and metrics
    this._cache = new Map();
    this._metrics = {
    };
  }

  validateApiKey() {
    // Basic sanity check: Gemini keys are typically long; enforce min length and allowed chars
    if (
      !this.apiKey ||
      typeof this.apiKey !== "string" ||
    ) {
      throw new Error("Invalid API key format");
    }
    return true;
  }

  async generateContent(prompt, systemInstructions, options = {}) {
    const key = options.useCache
      ? JSON.stringify({ p: prompt, s: systemInstructions })
      : null;
    if (key && this._cache.has(key)) {
      return this._cache.get(key);
    }

    const contents = systemInstructions
      ? `${systemInstructions}\n---\n${prompt}`
      : prompt;

    const start = Date.now();
    try {
      const model = this.client.getGenerativeModel({ model: this.model });
      const result = await model.generateContent(contents);
      const text = result?.response?.text() ?? "";

      // metrics
      const latency = Date.now() - start;
      this._metrics.lastLatency = latency;
      this._metrics.averageLatency =

      if (key) {
        this._cache.set(key, text);
      }
      return text;
    } catch (err) {
      // metrics
      // normalize error messages to match tests
      if (err?.response?.data?.error?.message) {
        throw new Error(err.response.data.error.message);
      }
      if (err?.response?.status && err?.message) {
        throw new Error(err.message);
      }
      if (err?.request && err?.message) {
        throw new Error(err.message);
      }
      throw err;
    }
  }

  async generateStructuredContent(prompt, systemInstructions, options = {}) {
    const text = await this.generateContent(
      prompt,
      systemInstructions,
      options,
    );
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  async generateResumeContent(userInfo) {
    const prompt = `Generate professional resume content for the following user. Return optimized, concise text.\n\nUser Info:\n${JSON.stringify(userInfo)}`;
    return this.generateContent(prompt);
  }

  async generateCoverLetter(resumeText, jobDetails = {}) {
    const prompt = `Using the resume content below, write a tailored cover letter.\n\nResume:\n${resumeText}\n\nJob Details:\n${JSON.stringify(jobDetails)}`;
    return this.generateContent(prompt);
  }

  getMetrics() {
    return { ...this._metrics };
  }

    const contents = systemInstructions
      ? `${systemInstructions}\n---\n${prompt}`
      : prompt;
    const model = this.client.getGenerativeModel({ model: this.model });
    const result = await model.generateContentStream(contents);
    let total = "";

    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      if (chunkText) {
        total += chunkText;
        yield { chunk: chunkText, aggregate: total };
      }
    }

    return { done: true };
  }
}
