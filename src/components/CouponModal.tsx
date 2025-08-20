import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import placeholder from '../../public/tucheck.png'; // ✅ bundled asset

interface CouponModalProps {
  coupon: {
    id: string;
    title: string;
    description: string | null;
    code: string | null;
    endDate: Date | null;
    imageUrl: string | null;
    category: string | null;
  };
  onClose: () => void;
}

export default function CouponModal({ coupon, onClose }: CouponModalProps) {
  const [showCode, setShowCode] = useState(false);

  const endDateLabel = coupon.endDate
    ? new Date(coupon.endDate).toLocaleDateString()
    : 'fecha desconocida';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={onClose} role="dialog" aria-modal="true">
      <div className="relative bg-white rounded-xl shadow-lg max-w-md w-full mx-4 p-4" onClick={(e) => e.stopPropagation()}>
        <button className="absolute top-2 right-2 text-gray-600 hover:text-gray-900" onClick={onClose} aria-label="Cerrar">
          <FontAwesomeIcon icon={faXmark} size="lg" />
        </button>

        <img
          src={coupon.imageUrl || placeholder}
          alt={coupon.title}
          className="w-full h-48 object-cover rounded-md"
          onError={(e) => {
            const img = e.currentTarget as HTMLImageElement;
            if (img.dataset.fallbackApplied) return; // ✅ avoid loop
            img.dataset.fallbackApplied = '1';
            img.src = placeholder;
          }}
        />

        <h2 className="mt-4 text-2xl font-bold text-gray-800">{coupon.title}</h2>
        {coupon.description && <p className="mt-2 text-sm text-gray-600">{coupon.description}</p>}
        <p className="mt-1 text-xs text-gray-400">Válido hasta {endDateLabel}</p>

        {!showCode ? (
          <button onClick={() => setShowCode(true)} className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-md transition">
            Mostrar código
          </button>
        ) : (
          <div className="mt-6 py-3 text-center text-2xl font-bold text-gray-800 bg-gray-100 rounded-md">
            {coupon.code ?? '—'}
          </div>
        )}
      </div>
    </div>
  );
}
