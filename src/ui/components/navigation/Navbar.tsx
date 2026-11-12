import { Bell, LogOut, PanelTopClose, Search } from "lucide-react"
import { useLocation, useNavigate } from "react-router"
import { useAuth } from "../../hooks/useAuth"
import { useStories } from "../../hooks/useStories"
import { useCallback, useEffect, useRef, useState } from "react"
import type { StoryInfo } from "../../../core/domain/models/stories/StoryModel"
import { getAppNotifications, getUnreadNotificationCount, type AppNotification } from "../../../infrastructure/api/requests/notifications.request"

type NavbarProps = {
    isSidebarOpen: boolean | null,
    isMobile: boolean,
    toggleSidebar: () => void
}

const Navbar = ({ isSidebarOpen, isMobile, toggleSidebar }: NavbarProps) => {

  // Use Location
  const location = useLocation();
  // Use Navigate
  const navigate = useNavigate();
  // Use Auth
  const { authUser, logout } = useAuth();
  // Use Stories
  const { loadPublishedStories, loading } = useStories();

  //Title Input Management
  const [ toSearchTitle, setToSearchTitle ] = useState("");
  const [ storiesResults, setStoriesResults ] = useState<StoryInfo[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const searchedStoryRef = useRef<HTMLInputElement>(null);
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const toSearch = e.target.value;
    setToSearchTitle(toSearch);
    if (isInSearchPage) {
        navigate(`${location.pathname}?title=${encodeURIComponent(toSearch)}`, { replace: true });
        return;
    }
    if (toSearch.trim() != "") {
        const searchResult = await loadPublishedStories({ offset: 1, limit: 3, title: toSearch, newestFirst: true });
        if (searchResult.data) {
            setStoriesResults(searchResult.data);
        } else {
            setStoriesResults([]);
        }
    } else {
        setToSearchTitle("");
        setStoriesResults([]);
    }
  }

  // Dynamic Explore Items
  const isInSearchPage = location.pathname.includes("/library") || (location.pathname.includes("/explore") && !location.pathname.includes("/explore/story"));

  const refreshNotifications = useCallback(async () => {
    if (!authUser) return;
    try {
      const [summary, unread] = await Promise.all([getAppNotifications(0, 5), getUnreadNotificationCount()]);
      setNotifications(summary.content);
      setUnreadCount(unread);
    } catch {
      setNotifications([]);
    }
  }, [authUser]);
  useEffect(() => {
    const timer = window.setTimeout(() => { void refreshNotifications(); }, 0);
    return () => window.clearTimeout(timer);
  }, [refreshNotifications, location.pathname]);

  return (
    <header className={`${isSidebarOpen !== null ? 'sticky' : 'fixed'} top-0 z-40 w-full bg-background-global/80 backdrop-blur-sm px-3 sm:px-6 lg:px-8 py-3 sm:py-4`}>
        <div className={`grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2
            ${location.pathname.includes("/write") && !isSidebarOpen && !isMobile && 'transition-opacity duration-500 opacity-0 hover:opacity-100'}
        `}>
            <div className="flex items-center space-x-4">
                {isSidebarOpen !== null && (
                    <>
                        <button
                            className="p-2 hover:bg-global/10 rounded-lg transition-colors cursor-pointer"
                            onClick={toggleSidebar}
                        >
                            <PanelTopClose
                                size={24}
                                className={`transition-transform duration-300 transform
                                    ${isSidebarOpen ? "rotate-270" : "rotate-90"}`}
                            />
                        </button>
                        <span className="text-global font-semibold text-lg hidden md:block">
                        </span>
                    </>
                )}
            </div>
            <div className="flex justify-center items-center min-w-0">
                <div className="flex items-center relative group w-full max-w-md">
                    <button
                      className="text-global hover:text-high-enfasis absolute top-2.2 left-3 opacity-50"
                      type="button"
                    >
                        <Search size={18} />
                    </button>
                    <div onBlur={() => setToSearchTitle("")}>
                        <input
                            type="text"
                            className="bg-search-bg border-none rounded-full py-2 pl-10 pr-4 text-sm text-global focus:ring-2 focus:ring-high-enfasis/50 w-full min-w-0 transition-all focus:outline-none"
                            placeholder="Buscar Historias..."
                            ref={searchedStoryRef}
                            onChange={handleInputChange}
                        />
                        { toSearchTitle && !isInSearchPage && (
                            <div
                                className="absolute top-full mt-2 left-0 right-0 bg-surface-bright/50 shadow-lg border border-toolbar-bg/10 rounded-xl z-50 overflow-hidden"
                            >
                                { !loading ? (
                                    storiesResults.length > 0 ? (
                                        storiesResults.map((story) => (
                                            <div
                                                key={story.id}
                                                onMouseDown={() => {navigate(`/explore/story/${story.id}`);}}
                                                className="px-4 py-2 hover:bg-high-enfasis/10 cursor-pointer text-md transition-colors truncate max-w-sm"
                                            >
                                                {story.title}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="px-4 py-2 hover:bg-high-enfasis/10 cursor-default text-md transition-colors" >
                                            No se encontraron resultados...
                                        </div>
                                    )
                                ) : (
                                    <div
                                      className="px-4 py-2 hover:bg-primary-container/20 cursor-pointer text-md text-primary font-bold transition-colors justify-center flex items-center space-x-2"
                                    >
                                      <div className="flex items-center justify-center w-10 h-10">
                                        <div className="loading-button" />
                                      </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex justify-end">
                {authUser && (
                    <>
                        <div className="relative">
                            <button
                                type="button"
                                onClick={() => {
                                    const next = !notificationsOpen;
                                    setNotificationsOpen(next);
                                    if (next) void refreshNotifications();
                                }}
                                aria-label="Notificaciones"
                                aria-expanded={notificationsOpen}
                                className="relative ml-2 rounded-full p-2 text-global transition hover:bg-global/10 hover:text-high-enfasis active:scale-90 cursor-pointer"
                            >
                                <Bell size={24} />
                                {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 min-w-5 rounded-full bg-high-enfasis px-1 text-center text-xs font-bold text-white">{unreadCount > 9 ? "9+" : unreadCount}</span>}
                            </button>
                            {notificationsOpen && (
                                <div className="absolute right-0 top-full z-50 mt-3 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-toolbar-bg/20 bg-surface-container-low shadow-2xl">
                                    <div className="flex items-center justify-between border-b border-toolbar-bg/10 px-4 py-3">
                                        <h2 className="font-bold text-global">Notificaciones</h2>
                                        <span className="text-xs text-several-light">{unreadCount} sin leer</span>
                                    </div>
                                    <div className="max-h-96 overflow-y-auto">
                                        {notifications.length ? notifications.map((notification) => (
                                            <button
                                                key={notification.notificationId}
                                                type="button"
                                                onClick={() => {
                                                    setNotificationsOpen(false);
                                                    const text = notification.notificationContent.toLowerCase();
                                                    navigate(text.includes("reactivar su cuenta") ? "/admin/requests" : text.includes("solicitud") ? "/requests" : "/notifications");
                                                }}
                                                className={`block w-full cursor-pointer border-b border-toolbar-bg/10 px-4 py-3 text-left text-sm text-global transition hover:bg-high-enfasis/10 ${notification.shown ? "" : "bg-high-enfasis/5"}`}
                                            >
                                                <span className="line-clamp-2">{notification.notificationContent}</span>
                                                <time className="mt-1 block text-xs text-several-light">{new Date(notification.createdAt).toLocaleString()}</time>
                                            </button>
                                        )) : <p className="px-4 py-6 text-center text-sm text-several-light">No tienes notificaciones.</p>}
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => { setNotificationsOpen(false); navigate("/notifications"); }}
                                        className="w-full cursor-pointer px-4 py-3 text-center text-sm font-semibold text-high-enfasis transition hover:bg-high-enfasis/10 active:scale-[0.99]"
                                    >
                                        Ver todas
                                    </button>
                                </div>
                            )}
                        </div>
                        <LogOut
                            size={26}
                            className="ml-4 md:ml-8 cursor-pointer hover:text-high-enfasis"
                            onClick={() => {logout(); navigate("/auth")}}
                        />
                    </>
                )}
            </div>
        </div>
    </header>
  )
}

export default Navbar
