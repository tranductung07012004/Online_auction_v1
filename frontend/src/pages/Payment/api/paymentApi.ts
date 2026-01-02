import axios from 'axios';
import { Order, Address, PaymentMethod } from '../types';

const API_URL = 'http:

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

export const PaymentApi = {
  
  createOrder: async (): Promise<Order> => {
    try {
      
      const { createOrder } = await import('../../../api/order');

      return await createOrder();
    } catch (error: any) {
      console.error('Error creating order:', error);
      if (error.response) {

        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        throw new Error(
          error.response.data?.message || 'Failed to create order. Please try again later.'
        );
      } else if (error.request) {
        
        throw new Error('No response received from server. Please check your internet connection.');
      } else {
        
        throw new Error('Error creating order: ' + error.message);
      }
    }
  },

  getOrderById: async (orderId: string): Promise<Order> => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data.data;
  },

  getUserOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders');
    return response.data.data;
  },

  cancelOrder: async (orderId: string): Promise<Order> => {
    const response = await api.put(`/orders/cancel/${orderId}`);
    return response.data.data;
  },

  updateShippingAddress: async (orderId: string, address: Address): Promise<Order> => {
    const response = await api.put(`/orders/${orderId}/shipping`, { address });
    return response.data.data;
  },

  processPayment: async (orderId: string, paymentMethod: PaymentMethod): Promise<Order> => {
    try {
      const response = await api.post(`/orders/${orderId}/payment`, { paymentMethod });
      return response.data.data;
    } catch (error: any) {
      console.error('Error processing payment:', error);
      if (error.response) {

        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        throw new Error(
          error.response.data?.message || 'Server error during payment processing. Please try again later.'
        );
      } else if (error.request) {
        
        throw new Error('No response received from server. Please check your internet connection.');
      } else {
        
        throw new Error('Error processing payment: ' + error.message);
      }
    }
  }
};

export default PaymentApi; 