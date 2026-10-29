import { useForm, type UseFormReturn } from "react-hook-form";
import type { PageResponse } from "../../core/domain/models/common/PaginationModels";
import type { StoryFilters, StoryInfo } from "../../core/domain/models/stories/StoryModel";
import type z from "zod";
import { searchSchema } from "../schemas/stories/stories.schema";
import { useCallback, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";

type SearchFormValues = z.infer<typeof searchSchema>;

interface Props {
  loadStories: (filters: StoryFilters, userId?: string) => Promise<PageResponse<StoryInfo>>;
  userId?: string;
}

interface UseSearchStoriesResults {
  searchForm: UseFormReturn<SearchFormValues>;
  resultStories: PageResponse<StoryInfo> | null;
  loading: boolean;
  handleSearch: (values: SearchFormValues) => Promise<void>;
  resetSearch: () => void;
}

export const useSearchStories = ({ loadStories, userId }: Props): UseSearchStoriesResults => {

  const [ resultStories, setResultStories ] = useState<PageResponse<StoryInfo> | null>(null);
  const [ loading, setLoading ] = useState<boolean>(false);

  // Use Form
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      offset: 1,
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

    const response = await loadStories!(filters, userId);
    if (!response.data) {
      setResultStories(null);
    }
    setResultStories(response);
    
    setLoading(false);
  }, [loadStories, userId]);

  const resetSearch = () => {
    searchForm.reset({
      offset: 1,
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
    handleSearch,
    resetSearch,
  };

}
