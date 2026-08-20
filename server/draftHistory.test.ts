import { describe, expect, it } from "vitest";
import { SQL } from "drizzle-orm";
import { MySqlDialect } from "drizzle-orm/mysql-core";
import { searchAffiliateDrafts } from "./db";
import { createLikePattern, draftHistorySearchSchema } from "./draftHistory";

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
});
