import { useNavigate, useSearchParams } from "react-router";
import { useSearchStories } from "../../hooks/useSearchStories";
import { useCallback, useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import type { StatusNames, StoryFilters, StoryInfo } from "../../../core/domain/models/stories/StoryModel";
import type { searchSchema } from "../../schemas/stories/stories.schema";
import type z from "zod";
import SelectCategoryModal from "../stories/SelectCategoryModal";
import SelectNewStatusModal from "../stories/SelectNewStatusModal";
import { Bolt, Cog, LineSquiggle, Plus, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { GenreIcon } from "../stories/GenresIcons";
import { StatusIcon } from "../stories/StatusesIcons";
import { BookCard } from "../../pages/landing/LandingPage";
import { getRandomColor } from "../../pages/utils/colors.util";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import PageNavigator from "./PageNavigator";

type SearchFormValues = z.infer<typeof searchSchema>;

interface Props {
  loadStories: (filters: StoryFilters) => Promise<PageResponse<StoryInfo>>;
  loading: boolean;
  routeAction: string;
}

const ExploreSection = ({ loadStories, loading, routeAction }: Props) => {

    // Use Navigate
    const navigate = useNavigate();
    // Use Search Params
    const [ searchParams ] = useSearchParams();
    // Use Search Stories
    const { searchForm, resultStories, handleSearch, resetSearch } = useSearchStories({ loadStories });
    const [ page, setPage ] = useState<number>(0);
    // Use Form
    const { handleSubmit, reset, control, setValue } = searchForm;

    // Watch for real time values
    const currentGenre = useWatch({ control, name: "genreName" });
    const currentSubgenre = useWatch({ control, name: "secondaryGenreName" });
    const currentStatus = useWatch({ control, name: "status" });

    // Select Search Genre or Subgenre
    const [ isSelectingGenreOrSubgenre, setIsSelectingGenreOrSubgenre ] = useState<"genre" | "subgenre" | null>(null);
    const [ isSelectingStatus, setIsSelectingStatus ] = useState<boolean>(false);
    // Handle Selections
    const handleSelectGenre = (value: string) => {
      if (isSelectingGenreOrSubgenre === "genre") setValue("genreName", value);
      if (isSelectingGenreOrSubgenre === "subgenre") setValue("secondaryGenreName", value);
      setIsSelectingGenreOrSubgenre(null)
    };
    const handleSelectStatus = (value: StatusNames) => {
        setValue("status", value);
        setIsSelectingStatus(false);
    };

    // Use Effect for default search
    useEffect(() => {
        const initialSearch = async () => {
            await handleSearch({
                offset: 0,
                limit: 12,
                title: null,
                genreName: null,
                secondaryGenreName: null,
                status: null,
                tagNames: null,
                newestFirst: true
            });
        };
        initialSearch();
    }, [handleSearch]);

    // Handle Submit
    const onSubmit = useCallback(async (data: SearchFormValues) => {
      const titleParam = searchParams.get("title") || "";

      data.offset = page * 12;
      await handleSearch({ ...data, title: titleParam !== "" ? titleParam : null, limit: 12});
    }, [handleSearch, page, searchParams]); 

    useEffect(() => {
        const loadPerChange = async () => {
            handleSubmit(onSubmit)();
        };
        loadPerChange();
    }, [handleSubmit, page, onSubmit])

    // Mobile filter sheet
    const [ filtersOpen, setFiltersOpen ] = useState<boolean>(false);
    const activeFilterCount = [currentGenre, currentSubgenre, currentStatus].filter(Boolean).length;

    useEffect(() => {
        if (!filtersOpen) return;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.body.style.overflow = previousOverflow;
        };
    }, [filtersOpen]);

    // Close the sheet if the viewport becomes desktop while it is open
    useEffect(() => {
        const mediaQuery = window.matchMedia("(min-width: 768px)");
        const handleChange = (event: MediaQueryListEvent) => {
            if (event.matches) setFiltersOpen(false);
        };
        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, []);

    const applyMobileFilters = async (data: SearchFormValues) => {
        await onSubmit(data);
        setFiltersOpen(false);
    };

    // Clear every filter and reload the whole collection
    const clearFilters = async () => {
        resetSearch();
        reset();
        setPage(0);
        const titleParam = searchParams.get("title") || "";
        await handleSearch({
            offset: 0,
            limit: 12,
            title: titleParam !== "" ? titleParam : null,
            genreName: null,
            secondaryGenreName: null,
            status: null,
            tagNames: null,
            newestFirst: true,
        });
        setFiltersOpen(false);
    };

    const renderFilterFields = () => (
        <>
            <div className="col-span-1 min-w-0">
                <label className="text-base font-semibold tracking-wide text-primary/80 uppercase ml-3 mb-3 flex items-center gap-3">
                    Género Principal
                    { currentGenre && (
                        <button
                          onClick={() => {
                            setValue("genreName", null);
                          }}
                          className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                        >
                          <RotateCcw size={20} />
                        </button>
                    )}
                </label>
                <button
                    onClick={() => setIsSelectingGenreOrSubgenre("genre")}
                    className="cursor-pointer w-full min-w-0 flex items-center justify-between gap-3 bg-surface-container-low glass-ghost px-4 py-4 sm:px-6 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                >
                <span className="flex min-w-0 items-center gap-3">
                    <span className="shrink-0 text-primary/60">
                    {currentGenre ? (
                        <GenreIcon name={currentGenre} size={24} />
                    ) : (
                        <Cog size={24} />
                    )}
                    </span>
                    <span className="truncate">{currentGenre || "Seleccionar Género"}</span>
                </span>
                <span className="shrink-0 text-primary/60">
                    <Plus size={20} />
                </span>
                </button>
            </div>
            <div className="col-span-1 min-w-0">
                <label className="text-base font-semibold tracking-wide text-primary/80 uppercase ml-3 mb-3 flex items-center gap-3">
                    Género Secundario
                    { currentSubgenre && (
                        <button
                          onClick={() => {
                            setValue("secondaryGenreName", null);
                          }}
                          className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                        >
                          <RotateCcw size={20} />
                        </button>
                    )}
                </label>
                <button
                    onClick={() => setIsSelectingGenreOrSubgenre("subgenre")}
                    className="cursor-pointer w-full min-w-0 flex items-center justify-between gap-3 bg-surface-container-low glass-ghost px-4 py-4 sm:px-6 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                >
                    <span className="flex min-w-0 items-center gap-3">
                        <span className="shrink-0 text-primary/60">
                        {currentSubgenre ? (
                            <GenreIcon name={currentSubgenre} size={24} />
                        ) : (
                            <Bolt size={24} />
                        )}
                        </span>
                        <span className="truncate">{currentSubgenre || "Seleccionar Subgénero"}</span>
                    </span>
                    <span className="shrink-0 text-primary/60">
                        <Plus size={20} />
                    </span>
                </button>
            </div>
            <div className="col-span-1 min-w-0">
                <label className="text-base font-semibold tracking-wide text-primary/80 uppercase ml-3 mb-3 flex items-center gap-3">
                    Estado
                    { currentStatus && (
                        <button
                          onClick={() => {
                            setValue("status", null);
                          }}
                          className="text-primary/40 hover:text-primary transition-colors cursor-pointer"
                        >
                          <RotateCcw size={20} />
                        </button>
                    )}
                </label>
                <button
                    onClick={() => setIsSelectingStatus(true)}
                    className="cursor-pointer w-full min-w-0 flex items-center justify-between gap-3 bg-surface-container-low glass-ghost px-4 py-4 sm:px-6 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                >
                    <span className="flex min-w-0 items-center gap-3">
                        <span className="shrink-0 text-primary/60">
                        {currentStatus ? (
                            <StatusIcon name={currentStatus} size={24} />
                        ) : (
                            <LineSquiggle size={24} />
                        )}
                        </span>
                        <span className="truncate">{currentStatus?.replace("_", " ") || "Seleccionar Estado"}</span>
                    </span>
                    <span className="shrink-0 text-primary/60">
                        <Plus size={20} />
                    </span>
                </button>
            </div>
        </>
    );

    return (
      <>
        { isSelectingGenreOrSubgenre && (
            <SelectCategoryModal
                onSelect={(value: string) => {handleSelectGenre(value)}}
                onCancel={() => setIsSelectingGenreOrSubgenre(null)}
                repeatedGenres={isSelectingGenreOrSubgenre === "genre" ? (currentSubgenre !== null ? [currentSubgenre!] : []) : (currentGenre !== null ? [currentGenre!] : [])}
            />
        )}
        { isSelectingStatus && (
            <SelectNewStatusModal
                onSelect={(value: string) => {
                    handleSelectStatus(value as StatusNames);
                }}
                onCancel={() => setIsSelectingStatus(false)}
                repeatedStatus={[currentStatus ? currentStatus! : ""]}
            />
        )}
        { filtersOpen && (
            <div
                className="fixed inset-0 z-[90] overflow-y-auto bg-black/40 backdrop-blur-sm md:hidden"
                onClick={() => setFiltersOpen(false)}
                role="dialog"
                aria-modal="true"
                aria-label="Filtros de búsqueda"
            >
                <div className="flex min-h-full items-end justify-center sm:items-center">
                    <div
                        className="w-full max-w-2xl rounded-t-2xl bg-search-bg p-4 sm:rounded-2xl sm:p-8 max-h-[85dvh] overflow-y-auto custom-scrollbar"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-6 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-global">Filtros</h2>
                            <button
                                type="button"
                                onClick={() => setFiltersOpen(false)}
                                aria-label="Cerrar filtros"
                                className="rounded-full p-2 text-several-light transition-colors hover:bg-surface-container-high hover:text-global"
                            >
                                <X size={22} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit(applyMobileFilters)} className="grid grid-cols-1 gap-5">
                            {renderFilterFields()}
                            <div className="flex items-center gap-3 pt-2">
                                <button
                                    type="button"
                                    onClick={() => { void clearFilters(); }}
                                    className="flex-1 rounded-lg border border-toolbar-bg/20 px-4 py-2.5 font-semibold text-global transition-colors hover:bg-toolbar-bg/10"
                                >
                                    Limpiar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-high-enfasis px-4 py-2.5 font-semibold text-background-global transition-transform hover:scale-[0.98] disabled:opacity-60"
                                >
                                    <Search size={18} />
                                    Aplicar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        )}
        <div className="mx-auto hidden max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 md:block">
            <form onSubmit={handleSubmit(onSubmit)} className="grid w-full grid-cols-1 gap-5 sm:gap-6 md:grid-cols-3 md:gap-8">
                {renderFilterFields()}
                <div className="col-span-1 flex items-center justify-start md:col-span-2 md:justify-center">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => { void clearFilters(); }} className="px-4 py-2 rounded-lg border border-toolbar-bg/10 text-global hover:bg-toolbar-bg/5 transition cursor-pointer">
                            Limpiar
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg border border-toolbar-bg/10 text-global hover:bg-toolbar-bg/5 transition cursor-pointer">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 py-4 pb-12 sm:px-6 lg:px-8">
            <div className="mb-5 flex items-center justify-between gap-3 md:hidden">
                <button
                    type="button"
                    onClick={() => setFiltersOpen(true)}
                    className="flex items-center gap-2 rounded-full bg-surface-container-low px-4 py-2.5 font-semibold text-global transition-colors hover:bg-surface-container-high"
                >
                    <SlidersHorizontal size={18} />
                    Filtrar
                    {activeFilterCount > 0 && (
                        <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-high-enfasis px-1.5 text-xs font-bold text-background-global">
                            {activeFilterCount}
                        </span>
                    )}
                </button>
                {activeFilterCount > 0 && (
                    <button
                        type="button"
                        onClick={() => { void clearFilters(); }}
                        className="text-sm text-several-light transition-colors hover:text-global"
                    >
                        Limpiar
                    </button>
                )}
            </div>
            <div>
                { resultStories && !loading && resultStories.data.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6">
                        {resultStories.data.map(story => (
                            <div
                                className="col-span-1 min-w-0"
                                key={story.id}
                                onClick={() => navigate(`${routeAction}${story.id}`)}
                            >
                                <BookCard
                                    author=""
                                    coverColor={getRandomColor()}
                                    coverUrl={story.coverUrl ? story.coverUrl : ""}
                                    genre={story.genre.name}
                                    title={story.title}
                                />
                            </div>
                        ))}
                        <div className="col-span-full">
                          <PageNavigator
                           page={resultStories.meta.numberPage}
                           totalPages={resultStories.meta.totalPages}
                           onPageChange={setPage}
                          />
                        </div>
                    </div>
                ) : (
                    loading ? (
                        <div className="flex min-h-[50dvh] w-full items-center justify-center">
                          <div className="loading-button" />
                        </div>
                    ) : (
                        <h3 className="w-full px-4 py-16 text-center text-xl font-bold text-several-light sm:text-2xl">
                            No hay historias con los criterios que buscas
                        </h3>
                    )
                )}
            </div>
        </div>
      </>
    );
}

export default ExploreSection;
