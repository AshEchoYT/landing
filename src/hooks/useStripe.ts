import { useState } from 'react';
import { useStripe, useElements } from '@stripe/react-stripe-js';

export const useStripePayment = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmPayment = async (clientSecret: string) => {
    if (!stripe || !elements) return;

    setLoading(true);
    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/tickets`,
      },
    });

    if (stripeError) {
      setError(stripeError.message || 'Payment failed');
    }
    setLoading(false);
  };

  return { confirmPayment, loading, error };
};