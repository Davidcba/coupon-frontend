import React from 'react';

interface CouponCardProps {
  coupon: {
    id: string;
    title: string;
    description: string;
    code: string;
    endDate: string;
    imageUrl: string;
    category: string;
  };
  onClick: () => void;
}

/**
 * Card to display a coupon summary. Clicking opens the coupon modal.
 */
export default function CouponCard({ coupon, onClick }: CouponCardProps) {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer bg-white rounded-xl overflow-hidden shadow hover:shadow-lg transition duration-200"
    >
      <img src={coupon.imageUrl} alt={coupon.title} className="w-full h-40 object-cover" />
      <div className="p-4 flex flex-col justify-between h-32">
        <h3 className="text-base font-semibold text-gray-800 truncate">{coupon.title}</h3>
        <p className="mt-1 text-sm text-gray-500 flex-1 truncate">{coupon.description}</p>
        <p className="mt-2 text-xs text-gray-400">
          Válido hasta {new Date(coupon.endDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
