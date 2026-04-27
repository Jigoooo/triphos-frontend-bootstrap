import { useQueryClient } from '@tanstack/react-query';

export function useQueryClear() {
  const queryClient = useQueryClient();

  return (queryKey?: unknown[]) => {
    if (queryKey) {
      queryClient.removeQueries({ queryKey });
      return;
    }

    queryClient.clear();
  };
}

