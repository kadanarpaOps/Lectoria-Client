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

    if (!authLoading && authUser && !authUser.userId) {
        return (
            <main className="mx-auto max-w-4xl px-6 py-16">
                <section className="rounded-3xl border border-amber-400/20 bg-background-global p-8">
                    <h1 className="text-3xl font-bold text-global">Mi biblioteca</h1>
                    <p className="mt-4 text-several-light">La API de Lectoria no incluye el identificador de usuario en el perfil ni en la validación de sesión. Story-service necesita ese identificador para cargar historias propias o guardadas.</p>
                </section>
            </main>
        );
    }

    return (
        <main className="relative h-full">
            <div className="min-h-screen pt-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="mb-12">
                        <div className="flex space-x-4">
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
                                userId={authUser.userId}
                                routeAction="/story/edit/"
                            />
                        ) : (
                            <ExploreSection
                                loading={loading}
                                loadStories={loadAuthUserFavorites}
                                userId={authUser.userId}
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
