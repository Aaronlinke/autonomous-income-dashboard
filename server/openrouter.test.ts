import { afterEach, describe, expect, it, vi } from "vitest";
import { generateApplicationDraft, getOpenRouterStatus } from "./openrouter";

const request = {
  programName: "Everflow-Demo-Netzwerk",
  programCategory: "Software & Tools",
  website: "https://beispiel.de",
  audience: "Deutschsprachige Selbstständige mit Interesse an hilfreichen Software-Workflows.",
  promotionChannels: ["Blog / Website"],
  contentPlan: "Ein transparenter Vergleichsartikel erklärt Einsatzgrenzen, Nutzen und sichtbare Affiliate-Offenlegung.",
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("OpenRouter-Bewerbungsassistent", () => {
  it("erzeugt und validiert einen strukturierten Entwurf ausschließlich serverseitig", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "test-key-only");
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({
        generatedDraft: "Guten Tag, ich möchte Ihr Programm transparent für meine deutschsprachige Zielgruppe prüfen und nur nach Ihrer Freigabe vorstellen.",
        disclosure: "Hinweis: Bei einer späteren Empfehlung kennzeichne ich eine mögliche Affiliate-Partnerschaft klar und sichtbar.",
        riskNotes: ["Angaben zur Zielgruppe vor externer Nutzung prüfen."],
        nextSteps: ["Entwurf fachlich prüfen.", "Programmbedingungen lesen."],
      }) } }],
    }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await generateApplicationDraft(request, 42);

    expect(result.generatedDraft).toContain("Guten Tag");
    expect(result.riskNotes).toHaveLength(1);
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(fetchMock.mock.calls[0]?.[1]).toMatchObject({
      method: "POST",
      headers: expect.objectContaining({ Authorization: "Bearer test-key-only" }),
    });
  });

  it("liefert ohne Schlüssel nur einen nicht-sensiblen Status und blockiert die Generierung", async () => {
    vi.stubEnv("OPENROUTER_API_KEY", "");
    const status = getOpenRouterStatus();

    expect(status).toMatchObject({ configured: false, mode: "Entwurfsmodus" });
    expect(status).not.toHaveProperty("apiKey");
    await expect(generateApplicationDraft(request, 99)).rejects.toThrow("OPENROUTER_NOT_CONFIGURED");
  });
});
