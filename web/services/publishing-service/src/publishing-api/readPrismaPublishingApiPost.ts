import type { PrismaClient } from "@prisma/client";

import { PublishingResourceOwnershipError } from "../errors/PublishingResourceOwnershipError.js";
import type { PublishingTenantKey } from "../identity/PublishingTenantKey.js";
import { mapPublishingApiPostDetail } from "./mapPublishingApiPostDetail.js";
import { publishingApiPostStateInclude } from "./publishingApiPostStateInclude.js";

export const readPrismaPublishingApiPost = async (
  database: PrismaClient,
  tenantKey: PublishingTenantKey,
  postId: string,
) => {
  const record = await database.clipPublishingPostState.findFirst({
    where: {
      postId,
      tenant: { tenantKey },
      post: { deletedAt: null },
    },
    include: publishingApiPostStateInclude,
  });
  if (record === null) {
    throw new PublishingResourceOwnershipError();
  }
  return mapPublishingApiPostDetail(record);
};
