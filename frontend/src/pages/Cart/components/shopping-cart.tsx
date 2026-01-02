import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { EmptyCart } from './empty-cart';
import { getCart } from '../../../api/cart';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Checkbox,
  FormControlLabel,
  Avatar,
  CircularProgress,
  Alert,
} from '@mui/material';
import { ProductCardProps } from '../../../components/ProductCard';

interface CartProduct extends ProductCardProps {
  _id?: string;
  quantity?: number;
  selected?: boolean;
}

export const ShoppingCart: React.FC = () => {
  const navigate = useNavigate();
  const [cartProducts, setCartProducts] = useState<CartProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string | number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  const getFakeCartData = (): CartProduct[] => {
    return [
      {
        id: 1,
        product_name: 'Tranh the ki trong',
        thumpnail_url: '/pic1.jpg',
        seller: {
          id: 1,
          avatar: '/placeholder-user.jpg',
          fullname: 'Nguyễn Văn A',
        },
        buy_now_price: 5000000,
        minimum_bid_step: 250000,
        start_at: new Date(),
        end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        current_price: 3000000,
        highest_bidder: {
          id: 6,
          avatar: '/placeholder-user.jpg',
          fullname: 'Lý Văn F',
        },
        bid_count: 15,
        quantity: 1,
      },
      {
        id: 2,
        product_name: 'De tam de che',
        thumpnail_url: '/pic2.jpg',
        seller: {
          id: 2,
          avatar: '/placeholder-user.jpg',
          fullname: 'Trần Thị B',
        },
        buy_now_price: 6000000,
        minimum_bid_step: 300000,
        start_at: new Date(),
        end_at: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        current_price: 4000000,
        highest_bidder: {
          id: 7,
          avatar: '/placeholder-user.jpg',
          fullname: 'Đỗ Thị G',
        },
        bid_count: 23,
        quantity: 1,
      },
      {
        id: 3,
        product_name: 'Da hoi ao dai',
        thumpnail_url: '/pic3.jpg',
        seller: {
          id: 3,
          avatar: '/placeholder-user.jpg',
          fullname: 'Lê Văn C',
        },
        buy_now_price: 4500000,
        minimum_bid_step: 225000,
        start_at: new Date(),
        end_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        current_price: 2800000,
        highest_bidder: null,
        bid_count: 8,
        quantity: 1,
      },
    ];
  };

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        setLoading(true);
        console.log('Fetching cart data...');

        try {

          const items = [] 

          if (items.length === 0) {
            console.log('Cart is empty, using fake data for UI preview');
            const fakeData = getFakeCartData();
            setCartProducts(fakeData);
            
            if (fakeData.length > 0) {
              setSelectedProductIds(new Set(fakeData.map(p => p.id)));
            }
          } else {
            
            const convertedItems = items.map((item: any) => ({
              id: item.productId || item._id,
              product_name: item.name || item.product_name,
              thumpnail_url: item.image || item.thumpnail_url || '/placeholder.svg',
              seller: item.seller || {
                id: 1,
                avatar: '/placeholder-user.jpg',
                fullname: 'Unknown Seller',
              },
              buy_now_price: item.buy_now_price || item.purchasePrice,
              minimum_bid_step: item.minimum_bid_step || 0,
              start_at: item.start_at || new Date(),
              end_at: item.end_at || new Date(),
              current_price: item.current_price || item.price || 0,
              highest_bidder: item.highest_bidder || null,
              bid_count: item.bid_count || 0,
              quantity: item.quantity || 1,
            }));
            setCartProducts(convertedItems);
            
            if (convertedItems.length > 0) {
              setSelectedProductIds(new Set(convertedItems.map(p => p.id)));
            }
          }
        } catch (apiError) {
          console.error('Failed to fetch cart from API:', apiError);
          
          const orderStr = localStorage.getItem('currentOrder');
          if (orderStr) {
            try {
              const orderData = JSON.parse(orderStr);
              console.log('Order data from localStorage (fallback):', orderData);

              if (orderData && orderData.items && orderData.items.length > 0) {
                console.log('Found items in localStorage (fallback):', orderData.items);
                
                const convertedItems = orderData.items.map((item: any) => ({
                  id: item.productId || item.id || item._id,
                  product_name: item.name || item.product_name,
                  thumpnail_url: item.image || item.thumpnail_url || '/placeholder.svg',
                  seller: item.seller || {
                    id: 1,
                    avatar: '/placeholder-user.jpg',
                    fullname: 'Unknown Seller',
                  },
                  buy_now_price: item.buy_now_price || item.purchasePrice,
                  minimum_bid_step: item.minimum_bid_step || 0,
                  start_at: item.start_at || new Date(),
                  end_at: item.end_at || new Date(),
                  current_price: item.current_price || item.price || 0,
                  highest_bidder: item.highest_bidder || null,
                  bid_count: item.bid_count || 0,
                  quantity: item.quantity || 1,
                }));
                setCartProducts(convertedItems);
                if (convertedItems.length > 0) {
                  setSelectedProductIds(new Set(convertedItems.map(p => p.id)));
                }
              } else {
                
                console.log('Using fake data for UI preview');
                const fakeData = getFakeCartData();
                setCartProducts(fakeData);
                if (fakeData.length > 0) {
                  setSelectedProductIds(new Set(fakeData.map(p => p.id)));
                }
              }
            } catch (e) {
              console.error('Error parsing order data from localStorage:', e);
              
              const fakeData = getFakeCartData();
              setCartProducts(fakeData);
              if (fakeData.length > 0) {
                setSelectedProductIds(new Set(fakeData.map(p => p.id)));
              }
            }
          } else {
            
            console.log('Using fake data for UI preview');
            const fakeData = getFakeCartData();
            setCartProducts(fakeData);
            if (fakeData.length > 0) {
              setSelectedProductIds(new Set(fakeData.map(p => p.id)));
            }
          }
        }
      } catch (err: any) {
        console.error('Failed to fetch cart:', err);
        console.error('Error details:', err.message);
        if (err.response) {
          console.error('Error response:', err.response);
        }
        
        console.log('Using fake data due to error');
        const fakeData = getFakeCartData();
        setCartProducts(fakeData);
        if (fakeData.length > 0) {
          setSelectedProductIds(new Set(fakeData.map(p => p.id)));
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCartData();
  }, []);

  const handleProductSelectionChange = (productId: string | number) => {
    setSelectedProductIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedProductIds.size === cartProducts.length) {
      
      setSelectedProductIds(new Set());
    } else {
      
      setSelectedProductIds(new Set(cartProducts.map(p => p.id)));
    }
  };

  const handleContinueToPayment = async () => {
    try {
      setIsProcessingOrder(true);

      if (selectedProductIds.size === 0) {
        toast.error('Please select at least one product to checkout');
        return;
      }

      const selectedProducts = cartProducts.filter((p) => selectedProductIds.has(p.id));
      if (selectedProducts.length === 0) {
        toast.error('Selected products not found');
        return;
      }

      const orderData = {
        items: selectedProducts.map(product => ({
          productId: product.id,
          product_name: product.product_name,
          image: product.thumpnail_url,
          seller: product.seller,
          buy_now_price: product.buy_now_price,
          current_price: product.current_price,
          quantity: product.quantity || 1,
        })),
      };

      localStorage.setItem('currentOrder', JSON.stringify(orderData));

      toast.success(`Redirecting to checkout page with ${selectedProducts.length} products...`);
      navigate('/payment-checkout');
    } catch (error: any) {
      console.error('Failed to process cart:', error);
      toast.error(error.message || 'Unable to proceed to checkout. Please try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" py={8}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" flexDirection="column" alignItems="center" justifyContent="center" py={8}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </Box>
    );
  }

  if (!cartProducts || cartProducts.length === 0) {
    return <EmptyCart />;
  }

  const isAllSelected = selectedProductIds.size === cartProducts.length && cartProducts.length > 0;
  const isIndeterminate = selectedProductIds.size > 0 && selectedProductIds.size < cartProducts.length;

  return (
    <Box maxWidth="1200px" mx="auto" px={2} py={4}>
      
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="body1" color="text.secondary">
          Select products to checkout ({selectedProductIds.size}/{cartProducts.length} selected)
        </Typography>
        <Button
          variant="outlined"
          size="small"
          onClick={handleSelectAll}
          sx={{
            borderColor: '#c3937c',
            color: '#c3937c',
            '&:hover': {
              borderColor: '#a67563',
              bgcolor: '#f8f3f0',
            },
          }}
        >
          {isAllSelected ? 'Deselect All' : 'Select All'}
        </Button>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        {cartProducts.map((product) => {
          const isSelected = selectedProductIds.has(product.id);
          return (
            <FormControlLabel
              key={product.id}
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={() => handleProductSelectionChange(product.id)}
                  sx={{
                    color: '#c3937c',
                    '&.Mui-checked': {
                      color: '#c3937c',
                    },
                  }}
                />
              }
              label={
                <Card
                  sx={{
                    width: '100%',
                    border: isSelected ? 2 : 1,
                    borderColor: isSelected ? '#c3937c' : 'divider',
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 4,
                      borderColor: '#c3937c',
                    },
                  }}
                  onClick={() => handleProductSelectionChange(product.id)}
                >
                  <CardContent>
                    <Box display="flex" gap={3}>

                      <CardMedia
                        component="img"
                        image={product.thumpnail_url || '/placeholder.svg'}
                        alt={product.product_name}
                        sx={{
                          width: 200,
                          height: 200,
                          objectFit: 'cover',
                          borderRadius: 2,
                        }}
                      />

                      <Box flex={1}>
                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                          <Box>
                            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                              {product.product_name}
                            </Typography>

                            <Box display="flex" alignItems="center" gap={1} mb={2}>
                              <Avatar
                                src={product.seller.avatar}
                                alt={product.seller.fullname}
                                sx={{ width: 32, height: 32 }}
                              />
                              <Typography variant="body2" color="text.secondary">
                                Seller: <strong>{product.seller.fullname}</strong>
                              </Typography>
                            </Box>

                            <Box display="flex" flexDirection="column" gap={1}>
                              <Box>
                                <Typography variant="h6" color="error" sx={{ fontWeight: 700 }}>
                                  {formatPrice(product.current_price)}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  Current Price
                                </Typography>
                              </Box>

                              {product.buy_now_price && (
                                <Box>
                                  <Typography variant="body1" sx={{ fontWeight: 600 }}>
                                    {formatPrice(product.buy_now_price)}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Buy Now Price
                                  </Typography>
                                </Box>
                              )}

                              <Typography variant="caption" color="text.secondary">
                                Bid Count: <strong>{product.bid_count}</strong>
                              </Typography>
                            </Box>

                            {product.highest_bidder && (
                              <Box mt={2} display="flex" alignItems="center" gap={1}>
                                <Avatar
                                  src={product.highest_bidder.avatar}
                                  alt={product.highest_bidder.fullname}
                                  sx={{ width: 24, height: 24 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  Highest Bidder: {product.highest_bidder.fullname}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              }
              sx={{ 
                m: 0,
                mb: 2,
                width: '100%',
                display: 'block',
                '& .MuiFormControlLabel-label': {
                  width: '100%',
                  margin: 0,
                }
              }}
            />
          );
        })}
      </Box>

      <Box display="flex" justifyContent="center" mt={4}>
        <Button
          variant="contained"
          size="large"
          onClick={handleContinueToPayment}
          disabled={isProcessingOrder || selectedProductIds.size === 0}
          sx={{
            px: 6,
            py: 1.5,
            borderRadius: 3,
            fontSize: '1.1rem',
            fontWeight: 600,
            bgcolor: '#c3937c',
            '&:hover': {
              bgcolor: '#a67563',
            },
            '&:disabled': {
              bgcolor: '#d3c4b8',
            },
          }}
        >
          {isProcessingOrder ? 'Processing...' : 'Continue to Checkout'}
        </Button>
      </Box>
    </Box>
  );
};
