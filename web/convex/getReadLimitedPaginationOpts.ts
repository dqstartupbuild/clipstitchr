import type { PaginationOptions } from "convex/server";

const MAXIMUM_ROWS_READ = 120;
const MAXIMUM_BYTES_READ = 512 * 1024;

export function getReadLimitedPaginationOpts(
  paginationOpts: PaginationOptions,
): PaginationOptions {
  return {
    ...paginationOpts,
    maximumRowsRead: Math.min(
      paginationOpts.maximumRowsRead ?? MAXIMUM_ROWS_READ,
      MAXIMUM_ROWS_READ,
    ),
    maximumBytesRead: Math.min(
      paginationOpts.maximumBytesRead ?? MAXIMUM_BYTES_READ,
      MAXIMUM_BYTES_READ,
    ),
  };
}
