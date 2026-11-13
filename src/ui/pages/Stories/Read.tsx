import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import type { ChapterInfo } from "../../../core/domain/models/chapters/ChapterModel";
import { parseTiptapContent, renderWithFormat, renderWithoutFormat } from "../utils/renderTiptap.util";
import CommentsSection from "../../components/stories/CommentsSection";
import { getChapterById } from "../../../infrastructure/api/requests/chapters/chapters.request";
import { useAuth } from "../../hooks/useAuth";
import { getChapterProgress, saveReadingProgress } from "../utils/readingHistory";
import { ArrowLeft, BookOpen, Clock3, ListTree, RotateCcw } from "lucide-react";

type ReadRouteState = {
  chapterToRead?: ChapterInfo;
  chapterId?: string;
  storyTitle?: string;
  storyAuthor?: string;
  continueReading?: boolean;
} | null;

type ChapterHeading = { id: string; title: string; level: number };

const getChapterScrollLimit = (reader: HTMLDivElement, content: HTMLDivElement) => {
  const contentEnd = content.getBoundingClientRect().bottom - reader.getBoundingClientRect().top + reader.scrollTop;
  return Math.max(0, contentEnd - reader.clientHeight);
};

const Read = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { authUser } = useAuth();
  const routeState = location.state as ReadRouteState;
  const chapterToRead = routeState?.chapterToRead ?? null;
  const chapterId = routeState?.chapterId ?? null;
  const readerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const saveTimerRef = useRef<number | null>(null);
  const [readingChapter, setReadingChapter] = useState<ChapterInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [resumePrompt, setResumePrompt] = useState(false);
  const [readStarted, setReadStarted] = useState(false);
  const [restorePosition, setRestorePosition] = useState(false);
  const [headings, setHeadings] = useState<ChapterHeading[]>([]);
  const contentHtml = useMemo(
    () => readingChapter ? renderWithFormat(parseTiptapContent(readingChapter.content)) : "",
    [readingChapter],
  );
  const userId = authUser?.userId ?? null;

  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      setReadingChapter(null);
      setResumePrompt(false);
      setReadStarted(false);
      const loadChapter = chapterToRead
        ? Promise.resolve(chapterToRead)
        : chapterId
          ? getChapterById(chapterId)
          : Promise.resolve(null);
      void loadChapter.then((chapter) => {
        if (!active) return;
        if (!chapter) {
          setError("No se encontró el capítulo que quieres leer.");
          return;
        }
        setReadingChapter(chapter);
        const progress = getChapterProgress(userId, chapter.id);
        if (progress) {
          const hasPosition = progress.positionProgress > 0;
          setResumePrompt(hasPosition && !routeState?.continueReading);
          setRestorePosition(hasPosition && Boolean(routeState?.continueReading));
          setReadStarted(!hasPosition || Boolean(routeState?.continueReading));
        } else {
          saveReadingProgress(userId, {
            chapterId: chapter.id,
            storyId: chapter.storyId,
            chapterOrder: chapter.order,
            chapterTitle: renderWithoutFormat(parseTiptapContent(chapter.title)),
            storyTitle: routeState?.storyTitle ?? "Historia",
            storyAuthor: routeState?.storyAuthor ?? "",
            progress: 0,
            positionProgress: 0,
            scrollPosition: 0,
            scrollExtent: 0,
            lastReadAt: new Date().toISOString(),
          });
          setReadStarted(true);
        }
      }).catch(() => {
        if (active) setError("No se pudo cargar el capítulo. Comprueba tu conexión e inténtalo nuevamente.");
      }).finally(() => {
        if (active) setLoading(false);
      });
    }, 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [chapterToRead, chapterId, routeState?.continueReading, routeState?.storyTitle, routeState?.storyAuthor, userId]);

  useEffect(() => {
    if (!readingChapter || !readStarted || !restorePosition || !readerRef.current || !contentRef.current) return;
    const entry = getChapterProgress(userId, readingChapter.id);
    const frame = window.requestAnimationFrame(() => {
      const reader = readerRef.current;
      const content = contentRef.current;
      if (!reader || !content) return;
      const maxScroll = getChapterScrollLimit(reader, content);
      const proportionalPosition = maxScroll * (entry?.positionProgress ?? 0) / 100;
      const sameReadingLayout = entry?.scrollExtent
        && Math.abs(entry.scrollExtent - maxScroll) <= Math.max(100, entry.scrollExtent * 0.05);
      reader.scrollTop = Math.max(0, sameReadingLayout ? entry.scrollPosition : proportionalPosition);
      setRestorePosition(false);
    });
    return () => window.cancelAnimationFrame(frame);
  }, [readingChapter, readStarted, restorePosition, userId]);

  useEffect(() => {
    if (!contentRef.current) return;
    const elements = Array.from(contentRef.current.querySelectorAll("h1, h2, h3"));
    const nextHeadings = elements.map((element, index) => {
      const id = `chapter-heading-${index}`;
      element.id = id;
      return {
        id,
        title: element.textContent?.trim() || `Sección ${index + 1}`,
        level: Number(element.tagName.slice(1)),
      };
    });
    setHeadings(nextHeadings);
  }, [contentHtml, readingChapter]);

  const persistReaderPosition = useCallback(() => {
    const reader = readerRef.current;
    const content = contentRef.current;
    if (!reader || !content || !readingChapter || !readStarted) return;
    const maxScroll = getChapterScrollLimit(reader, content);
    const positionProgress = maxScroll <= 0
      ? 100
      : Math.min(100, Math.max(0, Math.round((reader.scrollTop / maxScroll) * 100)));
    const previous = getChapterProgress(userId, readingChapter.id);
    saveReadingProgress(userId, {
      chapterId: readingChapter.id,
      storyId: readingChapter.storyId,
      chapterOrder: readingChapter.order,
      chapterTitle: renderWithoutFormat(parseTiptapContent(readingChapter.title)),
      storyTitle: routeState?.storyTitle ?? previous?.storyTitle ?? "Historia",
      storyAuthor: routeState?.storyAuthor ?? previous?.storyAuthor ?? "",
      progress: positionProgress,
      positionProgress,
      scrollPosition: reader.scrollTop,
      scrollExtent: maxScroll,
      lastReadAt: new Date().toISOString(),
    });
  }, [readingChapter, readStarted, routeState?.storyAuthor, routeState?.storyTitle, userId]);

  const handleReaderScroll = useCallback(() => {
    if (!readingChapter || !readStarted || !readerRef.current || !contentRef.current) return;
    if (saveTimerRef.current !== null) window.clearTimeout(saveTimerRef.current);
    saveTimerRef.current = window.setTimeout(() => {
      saveTimerRef.current = null;
      persistReaderPosition();
    }, 350);
  }, [persistReaderPosition, readingChapter, readStarted]);

  useEffect(() => () => {
    if (saveTimerRef.current !== null) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
      persistReaderPosition();
    }
  }, [persistReaderPosition]);

  const startReading = (continueFromSavedPosition: boolean) => {
    if (!readingChapter) return;
    if (!continueFromSavedPosition) {
      const previous = getChapterProgress(userId, readingChapter.id);
      saveReadingProgress(userId, {
        chapterId: readingChapter.id,
        storyId: readingChapter.storyId,
        chapterOrder: readingChapter.order,
        chapterTitle: renderWithoutFormat(parseTiptapContent(readingChapter.title)),
        storyTitle: routeState?.storyTitle ?? previous?.storyTitle ?? "Historia",
        storyAuthor: routeState?.storyAuthor ?? previous?.storyAuthor ?? "",
        progress: 0,
        positionProgress: 0,
        scrollPosition: 0,
        scrollExtent: 0,
        lastReadAt: new Date().toISOString(),
      }, false);
    }
    setRestorePosition(continueFromSavedPosition);
    setResumePrompt(false);
    setReadStarted(true);
  };

  const jumpToHeading = (headingId: string) => {
    const reader = readerRef.current;
    const target = document.getElementById(headingId);
    if (!reader || !target) return;
    const top = target.getBoundingClientRect().top - reader.getBoundingClientRect().top + reader.scrollTop;
    reader.scrollTo({ top, behavior: "smooth" });
  };

  return (
    <main className="mx-auto flex w-full max-w-6xl grow flex-col px-2 pb-5 pt-3 sm:px-5 sm:pt-5">
      {loading ? (
        <div className="flex min-h-[60vh] items-center justify-center"><div className="loading-button" /></div>
      ) : error ? (
        <div className="mx-auto my-auto max-w-lg rounded-2xl border border-red-400/20 bg-surface-container-low p-8 text-center">
          <p role="alert" className="text-red-300">{error}</p>
          <button type="button" onClick={() => navigate(-1)} className="mt-5 cursor-pointer rounded-xl bg-surface-container-high px-5 py-3 font-semibold text-global transition hover:bg-high-enfasis/10">
            Volver
          </button>
        </div>
      ) : readingChapter ? (
        <>
          <header className="mb-3 flex items-center justify-between gap-3 px-2 sm:px-4">
            <button type="button" onClick={() => navigate(-1)} className="inline-flex cursor-pointer items-center gap-2 rounded-xl px-2 py-2 text-sm text-several-light transition hover:bg-global/5 hover:text-global">
              <ArrowLeft size={18} /> <span className="hidden sm:inline">Volver a la historia</span>
            </button>
            <span className="max-w-[55%] truncate text-right text-xs text-several-light sm:text-sm">
              {routeState?.storyTitle ?? "Lectura"} · Capítulo {String(readingChapter.order).padStart(2, "0")}
            </span>
          </header>
          <div
            ref={readerRef}
            dir="rtl"
            onScroll={handleReaderScroll}
            className="reading-scroll-area custom-scrollbar min-h-0 max-h-[calc(100dvh-9rem)] flex-1 overflow-y-auto rounded-3xl border border-toolbar-bg/20 bg-surface-container-low shadow-2xl"
            aria-label="Contenido del capítulo; barra de desplazamiento a la izquierda"
          >
            <div dir="ltr" className="mx-auto max-w-4xl px-5 py-7 sm:px-10 sm:py-12">
              <div className="mb-8 border-b border-toolbar-bg/20 pb-7 sm:mb-10 sm:pb-9">
                <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-high-enfasis">
                  <BookOpen size={16} /> Capítulo {String(readingChapter.order).padStart(2, "0")}
                </p>
                <h1 className="break-words text-3xl font-black leading-tight text-global sm:text-5xl">
                  {renderWithoutFormat(parseTiptapContent(readingChapter.title))}
                </h1>
              </div>
              {headings.length > 0 && (
                <nav aria-label="Secciones del capítulo" className="mb-8 rounded-2xl border border-toolbar-bg/15 bg-background-global/60 p-4 sm:p-5">
                  <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-several-light">
                    <ListTree size={16} /> En este capítulo
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {headings.map((heading) => (
                      <button key={heading.id} type="button" onClick={() => jumpToHeading(heading.id)}
                        className={`max-w-full cursor-pointer truncate rounded-lg bg-surface-container-high px-3 py-2 text-left text-xs text-global transition hover:bg-high-enfasis/15 hover:text-high-enfasis ${heading.level > 1 ? "sm:ml-3" : ""}`}>
                        {heading.title}
                      </button>
                    ))}
                  </div>
                </nav>
              )}
              <article
                ref={contentRef}
                className="reader-prose min-h-40 break-words text-base leading-8 text-global/90 sm:text-lg sm:leading-9"
                dangerouslySetInnerHTML={{ __html: contentHtml }}
              />
              <div className="mt-12 border-t border-toolbar-bg/20 pt-8">
                <CommentsSection key={readingChapter.id} chapterId={readingChapter.id} title="Comentarios del capítulo" />
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="m-auto text-center text-several-light">No estás leyendo ningún capítulo.</div>
      )}

      {resumePrompt && readingChapter && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="resume-reading-title">
          <section className="relative w-full max-w-md overflow-hidden rounded-3xl border border-high-enfasis/30 bg-surface-container-low p-6 shadow-[0_0_70px_rgba(255,93,98,0.2)] sm:p-8">
            <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-high-enfasis/10 blur-2xl" />
            <Clock3 className="relative mb-4 text-high-enfasis" size={32} />
            <h2 id="resume-reading-title" className="relative text-2xl font-black text-global">Una grieta en el tiempo</h2>
            <p className="relative mt-3 text-sm leading-relaxed text-several-light">
              Ya habías recorrido el {getChapterProgress(userId, readingChapter.id)?.progress ?? 0}% de este capítulo. ¿Quieres volver al comienzo o continuar exactamente donde lo dejaste?
            </p>
            <div className="relative mt-7 grid gap-3 sm:grid-cols-2">
              <button type="button" onClick={() => startReading(false)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-toolbar-bg/30 px-4 py-3 text-sm font-semibold text-global transition hover:bg-surface-container-high">
                <RotateCcw size={17} /> Desde el inicio
              </button>
              <button type="button" onClick={() => startReading(true)} className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-high-enfasis px-4 py-3 text-sm font-bold text-background-global transition hover:scale-[0.98]">
                <Clock3 size={17} /> Continuar leyendo
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
};

export default Read;
