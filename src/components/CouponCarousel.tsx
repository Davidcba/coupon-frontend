// src/components/CouponCarousel.tsx
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/pagination'
import 'swiper/css/navigation'

import React from 'react'

type Coupon = {
  id: string
  title: string
  imageUrl?: string
  description?: string
}

type CouponCarouselProps = {
  coupons: Coupon[]
}

const CouponCarousel: React.FC<CouponCarouselProps> = ({ coupons }) => {
  return (
    <div className="max-w-4xl mx-auto my-8">
      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="rounded-lg shadow-lg"
      >
        {coupons.map((coupon) => (
          <SwiperSlide key={coupon.id}>
            <div className="bg-white rounded-lg overflow-hidden shadow-lg flex items-center justify-center">
              {coupon.imageUrl ? (
                <img
                  src={coupon.imageUrl}
                  alt={coupon.title}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 flex items-center justify-center bg-[#3B3B98] text-white text-2xl font-bold">
                  {coupon.title}
                </div>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  )
}

export default CouponCarousel
