import { getHookLabMediaJobTemporaryObjects } from "./getHookLabMediaJobTemporaryObjects.mjs";

export async function deleteHookLabMediaJobTemporaryObjects({
  config,
  deleteR2Object,
  job,
  r2,
}) {
  const objects = getHookLabMediaJobTemporaryObjects(job);

  await Promise.allSettled(
    objects.map((object) =>
      deleteR2Object({ client: r2, config, key: object.key }),
    ),
  );
}
