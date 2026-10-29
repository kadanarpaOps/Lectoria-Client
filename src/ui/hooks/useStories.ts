import { useContext } from "react"
import { StoriesContext } from "../context/StoriesContext"

export const useStories = () => {
    const storiesContext = useContext(StoriesContext);

    if (!storiesContext) {
        throw new Error("useStories must be used inside a StoriesProvider");
    }

    return storiesContext;
}
