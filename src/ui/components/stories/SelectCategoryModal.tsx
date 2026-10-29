import { useEffect, useRef, useState } from "react";
import { useStories } from "../../hooks/useStories";
import { GenreIcon } from "./GenresIcons";
import { Search } from "lucide-react";

interface Props {
    repeatedGenres: string[];
    onCancel: () => void;
    onSelect: (value: string) => void;
}

const SelectCategoryModal = ({ repeatedGenres, onCancel, onSelect }: Props) => {

  // Use Stories
  const { loading, genres } = useStories();
  // Search Genre Dynamically
  const [ searchedGenre, setSearchedGenre ] = useState<string>("");
  const searchedGenreRef = useRef<HTMLInputElement>(null);
  const handleSearchedGenreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchedGenre(e.target.value);
  }

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-100 bg-black/30 flex flex-col items-center justify-center p-4 backdrop-blur-sm">
        <div className="relative w-full max-w-2xl bg-search-bg rounded-2xl flex-col p-8 h-[80vh] overflow-y-auto custom-scrollbar">
          { !loading ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-fujiWhite tracking-tight">
                  Seleccionar Género
                </h2>
                <p className="text-on-surface-variant/60 text-sm mt-2">
                  Escoge un género para tu historia
                </p>
                <div className="mt-2 flex justify-center items-center">
                    <div className="flex items-center relative group">
                        <button
                          className="text-global hover:text-high-enfasis absolute top-2.2 left-3 opacity-50"
                          type="button"
                        >
                            <Search size={18} />
                        </button>
                        <input
                            type="text"
                            className="bg-background-global border-none rounded-full py-2 pl-10 pr-6 text-sm text-global focus:ring-2 focus:ring-high-enfasis/50 w-64 transition-all focus:outline-none"
                            placeholder="Buscar Género..."
                            ref={searchedGenreRef}
                            onChange={handleSearchedGenreChange}
                        />
                    </div>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                { genres!
                    .filter(g => !repeatedGenres.includes(g.name))
                    .filter(g => {
                      if (searchedGenre !== "") {
                        return g.name.toLocaleLowerCase().includes(searchedGenre.toLocaleLowerCase())
                      }
                      return true;
                    })
                    .map(g => (
                      <div key={g.id} onClick={() => onSelect(g.name)} className="group relative h-40 rounded-2xl bg-toolbar-bg cursor-pointer hover:scale-95 transition-all duration-300 overflow-hidden">
                        <div className="absolute inset-0 bg-linear-to-br from-black/20 to-transparent"></div>
                        <div className="relative z-10 p-6 flex flex-col h-full justify-between">
                          <span className="text-4xl text-high-enfasis">
                            <GenreIcon name={g.name} size={40} />
                          </span>
                          <span className="text-2xl font-bold text-fujiWhite tracking-tight">
                            {g.name}
                          </span>
                        </div>
                        <div className="absolute -right-6 -bottom-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                          <span className="text-9xl">
                            <GenreIcon name={g.name} size={150} />
                          </span>
                        </div>
                      </div>
                    )
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center w-full h-full">
              <div className="loading-button" />
            </div>
          )}
        </div>
        <button onClick={onCancel} className="mt-6 bg-high-enfasis font-bold px-8 py-2 rounded-2xl hover:scale-95 transition-all cursor-pointer text-background-global">
          Cancelar
        </button>
    </div>
  )
}

export default SelectCategoryModal
