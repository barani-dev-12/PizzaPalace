import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { pizzaApi } from '../api/pizzaApi';
import { useCart } from '../context/CartContext';
import { getPizzaImageUrl } from '../utils/pizzaImage';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

const PizzaDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, getPizzaPrice } = useCart();

  const [pizza, setPizza] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchPizza = async () => {
      try {
        const response = await pizzaApi.getById(id);
        if (response.data && response.data.success) {
          const pizzaData = response.data.data.pizza;
          setPizza(pizzaData);
          if (pizzaData.sizes && pizzaData.sizes.length > 0) {
            // Default select the first available size (usually Small or Medium)
            setSelectedSize(pizzaData.sizes[0]);
          }
        } else {
          toast.error('Pizza not found');
          navigate('/menu');
        }
      } catch (error) {
        console.error('Error fetching pizza details:', error);
        toast.error('Pizza not found or server error');
        navigate('/menu');
      } finally {
        setLoading(false);
      }
    };

    fetchPizza();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="py-24">
        <Spinner />
      </div>
    );
  }

  if (!pizza) return null;

  const { name, description, category, sizes, isAvailable, image } = pizza;

  // Retrieve pricing
  const unitPrice = getPizzaPrice(pizza, selectedSize);
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    if (!isAvailable) {
      toast.error('This pizza is currently out of stock');
      return;
    }
    if (!selectedSize) {
      toast.error('Please select a size');
      return;
    }

    addToCart(pizza, selectedSize, quantity);
    toast.success(`${quantity} x ${name} (${selectedSize}) added to cart!`, {
      style: {
        fontWeight: 'bold',
      },
    });
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Back Button */}
      <Link
        to="/menu"
        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-amber-500 transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
        <span>Back to Menu</span>
      </Link>

      {/* Main Details Panel */}
      <div className="bg-white border border-gray-100 rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8">
        
        {/* Left: Image Box */}
        <div className="relative rounded-2xl overflow-hidden bg-gray-50 h-[300px] sm:h-[400px] shadow-inner">
          {/* Category Tag */}
          <span className={`absolute top-4 left-4 z-10 px-4 py-1.5 text-xs font-extrabold uppercase rounded-full shadow-sm tracking-wider ${
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

          {!isAvailable && (
            <div className="absolute inset-0 bg-gray-900/60 z-20 flex items-center justify-center backdrop-blur-[2px]">
              <span className="bg-red-500 text-white font-extrabold px-6 py-2.5 rounded-full text-sm uppercase tracking-widest shadow-md">
                Out of Stock
              </span>
            </div>
          )}

          <img
            src={getPizzaImageUrl(image, category)}
            alt={name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right: Info Options Box */}
        <div className="flex flex-col justify-between space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight leading-tight">
              {name}
            </h1>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
              {description}
            </p>
          </div>

          {/* Configuration Forms */}
          <div className="space-y-6">
            {/* Size Selector */}
            <div className="space-y-3">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Choose Size
              </span>
              <div className="flex flex-wrap gap-3">
                {sizes.map((sz) => {
                  const sizePrice = getPizzaPrice(pizza, sz);
                  return (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      disabled={!isAvailable}
                      className={`flex-1 min-w-[100px] border p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                        selectedSize === sz
                          ? 'border-amber-500 bg-amber-50 text-amber-600 ring-2 ring-amber-500/20'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <span className="text-sm font-bold">{sz}</span>
                      <span className="text-xs font-semibold text-gray-400">₹{sizePrice}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center justify-between border-t border-b border-gray-100 py-4">
              <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                Quantity
              </span>
              <div className="flex items-center gap-4 select-none">
                <button
                  onClick={() => setQuantity((q) => Math.max(q - 1, 1))}
                  disabled={quantity <= 1 || !isAvailable}
                  className="w-10 h-10 border border-gray-200 hover:border-amber-200 hover:text-amber-500 hover:bg-amber-50 rounded-full flex items-center justify-center transition-colors disabled:opacity-50"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" />
                  </svg>
                </button>
                <span className="text-lg font-extrabold text-gray-800 w-6 text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  disabled={!isAvailable}
                  className="w-10 h-10 border border-gray-200 hover:border-amber-200 hover:text-amber-500 hover:bg-amber-50 rounded-full flex items-center justify-center transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Price & Add to Cart Area */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
            <div className="flex flex-col items-center sm:items-start">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Total Price
              </span>
              <span className="text-3xl font-black text-gray-800">
                ₹{totalPrice}
              </span>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={!isAvailable}
              className="w-full sm:w-auto px-10 py-4 text-sm font-bold text-white bg-gradient-to-r from-red-500 to-amber-500 hover:from-red-600 hover:to-amber-600 rounded-full shadow-md hover:shadow-lg active:scale-98 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add to Basket
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PizzaDetail;