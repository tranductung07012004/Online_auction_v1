import axios from 'axios';

const API = axios.create({
  baseURL: 'http:
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, 
});

API.interceptors.request.use(request => {
  console.log('Cart API Request:', request);
  return request;
}, error => {
  console.error('Cart Request Error:', error);
  return Promise.reject(error);
});

API.interceptors.response.use(response => {
  console.log('Cart API Response:', response);
  return response;
}, error => {
  console.error('Cart Response Error:', error);
  
  if (error.response && error.response.status === 401) {
    console.error('Authentication error - redirecting to login');
    window.location.href = '/signin';
  }
  return Promise.reject(error);
});

export const getCart = async () => {
  try {
    console.log('Getting cart...');
    const response = await API.get('/cart');
    console.log('Cart response:', response.data);
    return response.data.data;
  } catch (error: any) {
    console.error('Error in getCart:', error);
    throw new Error(error.response?.data?.message || 'Failed to fetch cart');
  }
};

export const addToCart = async (itemData: {
  dressId: string;
  sizeId: string;
  colorId: string;
  quantity: number;
  startDate: string;
  endDate: string;
}) => {
  try {
    console.log('Adding to cart with data:', itemData);
    const response = await API.post('/cart/add', itemData);
    console.log('AddToCart response:', response);
    return response.data.data;
  } catch (error: any) {
    console.error('Error in addToCart:', error);
    console.error('Response data:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to add item to cart');
  }
};

export const removeFromCart = async (itemIndex: number) => {
  try {
    const response = await API.delete(`/cart/remove/${itemIndex}`);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to remove item from cart');
  }
};

export const updateCartItemDates = async (
  itemIndex: number,
  dateData: { startDate: string; endDate: string }
) => {
  try {
    const response = await API.put(`/cart/update-dates/${itemIndex}`, dateData);
    return response.data.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to update item dates');
  }
};

export const clearCart = async () => {
  try {
    const response = await API.delete('/cart/clear');
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Failed to clear cart');
  }
}; 

export const addPhotographyServiceToCart = async (serviceData: {
  serviceId: string;
  serviceName: string;
  serviceType: string;
  price: number;
  imageUrl: string;
  bookingDate: string;
  location?: string;
}) => {
  try {
    console.log('Adding photography service to cart:', serviceData);

    const cartItemData = {
      dressId: serviceData.serviceId, 
      sizeId: "photography-size", 
      colorId: "photography-color", 
      quantity: 1,
      startDate: serviceData.bookingDate,
      endDate: serviceData.bookingDate, 
      
      isPhotography: true,
      photographyData: JSON.stringify({
        serviceName: serviceData.serviceName,
        serviceType: serviceData.serviceType,
        price: serviceData.price,
        imageUrl: serviceData.imageUrl,
        location: serviceData.location || 'Studio'
      })
    };
    
    console.log('Formatted cart data:', cartItemData);
    const response = await API.post('/cart/add', cartItemData);
    console.log('AddToCart response:', response);
    return response.data.data;
  } catch (error: any) {
    console.error('Error in addPhotographyServiceToCart:', error);
    console.error('Response data:', error.response?.data);
    throw new Error(error.response?.data?.message || 'Failed to add photography service to cart');
  }
};