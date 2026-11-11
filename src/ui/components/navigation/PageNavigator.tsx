import { ChevronLeft, ChevronRight } from "lucide-react";

interface PageNavigatorProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function PageNavigator({ page, totalPages, onPageChange }: PageNavigatorProps) {
  if (totalPages <= 1) return null;

  const previousPage = page - 1;
  const nextPage = page + 1;
  const pageButtonClass = "flex h-10 min-w-10 items-center justify-center rounded-xl px-2 text-on-surface transition-colors hover:bg-surface-variant/20 cursor-pointer";
  const arrowButtonClass = "flex h-10 w-10 items-center justify-center rounded-xl border border-outline-variant/10 text-on-surface-variant transition-colors hover:bg-surface-variant/20 cursor-pointer";

  return (
    <nav aria-label="Paginación" className="mt-14 flex items-center justify-center gap-2">
      {previousPage >= 0 && (
        <>
          <button type="button" onClick={() => onPageChange(previousPage)} className={arrowButtonClass} aria-label="Página anterior">
            <ChevronLeft size={24} />
          </button>
          <button type="button" onClick={() => onPageChange(previousPage)} className={pageButtonClass}>
            {previousPage + 1}
          </button>
        </>
      )}
      <span aria-current="page" className="flex h-10 min-w-10 items-center justify-center rounded-xl bg-primary px-2 font-bold text-on-primary">
        {page + 1}
      </span>
      {nextPage < totalPages && (
        <>
          <button type="button" onClick={() => onPageChange(nextPage)} className={pageButtonClass}>
            {nextPage + 1}
          </button>
          <button type="button" onClick={() => onPageChange(nextPage)} className={arrowButtonClass} aria-label="Página siguiente">
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </nav>
  );
}
