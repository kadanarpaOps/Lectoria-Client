import ExploreSection from "../../components/navigation/ExploreSection";
import { useStories } from "../../hooks/useStories";

export default function ExploreStories() {

    // Use Stories
    const { loading, loadPublishedStories } = useStories();
    
    return (
        <main className="relative w-full">
            <ExploreSection
                loadStories={loadPublishedStories}
                loading={loading}
                routeAction="/explore/story/"
            />
        </main>
    );

}
