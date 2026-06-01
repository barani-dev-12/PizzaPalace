import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { pizzaApi } from '../api/pizzaApi';
import PizzaCard from '../components/PizzaCard';
import Spinner from '../components/Spinner';
import { toast } from 'react-hot-toast';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const initialSearch = searchFromUrl;

  // Filter & Search states
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState('');
  const [isAvailableOnly, setIsAvailableOnly] = useState(false);
  const [sort, setSort] = useState('-createdAt');
  const [page, setPage] = useState(1);
  const [limit] = useState(6); // 6 items per page fits grid well

  // Data states
  const [pizzas, setPizzas] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);

  // Sync search state with URL query (use string dep — searchParams object changes every render)
  useEffect(() => {
    setSearch(searchFromUrl);
    setPage(1);
  }, [searchFromUrl]);

  // Fetch pizzas from backend when filters change
  useEffect(() => {
    const fetchPizzas = async () => {
      setLoading(true);
      try {
        const queryParams = {
          page,
          limit,
          sort,
        };

        if (category) {
          queryParams.category = category;
        }

        if (isAvailableOnly) {
          queryParams.isAvailable = true;
        }

        if (search.trim()) {
          queryParams.search = search.trim();
        }

        const response = await pizzaApi.getAll(queryParams);
        if (response.data && response.data.success) {
          setPizzas(response.data.data.pizzas);
          setPagination(response.data.data.pagination);
        }
      } catch (error) {
        console.error('Error fetching pizzas:', error);
        setPizzas([]);
        const msg = error.code === 'ECONNABORTED'
          ? 'Server is waking up. Wait a minute and refresh.'
          : error.response?.data?.message || 'Could not load menu. Check API connection.';
        toast.error(msg);
      } finally {
        setLoading(false);
      }
    };

    fetchPizzas();
  }, [category, isAvailableOnly, sort, page, search]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearch(val);
    setPage(1);
    
    // Update search param in URL
    if (val.trim()) {
      setSearchParams({ search: val.trim() });
    } else {
      setSearchParams({});
    }
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setPage(1);
  };

  const categories = [
    { name: 'All', value: '' },
    { name: 'Veg', value: 'Veg' },
    { name: 'Non-Veg', value: 'Non-Veg' },
    { name: 'Premium', value: 'Premium' },
    { name: 'Classic', value: 'Classic' },
    { name: 'Specialty', value: 'Specialty' },
  ];

  return (
    <div className="space-y-8 sm:space-y-12 animate-fadeIn">
      {/* Page Header */}
      <div className="text-center max-w-xl mx-auto space-y-2">
        <h1 className="text-3xl sm:text-5xl font-black text-gray-800 tracking-tight">
          Explore Our Menu
        </h1>
        <p className="text-sm sm:text-base text-gray-500">
          Browse through our delicious range of handcrafted pizzas. Filter by your preference and order hot.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-center">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search pizza by name..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-5 py-3 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 font-medium text-sm transition-all"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.608 10.608Z" />
            </svg>
          </div>

          {/* Sort Selection */}
          <div className="flex gap-3 sm:gap-4 items-center">
            <span className="text-xs sm:text-sm font-bold text-gray-500 whitespace-nowrap">Sort By</span>
            <select
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                setPage(1);
              }}
              className="w-full py-3 px-4 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 text-sm font-semibold text-gray-700 bg-white transition-all cursor-pointer"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="prices.Medium">Price: Low to High</option>
              <option value="-prices.Medium">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="-name">Name: Z to A</option>
            </select>
          </div>

          {/* Availability Toggle */}
          <div className="flex items-center lg:justify-end gap-3 select-none">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={isAvailableOnly}
                onChange={(e) => {
                  setIsAvailableOnly(e.target.checked);
                  setPage(1);
                }}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
              <span className="ms-3 text-sm font-bold text-gray-700">Available Only</span>
            </label>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="border-t border-gray-100 pt-6 flex flex-wrap gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat.name}
              onClick={() => handleCategorySelect(cat.value)}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all duration-300 ${
                category === cat.value
                  ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 scale-105'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Pizza Grid */}
      {loading ? (
        <div className="py-24">
          <Spinner />
        </div>
      ) : pizzas.length > 0 ? (
        <div className="space-y-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {pizzas.map((pizza) => (
              <PizzaCard key={pizza._id} pizza={pizza} />
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-6 select-none">
              <button
                onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                disabled={!pagination.hasPrevPage}
                className="p-3 border border-gray-200 rounded-2xl hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-gray-200 transition-all font-bold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
              </button>
              
              <span className="text-sm font-bold text-gray-700">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setPage((prev) => Math.min(prev + 1, pagination.totalPages))}
                disabled={!pagination.hasNextPage}
                className="p-3 border border-gray-200 rounded-2xl hover:bg-amber-50 hover:text-amber-500 hover:border-amber-200 disabled:opacity-50 disabled:hover:bg-transparent disabled:hover:text-inherit disabled:hover:border-gray-200 transition-all font-bold"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl p-8 shadow-sm max-w-md mx-auto space-y-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mx-auto">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.608 10.608Z" />
          </svg>
          <p className="text-gray-500 font-bold text-lg">No pizzas found</p>
          <p className="text-xs text-gray-400">Try adjusting your filters, sorting options, or search keyword.</p>
        </div>
      )}
    </div>
  );
};

export default Menu;