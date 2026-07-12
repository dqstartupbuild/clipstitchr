import { rm } from "node:fs/promises";
import { deleteR2Object } from "@/lib/clipstitchr/server/r2/deleteR2Object";

type DeleteHookLabTemporaryVideoOptions = {
  deleteObject?: (key: string) => Promise<unknown>;
  filePath?: string;
  objectKey?: string;
  removeFile?: (path: string) => Promise<unknown>;
};

export async function deleteHookLabTemporaryVideo({
  deleteObject = deleteR2Object,
  filePath,
  objectKey,
  removeFile = (path) => rm(path, { force: true }),
}: DeleteHookLabTemporaryVideoOptions) {
  const cleanupTasks: Promise<unknown>[] = [];

  if (filePath?.trim()) {
    cleanupTasks.push(removeFile(filePath));
  }

  if (objectKey?.trim()) {
    cleanupTasks.push(deleteObject(objectKey));
  }

  const results = await Promise.allSettled(cleanupTasks);
  const failures = results.flatMap((result) =>
    result.status === "rejected" ? [result.reason] : [],
  );

  if (failures.length) {
    throw new AggregateError(failures, "Unable to delete temporary Hook Lab video.");
  }
}
