/**
 * useSearchTransition Hook
 *
 * Optimized search/filter hook using React 18 useTransition
 * Prevents blocking UI during non-urgent search updates
 */

import { useState, useTransition, useCallback } from "react";

export interface UseSearchTransitionOptions<T> {
  initialValue?: T;
  debounceMs?: number;
}

export function useSearchTransition<T = string>(
  options: UseSearchTransitionOptions<T> = {},
) {
  const { initialValue = "" as T } = options;
  const [isPending, startTransition] = useTransition();
  const [value, setValue] = useState<T>(initialValue);
  const [deferredValue, setDeferredValue] = useState<T>(initialValue);

  const handleChange = useCallback((newValue: T) => {
    // Update input immediately for responsive feel
    setValue(newValue);

    // Defer expensive filtering/search operations
    startTransition(() => {
      setDeferredValue(newValue);
    });
  }, []);

  return {
    value,
    deferredValue,
    isPending,
    handleChange,
    setValue,
  };
}

/**
 * Example usage:
 *
 * function SearchBar() {
 *   const { value, deferredValue, isPending, handleChange } = useSearchTransition<string>();
 *
 *   // Use 'value' for the input (immediate feedback)
 *   // Use 'deferredValue' for filtering/search (non-blocking)
 *   const filteredResults = useMemo(() => {
 *     return items.filter(item => item.name.includes(deferredValue));
 *   }, [deferredValue, items]);
 *
 *   return (
 *     <Input
 *       value={value}
 *       onChange={(e) => handleChange(e.target.value)}
 *       placeholder="Search..."
 *       rightIcon={isPending ? <Spinner /> : <SearchIcon />}
 *     />
 *   );
 * }
 */
