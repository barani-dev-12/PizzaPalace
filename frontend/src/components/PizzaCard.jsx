import React from 'react';
import { Link } from 'react-router-dom';
import { getPizzaImageUrl, handlePizzaImageError } from '../utils/pizzaImage';

const PizzaCard = ({ pizza }) => {
  const { _id, name, description, category, prices, image, isAvailable } = pizza;

  return (
    <div className={`group relative bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden ${
      !isAvailable ? 'opacity-75' : ''
    }`}>
      {/* Category Badge */}
      <span className={`absolute top-4 left-4 z-10 px-3 py-1 text-[11px] font-extrabold uppercase rounded-full shadow-sm tracking-wider ${
        category === 'Veg' 
          ? 'bg-emerald-500 text-white' 
          : category === 'Non-Veg'
          ? 'bg-red-500 text-white'
          : category === 'Premium'
          ? 'bg-purple-600 text-white'
          : 'bg-amber-500 text-white'
      }`}>
        {category}
      </span>

      {/* Availability overlay */}
      {!isAvailable && (
        <div className="absolute inset-0 bg-gray-900/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
          <span className="bg-red-500 text-white font-extrabold px-4 py-2 rounded-full text-xs uppercase tracking-widest shadow-md">
            Out of Stock
          </span>
        </div>
      )}

      {/* Pizza Image container */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-gray-100">
        <img
          src={getPizzaImageUrl(image, category)}
          alt={name}
          onError={(e) => handlePizzaImageError(e, category)}
          className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          loading="lazy"
        />
      </div>

      {/* Pizza Info */}
      <div className="p-5 sm:p-6 flex-grow flex flex-col justify-between">
        <div>
          <h3 className="text-lg font-bold text-gray-800 tracking-tight group-hover:text-amber-500 transition-colors duration-200">
            {name}
          </h3>
          <p className="text-xs text-gray-500 mt-2 line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Action / Price Area */}
        <div className="mt-4 pt-3 border-t border-gray-100 flex flex-col gap-3">
          <div className="flex flex-wrap gap-2">
            {(prices instanceof Map ? Array.from(prices.entries()) : Object.entries(prices || {})).map(([size, price]) => (
              <span key={size} className="bg-amber-50 px-2 py-1 rounded-md text-[10px] sm:text-xs font-bold text-amber-700 border border-amber-100">
                {size}: ₹{price}
              </span>
            ))}
          </div>
          <div className="flex justify-end mt-1">
            <Link
              to={`/pizza/${_id}`}
              className="flex items-center justify-center w-full sm:w-auto gap-1.5 px-6 py-2 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 rounded-full shadow-md transition-all duration-300"
            >
              <span>Order Now</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PizzaCard;
