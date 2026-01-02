import React, { useState, useEffect, useRef } from 'react';
import { X, Search as SearchIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { searchDresses, Dress as ApiDress } from '../../api/dress';

interface Dress {
  _id: string;
  name: string;
  dailyRentalPrice: number;
  purchasePrice: number;
  images: string[];
  avgRating?: number;
}

interface DressCardProps {
  _id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  rating?: number;
  price: number;
  priceUnit?: string;
  status?: string;
  statusColor?: string;
  onClick?: () => void;
}

interface SearchOverlayProps {
  onClose?: () => void;
}

const DressCard: React.FC<DressCardProps> = ({
  _id,
  imageUrl, 
  title, 
  subtitle = "", 
  rating = 4.8, 
  status = "Available", 
  statusColor = "#6DE588",
  price = 450, 
  priceUnit = "Per Day",
  onClick
}) => {
  return (
    <div 
      className="relative rounded-lg w-full cursor-pointer transition duration-200 transform hover:scale-[1.02] hover:shadow-xl" 
      onClick={onClick}
    >
      
      <div className="absolute top-8 left-10 flex space-x-2">
        <div className="flex items-center bg-white rounded-full px-3 py-1 shadow text-sm font-medium">
          {rating} <span className="text-yellow-500 ml-1">⭐</span>
        </div>
        <div className="flex items-center bg-white rounded-full px-3 py-1 shadow text-sm font-medium">
          <span className="w-2 h-2 rounded-full mr-1"
                style={{ backgroundColor: statusColor }}  
          />
          {status}
        </div>
      </div>

      <div className="w-full h-[500px] overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover rounded-tl-[80px] rounded-tr-[80px]"
        />
      </div>

      <div className="flex flex-row justify-between bg-[#FFFFFF] rounded-bl-[30px] rounded-br-[30px] p-4 items-center">
        <div className="flex flex-col">
          <h3 className="text-xl font-bold">{title}</h3>
          <h5 className="text-gray-600">{subtitle}</h5>
        </div>
        <p className="text-gray-600">
          Price: <span className="text-[#C3937C]">${price}</span>/{priceUnit}
        </p>
      </div>

      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity duration-300 rounded-tl-[80px] rounded-tr-[80px] rounded-bl-[30px] rounded-br-[30px]">
        <div className="bg-white py-2 px-6 rounded-full font-medium text-[#C3937C] transform translate-y-2 hover:translate-y-0 transition-transform duration-300">
          View Details
        </div>
      </div>
    </div>
  );
};

const LoadingPanel: React.FC = () => {
  return (
    <div className="bg-white rounded-lg p-8 shadow-lg flex flex-col items-center justify-center">
      <p className="text-lg text-gray-700 mb-4">This might take a few seconds</p>
      <div className="w-12 h-12 border-4 border-t-4 border-gray-200 border-t-[#C3937C] rounded-full animate-spin"></div>
    </div>
  );
};

const SearchOverlay: React.FC<SearchOverlayProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<Dress[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const navigate = useNavigate();
  
  const handleClose = (): void => {
    if (onClose) {
      onClose();
    }
    else {
      navigate(-1);
    } 
  }

  const handleSearch = async (e?: React.FormEvent): Promise<void> => {
    if (e) e.preventDefault();
    if (!searchTerm.trim()) return;
    
    setIsSearching(true);
    setHasSearched(true);
    setError(null);
    
    try {
      
      const dresses = await searchDresses(searchTerm);

      setSearchResults(dresses.map(dress => ({
        _id: dress._id,
        name: dress.name,
        dailyRentalPrice: dress.dailyRentalPrice,
        purchasePrice: dress.purchasePrice,
        images: dress.images,
        avgRating: dress.avgRating
      })));
    } catch (error) {
      console.error('Error searching dresses:', error);
      setSearchResults([]);
      setError('An error occurred while searching. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (searchTerm.trim().length >= 2) {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
      
      searchTimeoutRef.current = setTimeout(() => {
        handleSearch();
      }, 500);
    }
    
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchTerm]);

  const handleDressClick = (id: string): void => {
    navigate(`/product/${id}`);
    if (onClose) {
      onClose();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      
      if (e.key === 'Escape') {
        handleClose();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (searchInputRef.current) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 overflow-y-auto flex flex-col items-center pt-20">
      
      <button 
        onClick={handleClose}
        className="absolute top-10 right-10 text-white hover:text-gray-300 transition"
        aria-label="Close search"
      >
        <X size={30} />
      </button>

      <div className="w-full max-w-2xl px-4">
        <form onSubmit={handleSearch} className="mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border-b-2 border-white bg-transparent text-white placeholder-gray-300 focus:outline-none focus:border-[#C3937C] text-lg"
              placeholder="Enter dress name to search"
            />
          </div>
        </form>
      </div>

      {isSearching && (
        <div className="flex justify-center my-12">
          <LoadingPanel />
        </div>
      )}

      {error && !isSearching && (
        <div className="w-full max-w-2xl px-4 text-center my-8">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{error}</p>
            <button 
              onClick={() => handleSearch()} 
              className="mt-2 px-4 py-2 bg-white rounded-full shadow-sm hover:shadow-md transition-shadow text-red-600 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      )}

      {!isSearching && hasSearched && (
        <div className="w-full px-6 md:px-12 max-w-7xl pb-20">
          {searchResults.length > 0 ? (
            <>
              <h2 className="text-white text-2xl mb-8">Search Results ({searchResults.length})</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {searchResults.map(dress => (
                  <DressCard 
                    key={dress._id} 
                    _id={dress._id}
                    imageUrl={dress.images && dress.images.length > 0 ? dress.images[0] : 'https:
                    title={dress.name}
                    subtitle={dress.purchasePrice > 0 ? "Available for Rent or Purchase" : "Rental Only"}
                    price={dress.dailyRentalPrice}
                    priceUnit={dress.purchasePrice > 0 ? "Day / Buy $" + dress.purchasePrice : "Day"}
                    rating={dress.avgRating || 4.5}
                    status={dress.purchasePrice > 0 ? "Rent/Buy" : "Rental"}
                    statusColor={dress.purchasePrice > 0 ? "#F3B664" : "#6DE588"}
                    onClick={() => handleDressClick(dress._id)}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-10">
              <p className="text-white text-xl">No results found for "{searchTerm}"</p>
              <p className="text-gray-300 mt-2">Try a different search term</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchOverlay;