import { z } from "zod";

export const draftHistorySearchSchema = z.object({
  query: z.string().trim().max(120).default(""),
  status: z.enum(["all", "draft", "approved", "archived"]).default("all"),
});

export type DraftHistorySearch = z.infer<typeof draftHistorySearchSchema>;

export const savedDraftFilterSchema = draftHistorySearchSchema.extend({
  name: z.string().trim().min(2, "Bitte vergeben Sie einen Namen mit mindestens zwei Zeichen.").max(80),
});

export const savedDraftFilterIdSchema = z.object({
  id: z.number().int().positive(),
});

export type SavedDraftFilterInput = z.infer<typeof savedDraftFilterSchema>;

export function createLikePattern(query: string) {
  const escapedQuery = query.replace(/[\\%_]/g, "\\$&");
  return `%${escapedQuery}%`;
}
