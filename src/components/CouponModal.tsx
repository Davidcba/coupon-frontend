import React, { useState } from 'react'

type Coupon = {
  id: string
  title: string
  description?: string
  terms?: string
  code: string
  endDate: string
}

type CouponModalProps = {
  coupon: Coupon
  onClose: () => void
}

const CouponModal: React.FC<CouponModalProps> = ({ coupon, onClose }) => {
  const [showCode, setShowCode] = useState(false)

  return (
    <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-red-500 text-xl"
        >
          ×
        </button>

        <h2 className="text-2xl font-bold mb-2 text-[#3B3B98]">{coupon.title}</h2>
        <p className="text-sm text-gray-700 mb-2">{coupon.description}</p>
        <p className="text-xs text-gray-500 mb-4">{coupon.terms || 'Términos y condiciones aplican.'}</p>
        <p className="text-sm text-gray-600 mb-4">
          Válido hasta: {new Date(coupon.endDate).toLocaleDateString()}
        </p>

        {/* Show/Reveal code button */}
        {!showCode ? (
          <button
            onClick={() => setShowCode(true)}
            className="w-full py-2 px-4 bg-[#3B3B98] text-white font-bold rounded hover:bg-[#2a2a7e]"
          >
            Mostrar Código
          </button>
        ) : (
          <div className="text-center mt-4">
            <p className="font-mono text-lg bg-gray-100 inline-block px-4 py-2 rounded">
              {coupon.code}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default CouponModal
