import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { assets } from '../assets/assets';
import { pizzaApi } from '../api/pizzaApi';
import PizzaCard from '../components/PizzaCard';
import Spinner from '../components/Spinner';

const Home = () => {
  const navigate = useNavigate();
  const [featuredPizzas, setFeaturedPizzas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const response = await pizzaApi.getAll({ limit: 3, isAvailable: true });
        if (response.data && response.data.success) {
          setFeaturedPizzas(response.data.data.pizzas);
        }
      } catch (error) {
        console.error('Error fetching featured pizzas:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/menu?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/menu');
    }
  };

  return (
    <div className="space-y-16 sm:space-y-24 animate-fadeIn">
      {/* Hero Section */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800 text-white min-h-[450px] sm:min-h-[520px] flex items-center shadow-lg">
        {/* Background Image Overlay with blending */}
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: `url(${assets.hero_img})` }} />
        
        {/* Subtle decorative mesh overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />

        <div className="relative max-w-3xl px-6 sm:px-12 py-16 space-y-6 sm:space-y-8 z-10">
          <span className="inline-block px-4 py-1.5 text-xs sm:text-sm font-extrabold bg-amber-500/25 border border-amber-500/40 text-amber-300 uppercase tracking-widest rounded-full">
            🔥 Wood-Fired & Handcrafted
          </span>
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-none">
            The Ultimate Pizza <br className="hidden sm:inline"/>
            <span className="bg-gradient-to-r from-amber-400 to-red-500 bg-clip-text text-transparent">
              Palace Experience
            </span>
          </h1>
          <p className="text-base sm:text-lg text-gray-300 max-w-xl font-normal leading-relaxed">
            Baked to perfection in our traditional stone ovens using fresh, locally-sourced organic ingredients. Order now and get it hot in 30 minutes!
          </p>

          {/* Search bar shortcut */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 max-w-lg">
            <div className="relative w-full sm:flex-1 min-w-0">
              <input
                type="text"
                placeholder="Search your favorite pizza..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-5 pr-12 bg-white text-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
              <button
                type="submit"
                aria-label="Search pizzas"
                className="absolute right-0 top-0 h-12 w-12 flex items-center justify-center p-0 border-0 bg-transparent text-gray-400 hover:text-amber-500 transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.608 10.608Z" />
                </svg>
              </button>
            </div>
            <Link
              to="/menu"
              className="h-12 px-8 flex items-center justify-center bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold rounded-full shadow-md hover:shadow-lg transition-all duration-300 whitespace-nowrap"
            >
              Explore Menu
            </Link>
          </form>
        </div>
      </section>

      {/* Featured Pizzas Section */}
      <section className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-800 tracking-tight">
              Our Featured Pizzas
            </h2>
            <p className="text-sm text-gray-500">
              Handpicked customer favorites cooked fresh daily.
            </p>
          </div>
          <Link
            to="/menu"
            className="group flex items-center gap-1.5 text-sm font-bold text-amber-500 hover:text-amber-600 transition-colors"
          >
            <span>See entire catalogue</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 transition-transform group-hover:translate-x-1"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="py-12">
            <Spinner />
          </div>
        ) : featuredPizzas.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {featuredPizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
            <p className="text-gray-500 font-semibold">No featured pizzas available at this time.</p>
            <p className="text-sm text-gray-400 mt-1">Please check back later or view the full menu.</p>
          </div>
        )}
      </section>

      {/* Why Us Section */}
      <section className="bg-amber-500/5 rounded-3xl border border-amber-500/10 p-8 sm:p-12 space-y-12">
        <div className="max-w-2xl mx-auto text-center space-y-3">
          <h2 className="text-3xl font-extrabold text-gray-800 tracking-tight">
            Why Pizza Palace?
          </h2>
          <p className="text-sm text-gray-500">
            We are dedicated to delivering the absolute finest pizza dining experience to your home.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-amber-500/10 rounded-full text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.467 5.99 5.99 0 0 0-1.925 3.546 5.974 5.974 0 0 1-2.133-1A3.75 3.75 0 0 0 12 18Z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Stone Oven Baked</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Baked at 450°C in custom wood-fired brick ovens to seal in the flavor and ensure a perfectly crisp, smoky crust.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-amber-500/10 rounded-full text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">30-Min Delivery</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Our professional delivery experts ensure your pizzas arrive piping hot, straight out of the oven to your kitchen counter.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center space-y-4 hover:shadow-md transition-shadow">
            <div className="p-4 bg-amber-500/10 rounded-full text-amber-500">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800">Fresh Ingredients</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              We exclusively use handpicked fresh basil, certified San Marzano tomatoes, organic flour, and local dairy cheeses.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;