import { describe, expect, it } from "vitest";

describe("OpenRouter-Geheimnis", () => {
  it("authentifiziert sich serverseitig am Modellkatalog", async () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    expect(apiKey, "OPENROUTER_API_KEY muss gesetzt sein").toBeTruthy();

    const response = await fetch("https://openrouter.ai/api/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    expect(response.ok, `OpenRouter antwortete mit HTTP ${response.status}`).toBe(true);
    const payload = (await response.json()) as { data?: unknown[] };
    expect(Array.isArray(payload.data)).toBe(true);
    expect(payload.data?.length).toBeGreaterThan(0);
  }, 20_000);
});
