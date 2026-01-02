import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CartItem, OrderSummary, Address } from './types';
import { calculateOrderSummary, formatCurrency } from './utils/paymentUtils';
import CheckoutSteps from './components/CheckoutSteps';
import AddressForm from './components/AddressForm';
import { useToast } from '../../hooks/use-toast';

const Information: React.FC = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<OrderSummary>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    initialDeposit: 0,
    remainingPayment: 0,
    currency: 'USD'
  });
  const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [defaultAddressId, setDefaultAddressId] = useState<string | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(true);
  const [selectedItemIds, setSelectedItemIds] = useState<Set<number>>(new Set());
  const { toast } = useToast();

  const fetchAddressAndProfileData = async () => {
    try {
      
      const addressesResponse = await axios.get('http:
      
      if (addressesResponse.data.success) {
        const addressesData = addressesResponse.data.data || {};
        console.log('Saved addresses loaded:', addressesData);

        let addressesList: any[] = [];

        if (addressesData.addresses && Array.isArray(addressesData.addresses)) {
          addressesList = addressesData.addresses;
          if (addressesData.defaultAddressId) {
            setDefaultAddressId(addressesData.defaultAddressId);
          }
        } 
        
        else if (Array.isArray(addressesData)) {
          addressesList = addressesData;
        }
        
        setSavedAddresses(addressesList);

        if (addressesList.length > 0) {
          if (addressesData.defaultAddressId) {
            
            const defaultAddress = addressesList.find((addr: any) => addr.id === addressesData.defaultAddressId);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setShowAddressForm(false);
            } else {
              
              setSelectedAddressId(addressesList[0].id);
              setShowAddressForm(false);
            }
          } else {
            
            const defaultAddress = addressesList.find((addr: any) => addr.isDefault === true);
            if (defaultAddress) {
              setDefaultAddressId(defaultAddress.id);
              setSelectedAddressId(defaultAddress.id);
              setShowAddressForm(false);
            } else {
              
              setSelectedAddressId(addressesList[0].id);
              setShowAddressForm(false);
            }
          }
        } else {
          
          setShowAddressForm(true);
        }
      } else {
        
        setShowAddressForm(true);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      
      setShowAddressForm(true);
    }
  };
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        if (import.meta.env.DEV) {
          const today = new Date();
          const twoDaysLater = new Date(today);
          twoDaysLater.setDate(twoDaysLater.getDate() + 2);

          const mockCartItems: CartItem[] = [
            {
              name: 'Elegant Wedding Dress',
              image: '/pic1.jpg',
              quantity: 1,
              dressId: 'demo-dress-1',
              sizeName: 'M',
              colorName: 'Ivory',
              pricePerDay: 80,
              startDate: today,
              endDate: twoDaysLater,
            },
          ];

          const rentalDays =
            Math.ceil(
              (twoDaysLater.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24),
            ) + 1;
          const dressTotal = 80 * rentalDays * 1;
          const mockSubtotal = dressTotal;
          const mockTax = mockSubtotal * 0.1;
          const mockShipping = mockSubtotal >= 100 ? 0 : 10;
          const mockTotal = mockSubtotal + mockTax + mockShipping;

          const mockAddress: Address = {
            firstName: 'Tung',
            lastName: 'Tran',
            company: 'Demo Company',
            address: '123 Demo Street',
            apartment: 'Apt 4B',
            city: 'Da Nang',
            province: 'Da Nang',
            postalCode: '550000',
            phone: '0123456789',
            country: 'Vietnam',
          };

          setCartItems(mockCartItems);
          
          setSelectedItemIds(new Set(mockCartItems.map((_: any, index: number) => index)));
          setSummary({
            subtotal: mockSubtotal,
            tax: mockTax,
            shipping: mockShipping,
            total: mockTotal,
            initialDeposit: mockTotal * 0.5,
            remainingPayment: mockTotal * 0.5,
            currency: 'USD',
          } as OrderSummary);

          const fakeSavedList = [
            {
              id: 'mock-address-1',
              isDefault: true,
              ...mockAddress,
            },
          ];
          setSavedAddresses(fakeSavedList);
          setDefaultAddressId('mock-address-1');
          setSelectedAddressId('mock-address-1');
          setShowAddressForm(false);

          setIsLoading(false);
          return;
        }

        let hasItems = false;

        const orderStr = localStorage.getItem('currentOrder');
        if (orderStr) {
          try {
            const orderData = JSON.parse(orderStr);
            console.log('Order data from localStorage:', orderData);
            let allCartItems: CartItem[] = [];

            if (orderData && orderData.items && orderData.items.length > 0) {
              console.log('Dress items found in order:', orderData.items);
              allCartItems = [...orderData.items];

              const firstItem = orderData.items[0];
              const startDate = new Date(firstItem.startDate);
              const endDate = new Date(firstItem.endDate);
              
              if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime())) {
                const dressItemsSummary = calculateOrderSummary(
                  orderData.items,
                  startDate,
                  endDate
                );
                setSummary(dressItemsSummary);
              }
              
              hasItems = true;
            }

            if (orderData && orderData.photographyItems && orderData.photographyItems.length > 0) {
              console.log('Photography items found in order:', orderData.photographyItems);

              const processedPhotographyItems = orderData.photographyItems.map((item: any) => ({
                id: item.serviceId,
                name: item.serviceName,
                type: item.serviceType,
                image: item.imageUrl,
                price: item.price,
                quantity: 1,
                bookingDate: item.bookingDate,
                location: item.location || 'Default location',
                isPhotographyService: true
              }));

              allCartItems = [...allCartItems, ...processedPhotographyItems];

              const totalAmount = processedPhotographyItems.reduce(
                (sum: number, item: CartItem) => sum + (item.price || 0), 0
              );

              setSummary(prev => {
                const updatedSummary = {...prev};
                updatedSummary.subtotal += totalAmount;
                updatedSummary.tax += totalAmount * 0.1; 
                updatedSummary.total += totalAmount + (totalAmount * 0.1);
                return updatedSummary;
              });
              
              hasItems = true;
            }
            
            if (hasItems) {
              setCartItems(allCartItems);
              
              setSelectedItemIds(new Set(allCartItems.map((_: any, index: number) => index)));
              await fetchAddressAndProfileData();
              setIsLoading(false);
              return; 
            }
          } catch (e) {
            console.error('Error parsing order data from localStorage:', e);
          }
        }

        const photographyCartStr = localStorage.getItem('photography_cart_items');
        if (photographyCartStr) {
          try {
            const photographyItems: any[] = JSON.parse(photographyCartStr);
            console.log('Photography cart data from localStorage (fallback):', photographyItems);
            
            if (photographyItems && photographyItems.length > 0) {
              
              const processedPhotographyItems = photographyItems.map((item: any) => ({
                id: item.serviceId,
                name: item.serviceName,
                type: item.serviceType,
                image: item.imageUrl,
                price: item.price,
                quantity: 1,
                bookingDate: item.bookingDate,
                location: item.location || 'Default location',
                isPhotographyService: true
              }));
              
              setCartItems(processedPhotographyItems);
              
              setSelectedItemIds(new Set(processedPhotographyItems.map((_: any, index: number) => index)));

              const totalAmount = processedPhotographyItems.reduce(
                (sum: number, item: CartItem) => sum + (item.price || 0), 0
              );
              
              const totalWithTax = totalAmount + (totalAmount * 0.1);
              setSummary({
                subtotal: totalAmount,
                tax: totalAmount * 0.1, 
                shipping: 0,  
                total: totalWithTax,
                initialDeposit: totalWithTax * 0.5, 
                remainingPayment: totalWithTax * 0.5, 
                currency: 'USD'
              });
              
              await fetchAddressAndProfileData();
              setIsLoading(false);
              return; 
            }
          } catch (e) {
            console.error('Error parsing photography cart data from localStorage:', e);
          }
        }

        const cartResponse = await axios.get('http:
        
        if (cartResponse.data.success && cartResponse.data.data) {
          const cartItems = cartResponse.data.data.items || [];
          setCartItems(cartItems);

          if (cartItems && cartItems.length > 0) {
            
            const processedItems = cartItems.map((item: any) => {
              return {
                dressId: typeof item.dress === 'object' ? item.dress._id : (item.dressId || item.dress),
                name: typeof item.dress === 'object' ? item.dress.name : item.name,
                image: typeof item.dress === 'object' && item.dress.images ? item.dress.images[0] : item.image,
                size: typeof item.size === 'object' ? item.size.name : item.sizeName,
                color: typeof item.color === 'object' ? item.color.name : item.colorName,
                quantity: item.quantity,
                pricePerDay: typeof item.dress === 'object' && item.dress.dailyRentalPrice ? 
                  item.dress.dailyRentalPrice : (item.pricePerDay || 0),
                startDate: item.startDate,
                endDate: item.endDate
              };
            });
            
            if (processedItems.length > 0) {
              const firstItem = processedItems[0];
              
              const today = new Date();
              const tomorrow = new Date(today);
              tomorrow.setDate(tomorrow.getDate() + 1);
              
              let itemStartDate = firstItem.startDate ? new Date(firstItem.startDate) : today;
              let itemEndDate = firstItem.endDate ? new Date(firstItem.endDate) : tomorrow;

              if (isNaN(itemStartDate.getTime())) itemStartDate = today;
              if (isNaN(itemEndDate.getTime())) itemEndDate = tomorrow;
              
              const calculatedSummary = calculateOrderSummary(
                processedItems,
                itemStartDate,
                itemEndDate
              );
              
              setSummary(calculatedSummary);

              const orderData = {
                items: processedItems
              };
              localStorage.setItem('currentOrder', JSON.stringify(orderData));
              setCartItems(processedItems);
              
              setSelectedItemIds(new Set(processedItems.map((_: any, index: number) => index)));
            }
          } else {
            setError('No items in cart');
            setTimeout(() => {
              navigate('/cart');
            }, 2000);
            return;
          }
        } else {
          setError('No items in cart');
          setTimeout(() => {
            navigate('/cart');
          }, 2000);
          return;
        }
        
        await fetchAddressAndProfileData();
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('An error occurred while loading your order');
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [navigate, savedAddresses.length]);
  
  const handleSelectAddress = (addressId: string) => {
    setSelectedAddressId(addressId);
    setShowAddressForm(false);
  };
  
  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setShowAddressForm(true);
  };
  
  const handleAddressSubmit = async (addressData: Address) => {
    try {
      setIsSubmitting(true);

      sessionStorage.setItem('shippingAddress', JSON.stringify(addressData));

      const savedData = sessionStorage.getItem('shippingAddress');
      console.log('Verification - address saved to session storage:', savedData);
      
      if (!savedData) {
        toast({
          title: 'Error saving address',
          description: 'There was a problem saving your address information',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }

      if (showAddressForm) {
        try {
          await axios.post('http:
            { 
              address: addressData,
              setAsDefault: savedAddresses.length === 0 
            }, 
            { withCredentials: true }
          );
          
          toast({
            title: 'Address saved',
            description: 'Your address has been saved to your profile'
          });
        } catch (error) {
          console.error('Error saving address to profile:', error);
          
        }
      }

      setTimeout(() => {
        
        navigate('/order-history');
      }, 100);
    } catch (error) {
      console.error('Error processing address:', error);
      setError('Failed to save address information');
      setIsSubmitting(false);
    }
  };
  
  const handleBackToReview = () => {
    navigate('/cart');
  };

  const handleItemSelection = (index: number) => {
    setSelectedItemIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItemIds.size === cartItems.length) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(cartItems.map((_: any, index: number) => index)));
    }
  };

  const handleUseSavedAddress = async () => {
    if (!selectedAddressId) {
      toast({
        title: 'Please select an address',
        description: 'You must select a delivery address to continue',
        variant: 'destructive'
      });
      return;
    }
    
    try {
      console.log('Starting handleUseSavedAddress, selectedAddressId:', selectedAddressId);
      setIsSubmitting(true);

      const selectedAddress = savedAddresses.find((addr: any) => addr.id === selectedAddressId);
      console.log('Selected address:', selectedAddress);
      
      if (!selectedAddress) {
        setError('Selected address not found');
        setIsSubmitting(false);
        return;
      }

      const addressForCheckout: Address = {
        firstName: selectedAddress.firstName,
        lastName: selectedAddress.lastName,
        company: selectedAddress.company || '',
        address: selectedAddress.address,
        apartment: selectedAddress.apartment || '',
        city: selectedAddress.city,
        province: selectedAddress.province,
        postalCode: selectedAddress.postalCode,
        phone: selectedAddress.phone,
        country: selectedAddress.country
      };
      
      console.log('Saving address to session storage:', addressForCheckout);

      sessionStorage.setItem('shippingAddress', JSON.stringify(addressForCheckout));

      const savedData = sessionStorage.getItem('shippingAddress');
      console.log('Verification - address saved to session storage:', savedData);
      
      if (!savedData) {
        toast({
          title: 'Error saving address',
          description: 'There was a problem saving your address information',
          variant: 'destructive'
        });
        setIsSubmitting(false);
        return;
      }
      
      console.log('About to navigate to order history');

      setTimeout(() => {
        
        navigate('/order-history');
        console.log('Navigation command issued');
      }, 100);
    } catch (error) {
      console.error('Error processing saved address:', error);
      setError('Failed to process address information');
      setIsSubmitting(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="information" completedSteps={['payment']} />
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#c3937c]"></div>
        </div>
      </div>
    );
  }
  
  if (error && cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <CheckoutSteps currentStep="information" completedSteps={['payment']} />
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <h2 className="text-2xl font-semibold mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-gray-600 mb-6">Redirecting to cart...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <CheckoutSteps currentStep="information" completedSteps={['payment']} />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-2">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4 mb-4">
              {error}
            </div>
          )}

          {savedAddresses.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h2 className="text-lg font-semibold mb-2">Saved Addresses</h2>
              <p className="text-sm text-gray-600 mb-4">Please select an address for delivery</p>
              
              <div className="space-y-4">
                {savedAddresses.map((address) => (
                  <div 
                    key={address.id}
                    className={`border rounded-md p-4 cursor-pointer transition-colors ${
                      selectedAddressId === address.id 
                        ? 'border-[#c3937c] bg-[#f9f5f2]' 
                        : 'border-gray-200 hover:border-[#c3937c]'
                    }`}
                    onClick={() => handleSelectAddress(address.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex items-center h-6 mt-1">
                        <div className={`w-5 h-5 rounded-full border ${selectedAddressId === address.id ? 'border-[#c3937c]' : 'border-gray-300'} flex items-center justify-center`}>
                          {selectedAddressId === address.id && (
                            <div className="w-3 h-3 rounded-full bg-[#c3937c]"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-medium">
                            {address.firstName} {address.lastName}
                          </h3>
                          {address.id === defaultAddressId && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {address.address}
                          {address.apartment && `, ${address.apartment}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.city}, {address.province}, {address.country}
                        </p>
                        <p className="text-sm text-gray-600">{address.postalCode}</p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  className="text-[#c3937c] hover:text-[#a67c66] font-medium text-sm mt-2 flex items-center"
                  onClick={handleUseNewAddress}
                >
                  + Add a new address
                </button>
              </div>
              
              {!showAddressForm && (
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleUseSavedAddress}
                    disabled={isSubmitting || !selectedAddressId}
                    className={`w-full rounded-md px-4 py-2 text-white font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#c3937c] ${
                      selectedAddressId ? 'bg-[#c3937c] hover:bg-[#a67c66]' : 'bg-gray-400 cursor-not-allowed'
                    } ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                  >
                    {isSubmitting ? 'Processing...' : selectedAddressId ? 'Deliver to this address' : 'Please select an address'}
                  </button>
                </div>
              )}
            </div>
          )}

          {showAddressForm && (
            <AddressForm 
              onSubmit={handleAddressSubmit}
              isLoading={isSubmitting}
              submitLabel="Continue to Shipping"
            />
          )}
          
          <div className="mt-6">
            <button
              onClick={handleBackToReview}
              className="text-[#c3937c] hover:text-[#a67c66] font-medium flex items-center"
            >
              <svg xmlns="http:
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Return to cart
            </button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <button
                onClick={handleSelectAll}
                className="text-sm text-[#c3937c] hover:text-[#a67c66] font-medium"
              >
                {selectedItemIds.size === cartItems.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
              </button>
            </div>
            
            <div className="divide-y divide-gray-200">
              {cartItems.map((item, index) => {
                const isSelected = selectedItemIds.has(index);
                if (!isSelected) return null;
                
                const startDate = new Date(item.startDate as Date);
                const endDate = new Date(item.endDate as Date);
                const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

                let itemTotal = 0;
                let typeDisplay = '';
                
                if ((item as any).purchaseType === 'buy') {
                  
                  const purchasePrice = (item as any).purchasePrice || ((item.pricePerDay || 0) * 10);
                  itemTotal = purchasePrice * item.quantity;
                  typeDisplay = 'Purchase';
                } else {
                  
                  itemTotal = (item.pricePerDay || 0) * days * item.quantity;
                  typeDisplay = `${days} days rental`;
                }
                
                return (
                  <div key={index} className="py-4 flex items-center">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleItemSelection(index)}
                      className="mr-3 w-4 h-4 text-[#c3937c] border-gray-300 rounded focus:ring-[#c3937c]"
                    />
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 relative">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover object-center"
                      />
                      <span className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-[#c3937c] text-white text-xs flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    
                    <div className="ml-4 flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      <p className="text-xs text-gray-500">{item.sizeName} · {item.colorName}</p>
                      <p className="text-xs text-gray-500">{typeDisplay}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(itemTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="border-t border-gray-200 pt-4 mt-4">
              {(() => {
                
                const selectedItems = cartItems.filter((_, idx) => selectedItemIds.has(idx));
                let selectedSubtotal = 0;
                let selectedTax = 0;
                let selectedShipping = 0;

                selectedItems.forEach(item => {
                  if (item.isPhotographyService) {
                    selectedSubtotal += item.price || 0;
                  } else {
                    const startDate = new Date(item.startDate as Date);
                    const endDate = new Date(item.endDate as Date);
                    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    if ((item as any).purchaseType === 'buy') {
                      const purchasePrice = (item as any).purchasePrice || ((item.pricePerDay || 0) * 10);
                      selectedSubtotal += purchasePrice * item.quantity;
                    } else {
                      selectedSubtotal += (item.pricePerDay || 0) * days * item.quantity;
                    }
                  }
                });

                selectedTax = selectedSubtotal * 0.1;
                selectedShipping = selectedSubtotal >= 100 ? 0 : (selectedSubtotal > 0 ? 10 : 0);
                const selectedTotal = selectedSubtotal + selectedTax + selectedShipping;

                return (
                  <>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">{formatCurrency(selectedSubtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">{formatCurrency(selectedTax)}</span>
                    </div>
                    <div className="flex justify-between text-sm mb-4">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">
                        {selectedShipping === 0 ? 'Free' : formatCurrency(selectedShipping)}
                      </span>
                    </div>
                    <div className="flex justify-between font-medium text-lg">
                      <span>Total</span>
                      <span className="text-[#c3937c]">{formatCurrency(selectedTotal)}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Information;