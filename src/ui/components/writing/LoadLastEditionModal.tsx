import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ChevronsRight, BookOpenText, History, ChevronLeft } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useStories } from "../../hooks/useStories";
import type { LastModifiedStory } from "../../../core/domain/models/stories/StoryModel";
import { getLastModifiedTime } from "../../pages/utils/time.util";
import type { ChapterInfo, EditingChapter } from "../../../core/domain/models/chapters/ChapterModel";

interface Props {
  setChapter(lastChapter: EditingChapter): void;
}

const LoadLastEditionModal = ({ setChapter }: Props) => {
  const { authUser } = useAuth();
  const { loadLastModifiedStoryForAuthUser, loading } = useStories();
  const [ lastStory, setLastStory ] = useState<LastModifiedStory | null>(null);
  const [ lastChapter, setLastChapter ] = useState<ChapterInfo | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const loadLastStory = async () => {
      if (authUser) {
        const responseStory = await loadLastModifiedStoryForAuthUser();
        if (responseStory !== null) {
          setLastStory(responseStory);
          if (responseStory.chapters.length > 0) {
            setLastChapter(responseStory.chapters[0]);
          }
        }
        setLastStory(responseStory);
      }
    };

    loadLastStory();
  }, [authUser, loadLastModifiedStoryForAuthUser]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 bg-black/30 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-search-bg rounded-2xl flex-col p-4 sm:p-8 max-h-[85dvh] overflow-y-auto custom-scrollbar">
        <div onClick={() => navigate(-1)} className="absolute mt-1 hover:text-high-enfasis cursor-pointer transition-all duration-300">
          <ChevronLeft size={24} />
        </div>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-fujiWhite tracking-tight">
            {lastStory ? "Continúa editando tu última historia" : "Empieza a escribir!"}
          </h2>
        </div>

        <div className="group flex items-center justify-between p-6 rounded-2xl bg-surface-container-low border border-transparent hover:border-primary/20 transition-all cursor-default">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-display font-black text-on-surface-variant/50 italic">
              <History size={30} />
            </span>
            <div>
              <h4 className={`text-lg ${lastStory?.title ? "font-bold text-on-surface group-hover:text-primary transition-colors" : "font-light text-on-surface-variant/40 italic"}`}>
                {loading ? "Cargando historia..." : lastStory?.title ?? "No tienes una historia reciente"}
              </h4>
              <p className="text-xs text-on-surface-variant">
                {lastStory ? `${lastStory.hidden ? "Borrador" : "Publicado"} • Última Edición ${lastStory.updatedAt ? getLastModifiedTime(lastStory.updatedAt): "Nunca"} • ${lastStory.totalChapters} capítulos` : "Aún no hay una historia reciente para mostrar"}
              </p>
            </div>
          </div>
        </div>

        {lastStory && (
          <>
            <div className="text-center my-8">
              <h2 className="text-xl font-bold text-fujiWhite tracking-tight">
                <p className="text-on-surface-variant/60">
                  Tu última versión quedó guardada y lista para continuar cuando quieras.
                </p>
              </h2>
            </div>
        
            <div className="flex items-center justify-center">
              {lastChapter ? (
                <div
                  onClick={() => setChapter({ ...lastChapter, order: lastChapter.order.toString() })}
                  className="group relative w-full sm:w-max rounded-2xl bg-toolbar-bg cursor-pointer hover:scale-95 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent"></div>
                  <div className="relative z-10 p-4 sm:p-6 flex flex-row gap-3 sm:gap-4 items-center h-full justify-start">
                    <span className="text-4xl text-high-enfasis">
                      <ChevronsRight size={40} />
                    </span>
                    <span className="text-lg sm:text-2xl font-bold text-fujiWhite tracking-tight">
                      Sigue editando <span className="pl-2 font-light italic">Capítulo {lastChapter.order}</span>
                    </span>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => navigate(`/story/edit/${lastStory.id}`)}
                  className="group relative w-full sm:w-max rounded-2xl bg-toolbar-bg cursor-pointer hover:scale-95 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent"></div>
                  <div className="relative z-10 p-4 sm:p-6 flex flex-row gap-3 sm:gap-4 items-center h-full justify-start">
                    <span className="text-4xl text-high-enfasis">
                      <ChevronsRight size={40} />
                    </span>
                    <span className="text-lg sm:text-2xl font-bold text-fujiWhite tracking-tight">
                      Crea un capítulo
                    </span>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="text-center my-8">
          <h2 className="text-xl font-bold text-fujiWhite tracking-tight">
            <p className="text-on-surface-variant/60">
              Escoge algún mundo y sigue construyendo tu historia.
            </p>
          </h2>
        </div>

        <div className="flex items-center justify-center">
          <Link
            to="/library"
            className="group relative w-full sm:w-max rounded-2xl bg-toolbar-bg cursor-pointer hover:scale-95 transition-all duration-300 overflow-hidden"
          >
            <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent"></div>
            <div className="relative z-10 p-4 sm:p-6 flex flex-row gap-3 sm:gap-4 items-center h-full justify-start">
              <span className="text-4xl text-high-enfasis">
                <BookOpenText size={40} />
              </span>
              <span className="text-lg sm:text-2xl font-bold text-fujiWhite tracking-tight">
                Edita alguna de tus otras historias
              </span>
            </div>
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoadLastEditionModal;
