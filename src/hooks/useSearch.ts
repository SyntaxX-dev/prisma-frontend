"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const query = searchParams.get('q') || '';
    setSearchQuery(query);
  }, [searchParams]);

  const updateSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!query.trim()) {
      setIsLoading(false);
      const params = new URLSearchParams(searchParams.toString());
      params.delete('q');
      router.replace('/dashboard', { scroll: false });
      return;
    }

    setIsLoading(true);
    console.log('Setting isLoading to true');

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      params.set('q', query.trim());
      
      const newUrl = `/courses/search?${params.toString()}`;
      router.push(newUrl);
      setIsLoading(false);
      console.log('Setting isLoading to false');
    }, 500);
  }, [router, searchParams]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setIsLoading(false);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    router.replace('/dashboard', { scroll: false });
  }, [router]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    searchQuery,
    updateSearch,
    clearSearch,
    isSearching: searchQuery.length > 0,
    isLoading
  };
}
