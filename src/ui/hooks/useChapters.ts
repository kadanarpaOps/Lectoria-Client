import { useContext } from "react"
import { ChaptersContext } from "../context/ChaptersContext"

export const useChapters = () => {
  const chaptersContext = useContext(ChaptersContext);

  if (!chaptersContext) {
    throw new Error("useChapters must be used inside a ChaptersProvider");
  }

  return chaptersContext;
}
