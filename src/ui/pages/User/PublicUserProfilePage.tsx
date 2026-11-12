import { useEffect, useRef, useState } from "react";
import { ArrowLeft, BookOpen, CalendarDays, UserRound } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router";
import { UserService } from "../../../core/use-cases/UserUseCases";
import type { PublicUserProfile } from "../../../core/domain/models/users/UserDirectoryModel";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import type { StoryInfo } from "../../../core/domain/models/stories/StoryModel";
import { StoryService } from "../../../core/use-cases/stories/StoryUseCases";
import { getRandomCover } from "../utils/covers.util";
import { getLastModifiedTime } from "../utils/time.util";
import PageNavigator from "../../components/navigation/PageNavigator";

const userService = new UserService();
const storyService = new StoryService();
const PAGE_SIZE = 12;

interface ProfileStoriesState {
  page: number;
  scrollY: number;
}

export default function PublicUserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const stateKey = `lectoria-profile-stories:${userId ?? ""}`;
  const [restoredState] = useState<ProfileStoriesState | null>(() => {
    try {
      const stored = sessionStorage.getItem(stateKey);
      if (!stored) return null;
      sessionStorage.removeItem(stateKey);
      const state = JSON.parse(stored) as Partial<ProfileStoriesState>;
      return Number.isInteger(state.page) && (state.page ?? -1) >= 0 && typeof state.scrollY === "number"
        ? state as ProfileStoriesState
        : null;
    } catch {
      return null;
    }
  });
  const restoredScrollY = useRef<number | null>(restoredState?.scrollY ?? null);
  const [profile, setProfile] = useState<PublicUserProfile | null>(null);
  const [stories, setStories] = useState<PageResponse<StoryInfo> | null>(null);
  const [page, setPage] = useState(restoredState?.page ?? 0);
  const [loading, setLoading] = useState(Boolean(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    let active = true;
    const loadProfile = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      setError(null);
      try {
        const [user, userStories] = await Promise.all([
          userService.getPublicUserProfile(userId),
          storyService.getPublicStoriesByUser(userId, {
            offset: page * PAGE_SIZE,
            limit: PAGE_SIZE,
            newestFirst: true,
          }),
        ]);
        if (!active) return;
        setProfile(user);
        setStories(userStories);
      } catch {
        if (active) setError("No se pudo cargar el perfil. Es posible que el usuario ya no esté disponible.");
      } finally {
        if (active) setLoading(false);
      }
    };
    void loadProfile();

    return () => {
      active = false;
    };
  }, [page, userId]);

  useEffect(() => {
    if (loading || !stories || restoredScrollY.current === null) return;
    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: restoredScrollY.current ?? 0, behavior: "auto" });
      restoredScrollY.current = null;
    });
    return () => window.cancelAnimationFrame(frame);
  }, [loading, stories]);

  const openStory = (storyId: string) => {
    try {
      sessionStorage.setItem(stateKey, JSON.stringify({
        page,
        scrollY: window.scrollY,
      } satisfies ProfileStoriesState));
    } catch {
      // The selected story remains accessible if browser storage is unavailable.
    }
    navigate(`/explore/story/${storyId}`);
  };

  const displayError = error ?? (!userId ? "No se encontró el usuario solicitado." : null);
  const changePage = (nextPage: number) => {
    setError(null);
    setLoading(true);
    setPage(nextPage);
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <button
        type="button"
        onClick={() => {
          const from = (location.state as { from?: unknown } | null)?.from;
          navigate(typeof from === "string" && from.startsWith("/users") ? from : "/users");
        }}
        className="mb-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-toolbar-bg/15 px-4 py-2 text-sm font-semibold text-global transition-colors hover:bg-toolbar-bg/10"
      >
        <ArrowLeft size={17} />
        Volver a Comunidad
      </button>

      {displayError ? (
        <section role="alert" className="rounded-3xl border border-red-500/20 bg-red-500/5 p-8 text-center text-red-300">
          {displayError}
        </section>
      ) : loading || !profile || !stories ? (
        <div className="flex min-h-64 items-center justify-center"><div className="loading-button" /></div>
      ) : (
        <>
          <section className="flex flex-col items-center gap-5 rounded-3xl border border-toolbar-bg/10 bg-background-global p-6 text-center sm:flex-row sm:p-8 sm:text-left">
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-high-enfasis/30 bg-inputs-bg">
              {profile.profileImageUrl
                ? <img src={profile.profileImageUrl} alt={`Perfil de ${profile.username}`} className="h-full w-full object-cover" />
                : <UserRound size={36} className="text-several-light" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-high-enfasis">Perfil de la comunidad</p>
              <h1 className="mt-2 break-all text-3xl font-bold text-global">{profile.username}</h1>
              <p className="mt-3 flex items-center justify-center gap-2 text-sm text-several-light sm:justify-start">
                <CalendarDays size={16} />
                Se unió {profile.memberSince ? getLastModifiedTime(profile.memberSince).toLowerCase() : "en una fecha no disponible"}
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-high-enfasis/10 px-4 py-2 text-sm font-semibold text-high-enfasis">
              <BookOpen size={17} />
              {stories.meta.totalItems} historias
            </div>
          </section>

          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-high-enfasis">Publicaciones</p>
                <h2 className="mt-1 text-2xl font-bold text-global">Historias de {profile.username}</h2>
              </div>
            </div>
            {stories.data.length === 0 ? (
              <p className="rounded-3xl border border-dashed border-toolbar-bg/20 p-10 text-center text-several-light">
                Este usuario todavía no ha publicado historias.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-6 lg:grid-cols-4">
                {stories.data.map((story) => (
                  <button
                    key={story.id}
                    type="button"
                    onClick={() => openStory(story.id)}
                    className="group min-w-0 cursor-pointer overflow-hidden rounded-2xl border border-toolbar-bg/10 bg-background-global text-left transition-transform hover:-translate-y-1 active:scale-[0.98]"
                  >
                    <div className="aspect-3/4 overflow-hidden bg-surface-container-low">
                      <img src={story.coverUrl || getRandomCover()} alt={`Portada de ${story.title}`} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="p-3 sm:p-4">
                      <h3 className="line-clamp-2 font-semibold text-global">{story.title}</h3>
                      <p className="mt-2 text-xs text-several-light">{story.genre.name}</p>
                      <p className="mt-1 text-xs text-several-light">{story.totalChapters} capítulos</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <PageNavigator page={page} totalPages={stories.meta.totalPages} onPageChange={changePage} />
          </section>
        </>
      )}
    </main>
  );
}
