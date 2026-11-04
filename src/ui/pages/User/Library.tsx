import { useState } from "react";
import { useStories } from "../../hooks/useStories";
import { useAuth } from "../../hooks/useAuth";
import ExploreSection from "../../components/navigation/ExploreSection";

type LibraryMode = "mine" | "saved";

export default function Library() {

    // Use Auth
    const { loading: authLoading, authUser } = useAuth();

    // Use Stories
    const { loading, loadAuthUserFavorites, loadStoriesForAuthUser } = useStories();

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
                ) : (
                    <ExploreSection
                        loading={loading}
                        loadStories={loadAuthUserFavorites}
                        routeAction="/explore/story/"
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
