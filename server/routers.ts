import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { createAffiliateDraft, listAffiliateDrafts, setAffiliateDraftStatus } from "./db";
import { applicationRequestSchema, generateApplicationDraft, getOpenRouterStatus } from "./openrouter";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  assistant: router({
    status: publicProcedure.query(() => getOpenRouterStatus()),
    listDrafts: protectedProcedure.query(({ ctx }) => listAffiliateDrafts(ctx.user.id)),
    generateDraft: protectedProcedure.input(applicationRequestSchema).mutation(async ({ ctx, input }) => {
      try {
        const generated = await generateApplicationDraft(input, ctx.user.id);
        const draft = await createAffiliateDraft({
          userId: ctx.user.id,
          programName: input.programName,
          programCategory: input.programCategory,
          website: input.website,
          audience: input.audience,
          promotionChannels: JSON.stringify(input.promotionChannels),
          contentPlan: input.contentPlan,
          generatedDraft: generated.generatedDraft,
          disclosure: generated.disclosure,
          riskNotes: JSON.stringify(generated.riskNotes),
          nextSteps: JSON.stringify(generated.nextSteps),
          status: "draft",
        });
        return {
          draft,
          actionBoundary: "Entwurf gespeichert. Es wurde keine Bewerbung versendet.",
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : "Der Assistent konnte keinen Entwurf erzeugen.";
        if (message === "RATE_LIMIT") {
          throw new TRPCError({ code: "TOO_MANY_REQUESTS", message: "Bitte warten Sie kurz, bevor Sie einen weiteren Entwurf erzeugen." });
        }
        if (message === "OPENROUTER_NOT_CONFIGURED") {
          throw new TRPCError({ code: "PRECONDITION_FAILED", message: "OpenRouter ist noch nicht sicher konfiguriert." });
        }
        throw new TRPCError({ code: "BAD_GATEWAY", message: "Die Entwurfserstellung war nicht verfügbar. Bitte versuchen Sie es erneut." });
      }
    }),
    setDraftStatus: protectedProcedure.input(z.object({
      id: z.number().int().positive(),
      status: z.enum(["approved", "archived"]),
    })).mutation(({ ctx, input }) => setAffiliateDraftStatus(ctx.user.id, input.id, input.status)),
  }),
});

export type AppRouter = typeof appRouter;
