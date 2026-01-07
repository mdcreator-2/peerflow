const PAYMENT_DELAY = 2000;

export const PAYMENT_METHODS = {
  CASH: 'cash',
  UPI: 'upi',
  CARD: 'card',
};

const generateTransactionId = () => {
  return 'TXN' + Date.now() + Math.random().toString(36).substring(2, 9).toUpperCase();
};

export const processPayment = async (paymentData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isSuccess = Math.random() < 0.9;

      if (isSuccess) {
        resolve({
          success: true,
          transaction_id: generateTransactionId(),
          amount: paymentData.amount,
          method: paymentData.method,
          timestamp: new Date().toISOString(),
          message: 'Payment successful',
        });
      } else {
        reject({
          success: false,
          error: 'PAYMENT_FAILED',
          message: 'Payment failed. Please try again.',
        });
      }
    }, PAYMENT_DELAY);
  });
};

export const processUPIPayment = async (upiId, amount) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const upiRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;
      
      if (!upiRegex.test(upiId)) {
        reject({
          success: false,
          error: 'INVALID_UPI',
          message: 'Invalid UPI ID format',
        });
        return;
      }

      resolve({
        success: true,
        transaction_id: generateTransactionId(),
        amount,
        method: PAYMENT_METHODS.UPI,
        upi_id: upiId,
        timestamp: new Date().toISOString(),
        message: 'UPI payment successful',
      });
    }, PAYMENT_DELAY);
  });
};

export const processCardPayment = async (cardDetails, amount) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!cardDetails.number || cardDetails.number.length < 16) {
        reject({
          success: false,
          error: 'INVALID_CARD',
          message: 'Invalid card number',
        });
        return;
      }

      if (!cardDetails.cvv || cardDetails.cvv.length < 3) {
        reject({
          success: false,
          error: 'INVALID_CVV',
          message: 'Invalid CVV',
        });
        return;
      }

      resolve({
        success: true,
        transaction_id: generateTransactionId(),
        amount,
        method: PAYMENT_METHODS.CARD,
        card_last_four: cardDetails.number.slice(-4),
        timestamp: new Date().toISOString(),
        message: 'Card payment successful',
      });
    }, PAYMENT_DELAY);
  });
};

export const processCashPayment = async (amount) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        transaction_id: generateTransactionId(),
        amount,
        method: PAYMENT_METHODS.CASH,
        timestamp: new Date().toISOString(),
        message: 'Cash payment will be collected on delivery/pickup',
        pending: true,
      });
    }, 500);
  });
};

export const verifyPaymentStatus = async (transactionId) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        transaction_id: transactionId,
        status: 'completed',
        verified_at: new Date().toISOString(),
      });
    }, 1000);
  });
};

export const getAvailablePaymentMethods = () => {
  return [
    {
      id: PAYMENT_METHODS.CASH,
      name: 'Cash on Pickup/Delivery',
      description: 'Pay when you receive the item',
      icon: '💵',
    },
    {
      id: PAYMENT_METHODS.UPI,
      name: 'UPI',
      description: 'Pay using any UPI app',
      icon: '📱',
    },
    {
      id: PAYMENT_METHODS.CARD,
      name: 'Credit/Debit Card',
      description: 'Pay securely with your card',
      icon: '💳',
    },
  ];
};