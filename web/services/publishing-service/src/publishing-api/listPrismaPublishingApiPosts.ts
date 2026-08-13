import type { PrismaClient } from "@prisma/client";

import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import type { PublishingApiPostStatus } from "./PublishingApiPostStatus.js";
import { mapPublishingApiPostSummary } from "./mapPublishingApiPostSummary.js";
import { publishingApiPostStateInclude } from "./publishingApiPostStateInclude.js";

export const listPrismaPublishingApiPosts = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  productId: string,
  status?: PublishingApiPostStatus,
) => {
  const records = await database.clipPublishingPostState.findMany({
    where: { tenant: { tenantKey }, productId, post: { deletedAt: null } },
    include: publishingApiPostStateInclude,
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    take: 2_000,
  });
  const posts = records.map(mapPublishingApiPostSummary);
  return Object.freeze(
    status === undefined ? posts : posts.filter((post) => post.status === status),
  );
};
