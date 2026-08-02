import { Client } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { readEphemeralPostgresTestUrl } from "../support/readEphemeralPostgresTestUrl.js";
import { readPublishingSqlFile } from "../support/readPublishingSqlFile.js";

const databaseUrl = readEphemeralPostgresTestUrl(process.env);
const administrator = new Client({ connectionString: databaseUrl });
const freshSchema = "clip_publishing_fresh_migration_test";
const additiveSchema = "clip_publishing_additive_migration_test";

let baselineMigrationSql = "";
let sidecarMigrationSql = "";
let focusedCoreSql = "";

beforeAll(async () => {
  baselineMigrationSql = await readPublishingSqlFile(
    "../../prisma/migrations/20260802080000_baseline_focused_postiz_core/migration.sql",
  );
  sidecarMigrationSql = await readPublishingSqlFile(
    "../../prisma/migrations/20260802090000_add_clip_publishing_sidecars/migration.sql",
  );
  focusedCoreSql = await readPublishingSqlFile(
    "../fixtures/focused-postiz-core.sql",
  );

  await administrator.connect();
  await administrator.query(`DROP SCHEMA IF EXISTS "${freshSchema}" CASCADE`);
  await administrator.query(`CREATE SCHEMA "${freshSchema}"`);
  await administrator.query(`DROP SCHEMA IF EXISTS "${additiveSchema}" CASCADE`);
  await administrator.query(`CREATE SCHEMA "${additiveSchema}"`);
});

afterAll(async () => {
  await administrator.query("SET search_path TO public");
  await administrator.query(`DROP SCHEMA IF EXISTS "${freshSchema}" CASCADE`);
  await administrator.query(`DROP SCHEMA IF EXISTS "${additiveSchema}" CASCADE`);
  await administrator.end();
});

describe.sequential("publishing PostgreSQL migrations", () => {
  it("creates the focused core and publishing sidecars on a fresh database", async () => {
    await administrator.query(`SET search_path TO "${freshSchema}"`);
    await administrator.query(baselineMigrationSql);
    await administrator.query(sidecarMigrationSql);

    const tables = await administrator.query<{ table_name: string }>(
      `SELECT table_name
       FROM information_schema.tables
       WHERE table_schema = $1
       ORDER BY table_name`,
      [freshSchema],
    );

    expect(tables.rows.map(({ table_name }) => table_name)).toEqual(
      expect.arrayContaining([
        "Organization",
        "Integration",
        "Media",
        "Post",
        "Tags",
        "TagsPosts",
        "ClipPublishingTenant",
        "ClipPublishingPostState",
        "ClipPublishingOutbox",
      ]),
    );
  });

  it("applies additively without changing existing or unrelated data", async () => {
    await administrator.query(`SET search_path TO "${additiveSchema}"`);
    await administrator.query(focusedCoreSql);
    await administrator.query(
      'ALTER TABLE "Organization" ADD COLUMN "existingExtra" TEXT',
    );
    await administrator.query(
      'UPDATE "Organization" SET "existingExtra" = $1 WHERE "id" = $2',
      ["keep-me", "existing-org"],
    );

    await administrator.query(baselineMigrationSql);
    await administrator.query(sidecarMigrationSql);

    const organization = await administrator.query<{
      existingExtra: string;
      name: string;
    }>(
      'SELECT "name", "existingExtra" FROM "Organization" WHERE "id" = $1',
      ["existing-org"],
    );
    const unrelated = await administrator.query<{ payload: string }>(
      'SELECT "payload" FROM "LegacyUnrelated" WHERE "id" = $1',
      ["legacy-row"],
    );

    expect(organization.rows[0]).toEqual({
      existingExtra: "keep-me",
      name: "Existing workspace",
    });
    expect(unrelated.rows[0]?.payload).toBe("must survive");
  });

  it("keeps the baseline re-runnable but rejects sidecar reapplication", async () => {
    await administrator.query(`SET search_path TO "${additiveSchema}"`);
    await expect(administrator.query(baselineMigrationSql)).resolves.toBeDefined();
    await expect(administrator.query(sidecarMigrationSql)).rejects.toThrow();

    const unrelated = await administrator.query<{ payload: string }>(
      'SELECT "payload" FROM "LegacyUnrelated" WHERE "id" = $1',
      ["legacy-row"],
    );
    expect(unrelated.rows[0]?.payload).toBe("must survive");
  });

  it("retains every audited Postiz CreationMethod value", async () => {
    await administrator.query(`SET search_path TO "${additiveSchema}"`);
    const labels = await administrator.query<{ enumlabel: string }>(
      `SELECT enumlabel
       FROM pg_enum
       JOIN pg_type ON pg_type.oid = pg_enum.enumtypid
       JOIN pg_namespace ON pg_namespace.oid = pg_type.typnamespace
       WHERE pg_namespace.nspname = $1
         AND pg_type.typname = 'CreationMethod'
       ORDER BY enumsortorder`,
      [additiveSchema],
    );

    expect(labels.rows.map(({ enumlabel }) => enumlabel)).toEqual([
      "UNKNOWN",
      "WEB",
      "MCP",
      "API",
      "AUTOPOST",
      "CLI",
    ]);
  });
});
