import { useForm, type UseFormReturn } from "react-hook-form";
import type { PageResponse } from "../../core/domain/models/common/PaginationModels";
import type { StoryFilters, StoryInfo } from "../../core/domain/models/stories/StoryModel";
import type z from "zod";
import { searchSchema } from "../schemas/stories/stories.schema";
import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { isAxiosError } from "axios";

type SearchFormValues = z.infer<typeof searchSchema>;

interface Props {
  loadStories: (filters: StoryFilters) => Promise<PageResponse<StoryInfo>>;
}

interface UseSearchStoriesResults {
  searchForm: UseFormReturn<SearchFormValues>;
  resultStories: PageResponse<StoryInfo> | null;
  loading: boolean;
  error: string | null;
  handleSearch: (values: SearchFormValues) => Promise<void>;
  resetSearch: () => void;
}

export const useSearchStories = ({ loadStories }: Props): UseSearchStoriesResults => {

  const [ resultStories, setResultStories ] = useState<PageResponse<StoryInfo> | null>(null);
  const [ loading, setLoading ] = useState<boolean>(false);
  const [ error, setError ] = useState<string | null>(null);

  // Use Form
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      offset: 0,
      limit: 12,
      title: null,
      genreName: null,
      secondaryGenreName: null,
      status: null,
      tagNames: null,
      newestFirst: true,
    }
  });

  // Search
  const handleSearch = useCallback(async (values: SearchFormValues) => {
    setLoading(true);
    setError(null);
    
    const filters = {
      offset: values.offset,
      limit: values.limit,
      ...(values.title && { title: values.title }),
      ...(values.genreName && { genreName: values.genreName }),
      ...(values.secondaryGenreName && { secondaryGenreName: values.secondaryGenreName }),
      ...(values.status && { status: values.status }),
      ...(values.tagNames && { tagNames: values.tagNames }),
      newestFirst: values.newestFirst,
    };

    try {
      const response = await loadStories(filters);
      setResultStories(response);
    } catch (requestError) {
      const message = isAxiosError<{ message?: string }>(requestError)
        ? requestError.response?.data?.message
        : null;
      setResultStories(null);
      setError(message || "No se pudieron cargar las historias. Inténtalo nuevamente.");
    } finally {
      setLoading(false);
    }
  }, [loadStories]);

  const resetSearch = () => {
    searchForm.reset({
      offset: 0,
      limit: 12,
      title: null,
      genreName: null,
      secondaryGenreName: null,
      status: null,
      tagNames: null,
      newestFirst: true,
    })
  };

  return {
    searchForm,
    resultStories,
    loading,
    error,
    handleSearch,
    resetSearch,
  };

}
