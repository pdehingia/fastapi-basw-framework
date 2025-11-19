import React from 'react';
import Button from '../../atoms/Button';

const ReviewDetailPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Review Detail Page</h1>
      <p className="text-slate-600 mt-2">Review detail component placeholder.</p>
      <Button variant="primary" className="mt-4">
        Back to Reviews
      </Button>
    </div>
  );
};

export default ReviewDetailPage;
