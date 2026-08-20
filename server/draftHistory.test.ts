import { describe, expect, it } from "vitest";
import { SQL } from "drizzle-orm";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { createSavedDraftFilter, deleteSavedDraftFilter, listSavedDraftFilters, searchAffiliateDrafts } from "./db";
import { createLikePattern, draftHistorySearchSchema, savedDraftFilterSchema } from "./draftHistory";

describe("Entwurfshistorie – Suchparameter", () => {
  it("normalisiert leere Suchparameter und verwendet den Gesamtstatus", () => {
    expect(draftHistorySearchSchema.parse({})).toEqual({ query: "", status: "all" });
  });

  it("trimmt die Suche und behält einen gewählten Status", () => {
    expect(draftHistorySearchSchema.parse({ query: "  Everflow  ", status: "approved" })).toEqual({
      query: "Everflow",
      status: "approved",
    });
  });

  it("validiert eine benannte Filtervorlage mit Nutzer-Suchparametern", () => {
    expect(savedDraftFilterSchema.parse({ name: "  Offene Tool-Prüfungen  ", query: " Everflow ", status: "draft" })).toEqual({
      name: "Offene Tool-Prüfungen",
      query: "Everflow",
      status: "draft",
    });
  });

  it("lehnt Filtervorlagen ohne aussagekräftigen Namen ab", () => {
    expect(() => savedDraftFilterSchema.parse({ name: " ", query: "", status: "all" })).toThrow();
  });

  it("behandelt Platzhalterzeichen als Suchtext statt als unbeabsichtigte Wildcards", () => {
    expect(createLikePattern("100%_bereit\\test")).toBe("%100\\%\\_bereit\\\\test%");
  });

  it("führt die serverseitige Suche mit Nutzer-, Status- und Textbedingung aus", async () => {
    const events: string[] = [];
    const expectedRows = [{ id: 7, programName: "Everflow-Demo-Netzwerk" }];
    let whereCondition: SQL | undefined;
    let orderCondition: SQL | undefined;
    const fakeDb = {
      select: () => ({
        from: () => ({
          where: (condition: SQL) => {
            whereCondition = condition;
            return {
              orderBy: (order: SQL) => {
                orderCondition = order;
                return {
              limit: async (value: number) => {
                events.push(`limit:${value}`);
                return expectedRows;
              },
                };
              },
            };
          },
        }),
      }),
    };

    const result = await searchAffiliateDrafts(42, { query: "Everflow", status: "approved" }, fakeDb as never);
    const dialect = new MySqlDialect();
    const whereQuery = dialect.sqlToQuery(whereCondition!);
    const orderQuery = dialect.sqlToQuery(orderCondition!);

    expect(result).toEqual(expectedRows);
    expect(events).toEqual(["limit:100"]);
    expect(whereQuery.sql).toContain("`affiliateDrafts`.`userId`");
    expect(whereQuery.sql).toContain("`affiliateDrafts`.`status`");
    expect(whereQuery.sql).toContain("`affiliateDrafts`.`programName`");
    expect(whereQuery.params).toEqual([42, "approved", "%Everflow%", "%Everflow%", "%Everflow%", "%Everflow%", "%Everflow%"]);
    expect(orderQuery.sql).toContain("`affiliateDrafts`.`updatedAt` desc");
  });

  it("speichert, lädt und löscht Filtervorlagen ausschließlich im persönlichen Arbeitsraum", async () => {
    const savedRows = [{ id: 4, userId: 42, name: "Offene Prüfungen", query: "Everflow", status: "draft" }];
    const events: string[] = [];
    let insertedValues: unknown;
    const fakeDb = {
      insert: () => ({
        values: async (values: unknown) => {
          insertedValues = values;
          events.push("insert");
        },
      }),
      select: () => ({
        from: () => ({
          where: () => ({
            orderBy: () => ({
              limit: async (limit: number) => {
                events.push(`select:${limit}`);
                return savedRows;
              },
            }),
          }),
        }),
      }),
      delete: () => ({
        where: async () => {
          events.push("delete");
        },
      }),
    };

    const created = await createSavedDraftFilter(42, { name: "Offene Prüfungen", query: "Everflow", status: "draft" }, fakeDb as never);
    const listed = await listSavedDraftFilters(42, fakeDb as never);
    const deleted = await deleteSavedDraftFilter(42, 4, fakeDb as never);

    expect(insertedValues).toMatchObject({ userId: 42, name: "Offene Prüfungen", query: "Everflow", status: "draft" });
    expect(created).toEqual(savedRows[0]);
    expect(listed).toEqual(savedRows);
    expect(deleted).toEqual({ success: true });
    expect(events).toEqual(["insert", "select:1", "select:30", "delete"]);
  });
});
