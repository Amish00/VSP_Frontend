// src/api/PaymentService.js
import api from './Api';  

export const initiatePayment = async (gateway, amount, planId, billingCycle) => {
  const response = await api.post('/payment/initiate', {
    gateway,
    amount,
    planId,
    billingCycle
  });
  return response.data;
};