import { useNavigate } from "react-router";
import { Clock3, Orbit, Sparkles } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getReadingHistory, type ReadingHistoryEntry } from "../utils/readingHistory";

const formatReadTime = (date: string) => {
  const elapsed = Date.now() - new Date(date).getTime();
  if (elapsed < 60_000) return "Hace un momento";
  if (elapsed < 3_600_000) return `Hace ${Math.floor(elapsed / 60_000)} min`;
  if (elapsed < 86_400_000) return `Hace ${Math.floor(elapsed / 3_600_000)} h`;
  return new Date(date).toLocaleDateString();
};

export default function ReadingHistory() {
  const { authUser } = useAuth();
  const navigate = useNavigate();
  const entries: ReadingHistoryEntry[] = getReadingHistory(authUser?.userId ?? null);

  return (
    <main className="relative mx-auto w-full max-w-5xl overflow-hidden px-4 py-8 sm:px-6 sm:py-12">
      <div className="pointer-events-none absolute -left-24 top-20 h-64 w-64 rounded-full bg-high-enfasis/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-20 top-72 h-72 w-72 rounded-full bg-secondary/10 blur-3xl" />
      <header className="relative mb-10 overflow-hidden rounded-3xl border border-high-enfasis/20 bg-gradient-to-br from-surface-container-high via-background-global to-secondary-container/40 p-6 shadow-2xl sm:p-10">
        <div className="absolute -right-4 -top-8 animate-[rift-drift_8s_ease-in-out_infinite] text-high-enfasis/15">
          <Orbit size={180} strokeWidth={0.8} />
        </div>
        <div className="relative flex items-center gap-3 text-high-enfasis">
          <Clock3 size={22} />
          <p className="text-xs font-bold uppercase tracking-[0.3em]">Archivo temporal</p>
        </div>
        <h1 className="relative mt-3 text-3xl font-black tracking-tight text-global sm:text-5xl">Tu línea del tiempo</h1>
        <p className="relative mt-3 max-w-xl text-sm leading-relaxed text-several-light sm:text-base">
          Cada capítulo que visitas deja una huella. Regresa al punto exacto donde el tiempo se detuvo.
        </p>
        <div className="relative mt-6 flex items-center gap-2 text-xs text-high-enfasis/80">
          <Sparkles size={16} />
          <span>{entries.length} {entries.length === 1 ? "capítulo en tu archivo" : "capítulos en tu archivo"}</span>
        </div>
      </header>

      {entries.length ? (
        <ol className="relative space-y-5 before:absolute before:bottom-8 before:left-[15px] before:top-8 before:w-px before:bg-gradient-to-b before:from-high-enfasis/80 before:via-secondary/40 before:to-transparent sm:before:left-5">
          {entries.map((entry, index) => (
            <li key={entry.chapterId} className="relative pl-10 sm:pl-14">
              <span className="absolute left-[8px] top-7 z-10 flex h-4 w-4 items-center justify-center rounded-full border border-high-enfasis bg-background-global shadow-[0_0_16px_rgba(255,93,98,0.65)] sm:left-3 sm:top-8 sm:h-5 sm:w-5">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-high-enfasis" />
              </span>
              <article
                className="group relative animate-[rift-entry_500ms_ease-out_both] overflow-hidden rounded-2xl border border-toolbar-bg/20 bg-surface-container-low/90 p-4 shadow-xl transition duration-500 hover:-translate-y-1 hover:border-high-enfasis/40 hover:shadow-[0_18px_50px_rgba(255,93,98,0.09)] sm:p-6"
                style={{ animationDelay: `${Math.min(index, 8) * 70}ms` }}
              >
                <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-high-enfasis/5 blur-2xl transition group-hover:bg-high-enfasis/10" />
                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-widest text-high-enfasis">{entry.storyTitle || "Historia"}</p>
                    <h2 className="mt-1 break-words text-lg font-bold text-global sm:text-xl">
                      Capítulo {String(entry.chapterOrder).padStart(2, "0")} · {entry.chapterTitle || "Sin título"}
                    </h2>
                    <p className="mt-1 text-sm text-several-light">
                      {entry.storyAuthor ? `Por ${entry.storyAuthor} · ` : ""}{formatReadTime(entry.lastReadAt)}
                    </p>
                  </div>
                  <span className="w-fit rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary">
                    {entry.progress >= 100 ? "Completado" : `${entry.progress}% recorrido`}
                  </span>
                </div>
                <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-background-global">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-high-enfasis via-primary to-secondary shadow-[0_0_12px_rgba(255,93,98,0.4)] transition-[width] duration-700"
                    style={{ width: `${Math.max(0, Math.min(100, entry.progress))}%` }}
                  />
                </div>
                <div className="relative mt-4 flex items-center justify-between gap-3">
                  <span className="text-xs text-several-light">{entry.progress >= 100 ? "La grieta quedó sellada" : "Tu lugar sigue esperándote"}</span>
                  <button
                    type="button"
                    onClick={() => navigate("/read", {
                      state: {
                        chapterId: entry.chapterId,
                        storyTitle: entry.storyTitle,
                        storyAuthor: entry.storyAuthor,
                        continueReading: true,
                      },
                    })}
                    className="cursor-pointer rounded-xl bg-high-enfasis px-4 py-2 text-sm font-bold text-background-global transition hover:scale-[0.97] hover:shadow-lg hover:shadow-high-enfasis/20 active:scale-95"
                  >
                    {entry.progress > 0 ? "Retomar lectura" : "Comenzar lectura"}
                  </button>
                </div>
              </article>
            </li>
          ))}
        </ol>
      ) : (
        <div className="relative rounded-3xl border border-dashed border-toolbar-bg/30 bg-surface-container-low/60 px-6 py-14 text-center">
          <Clock3 className="mx-auto text-high-enfasis/70" size={40} />
          <h2 className="mt-4 text-xl font-bold text-global">Aún no hay huellas en el tiempo</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-several-light">Explora una historia y abre un capítulo. Guardaremos tu recorrido para que puedas retomarlo cuando quieras.</p>
          <button type="button" onClick={() => navigate("/explore")} className="mt-6 cursor-pointer rounded-xl bg-high-enfasis px-5 py-3 font-bold text-background-global transition hover:scale-95">
            Explorar historias
          </button>
        </div>
      )}
    </main>
  );
}
