import { OrderItem, OrderSummary } from '../types';

export const calculateDurationInDays = (startDate: Date, endDate: Date): number => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const diffTime = Math.abs(end.getTime() - start.getTime());

  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};

export const calculateSubtotal = (items: OrderItem[], startDate: Date, endDate: Date): number => {
  const days = calculateDurationInDays(startDate, endDate);
  
  return items.reduce((subtotal, item) => {
    
    if (item.purchaseType === 'buy' && item.purchasePrice) {
      return subtotal + (item.purchasePrice * item.quantity);
    }
    
    return subtotal + (item.pricePerDay * days * item.quantity);
  }, 0);
};

export const calculateTax = (subtotal: number, taxRate: number = 0.1): number => {
  return subtotal * taxRate;
};

export const calculateShipping = (subtotal: number): number => {
  
  if (subtotal >= 100) {
    return 0;
  }

  return 10;
};

export const calculateOrderSummary = (
  items: OrderItem[],
  startDate: Date,
  endDate: Date,
  taxRate: number = 0.1
): OrderSummary => {
  const subtotal = calculateSubtotal(items, startDate, endDate);
  const tax = calculateTax(subtotal, taxRate);
  const shipping = calculateShipping(subtotal);
  const total = subtotal + tax + shipping;
  const initialDeposit = total * 0.5; 
  
  return {
    subtotal,
    tax,
    shipping,
    total,
    initialDeposit,
    remainingPayment: total - initialDeposit,
    currency: 'USD',
  };
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
};

export const formatDate = (date: Date): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const getOrderStatusInfo = (status: string): { label: string; color: string } => {
  switch (status) {
    case 'pending':
      return { label: 'Pending', color: '#f59e0b' }; 
    case 'confirmed':
      return { label: 'Confirmed', color: '#3b82f6' }; 
    case 'cancelled':
      return { label: 'Cancelled', color: '#ef4444' }; 
    case 'delivered':
      return { label: 'Delivered', color: '#10b981' }; 
    case 'returned':
      return { label: 'Returned', color: '#8b5cf6' }; 
    case 'under-review':
      return { label: 'Under Review', color: '#6b7280' }; 
    default:
      return { label: 'Unknown', color: '#6b7280' }; 
  }
}; 