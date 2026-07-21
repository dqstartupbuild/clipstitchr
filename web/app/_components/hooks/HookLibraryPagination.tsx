import { ChevronLeft, ChevronRight } from "lucide-react";
import { getHookLibraryPaginationPages } from "@/lib/clipstitchr/utils/getHookLibraryPaginationPages";

export function HookLibraryPagination({
  currentPage,
  totalPages,
  onChange,
}: {
  currentPage: number;
  totalPages: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  const buttonClassName =
    "inline-flex size-10 items-center justify-center rounded-md text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-40";

  return (
    <nav
      aria-label="Hook library pages"
      className="flex flex-wrap items-center justify-center gap-1"
    >
      <button
        aria-label="Previous page"
        className={`${buttonClassName} bg-[#e3ebe6] text-[#27332d] hover:bg-[#d3dfd8]`}
        disabled={currentPage <= 1}
        type="button"
        onClick={() => onChange(currentPage - 1)}
      >
        <ChevronLeft aria-hidden className="size-4" />
      </button>
      {getHookLibraryPaginationPages(currentPage, totalPages).map(
        (page, index) =>
          page === "ellipsis" ? (
            <span
              aria-hidden
              className="inline-flex size-10 items-center justify-center text-[#68736d]"
              key={`ellipsis-${index}`}
            >
              …
            </span>
          ) : (
            <button
              aria-current={page === currentPage ? "page" : undefined}
              aria-label={`Page ${page}`}
              className={`${buttonClassName} ${
                page === currentPage
                  ? "bg-[#151a18] text-white"
                  : "bg-[#e3ebe6] text-[#27332d] hover:bg-[#d3dfd8]"
              }`}
              key={page}
              type="button"
              onClick={() => onChange(page)}
            >
              {page}
            </button>
          ),
      )}
      <button
        aria-label="Next page"
        className={`${buttonClassName} bg-[#e3ebe6] text-[#27332d] hover:bg-[#d3dfd8]`}
        disabled={currentPage >= totalPages}
        type="button"
        onClick={() => onChange(currentPage + 1)}
      >
        <ChevronRight aria-hidden className="size-4" />
      </button>
    </nav>
  );
}
