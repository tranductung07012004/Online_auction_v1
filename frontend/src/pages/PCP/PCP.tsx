import { useState, useEffect } from 'react';
import Header from '../../components/header';
import Footer from '../../components/footer';
import ProductCard from '../../components/ProductCard';
import { useSearchParams } from 'react-router-dom';

import { PCPSearchBar } from './pcp/PCPSearchBar';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Pagination,
} from '@mui/material';
import { useSearchSync } from '../../hooks/useSearchSync';

interface FakeProduct {
  id: number;
  product_name: string;
  thumpnail_url: string;
  seller: {
    id: number;
    avatar: string;
    fullname: string;
  };
  buy_now_price: number | null;
  minimum_bid_step: number;
  start_at: string | Date;
  end_at: string | Date;
  current_price: number;
  highest_bidder: {
    id: number;
    avatar: string;
    fullname: string;
  } | null;
  created_at?: string | Date;
  posted_at?: string | Date;
  bid_count: number;
  category: string;
}

const generateFakeProducts = (): FakeProduct[] => {
  const now = new Date();
  const sellers = [
    { id: 1, avatar: '/placeholder-user.jpg', fullname: 'Nguyễn Văn A' },
    { id: 2, avatar: '/placeholder-user.jpg', fullname: 'Trần Thị B' },
    { id: 3, avatar: '/placeholder-user.jpg', fullname: 'Lê Văn C' },
    { id: 4, avatar: '/placeholder-user.jpg', fullname: 'Phạm Thị D' },
    { id: 5, avatar: '/placeholder-user.jpg', fullname: 'Hoàng Văn E' },
  ];

  const categories = [
    'smartphone', 'iphone', 'samsung', 'xiaomi', 'oppo',
    'clothes', 'men', 'women', 'kids', 'accessories',
    'book', 'fiction', 'non-fiction', 'educational',
  ];

  const productNames = [
    'Tranh the ki trong',
    'De tam de che',
    'Da hoi ao dai',
    'Thang canh ky phong',
    'Thanh guom cua vua Louis III',
    'Chen thanh',
    'Ke huy diet',
    'Hung thu tiec tan',
    'Tranh cua picasso',
    'Nguoi dep to lua',
    'Mot ngay nang',
    'Berserk',
  ];

  const bidders = [
    { id: 6, avatar: '/placeholder-user.jpg', fullname: 'Lý Văn F' },
    { id: 7, avatar: '/placeholder-user.jpg', fullname: 'Đỗ Thị G' },
    { id: 8, avatar: '/placeholder-user.jpg', fullname: 'Bùi Văn H' },
    { id: 9, avatar: '/placeholder-user.jpg', fullname: 'Vũ Thị I' },
    { id: 10, avatar: '/placeholder-user.jpg', fullname: 'Đinh Văn J' },
  ];

  return productNames.map((name, index) => {
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - Math.floor(Math.random() * 7));
    
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + Math.floor(Math.random() * 14) + 7);
    
    const buyNowPrice = Math.floor(Math.random() * 5000000) + 1000000; 
    const minBidStep = Math.floor(buyNowPrice * 0.05); 
    const currentPrice = Math.floor(buyNowPrice * (0.6 + Math.random() * 0.3)); 
    const bidCount = Math.floor(Math.random() * 50) + 1; 
    const hasHighestBidder = Math.random() > 0.2; 
    const postedDate = new Date(startDate);
    postedDate.setDate(postedDate.getDate() - Math.floor(Math.random() * 3)); 

    const category = categories[index % categories.length];

    return {
      id: index + 1,
      product_name: name,
      thumpnail_url: '/placeholder.svg',
      seller: sellers[Math.floor(Math.random() * sellers.length)],
      buy_now_price: Math.random() > 0.1 ? buyNowPrice : null, 
      minimum_bid_step: minBidStep,
      start_at: startDate.toISOString(),
      end_at: endDate.toISOString(),
      current_price: currentPrice,
      highest_bidder: hasHighestBidder ? bidders[Math.floor(Math.random() * bidders.length)] : null,
      created_at: postedDate.toISOString(),
      bid_count: bidCount,
      category,
    };
  });
};

