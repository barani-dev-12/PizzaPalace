import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { getPizzaImageUrl } from '../utils/pizzaImage';

const Cart = () => {
  const navigate = useNavigate();
  const { cart, updateQuantity, removeFromCart, cartTotal, getPizzaPrice } = useCart();

  // Pricing constants
  const deliveryFee = cartTotal > 500 ? 0 : 40;
  const taxRate = 0.05; // 5% GST
  const taxes = Math.round(cartTotal * taxRate);
  const grandTotal = cartTotal + deliveryFee + taxes;

  const handleCheckoutRedirect = () => {
    navigate('/checkout');
  };

  const getPizzaImage = (item) => getPizzaImageUrl(item.pizza.image, item.pizza.category);

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto text-center py-16 sm:py-24 space-y-6 animate-fadeIn">
        <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto text-amber-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12">
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-gray-800 tracking-tight">Your Cart is Empty</h2>
          <p className="text-sm text-gray-500 max-w-xs mx-auto">
            You haven't added any pizzas to your basket yet. Let's find something delicious!
          </p>
        </div>
        <Link
          to="/menu"
          className="inline-block px-8 py-3 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">
          Your Shopping Basket
        </h1>
        <p className="text-xs sm:text-sm text-gray-500">
          You have {cart.length} unique pizza selection(s) in your cart.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item, idx) => {
            const price = getPizzaPrice(item.pizza, item.size);
            const totalItemPrice = price * item.quantity;
            return (
              <div
                key={`${item.pizza._id}-${item.size}-${idx}`}
                className="bg-white border border-gray-100 rounded-3xl p-4 sm:p-5 flex gap-4 items-center shadow-sm"
              >
                {/* Product Thumbnail */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden bg-gray-50 flex-shrink-0">
                  <img
                    src={getPizzaImage(item)}
                    alt={item.pizza.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Product Details */}
                <div className="flex-grow min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-gray-800 truncate">
                      {item.pizza.name}
                    </h3>
                    <button
                      onClick={() => removeFromCart(item.pizza._id, item.size)}
                      className="text-gray-400 hover:text-red-500 transition-colors p-1"
                      aria-label="Remove item"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs text-gray-500">
                    <span className="font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      Size: {item.size}
                    </span>
                    <span>₹{price} each</span>
                  </div>

                  {/* Quantity and Total Price row */}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                    {/* Qty Controls */}
                    <div className="flex items-center gap-2 select-none">
                      <button
                        onClick={() => updateQuantity(item.pizza._id, item.size, item.quantity - 1)}
                        className="w-7 h-7 border border-gray-200 hover:border-amber-200 hover:text-amber-500 hover:bg-amber-50 rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                        </svg>
                      </button>
                      <span className="text-sm font-bold text-gray-700 w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.pizza._id, item.size, item.quantity + 1)}
                        className="w-7 h-7 border border-gray-200 hover:border-amber-200 hover:text-amber-500 hover:bg-amber-50 rounded-full flex items-center justify-center transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3.5 h-3.5">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                      </button>
                    </div>

                    {/* Total Price */}
                    <span className="font-extrabold text-sm sm:text-base text-gray-800">
                      ₹{totalItemPrice}
                    </span>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {/* Right Column: Order Summary Panel */}
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <h2 className="text-xl font-bold text-gray-800 tracking-tight pb-3 border-b border-gray-100">
            Payment Summary
          </h2>

          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Basket Subtotal</span>
              <span className="font-bold text-gray-800">₹{cartTotal}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              {deliveryFee === 0 ? (
                <span className="font-extrabold text-emerald-500 uppercase text-xs">Free Delivery</span>
              ) : (
                <span className="font-bold text-gray-800">₹{deliveryFee}</span>
              )}
            </div>
            <div className="flex justify-between">
              <span>Estimated GST (5%)</span>
              <span className="font-bold text-gray-800">₹{taxes}</span>
            </div>

            {deliveryFee > 0 && (
              <p className="text-[10px] text-amber-600 bg-amber-50 p-2.5 rounded-xl mt-1 leading-relaxed">
                💡 Add <b>₹{500 - cartTotal}</b> more to your cart to unlock <b>FREE Delivery</b>!
              </p>
            )}
          </div>

          <div className="border-t border-gray-100 pt-4 flex justify-between items-baseline">
            <span className="text-base font-bold text-gray-800">Total Amount</span>
            <span className="text-2xl font-black text-amber-500">₹{grandTotal}</span>
          </div>

          <button
            onClick={handleCheckoutRedirect}
            className="w-full py-4 text-center text-sm font-bold text-white bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 rounded-full shadow-md hover:shadow-lg active:scale-98 transition-all duration-300"
          >
            Checkout Basket
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;