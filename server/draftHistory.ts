import { z } from "zod";

export const draftHistorySearchSchema = z.object({
  query: z.string().trim().max(120).default(""),
  status: z.enum(["all", "draft", "approved", "archived"]).default("all"),
});

export type DraftHistorySearch = z.infer<typeof draftHistorySearchSchema>;

export function createLikePattern(query: string) {
  const escapedQuery = query.replace(/[\\%_]/g, "\\$&");
  return `%${escapedQuery}%`;
}