export default function ProductPage(): JSX.Element {
  const [searchParams] = useSearchParams();

  useSearchSync();
  
  const urlQuery = searchParams.get('q') || '';
  const urlCategory = searchParams.get('category') || '';
  
  const [searchQuery, setSearchQuery] = useState(urlQuery);
  const [products, setProducts] = useState<FakeProduct[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<FakeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const productsPerPage = 6; 

  const [categoryFilter, setCategoryFilter] = useState<string>(urlCategory);

  useEffect(() => {
    const loadFakeData = () => {
      setLoading(true);
      try {

        const fakeData = generateFakeProducts();
        setProducts(fakeData);
        setFilteredProducts(fakeData);
        setError(null);
      } catch (error) {
        console.error('Error loading products:', error);
        setError('Failed to load products');
        
        const fakeData = generateFakeProducts();
        setProducts(fakeData);
        setFilteredProducts(fakeData);
      } finally {
        setLoading(false);
      }
    };

    loadFakeData();
  }, []);

  useEffect(() => {
    const urlQuery = searchParams.get('q');
    const urlCategory = searchParams.get('category');

    if (urlCategory) {
      setCategoryFilter(urlCategory);
    } else {
      setCategoryFilter('');
    }
    
    if (products.length > 0) {
      if (urlQuery && urlQuery.trim()) {
        
        setSearchQuery(urlQuery);
        setIsSearching(true);

        const filtered = products.filter((product) =>
          product.product_name.toLowerCase().includes(urlQuery.toLowerCase()) ||
          product.seller.fullname.toLowerCase().includes(urlQuery.toLowerCase())
        );
        setFilteredProducts(filtered);
        setIsSearching(false);
      } else {
        
        setSearchQuery('');
        setFilteredProducts(products);
      }
    }
  }, [searchParams, products]);

  useEffect(() => {
    let result = [...products];

    if (searchQuery.trim()) {
      result = result.filter(
        (product) =>
          product.product_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.seller.fullname.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (categoryFilter) {
      result = result.filter((product) => 
        product.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    setFilteredProducts(result);
    
    setCurrentPage(1);
  }, [
    products,
    searchQuery,
    categoryFilter,
  ]);

  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const displayProducts = filteredProducts.slice(startIndex, endIndex);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div>
      <Header />

      <Box
        sx={{
          bgcolor: 'white',
          borderBottom: '1px solid #EAEAEA',
          py: 2,
          px: { xs: 2, md: 4 },
          display: 'flex',
          justifyContent: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        }}
      >
        <PCPSearchBar />
      </Box>

      <main>
        <Container maxWidth="lg" sx={{ py: 4 }}>
          
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 600,
              mb: 4,
              fontSize: { xs: '1.75rem', md: '2rem' },
            }}
          >
            Our Products
          </Typography>

          {loading || isSearching ? (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: 400,
              }}
            >
              <CircularProgress />
            </Box>
          ) : error ? (
            <Box sx={{ mb: 4 }}>
              <Alert severity="error">{error}</Alert>
            </Box>
          ) : displayProducts.length === 0 ? (
            <Paper
              sx={{
                p: 4,
                textAlign: 'center',
                bgcolor: 'background.default',
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No products found matching your criteria
              </Typography>
            </Paper>
          ) : (
            <>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: {
                    xs: '1fr',
                    sm: 'repeat(2, 1fr)',
                    md: 'repeat(3, 1fr)',
                  },
                  gap: 3,
                }}
              >
                {displayProducts.map((product) => (
                  <Box key={product.id}>
                    <ProductCard {...product} />
                  </Box>
                ))}
              </Box>

              {totalPages > 1 && (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    mt: 6,
                  }}
                >
                  <Pagination
                    count={totalPages}
                    page={currentPage}
                    onChange={handlePageChange}
                    size="large"
                    showFirstButton
                    showLastButton
                    sx={{
                      '& .MuiPaginationItem-root': {
                        color: '#8B6F47',
                        '&.Mui-selected': {
                          backgroundColor: '#EAD9C9',
                          color: '#8B6F47',
                          '&:hover': {
                            backgroundColor: '#EAD9C9',
                            opacity: 0.8,
                          },
                        },
                        '&:hover': {
                          backgroundColor: '#EAD9C9',
                          opacity: 0.6,
                        },
                      },
                    }}
                  />
                </Box>
              )}
            </>
          )}
        </Container>
      </main>
      <Footer />
    </div>
  );
}
