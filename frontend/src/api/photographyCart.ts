import { toast } from 'react-hot-toast';

export interface PhotographyCartItem {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  price: number;
  imageUrl: string;
  bookingDate: string;
  location: string;
}

const PHOTOGRAPHY_CART_KEY = 'photography_cart_items';

export const getPhotographyCart = (): PhotographyCartItem[] => {
  try {
    const cartItems = localStorage.getItem(PHOTOGRAPHY_CART_KEY);
    return cartItems ? JSON.parse(cartItems) : [];
  } catch (error) {
    console.error('Error getting photography cart:', error);
    return [];
  }
};

export const addPhotographyToCart = async (item: PhotographyCartItem): Promise<void> => {
  try {
    
    const cartItemsJson = localStorage.getItem(PHOTOGRAPHY_CART_KEY);
    let cartItems: PhotographyCartItem[] = [];
    
    if (cartItemsJson) {
      cartItems = JSON.parse(cartItemsJson);
    }

    const bookingDate = new Date(item.bookingDate);
    const formattedDate = bookingDate.toISOString();

    const updatedItem = {
      ...item,
      bookingDate: formattedDate
    };

    const existingItemIndex = cartItems.findIndex(cartItem => 
      cartItem.serviceId === updatedItem.serviceId
    );
    
    if (existingItemIndex >= 0) {
      
      cartItems[existingItemIndex] = updatedItem;
    } else {
      
      cartItems.push(updatedItem);
    }

    localStorage.setItem(PHOTOGRAPHY_CART_KEY, JSON.stringify(cartItems));

    const currentOrderJson = localStorage.getItem('currentOrder');
    if (currentOrderJson) {
      const currentOrder = JSON.parse(currentOrderJson);

      const photographyItems = cartItems.map(item => ({
        serviceId: item.serviceId,
        serviceName: item.serviceName,
        serviceType: item.serviceType,
        price: item.price,
        imageUrl: item.imageUrl,
        bookingDate: item.bookingDate,
        location: item.location
      }));

      const updatedOrder = {
        ...currentOrder,
        photographyItems: photographyItems
      };
      
      localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
    }
    
    console.log('Photography item added to cart and updated in orders:', updatedItem);
  } catch (error) {
    console.error('Error adding photography item to cart:', error);
    throw error;
  }
};

export const removePhotographyFromCart = (serviceId: string): void => {
  try {
    const cartItemsJson = localStorage.getItem(PHOTOGRAPHY_CART_KEY);
    if (!cartItemsJson) return;
    
    let cartItems: PhotographyCartItem[] = JSON.parse(cartItemsJson);
    cartItems = cartItems.filter(item => item.serviceId !== serviceId);
    
    localStorage.setItem(PHOTOGRAPHY_CART_KEY, JSON.stringify(cartItems));

    const currentOrderJson = localStorage.getItem('currentOrder');
    if (currentOrderJson) {
      const currentOrder = JSON.parse(currentOrderJson);
      
      if (currentOrder.photographyItems) {
        
        const updatedPhotographyItems = currentOrder.photographyItems.filter(
          (item: any) => item.serviceId !== serviceId
        );

        const updatedOrder = {
          ...currentOrder,
          photographyItems: updatedPhotographyItems
        };
        
        localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
      }
    }
  } catch (error) {
    console.error('Error removing photography item from cart:', error);
  }
};

export const clearPhotographyCart = (): void => {
  localStorage.removeItem(PHOTOGRAPHY_CART_KEY);

  const currentOrderJson = localStorage.getItem('currentOrder');
  if (currentOrderJson) {
    const currentOrder = JSON.parse(currentOrderJson);

    const updatedOrder = {
      ...currentOrder,
      photographyItems: []
    };
    
    localStorage.setItem('currentOrder', JSON.stringify(updatedOrder));
  }
};

export const updatePhotographyBookingDate = (serviceId: string, bookingDate: string): PhotographyCartItem[] => {
  try {
    
    const currentCart = getPhotographyCart();

    const itemIndex = currentCart.findIndex(item => item.serviceId === serviceId);
    
    if (itemIndex >= 0) {
      
      currentCart[itemIndex].bookingDate = bookingDate;

      localStorage.setItem(PHOTOGRAPHY_CART_KEY, JSON.stringify(currentCart));
      
      toast.success('Booking date updated');
    }
    
    return currentCart;
  } catch (error) {
    console.error('Error updating photography booking date:', error);
    toast.error('Failed to update booking date');
    return getPhotographyCart();
  }
};

export const formatBookingDate = (dateString: string): string => {
  const date = new Date(dateString);

  const formattedDate = date.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
  
  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return `${formattedDate} at ${formattedTime}`;
};
