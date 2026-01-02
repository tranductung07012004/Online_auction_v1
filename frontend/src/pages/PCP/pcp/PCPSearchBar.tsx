import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar, MenuItem } from '../../../components/SearchBar';
import { useSearchStore } from '../../../stores';
import {
  CheckroomOutlined as DressIcon,
  Smartphone as SmartPhoneIcon,
  Book as BookIcon,
} from '@mui/icons-material';

export const PCPSearchBar: React.FC = () => {
  const navigate = useNavigate();
  const { searchQuery, filters, setSearchQuery, updateFilters } = useSearchStore();

  const menuItems: MenuItem[] = [
    { 
      text: 'Smartphone', 
      icon: <SmartPhoneIcon />, 
      path: '/pcp',
      subcategories: [
        { text: 'iPhone', value: 'iphone' },
        { text: 'Samsung', value: 'samsung' },
        { text: 'Xiaomi', value: 'xiaomi' },
        { text: 'Oppo', value: 'oppo' },
      ]
    },
    { 
      text: 'Clothes', 
      icon: <DressIcon />, 
      path: '/pcp',
      subcategories: [
        { text: 'Men', value: 'men' },
        { text: 'Women', value: 'women' },
        { text: 'Kids', value: 'kids' },
        { text: 'Accessories', value: 'accessories' },
      ]
    },
    { 
      text: 'Book', 
      icon: <BookIcon />, 
      path: '/pcp',
      subcategories: [
        { text: 'Fiction', value: 'fiction' },
        { text: 'Non-Fiction', value: 'non-fiction' },
        { text: 'Educational', value: 'educational' },
      ]
    },
  ];

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    }

    if (filters.category) {
      params.set('category', filters.category);
    }
    if (filters.sort) {
      params.set('sort', filters.sort);
    }
    if (filters.endTime) {
      params.set('endTime', 'desc');
    }

    navigate(`/pcp?${params.toString()}`);
  };

  const handleFilterSelect = (newFilters: { 
    category?: string; 
    sort?: string; 
    endTime?: boolean 
  }) => {
    
    updateFilters(newFilters);

    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set('q', searchQuery);
    }

    const updatedFilters = { ...filters, ...newFilters };
    if (updatedFilters.category) {
      params.set('category', updatedFilters.category);
    }
    if (updatedFilters.sort) {
      params.set('sort', updatedFilters.sort);
    }
    if (updatedFilters.endTime) {
      params.set('endTime', 'desc');
    }

    navigate(`/pcp?${params.toString()}`);
  };

  return (
    <SearchBar
      searchQuery={searchQuery}
      onSearchChange={handleSearchChange}
      onSearchSubmit={handleSearchSubmit}
      menuItems={menuItems}
      onFilterSelect={handleFilterSelect}
      placeholder="Search for products..."
      maxWidth={{ xs: '100%', md: '800px' }}
    />
  );
};

export default PCPSearchBar;

