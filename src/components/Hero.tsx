import React from 'react';

/**
 * A hero banner showcasing a featured promotion. The background image and overlayed
 * content are inspired by the provided design. The imagery lives in the public
 * folder under images/hero_burger.png. Feel free to replace it with another
 * image by updating the src attribute below.
 */
export default function Hero() {
  return (
    <div className="relative w-full h-56 sm:h-64 md:h-80 lg:h-96 rounded-xl overflow-hidden shadow">
      <img
        src="/images/hero_burger.png"
        alt="Featured promotion"
        className="w-full h-full object-cover"
      />
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-start p-6 sm:p-8">
        <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-white max-w-md">
          Popular por sabor, no por moda
        </h2>
        <span className="mt-2 text-yellow-400 text-2xl sm:text-3xl md:text-4xl font-extrabold">
          20% OFF
        </span>
        <button className="mt-4 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold px-5 py-2 rounded-md shadow">
          Obtén tu cupón
        </button>
      </div>
    </div>
  );
}