import { useEffect, useRef } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { useSearchStore } from '../stores/searchStore';

export const useSearchSync = () => {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { searchQuery, filters, setSearchQuery, setFilters } = useSearchStore();
  const prevLocationRef = useRef<string>(location.pathname + location.search);

  useEffect(() => {
    const currentLocation = location.pathname + location.search;

    if (currentLocation !== prevLocationRef.current) {
      
      const urlQuery = searchParams.get('q') || '';
      if (urlQuery !== searchQuery) {
        setSearchQuery(urlQuery);
      }

      const urlCategory = searchParams.get('category') || undefined;
      const urlSubCategory = searchParams.get('subcategory') || undefined;
      const urlSort = searchParams.get('sort') || undefined;
      const urlEndTime = searchParams.get('endTime') === 'desc' ? true : undefined;
      
      setFilters({
        category: urlCategory,
        subcategory: urlSubCategory,
        sort: urlSort,
        endTime: urlEndTime,
      });
      
      prevLocationRef.current = currentLocation;
    }
  }, [location, searchParams, searchQuery, filters, setSearchQuery, setFilters]);
};

