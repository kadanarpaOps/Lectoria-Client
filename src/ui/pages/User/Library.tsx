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
        <main className="relative h-full">
            <div className="min-h-screen pt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <div className="flex flex-wrap gap-x-4">
                            <button
                                onClick={() => handleModeChange("mine")}
                                className={`pb-4 px-2 font-semibold text-lg transition ${
                                    libraryMode === "mine"
                                        ? "text-high-enfasis border-b-2 border-high-enfasis cursor-default"
                                        : "text-several-light hover:text-global cursor-pointer"
                                }`}
                            >
                                Mis Historias
                            </button>
                            <button
                                onClick={() => handleModeChange("saved")}
                                className={`pb-4 px-2 font-semibold text-lg transition ${
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
                        <div className="flex min-h-full items-center justify-center w-full h-full">
                          <div className="loading-button" />
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
