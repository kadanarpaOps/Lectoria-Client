import { useNavigate, useSearchParams } from "react-router";
import { useSearchStories } from "../../hooks/useSearchStories";
import { useCallback, useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import type { StatusNames, StoryFilters, StoryInfo } from "../../../core/domain/models/stories/StoryModel";
import type { searchSchema } from "../../schemas/stories/stories.schema";
import type z from "zod";
import SelectCategoryModal from "../stories/SelectCategoryModal";
import SelectNewStatusModal from "../stories/SelectNewStatusModal";
import { Bolt, ChevronLeft, ChevronRight, Cog, LineSquiggle, Plus, RotateCcw, Search } from "lucide-react";
import { GenreIcon } from "../stories/GenresIcons";
import { StatusIcon } from "../stories/StatusesIcons";
import { BookCard } from "../../pages/landing/LandingPage";
import { getRandomColor } from "../../pages/utils/colors.util";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";

type SearchFormValues = z.infer<typeof searchSchema>;

interface Props {
  loadStories: (filters: StoryFilters, userId?: string) => Promise<PageResponse<StoryInfo>>;
  userId?: string;
  loading: boolean;
  routeAction: string;
}

const ExploreSection = ({ loadStories, userId, loading, routeAction }: Props) => {

    // Use Navigate
    const navigate = useNavigate();
    // Use Search Params
    const [ searchParams ] = useSearchParams();
    // Use Search Stories
    const { searchForm, resultStories, handleSearch, resetSearch } = useSearchStories({ loadStories: loadStories, userId: userId });
    const [ page, setPage ] = useState<number>(1);
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
        console.log(value)
        setValue("status", value);
        setIsSelectingStatus(false);
    };

    // Use Effect for default search
    useEffect(() => {
        const initialSearch = async () => {
            await handleSearch({
                offset: 1,
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

      data.offset = page;
      await handleSearch({ ...data, title: titleParam !== "" ? titleParam : null, limit: 12});
    }, [handleSearch, page, searchParams]); 

    useEffect(() => {
        const loadPerChange = async () => {
            handleSubmit(onSubmit)();
        };
        loadPerChange();
    }, [handleSubmit, page, onSubmit])

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
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
            <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full justify-center">
                <div className="col-span-1">
                    <label className="text-md font-semibold tracking-wide text-primary/80 uppercase ml-3 mb-3 flex items-center gap-3">
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
                        className="cursor-pointer w-full flex items-center justify-between bg-surface-container-low glass-ghost px-6 py-4 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                    >
                    <span className="flex items-center gap-3">
                        <span className="text-primary/60">
                        {currentGenre ? (
                            <GenreIcon name={currentGenre} size={24} />
                        ) : (
                            <Cog size={24} />
                        )}
                        </span>
                        {currentGenre || "Seleccionar Género"}
                    </span>
                    <span className="text-primary/60">
                        <Plus size={20} />
                    </span>
                    </button>
                </div>
                <div className="col-span-1">
                    <label className="text-md font-semibold tracking-wide text-primary/80 uppercase ml-3 mb-3 flex items-center gap-3">
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
                        className="cursor-pointer w-full flex items-center justify-between bg-surface-container-low glass-ghost px-6 py-4 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-primary/60">
                            {currentSubgenre ? (
                                <GenreIcon name={currentSubgenre} size={24} />
                            ) : (
                                <Bolt size={24} />
                            )}
                            </span>
                            {currentSubgenre || "Seleccionar Subgénero"}
                        </span>
                        <span className="text-primary/60">
                            <Plus size={20} />
                        </span>
                    </button>
                </div>
                <div className="col-span-1">
                    <label className="text-md font-semibold tracking-wide text-primary/80 uppercase ml-3 mb-3 flex items-center gap-3">
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
                        className="cursor-pointer w-full flex items-center justify-between bg-surface-container-low glass-ghost px-6 py-4 rounded-xl hover:bg-surface-container-high transition-colors text-on-surface" type="button"
                    >
                        <span className="flex items-center gap-3">
                            <span className="text-primary/60">
                            {currentStatus ? (
                                <StatusIcon name={currentStatus} size={24} />
                            ) : (
                                <LineSquiggle size={24} />
                            )}
                            </span>
                            {currentStatus?.replace("_", " ") || "Seleccionar Estado"}
                        </span>
                        <span className="text-primary/60">
                            <Plus size={20} />
                        </span>
                    </button>
                </div>
                <div className="col-span-2 items-center justify-center space-x-3">
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => { resetSearch(); reset(); }} className="px-4 py-2 rounded-lg border border-toolbar-bg/10 text-global hover:bg-toolbar-bg/5 transition cursor-pointer">
                            Limpiar
                        </button>
                        <button type="submit" disabled={loading} className="px-4 py-2 rounded-lg border border-toolbar-bg/10 text-global hover:bg-toolbar-bg/5 transition cursor-pointer">
                            <Search size={20} />
                        </button>
                    </div>
                </div>
            </form>
        </div>
        <div className="px-8 py-4">
            <div>
                { resultStories && !loading && resultStories.data.length > 0 ? (
                    <div className="grid grid-cols-6 gap-6">
                        {resultStories.data.map(story => (
                            <div
                                className="col-span-1"
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
                        <div className="col-span-6">
                            <div className="flex items-center justify-center gap-2 mt-14">
                              {/** Previous Navigation */}
                              <button
                                onClick={() => setPage(resultStories?.meta.numberPage - 1)}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/10 text-on-surface-variant
                                  ${resultStories?.meta.numberPage !== 1 && "hover:bg-surface-variant/20 transition-colors cursor-pointer"}`}
                                disabled={resultStories?.meta.numberPage === 1}
                              >
                                <span>
                                  <ChevronLeft size={24} />
                                </span>
                              </button>
                              {/** Actual Page - 1 */}
                              {resultStories?.meta.numberPage !== 1 && (
                                <button
                                  onClick={() => setPage(resultStories?.meta.numberPage - 1)}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-variant/20 text-on-surface transition-colors cursor-pointer"
                                >
                                  {resultStories?.meta.numberPage - 1}
                                </button>
                              )}
                              {/** Actual Page */}
                              <button
                                disabled={true}
                                className="w-10 h-10 flex items-center justify-center rounded-xl bg-primary text-on-primary font-bold cursor-default"
                              >
                                {resultStories?.meta.numberPage}
                              </button>
                              {/** Actual Page + 1 */}
                              {resultStories?.meta.numberPage !== resultStories?.meta.totalPages && (
                                <button
                                  onClick={() => setPage(resultStories?.meta.numberPage + 1)}
                                  className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-surface-variant/20 text-on-surface transition-colors cursor-pointer"
                                >
                                  {resultStories?.meta.numberPage + 1}
                                </button>
                              )}
                              {/** Next Navigation */}
                              <button
                                onClick={() => setPage(resultStories?.meta.numberPage + 1)}
                                className={`w-10 h-10 flex items-center justify-center rounded-xl border border-outline-variant/10 text-on-surface-variant
                                  ${resultStories?.meta.numberPage !== resultStories?.meta.totalPages && "hover:bg-surface-variant/20 transition-colors cursor-pointer"}`}
                                disabled={resultStories?.meta.numberPage === resultStories?.meta.totalPages}
                              >
                                <span>
                                  <ChevronRight size={24} />
                                </span>
                              </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    loading ? (
                        <div className="flex col-span-6 min-h-full items-center justify-center w-full h-full">
                          <div className="loading-button" />
                        </div>
                    ) : (
                        <h3 className="col-span-6 text-center min-h-full text-2xl font-bold">
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
