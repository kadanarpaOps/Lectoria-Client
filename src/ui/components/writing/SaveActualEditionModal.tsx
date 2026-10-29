import { useEffect } from "react";
import type { EditingChapter } from "../../../core/domain/models/chapters/ChapterModel";
import { getLastModifiedTime } from "../../pages/utils/time.util";
import { ChevronsRight, Save, Skull } from "lucide-react";
import { countTotalWords, parseTiptapContent, renderWithoutFormat } from "../../pages/utils/renderTiptap.util";

interface Props {
  toSaveChapter: EditingChapter;
  toEditChapter: EditingChapter;
  onSave(): void;
  onDiscard(): void;
  onContinue(): void;
}

const SaveActualEditionModal = ({ toSaveChapter, toEditChapter, onSave, onDiscard, onContinue }: Props) => {

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 bg-black/30 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl bg-search-bg rounded-2xl flex-col p-4 sm:p-8 max-h-[85dvh] overflow-y-auto custom-scrollbar">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-fujiWhite tracking-tight">
            ¡Tienes un Capítulo pendiente por guardar!
          </h2>
        </div>
        <div className="group flex items-center justify-between p-6 rounded-2xl bg-surface-container-low border border-transparent hover:border-primary/20 transition-all cursor-default">
          <div className="flex items-center gap-6">
            <span className="text-2xl font-display font-black text-on-surface-variant/50 italic">
              {String(toSaveChapter.order).padStart(2, '0')}
            </span>
            <div>
              <h4 className={`text-lg ${toSaveChapter.title ? "font-bold text-on-surface group-hover:text-primary transition-colors" : "font-light text-on-surface-variant/40 italic"}`}>
                {toSaveChapter.title ? renderWithoutFormat(parseTiptapContent(toSaveChapter.title)) : "Sin título"}
              </h4>
              <p className="text-xs text-on-surface-variant">
                {toSaveChapter.hidden ? "Borrador" : "Publicado"} • Última Edición {toSaveChapter.updatedAt ? getLastModifiedTime(toSaveChapter.updatedAt) : "Nunca"} • {toSaveChapter.content ? countTotalWords(parseTiptapContent(toSaveChapter.content)) : 0} palabras
              </p>
            </div>
          </div>
        </div>
        <div className="text-center my-8">
          <h2 className="text-xl font-bold text-fujiWhite tracking-tight">
            <p className="text-on-surface-variant/60">
              Puedes guardarlo y comenzar a editar Capítulo {String(toEditChapter.order).padStart(2, '0')} <span className="italic">{toEditChapter.title ? renderWithoutFormat(parseTiptapContent(toEditChapter.title)) : "Sin título"}</span>
            </p>
          </h2>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-around gap-3">
          <button type="button" onClick={onSave} className="group relative w-full sm:w-auto rounded-2xl bg-toolbar-bg text-left cursor-pointer hover:scale-95 transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-high-enfasis">
            <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent"></div>
              <div className="relative z-10 p-4 sm:p-6 flex flex-row gap-3 sm:gap-4 items-center h-full justify-start">
                <span className="text-4xl text-high-enfasis">
                  <Save size={40} />
                </span>
                <span className="text-lg sm:text-2xl font-bold text-fujiWhite tracking-tight">
                  Guardar
                </span>
              </div>
          </button>
          <button type="button" onClick={onContinue} className="group relative w-full sm:w-auto rounded-2xl bg-toolbar-bg text-left cursor-pointer hover:scale-95 transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-high-enfasis">
            <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent"></div>
              <div className="relative z-10 p-4 sm:p-6 flex flex-row gap-3 sm:gap-4 items-center h-full justify-start">
                <span className="text-4xl text-high-enfasis">
                  <ChevronsRight size={40} />
                </span>
                <span className="text-lg sm:text-2xl font-bold text-fujiWhite tracking-tight">
                  Seguir Editando
                </span>
              </div>
          </button>
        </div>
        <div className="text-center my-8">
          <h2 className="text-xl font-bold text-fujiWhite tracking-tight">
            <p className="text-on-surface-variant/60">
              Si descartas la edición actual <span className="bold">no podrás recuperarla</span>
            </p>
          </h2>
        </div>
        <div className="flex items-center justify-center">
          <button type="button" onClick={onDiscard} className="group relative w-full sm:w-auto rounded-2xl bg-toolbar-bg text-left cursor-pointer hover:scale-95 transition-all duration-300 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-high-enfasis">
            <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent"></div>
              <div className="relative z-10 p-4 sm:p-6 flex flex-row gap-3 sm:gap-4 items-center h-full justify-start">
                <span className="text-4xl text-high-enfasis">
                  <Skull size={40} />
                </span>
                <span className="text-lg sm:text-2xl font-bold text-fujiWhite tracking-tight">
                  Descartar
                </span>
              </div>
          </button>
          </div>
        </div>
    </div>
  );
}

export default SaveActualEditionModal;
