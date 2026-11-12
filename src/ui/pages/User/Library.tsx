import { useCallback, useState } from "react";
import { useStories } from "../../hooks/useStories";
import { useAuth } from "../../hooks/useAuth";
import ExploreSection from "../../components/navigation/ExploreSection";
import type { StoryFilters, StoryInfo } from "../../../core/domain/models/stories/StoryModel";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import { getCoauthoredStories } from "../../../infrastructure/api/requests/requests.request";

type LibraryMode = "mine" | "saved" | "coauthored";

export default function Library() {

    // Use Auth
    const { loading: authLoading, authUser } = useAuth();

    // Use Stories
    const { loading, loadAuthUserFavorites, loadStoriesForAuthUser } = useStories();
    const loadCoauthored = useCallback(async (filters: StoryFilters): Promise<PageResponse<StoryInfo>> => {
        const allStories = await getCoauthoredStories();
        const pageSize = filters.limit || 12;
        const data = allStories.slice(filters.offset, filters.offset + pageSize);
        return {
            data,
            meta: {
                numberPage: Math.floor(filters.offset / pageSize),
                pageSize,
                totalItems: allStories.length,
                totalPages: Math.ceil(allStories.length / pageSize),
            },
        };
    }, []);

    // Library Mode
    const [ libraryMode, setLibraryMode ] = useState<LibraryMode>("mine");
    const handleModeChange = (newMode: LibraryMode) => {
        if (newMode !== libraryMode) {
            setLibraryMode(newMode);
        }
    }

    return (
        <main className="relative w-full">
            <div className="mx-auto w-full max-w-7xl px-4 pt-6 sm:px-6 sm:pt-8 lg:px-8">
                <div className="flex flex-wrap gap-x-2 sm:gap-x-4">
                    <button
                        onClick={() => handleModeChange("mine")}
                        className={`pb-4 px-2 font-semibold text-base transition sm:text-lg ${
                            libraryMode === "mine"
                                ? "text-high-enfasis border-b-2 border-high-enfasis cursor-default"
                                : "text-several-light hover:text-global cursor-pointer"
                        }`}
                    >
                        Mis Historias
                    </button>
                    <button
                        onClick={() => handleModeChange("coauthored")}
                        className={`pb-4 px-2 font-semibold text-base transition sm:text-lg ${
                            libraryMode === "coauthored"
                                ? "text-high-enfasis border-b-2 border-high-enfasis cursor-default"
                                : "text-several-light hover:text-global cursor-pointer"
                        }`}
                    >
                        Coautorías
                    </button>
                    <button
                        onClick={() => handleModeChange("saved")}
                        className={`pb-4 px-2 font-semibold text-base transition sm:text-lg ${
                            libraryMode === "saved"
                                ? "text-high-enfasis border-b-2 border-high-enfasis cursor-default"
                                : "text-several-light hover:text-global cursor-pointer"
                        }`}
                    >
                        Historias Guardadas
                    </button>
                </div>
            </div>
            { !authLoading && authUser ? (
                libraryMode === "mine" ? (
                    <ExploreSection
                        loading={loading}
                        loadStories={loadStoriesForAuthUser}
                        routeAction="/story/edit/"
                    />
                ) : libraryMode === "saved" ? (
                    <ExploreSection
                        loading={loading}
                        loadStories={loadAuthUserFavorites}
                        routeAction="/explore/story/"
                    />
                ) : (
                    <ExploreSection
                        loading={loading}
                        loadStories={loadCoauthored}
                        routeAction="/story/edit/"
                    />
                )
            ) : (
                <div className="flex min-h-[50dvh] w-full items-center justify-center">
                  <div className="loading-button" />
                </div>
            )}
        </main>
    );
}
