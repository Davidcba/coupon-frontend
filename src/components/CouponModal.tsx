import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';

interface CouponModalProps {
  coupon: {
    id: string;
    title: string;
    description: string;
    code: string;
    endDate: string;
    imageUrl: string;
    category: string;
  };
  onClose: () => void;
}

/**
 * A modal component that displays the full details of a coupon. Users can reveal
 * the coupon code by clicking a button. The overlay dims the background
 * and clicking the X or outside of the card closes the modal.
 */
export default function CouponModal({ coupon, onClose }: CouponModalProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </button>
        {/* Image */}
        <img
          src={coupon.imageUrl}
          alt={coupon.title}
          className="w-full h-48 object-cover rounded-md"
        />
        {/* Content */}
        <h2 className="mt-4 text-2xl font-bold text-gray-800">
          {coupon.title}
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          {coupon.description}
        </p>
        <p className="mt-1 text-xs text-gray-400">
          Válido hasta {new Date(coupon.endDate).toLocaleDateString()}
        </p>
        {/* Show/Reveal code button or code itself */}
        {!showCode ? (
          <button
            onClick={() => setShowCode(true)}
            className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md transition"
          >
            Mostrar código
          </button>
        ) : (
          <div className="mt-6 py-3 text-center text-2xl font-bold text-gray-800 bg-gray-100 rounded-md">
            {coupon.code}
          </div>
        )}
      </div>
    </div>
  );
}