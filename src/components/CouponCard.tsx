import React from 'react'

type Coupon = {
  id: string
  title: string
  code: string
  endDate: string
}

type CouponCardProps = {
  coupon: Coupon
  onCopy: (code: string) => void
}

const CouponCard: React.FC<CouponCardProps> = ({ coupon }) => {
  const hardcodedImage = '/images/pizza.jpeg' // You can replace with any static image later

  return (
    <div className="bg-white rounded-2xl shadow-md p-0 border-2 border-[#3B3B98]/20 hover:border-[#3B3B98] hover:shadow-lg transition overflow-hidden cursor-pointer">
      {/* Hardcoded Image */}
      <img
        src={hardcodedImage}
        alt={coupon.title}
        className="w-full h-40 object-cover"
      />
      <div className="p-4">
        <h2 className="text-lg font-bold text-[#3B3B98] mb-2">{coupon.title}</h2>
      </div>
    </div>
  )
}

export default CouponCard
