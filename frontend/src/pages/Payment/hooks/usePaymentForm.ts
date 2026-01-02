import { useState } from 'react';
import { PaymentFormData } from '../types';

interface ValidationErrors {
  cardNumber?: string;
  cardholderName?: string;
  expiryDate?: string;
  cvv?: string;
}

const usePaymentForm = () => {
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    saveCard: false,
  });

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;

    if (name === 'cardNumber') {
      
      const digits = value.replace(/\D/g, '');
      
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
      
      const limited = formatted.substring(0, 19);
      
      setFormData(prev => ({
        ...prev,
        [name]: limited
      }));
      return;
    }

    if (name === 'expiryDate') {
      const digits = value.replace(/\D/g, '');
      let formatted = digits;
      
      if (digits.length > 2) {
        formatted = `${digits.substring(0, 2)}/${digits.substring(2, 4)}`;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: formatted
      }));
      return;
    }

    if (name === 'cvv') {
      const digits = value.replace(/\D/g, '');
      const limited = digits.substring(0, 4);
      
      setFormData(prev => ({
        ...prev,
        [name]: limited
      }));
      return;
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!formData.cardNumber.trim()) {
      newErrors.cardNumber = 'Card number is required';
    } else if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      newErrors.cardNumber = 'Card number must be 16 digits';
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!formData.expiryDate.trim()) {
      newErrors.expiryDate = 'Expiry date is required';
    } else {
      const [month, year] = formData.expiryDate.split('/');
      const currentYear = new Date().getFullYear() % 100; 
      const currentMonth = new Date().getMonth() + 1; 
      
      const expMonth = parseInt(month);
      const expYear = parseInt(year);
      
      if (isNaN(expMonth) || isNaN(expYear) || expMonth < 1 || expMonth > 12) {
        newErrors.expiryDate = 'Invalid expiration date';
      } else if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
        newErrors.expiryDate = 'Card has expired';
      }
    }

    if (!formData.cvv.trim()) {
      newErrors.cvv = 'CVV is required';
    } else if (formData.cvv.length < 3) {
      newErrors.cvv = 'CVV must be at least 3 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (onSubmit: (formData: PaymentFormData) => Promise<void>) => {
    setIsSubmitting(true);
    
    if (validateForm()) {
      try {
        await onSubmit(formData);
      } catch (error) {
        console.error('Payment form submission error:', error);
      }
    }
    
    setIsSubmitting(false);
  };

  const resetForm = () => {
    setFormData({
      cardNumber: '',
      cardholderName: '',
      expiryDate: '',
      cvv: '',
      saveCard: false,
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
    resetForm,
  };
};

export default usePaymentForm; 