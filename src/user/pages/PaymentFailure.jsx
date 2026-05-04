import React from 'react';
import { Link } from 'react-router-dom';

const PaymentFailure = () => {
  return (
    <div className="text-center py-20">
      <div className="text-6xl mb-4">❌</div>
      <h1 className="text-3xl font-bold text-text-primary">Payment Failed</h1>
      <p className="text-text-secondary mt-2">Please try again or contact support.</p>
      <Link to="/plans" className="mt-6 inline-block bg-primary text-white px-6 py-2 rounded-xl">
        Back to Plans
      </Link>
    </div>
  );
};

export default PaymentFailure;