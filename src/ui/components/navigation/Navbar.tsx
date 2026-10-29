import { LogOut, PanelTopClose, Search } from "lucide-react"
import { useLocation, useNavigate } from "react-router"
import { useAuth } from "../../hooks/useAuth"
import { useStories } from "../../hooks/useStories"
import { useRef, useState } from "react"
import type { StoryInfo } from "../../../core/domain/models/stories/StoryModel"

type NavbarProps = {
    isSidebarOpen: boolean | null,
    toggleSidebar: () => void
}

const Navbar = ({ isSidebarOpen, toggleSidebar }: NavbarProps) => {

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

  return (
    <header className={`${isSidebarOpen !== null ? 'sticky' : 'fixed'} top-0 z-40 w-full bg-background-global/80 backdrop-blur-sm pl-8 pr-12 py-4`}>
        <div className={`grid grid-cols-3 items-center
            ${location.pathname.includes("/write") && !isSidebarOpen && 'transition-opacity duration-500 opacity-0 hover:opacity-100'}
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
            <div className="flex justify-center items-center col-span-1">
                <div className="flex items-center relative group">
                    <button
                      className="text-global hover:text-high-enfasis absolute top-2.2 left-3 opacity-50"
                      type="button"
                    >
                        <Search size={18} />
                    </button>
                    <div onBlur={() => setToSearchTitle("")}>
                        <input
                            type="text"
                            className="bg-search-bg border-none rounded-full py-2 pl-10 pr-6 text-sm text-global focus:ring-2 focus:ring-high-enfasis/50 w-94 transition-all focus:outline-none"
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
