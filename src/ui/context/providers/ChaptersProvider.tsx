import { useCallback, useState, type ReactNode } from "react"
import { ChapterService } from "../../../core/use-cases/chapters/ChapterUseCases";
import type { ChaptersFilters, RegisterChapter, UpdateChapter, ChapterInfo } from "../../../core/domain/models/chapters/ChapterModel";
import executeTask from "../utils/TaskExecutor";
import { ChaptersContext, type ChaptersContextType } from "../ChaptersContext";
import type { PageResponse } from "../../../core/domain/models/common/PaginationModels";
import { useAlert } from "../../hooks/useAlert";

type Props = {
  children: ReactNode;
}

const chapterService = new ChapterService;

function ChaptersProvider({ children }: Props) {
  // Alert Component
  const { showAlert } = useAlert();
  // Basics
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ updating, setUpdating ] = useState<boolean>(false);
  const [ error, setError ] = useState<string | null>(null);
  
  // Business Methods
  const getChaptersByStory = useCallback(async (filters: ChaptersFilters, storyId: string) => {
    const response = await executeTask(() => chapterService.getChaptersByStory(filters, storyId), setLoading, setError) as PageResponse<ChapterInfo>;
    return response;
  }, []);

  const getOwnedChaptersByStory = useCallback(async (filters: ChaptersFilters, storyId: string) => {
    const response = await executeTask(() => chapterService.getOwnedChaptersByStory(filters, storyId), setLoading, setError) as PageResponse<ChapterInfo>;
    return response;
  }, []);

  const createChapter = async (createChapter: RegisterChapter) => {
    setError(null);
    const response = await executeTask(() => chapterService.createChapter(createChapter), setLoading, setError, showAlert, true);
    if (!response) return false;
    return true;
  }

  const updateChapter = async (updateChapter: UpdateChapter, chapterId: string) => {
    setError(null);
    const response = await executeTask(() => chapterService.updateChapter(updateChapter, chapterId), setUpdating, setError, showAlert, true);
    if (!response) return false;
    return true;
  }

  const toggleChapterStatus = async (chapterId: string) => {
    setError(null);
    const response = await executeTask(() => chapterService.toggleChapterStatus(chapterId), setLoading, setError, showAlert, true);
    if (!response) return false;
    return true;
  }

  const deleteChapter = async (storyId: string, chapterId: string) => {
    setError(null);
    const response = await executeTask(() => chapterService.deleteChapter(storyId, chapterId), setLoading, setError, showAlert, true);
    if (!response) return false;
    return true;
  }

  // Export Values
  const exportValues: ChaptersContextType = {
    loading,
    updating,
    error,
    getChaptersByStory,
    getOwnedChaptersByStory,
    createChapter,
    updateChapter,
    toggleChapterStatus,
    deleteChapter
  }

  return (
    <ChaptersContext.Provider value={exportValues}>{children}</ChaptersContext.Provider>
  )

}

export default ChaptersProvider;
